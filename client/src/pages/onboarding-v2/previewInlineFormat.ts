import { serializeRichDom, type RichMark } from "@/components/site/richText";

/**
 * Schwebende Format-Toolbar im Vorschau-iframe (2026-08-30): Text in einem
 * formatierbaren Inline-Feld markieren → F/K/A über der Auswahl. Ein Klick
 * wrappt die Auswahl in strong/em (bzw. entfernt die Auszeichnung), das
 * Element wird zu Marker-Text serialisiert (richText.tsx) und sofort
 * gespeichert — der iframe lädt danach mit sauberem Render neu.
 */

const STYLE_MARK = "data-pb-inline-format-style";

const TOOLBAR_CSS = `
.pb-inline-format{position:fixed;z-index:32;display:none;align-items:center;gap:2px;padding:3px;background:rgba(11,11,13,.94);border:1px solid rgba(255,255,255,.14);border-radius:999px;box-shadow:0 14px 34px rgba(11,11,13,.4);font-family:"Space Grotesk",system-ui,sans-serif}
.pb-inline-format[data-visible="true"]{display:flex}
.pb-inline-format button{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:999px;background:transparent;color:rgba(245,245,242,.85);font:600 .8rem/1 "Space Grotesk",system-ui,sans-serif;cursor:pointer}
.pb-inline-format button:hover{background:rgba(255,255,255,.14);color:#fff}
.pb-inline-format button[data-accent]{color:#ccff00}
`;

function markElement(doc: Document, mark: RichMark): HTMLElement {
  const el = doc.createElement(mark === "**" ? "strong" : "em");
  if (mark === "==") el.className = "pb-rich-accent";
  return el;
}

/** Passendes Format-Element, in dem die Range vollständig liegt (→ Unwrap). */
/** Cross-Realm-sicher (iframe): nodeType statt instanceof. */
function asElement(node: Node): Element | null {
  return node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
}

function surroundingMark(
  range: Range,
  mark: RichMark,
  boundary: Element
): Element | null {
  const el = asElement(range.commonAncestorContainer);
  const selector =
    mark === "**"
      ? "strong"
      : mark === "=="
        ? "em.pb-rich-accent"
        : "em:not(.pb-rich-accent)";
  const found = el?.closest(selector) ?? null;
  return found && boundary.contains(found) && found !== boundary
    ? found
    : null;
}

/**
 * Auswahl auszeichnen bzw. Auszeichnung entfernen. Exportiert für Tests.
 * Gleiche Auszeichnungen im extrahierten Fragment werden entpackt, damit
 * keine Verschachtelung entsteht (Serialisierung bliebe sonst mehrdeutig).
 */
export function applyMarkToRange(
  doc: Document,
  range: Range,
  mark: RichMark,
  boundary: Element
): void {
  const wrapped = surroundingMark(range, mark, boundary);
  if (wrapped) {
    const parent = wrapped.parentNode;
    if (!parent) return;
    while (wrapped.firstChild) parent.insertBefore(wrapped.firstChild, wrapped);
    wrapped.remove();
    return;
  }
  const frag = range.extractContents();
  const tag = mark === "**" ? "strong" : "em";
  frag
    .querySelectorAll(tag)
    .forEach(nested => nested.replaceWith(...Array.from(nested.childNodes)));
  const wrap = markElement(doc, mark);
  wrap.appendChild(frag);
  range.insertNode(wrap);
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

  doc.addEventListener("selectionchange", () => {
    doc.defaultView?.requestAnimationFrame(update);
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
    applyMarkToRange(doc, range, mark, currentTarget);
    const value = serializeRichDom(currentTarget).trim();
    sel.removeAllRanges();
    hide();
    if (value && value.length <= maxLength) onApply(path, value);
  });
}
