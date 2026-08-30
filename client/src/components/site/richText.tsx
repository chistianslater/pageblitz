import React from "react";

/**
 * Leichtes Auszeichnungs-Subset für Kundentexte (Studio-Texteditor,
 * 2026-08-30): `**fett**`, `*kursiv*`, `==akzent==` (kursiv in der
 * Akzentfarbe der Designrichtung). Gespeichert wird weiterhin reiner
 * Text mit Markern — kein HTML im Dokument, kein Sanitizing nötig.
 * Gerendert wird über React-Elemente (automatisch escaped).
 *
 * Kein Nesting: die Marker sind flach und bewusst konservativ — nur
 * vollständige Paare in derselben Zeile werden erkannt, alles andere
 * bleibt sichtbarer Text.
 */
const TOKEN = /==([^=\n]+)==|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

export function hasMarks(text: string): boolean {
  TOKEN.lastIndex = 0;
  return TOKEN.test(text);
}

/** Marker entfernen — für Vergleiche, aria-Labels und Zeichenzählung. */
export function stripMarks(text: string): string {
  return text.replace(TOKEN, (_m, accent, bold, italic) =>
    String(accent ?? bold ?? italic)
  );
}

/**
 * Text mit Markern zu React-Knoten. Strings ohne Marker kommen unverändert
 * zurück, damit Packs `rich(x)` bedingungslos einsetzen können.
 */
export function rich(text: string): React.ReactNode {
  if (!hasMarks(text)) return text;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(text); m; m = TOKEN.exec(text)) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, accent, bold, italic] = m;
    if (accent !== undefined) {
      nodes.push(
        <em className="pb-rich-accent" key={key++}>
          {accent}
        </em>
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else {
      nodes.push(<em key={key++}>{italic}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * DOM eines inline editierten Elements zurück zu Marker-Text — erhält
 * Auszeichnungen beim Speichern aus der Vorschau (PreviewFrame). Fremde
 * Elemente (Pack-eigene Spans, Zeilenumbruch-Spans) werden transparent
 * durchlaufen; nur strong/em tragen Marker.
 */
export function serializeRichDom(root: Node): string {
  let out = "";
  root.childNodes.forEach(node => {
    // nodeType statt instanceof: die Knoten stammen aus dem Vorschau-
    // iframe (eigener Realm) — `instanceof Element` des Studio-Bundles
    // wäre dort immer false und würde alle Element-Kinder verschlucken.
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (el.tagName === "BR") {
      out += "\n";
      return;
    }
    const inner = serializeRichDom(el);
    if (el.tagName === "STRONG" && inner) out += `**${inner}**`;
    else if (el.tagName === "EM" && inner)
      out += el.classList.contains("pb-rich-accent")
        ? `==${inner}==`
        : `*${inner}*`;
    else out += inner;
  });
  return out;
}

export type RichMark = "**" | "*" | "==";

/** Auszeichnung als Bereich im MARKER-FREIEN Text (Plain-Offsets). */
export interface MarkRange {
  start: number;
  end: number;
  mark: RichMark;
}

/** Zerlegt Marker-Text in Plain-Text + flache, sortierte Bereiche. */
export function parseMarkRanges(value: string): {
  plain: string;
  ranges: MarkRange[];
} {
  let plain = "";
  const ranges: MarkRange[] = [];
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(value); m; m = TOKEN.exec(value)) {
    plain += value.slice(last, m.index);
    const [, accent, bold, italic] = m;
    const inner = String(accent ?? bold ?? italic);
    const mark: RichMark =
      accent !== undefined ? "==" : bold !== undefined ? "**" : "*";
    ranges.push({
      start: plain.length,
      end: plain.length + inner.length,
      mark,
    });
    plain += inner;
    last = m.index + m[0].length;
  }
  plain += value.slice(last);
  return { plain, ranges };
}

/** Baut aus Plain-Text + disjunkten Bereichen wieder Marker-Text. */
export function buildMarkedText(
  plain: string,
  ranges: readonly MarkRange[]
): string {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let out = "";
  let pos = 0;
  for (const range of sorted) {
    out += plain.slice(pos, range.start);
    out += range.mark + plain.slice(range.start, range.end) + range.mark;
    pos = range.end;
  }
  return out + plain.slice(pos);
}

/**
 * Auszeichnung auf einen Plain-Bereich anwenden — IMMER flach:
 * deckt ein gleichartiger Bereich die Auswahl ab, wird er entfernt
 * (Toggle); sonst weichen alle überlappenden Bereiche der neuen
 * Auszeichnung. Verschachtelte Marker (unparsebar) entstehen so nie.
 */
export function toggleRangeMark(
  value: string,
  start: number,
  end: number,
  mark: RichMark
): string {
  if (start >= end) return value;
  const { plain, ranges } = parseMarkRanges(value);
  const covering = ranges.find(
    r => r.mark === mark && r.start <= start && end <= r.end
  );
  const keep = ranges.filter(r => r.end <= start || r.start >= end);
  if (covering) return buildMarkedText(plain, keep);
  return buildMarkedText(plain, [...keep, { start, end, mark }]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Marker-Text zu HTML (escaped) — Sofort-Feedback im Vorschau-iframe,
 * bevor der Server-Patch das saubere SSR-Rendering nachlädt.
 */
export function richHtml(value: string): string {
  const { plain, ranges } = parseMarkRanges(value);
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let out = "";
  let pos = 0;
  const emit = (text: string) => escapeHtml(text).replace(/\n/g, "<br>");
  for (const range of sorted) {
    out += emit(plain.slice(pos, range.start));
    const inner = emit(plain.slice(range.start, range.end));
    if (range.mark === "**") out += `<strong>${inner}</strong>`;
    else if (range.mark === "==")
      out += `<em class="pb-rich-accent">${inner}</em>`;
    else out += `<em>${inner}</em>`;
    pos = range.end;
  }
  return out + emit(plain.slice(pos));
}

/**
 * Akzent-Auszeichnung — von SiteRenderer an jedes Pack-CSS angehängt.
 * Zusätzlich zur Akzentfarbe eine Unterstreichung im ROHEN Akzent
 * (--pb-accent): der Kontrast-Guard dunkelt --pb-accent-text bei grellen
 * Akzenten fast auf Textfarbe ab — ohne die Linie wären ==Akzent== und
 * *kursiv* dann optisch identisch (Betreiber-Befund 2026-08-30).
 */
export const RICH_TEXT_CSS = `
.pb-rich-accent{font-style:italic;color:var(--pb-accent-text);text-decoration:underline;text-decoration-color:var(--pb-accent);text-decoration-thickness:2px;text-underline-offset:3px}
`;
