import { resolveOpeningHours } from "./gmbOpeningHours";
import { parseGmbAddress } from "../gmb/address";
import type { GenerateSiteContentArgs } from "./generateSiteContent";
import type { GmbReview } from "../gmb/details";
import type { ExistingSiteFacts } from "../gmb/siteCrawl";
import type { V2Images, V2JobBusiness } from "./runJob";

/** Spec §2.2: max. 3 Testimonials, nur ≥ 4 Sterne, Text ≤ 240 Zeichen. */
const MAX_TESTIMONIALS = 3;
const MIN_TESTIMONIAL_RATING = 4;
const MAX_TESTIMONIAL_TEXT_LENGTH = 240;

/** „Anna Beispiel Müller" → „Anna M." — nur Vorname + Initial des Nachnamens. */
function shortenReviewAuthor(authorName: string): string {
  const parts = authorName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anonym";
  if (parts.length === 1) return parts[0];
  const initial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${parts[0]} ${initial}.`;
}

/** Kürzt an der Wortgrenze (nie mitten im Wort) und hängt eine Ellipse an. */
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength - 2);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[\s.,;:]+$/, "")} …`;
}

/**
 * Filtert die persistierten Google-Reviews (`businesses.googleReviews`, rohe
 * GMB-Form aus persistGmbDetails) zu Testimonial-Fakten (Spec §2.2):
 * nur ≥ 4 Sterne, nur mit Text, max. 3, Autor als „Vorname N.", Text an der
 * Wortgrenze auf ≤ 240 Zeichen gekürzt, Whitespace normalisiert.
 * Deterministisch — diese Texte formuliert NIE das LLM (mergeFacts in
 * generateSiteContent.ts setzt/ersetzt die testimonials-Sektion damit).
 */
export function selectTestimonialReviews(
  reviews: GmbReview[] | null | undefined
): { author: string; text: string; rating: number }[] {
  if (!reviews?.length) return [];
  return reviews
    .filter(
      r =>
        r.rating >= MIN_TESTIMONIAL_RATING && r.text && r.text.trim().length > 0
    )
    .slice(0, MAX_TESTIMONIALS)
    .map(r => ({
      author: shortenReviewAuthor(r.author_name),
      text: truncateAtWordBoundary(
        r.text.replace(/\s+/g, " ").trim(),
        MAX_TESTIMONIAL_TEXT_LENGTH
      ),
      rating: r.rating,
    }));
}

/**
 * Baut `business`/`facts` für `generateSiteContent` aus einem Business-
 * Datensatz + Ziel-Slug + bereits aufgelösten Bildern (`resolveV2Images`).
 * Rein (keine DB-/Netzwerk-Calls) — gemeinsam genutzt von
 * `runWebsiteGenerationV2` (Erstgenerierung/Studio-Job, `runJob.ts`) und
 * `website.regenerate` (Admin-Regenerierung, `routers.ts`), damit das
 * Fakten-Mapping nur an einer Stelle existiert statt zweimal identisch
 * inline zu stehen (Review-Finding, Task 3 Fix-Runde).
 *
 * Stadt/Straße/PLZ kommen deterministisch aus `parseGmbAddress` über die
 * persistierte GMB-Adresse (`businesses.address`, formatted_address-Freitext)
 * — `searchRegion` ist nur noch Nachrangquelle für die Stadt (Plan B7
 * Task 3, Spec §2.1: Referenzfall „…In München." für einen Betrieb in
 * Bocholt).
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
  const parsedAddress = parseGmbAddress(null, business.address);
  const city = parsedAddress.city || business.searchRegion || undefined;
  return {
    business: {
      name: business.name,
      category,
      city,
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
        street: parsedAddress.street,
        zip: parsedAddress.zip,
        city,
        openingHours: resolveOpeningHours(business.openingHours),
      },
      // Immer als Array (ggf. leer): ein leeres Array heißt „es gibt keine
      // belastbaren Reviews" — mergeFacts strippt dann auch eine vom LLM
      // erfundene testimonials-Sektion, statt sie stehen zu lassen.
      reviews: selectTestimonialReviews(business.googleReviews),
      ...(business.editorialSummary
        ? { editorialSummary: business.editorialSummary }
        : {}),
      images,
      ...(existingSite ? { existingSite } : {}),
    },
  };
}
