import {
  richHtml,
  serializeRichDom,
  toggleRangeMark,
  type RichMark,
} from "@/components/site/richText";

/**
 * Schwebende Format-Toolbar im Vorschau-iframe (2026-08-30): Text in einem
 * formatierbaren Inline-Feld markieren → F/K/A über der Auswahl. Die
 * Auswahl wird als Plain-Offsets gelesen und TEXTBASIERT ausgezeichnet
 * (toggleRangeMark, immer flach), sofort lokal gerendert (richHtml) und
 * gespeichert — der iframe lädt danach mit sauberem Pack-Render neu.
 */

const STYLE_MARK = "data-pb-inline-format-style";

const TOOLBAR_CSS = `
.pb-inline-format{position:fixed;z-index:32;display:none;align-items:center;gap:2px;padding:3px;background:rgba(11,11,13,.94);border:1px solid rgba(255,255,255,.14);border-radius:999px;box-shadow:0 14px 34px rgba(11,11,13,.4);font-family:"Space Grotesk",system-ui,sans-serif}
.pb-inline-format[data-visible="true"]{display:flex}
.pb-inline-format button{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:999px;background:transparent;color:rgba(245,245,242,.85);font:600 .8rem/1 "Space Grotesk",system-ui,sans-serif;cursor:pointer}
.pb-inline-format button:hover{background:rgba(255,255,255,.14);color:#fff}
.pb-inline-format button[data-accent]{color:#ccff00}
`;

/** Cross-Realm-sicher (iframe): nodeType statt instanceof. */
function asElement(node: Node): Element | null {
  return node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
}

/**
 * Plain-Text-Offset eines Selektionspunkts innerhalb des Ziels — zählt
 * Textknoten (BR = 1 Zeichen, wie serializeRichDom), Realm-sicher über
 * nodeType. Grundlage der textbasierten Auszeichnung (toggleRangeMark).
 */
export function plainOffset(
  root: Node,
  container: Node,
  offset: number
): number {
  let count = 0;
  let done = false;
  const walk = (node: Node): void => {
    if (done) return;
    if (node === container && node.nodeType === Node.TEXT_NODE) {
      count += offset;
      done = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      count += node.textContent?.length ?? 0;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if ((node as Element).tagName === "BR") {
      count += 1;
      return;
    }
    const children = Array.from(node.childNodes);
    const limit = node === container ? offset : children.length;
    for (let i = 0; i < children.length; i++) {
      if (node === container && i >= limit) {
        done = true;
        return;
      }
      walk(children[i]!);
      if (done) return;
    }
    if (node === container) done = true;
  };
  walk(root);
  return count;
}

/**
 * Toolbar an ein Vorschau-Dokument hängen (einmal pro iframe-Load —
 * doppelte Verdrahtung verhindert der Style-Marker). `formattable` mappt
 * Inline-Pfade auf ihre maxLength.
 */
export function enableInlineFormatToolbar(
  doc: Document,
  formattable: Map<string, number>,
  onApply: (path: string, value: string) => void
): void {
  if (formattable.size === 0) return;
  if (doc.querySelector(`style[${STYLE_MARK}]`)) return;
  const style = doc.createElement("style");
  style.setAttribute(STYLE_MARK, "");
  style.textContent = TOOLBAR_CSS;
  doc.head.appendChild(style);

  const toolbar = doc.createElement("div");
  toolbar.className = "pb-inline-format";
  toolbar.innerHTML = `
    <button type="button" data-pb-mark="**" title="Markierten Text fett" aria-label="Fett"><b>F</b></button>
    <button type="button" data-pb-mark="*" title="Markierten Text kursiv" aria-label="Kursiv"><i>K</i></button>
    <button type="button" data-pb-mark="==" data-accent title="Markierten Text in der Akzentfarbe (kursiv)" aria-label="Akzentfarbe"><i>A</i></button>
  `;
  doc.body.appendChild(toolbar);

  let currentTarget: HTMLElement | null = null;
  const hide = () => {
    toolbar.removeAttribute("data-visible");
    currentTarget = null;
  };

  const update = () => {
    const sel = doc.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return hide();
    const range = sel.getRangeAt(0);
    const el = asElement(range.commonAncestorContainer);
    const target = el?.closest<HTMLElement>("[data-pb-inline-edit]") ?? null;
    const path = target?.getAttribute("data-pb-inline-edit") ?? "";
    if (!target || !formattable.has(path)) return hide();
    currentTarget = target;
    toolbar.setAttribute("data-visible", "true");
    const rect = range.getBoundingClientRect();
    const width = toolbar.offsetWidth || 100;
    const height = toolbar.offsetHeight || 34;
    const win = doc.defaultView;
    const maxLeft = (win?.innerWidth ?? 800) - width - 8;
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - width / 2),
      maxLeft
    );
    // Über der Auswahl; zu nah am oberen Rand → darunter.
    const top =
      rect.top - height - 8 >= 8 ? rect.top - height - 8 : rect.bottom + 8;
    toolbar.style.left = `${Math.round(left)}px`;
    toolbar.style.top = `${Math.round(top)}px`;
  };

  // setTimeout statt requestAnimationFrame: rAF wird in Hintergrund-Tabs
  // gedrosselt/pausiert — die Toolbar erschiene dann gar nicht.
  let pending = 0;
  doc.addEventListener("selectionchange", () => {
    if (pending) return;
    pending = doc.defaultView?.setTimeout(() => {
      pending = 0;
      update();
    }, 30) as unknown as number;
  });
  doc.defaultView?.addEventListener("scroll", hide, { passive: true });

  toolbar.addEventListener("mousedown", event => event.preventDefault());
  toolbar.addEventListener("click", event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-pb-mark]"
    );
    if (!button || !currentTarget) return;
    const mark = button.getAttribute("data-pb-mark") as RichMark;
    const sel = doc.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!currentTarget.contains(range.commonAncestorContainer)) return;
    const path = currentTarget.getAttribute("data-pb-inline-edit") ?? "";
    const maxLength = formattable.get(path) ?? Infinity;
    const target = currentTarget;
    const start = plainOffset(target, range.startContainer, range.startOffset);
    const end = plainOffset(target, range.endContainer, range.endOffset);
    // Textbasiert statt DOM-Chirurgie: Marker bleiben garantiert flach —
    // verschachtelte strong/em ergaben sonst unparsebare Marker, die als
    // rohe Sternchen in der Vorschau landeten (User-Befund 2026-08-30).
    const value = toggleRangeMark(
      serializeRichDom(target),
      Math.min(start, end),
      Math.max(start, end),
      mark
    ).trim();
    sel.removeAllRanges();
    hide();
    if (!value || value.length > maxLength) return;
    // Sofort-Feedback; das saubere Pack-Rendering folgt mit dem Reload.
    target.innerHTML = richHtml(value);
    onApply(path, value);
  });
}
