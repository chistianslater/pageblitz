import { mapGmbOpeningHoursToV2 } from "./gmbOpeningHours";
import type { GenerateSiteContentArgs } from "./generateSiteContent";
import type { ExistingSiteFacts } from "../gmb/siteCrawl";
import type { V2Images, V2JobBusiness } from "./runJob";

/**
 * Baut `business`/`facts` für `generateSiteContent` aus einem Business-
 * Datensatz + Ziel-Slug + bereits aufgelösten Bildern (`resolveV2Images`).
 * Rein (keine DB-/Netzwerk-Calls) — gemeinsam genutzt von
 * `runWebsiteGenerationV2` (Erstgenerierung/Studio-Job, `runJob.ts`) und
 * `website.regenerate` (Admin-Regenerierung, `routers.ts`), damit das
 * Fakten-Mapping nur an einer Stelle existiert statt zweimal identisch
 * inline zu stehen (Review-Finding, Task 3 Fix-Runde).
 *
 * `slug` ist bewusst ein eigener Parameter statt aus `business` abgeleitet:
 * die Erstgenerierung nutzt den bereits vergebenen `website.slug`, die
 * Admin-Regenerierung vergibt bei jedem Lauf einen neuen Slug.
 */
export function buildV2GenerationFacts(
  business: V2JobBusiness,
  category: string,
  slug: string,
  images: V2Images,
  /**
   * Crawl-Ergebnis der bestehenden Betriebs-Website (Plan B7 Task 2,
   * `crawlExistingSite` in `server/gmb/siteCrawl.ts`). Optional: `null`/
   * `undefined` (keine Website, Crawl fehlgeschlagen) lässt das Feld weg —
   * dann fehlt auch der Prompt-Abschnitt. Nur eine Prompt-Faktenquelle,
   * landet nie im Dokument.
   */
  existingSite?: ExistingSiteFacts | null
): Pick<GenerateSiteContentArgs, "business" | "facts"> {
  const rating = business.rating ? parseFloat(business.rating) : NaN;
  return {
    business: {
      name: business.name,
      category,
      city: business.searchRegion || undefined,
    },
    facts: {
      slug,
      businessCategory: category,
      ...(Number.isFinite(rating)
        ? { google: { rating, reviewCount: business.reviewCount || 0 } }
        : {}),
      contact: {
        phone: business.phone || undefined,
        email: business.email || undefined,
        // business.address ist ein unstrukturierter Freitext-Fund (GMB-Adresse,
        // Tabelle "businesses" hat kein street/zip/city) — die v2-ContactSchema
        // erwartet street/zip/city getrennt. Ohne strukturierte Trennung wird
        // hier bewusst NUR die Stadt aus searchRegion übernommen; street/zip
        // bleiben leer, bis der Onboarding-Legal-Schritt (applyOnboardingToV2)
        // sie mit echten, vom Nutzer bestätigten Werten füllt.
        city: business.searchRegion || undefined,
        openingHours: mapGmbOpeningHoursToV2(business.openingHours),
      },
      images,
      ...(existingSite ? { existingSite } : {}),
    },
  };
}
