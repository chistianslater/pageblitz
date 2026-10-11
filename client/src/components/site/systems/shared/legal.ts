/**
 * Rechtstext aus dem legalGenerator für den System-Rahmen vorbereiten
 * (Journal, Raster). Der Generator liefert ein ganzes Dokument mit eigenem
 * `<style>` (body max-width, h2-Linien, Linkfarbe) und einem
 * „← Zurück zur Website“-Link — beides gälte sonst für die ganze Seite
 * bzw. gehört nicht in die Website. Übrig bleibt der Inhalt des `<body>`;
 * das erste h1 wird zum Seitentitel gehoben (genau ein h1 je Seite).
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator
 * (renderLegalPage in server/ssr/renderSite.tsx), nie aus Nutzereingaben.
 */
const BODY = /<body[^>]*>([\s\S]*?)<\/body>/i;
const STYLE = /<style[\s\S]*?<\/style>/gi;
const BACK_LINK = /<a\b[^>]*class="[^"]*\bback-link\b[^"]*"[^>]*>[\s\S]*?<\/a>\s*/gi;
const FIRST_H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i;

export type LegalParts = {
  /** Inhalt des ersten h1 (für den Seitenkopf), falls vorhanden. */
  titleHtml?: string;
  /** Rest des Rechtstexts, ohne Dokument-Hülle, Stil und Zurück-Link. */
  body: string;
};

export function legalParts(html: string): LegalParts {
  const inner = html.match(BODY)?.[1] ?? html;
  const clean = inner.replace(STYLE, "").replace(BACK_LINK, "");
  const match = clean.match(FIRST_H1);
  const body = (match ? clean.replace(FIRST_H1, "") : clean).trim();
  return { titleHtml: match?.[1], body };
}
