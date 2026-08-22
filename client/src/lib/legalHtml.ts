/**
 * Liest Impressum-/Datenschutz-HTML aus einem Website-Dokument, egal ob es
 * v1 (Top-Level-Felder) oder v2 (`websiteData.legal.*`, siehe
 * shared/siteContract/schema.ts) ist.
 *
 * v2-Dokumente speichern impressumHtml/datenschutzHtml ausschließlich unter
 * `legal`, NICHT mehr top-level — ein v2-Dokument mit Top-Level-Feldern würde
 * das strikte WebsiteDataV2Schema verletzen (siehe server/v2WriteGuard.ts).
 * Diese Funktion bleibt bewusst pur (kein Netzwerk, keine React-Hooks), damit
 * sie unabhängig von LegalPage getestet werden kann.
 */
export function pickLegalHtml(
  websiteData: unknown,
  kind: "impressum" | "datenschutz"
): string | null {
  if (!websiteData || typeof websiteData !== "object") return null;
  const data = websiteData as Record<string, unknown>;

  if (data.version === 2) {
    const legal = data.legal;
    if (!legal || typeof legal !== "object") return null;
    const html = (legal as Record<string, unknown>)[
      kind === "impressum" ? "impressumHtml" : "datenschutzHtml"
    ];
    return typeof html === "string" ? html : null;
  }

  const html = data[kind === "impressum" ? "impressumHtml" : "datenschutzHtml"];
  return typeof html === "string" ? html : null;
}
