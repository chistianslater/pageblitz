/**
 * Live-Vorschau für strukturierte Editoren (2026-09-26, Speisekarte): der
 * Server rendert den Entwurf komplett (`previewOfferDraft`), hier wird nur
 * die betroffene Sektion ins bestehende Vorschau-DOM übernommen — ohne
 * Neuladen, ohne Scrollsprung, ohne Speichern.
 *
 * Fehlt die Sektion in der Vorschau noch (Speisekarte gerade erst gebucht),
 * landet sie hinter dem nächsten Vorgänger mit bekannter id, sonst vor dem
 * nächsten Nachfolger. Ohne jeden Ankerpunkt → false, dann bleibt es beim
 * Neuladen nach dem Speichern.
 */
export function swapSectionFromHtml(
  target: Document,
  html: string,
  anchor: string
): boolean {
  const source = new DOMParser().parseFromString(html, "text/html");
  const next = source.getElementById(anchor);
  const current = target.getElementById(anchor);
  if (!next) {
    current?.remove();
    return current !== null;
  }
  const imported = target.importNode(next, true);
  if (current) {
    current.replaceWith(imported);
    return true;
  }
  for (
    let prev = next.previousElementSibling;
    prev;
    prev = prev.previousElementSibling
  ) {
    const match = prev.id ? target.getElementById(prev.id) : null;
    if (match) {
      match.after(imported);
      return true;
    }
  }
  for (
    let after = next.nextElementSibling;
    after;
    after = after.nextElementSibling
  ) {
    const match = after.id ? target.getElementById(after.id) : null;
    if (match) {
      match.before(imported);
      return true;
    }
  }
  return false;
}
