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

/** Akzent-Auszeichnung — von SiteRenderer an jedes Pack-CSS angehängt. */
export const RICH_TEXT_CSS = `
.pb-rich-accent{font-style:italic;color:var(--pb-accent-text)}
`;
