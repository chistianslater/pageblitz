import { getConstitution } from "@shared/stylePacks";
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
export function packFontHrefs(packId: PackId): string[] {
  const constitution = getConstitution(packId);
  const fonts = [
    constitution.type.display,
    constitution.type.body,
    constitution.type.utility,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const families = Array.from(new Set(fonts.map(f => f.googleCss)));
  if (families.length === 0) return [];

  const query = families.map(f => `family=${f}`).join("&");
  return [`https://fonts.googleapis.com/css2?${query}&display=swap`];
}
