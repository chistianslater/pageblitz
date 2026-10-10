import { getConstitution, getFontPair } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

/**
 * Baut die Google-Fonts-Stylesheet-URL(s) für die Fonts einer Pack-
 * Verfassung (`type.display`/`type.body`/`type.utility`) — dedupliziert auf
 * die `googleCss`-Familienangabe, damit dieselbe Familie nicht zweimal in
 * der Query landet. Pendant zu `buildFontsUrl` in `server/ssr/renderSite.tsx`
 * (SSR-Head); dieser Helfer bedient den CSR-Fallback (`SitePage.tsx`), wenn
 * eine Kundenseite ohne SSR-HTML innerhalb der SPA gerendert wird.
 *
 * Liefert ein Array (aktuell immer 0 oder 1 Eintrag) statt einer einzelnen
 * URL, damit Aufrufer unabhängig von der internen Bündelung einfach über
 * `<link>`-Tags iterieren können.
 */
export function packFontHrefs(packId: PackId, fontPairId?: string): string[] {
  const constitution = getConstitution(packId);
  // Gewählte Schriftpaarung (Studio-Theme-Editor) ersetzt display/body —
  // dieselbe Ersetzung wie toCssVars/fontsForDoc im SSR, damit CSR-Vorschau
  // und Live-Seite identisch aussehen.
  const pair = getFontPair(fontPairId);
  const fonts = [
    pair?.display ?? constitution.type.display,
    pair?.body ?? constitution.type.body,
    constitution.type.utility,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const families = Array.from(new Set(fonts.map(f => f.googleCss)));
  if (families.length === 0) return [];

  const query = families.map(f => `family=${f}`).join("&");
  return [`https://fonts.googleapis.com/css2?${query}&display=swap`];
}

/**
 * Schrift-Links für ein ganzes Dokument (CSR-Fallback): rev 3 bringt seine
 * Systemschriften selbst gehostet mit (SSR-Head, `/fonts/systems/`) und
 * braucht deshalb keine Google Fonts; alles andere wie packFontHrefs.
 */
export function siteFontHrefs(doc: {
  stylePackId: PackId;
  fontPairId?: string;
  designRevision?: number;
  system?: string;
}): string[] {
  if (doc.designRevision === 3 && doc.system) return [];
  return packFontHrefs(doc.stylePackId, doc.fontPairId);
}
