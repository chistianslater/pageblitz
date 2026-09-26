/**
 * Externe Links der Kundenseiten öffnen in neuem Tab (2026-09-26): Buttons
 * zu Bestell- und Buchungsplattformen sollen den Besucher nicht von der
 * Seite wegführen. Die 20 Packs rendern Hero-/CTA-Buttons selbst — statt 40
 * Stellen anzufassen, ergänzt das SSR `target`/`rel` zentral an jedem
 * `<a>` mit http(s)-Ziel, das noch kein `target` hat.
 */
export function openExternalLinksInNewTab(html: string): string {
  return html.replace(
    /<a (?![^>]*\btarget=)([^>]*?\bhref="https?:\/\/[^"]*"[^>]*)>/g,
    (_match, attrs: string) =>
      /\brel="/.test(attrs)
        ? `<a ${attrs} target="_blank">`
        : `<a ${attrs} target="_blank" rel="noopener noreferrer">`
  );
}
