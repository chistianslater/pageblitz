/**
 * Halluzinations-Guard nach der LLM-Phase (Plan B7 Task 3, Spec §2.2):
 *
 * (a) Stadt-Guard: Städtenamen im generierten Text müssen aus den Fakten
 *     stammen. Taucht eine fremde deutsche Großstadt auf (Referenzfall §0:
 *     „…In München." für einen Betrieb in Bocholt), wird sie deterministisch
 *     durch die Fakten-Stadt ersetzt — bzw. die Orts-Phrase entfernt, wenn
 *     keine Fakten-Stadt bekannt ist.
 * (b) Branchen-Guard: enthält der Text starke Marker einer Branche, die
 *     weder zur Kategorie noch zum Kontext (Editorial Summary, bestehende
 *     Website) passt (Referenzfall: „Präzisionsoptik und Akustik" für eine
 *     Werbeagentur), gibt es GENAU EINEN LLM-Retry mit explizitem Hinweis —
 *     danach wird akzeptiert (kein Endlos-Loop, Spec §2.2).
 *
 * Der Guard läuft im Job NACH generateSiteContent und INNERHALB des
 * try/restore-Blocks von runJob.ts (Zeitmaschinen-Interim darf einen
 * Fehlschlag nicht überleben). Er wirft selbst nie wegen eines
 * fehlgeschlagenen Retrys — dann bleibt die (stadt-korrigierte) Erstfassung
 * stehen, statt den ganzen Job scheitern zu lassen.
 */
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import type { ExistingSiteFacts } from "../gmb/siteCrawl";
import { GERMAN_CITIES, INDUSTRY_MARKER_GROUPS } from "./factGuardData";

export interface FactGuardFacts {
  businessName: string;
  /** Fakten-Stadt (parseGmbAddress bzw. searchRegion) — fremde Städte werden hierdurch ersetzt. */
  city?: string;
  /** Kategorie aus der GMB-Kette (nie der Firmenname). */
  category?: string;
  /** Zusätzliche Fakten-Evidenz: Editorial Summary + Text der bestehenden Website. */
  contextText?: string;
}

/**
 * Städtenamen, die zugleich gewöhnliche deutsche Wörter sind („gutes Essen",
 * „unsere Halle") — sie werden nur nach einer Orts-Präposition („in Essen")
 * als Stadt behandelt, sonst nie angefasst.
 */
const AMBIGUOUS_CITIES = new Set(["Essen", "Halle"]);

const LOCATION_PREPOSITIONS =
  "(?:in|In|aus|Aus|bei|Bei|nach|Nach|von|Von|um|Um)";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cityPattern(city: string): RegExp {
  const c = escapeRegex(city);
  if (AMBIGUOUS_CITIES.has(city)) {
    return new RegExp(
      `(?<=\\b${LOCATION_PREPOSITIONS}\\s)${c}(?!\\p{L})`,
      "gu"
    );
  }
  return new RegExp(`(?<!\\p{L})${c}(?!\\p{L})`, "gu");
}

/** Orts-Phrase „ in München" für den Entfernen-Fall (keine Fakten-Stadt bekannt). */
function cityPhrasePattern(city: string): RegExp {
  const c = escapeRegex(city);
  return new RegExp(`\\s${LOCATION_PREPOSITIONS}\\s+${c}(?!\\p{L})`, "gu");
}

/** Werte-Schlüssel, in denen NIE ersetzt wird (Fakten/URLs/strukturierte Felder). */
const SKIP_KEYS = new Set([
  "imageUrl",
  "url",
  "ctaHref",
  "email",
  "phone",
  "street",
  "zip",
  "day",
  "hours",
  "slug",
]);

function isUrlLike(value: string): boolean {
  return /^(https?:|\/|#|mailto:|tel:)/.test(value);
}

type CityGuardState = { replacements: number };

function guardString(
  text: string,
  foreignCities: string[],
  factCity: string | undefined,
  state: CityGuardState
): string {
  let result = text;
  for (const city of foreignCities) {
    if (factCity) {
      result = result.replace(cityPattern(city), () => {
        state.replacements += 1;
        return factCity;
      });
    } else {
      // Erst die Orts-Phrase („ in München") entfernen, dann übrige nackte
      // Nennungen — anschließend Leerraum-/Satzzeichen-Artefakte aufräumen.
      result = result.replace(cityPhrasePattern(city), () => {
        state.replacements += 1;
        return "";
      });
      result = result.replace(cityPattern(city), () => {
        state.replacements += 1;
        return "";
      });
    }
  }
  if (result !== text) {
    result = result
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim();
  }
  // Sicherheitsnetz: ein Feld darf durch den Guard nie leer werden
  // (WebsiteDataV2Schema verlangt z. B. headline min(1)).
  if (result.length === 0 && text.trim().length > 0) return text;
  return result;
}

function deepGuard(
  value: unknown,
  fn: (text: string) => string,
  key?: string
): unknown {
  if (typeof value === "string") {
    if ((key && SKIP_KEYS.has(key)) || isUrlLike(value)) return value;
    return fn(value);
  }
  if (Array.isArray(value)) return value.map(v => deepGuard(v, fn, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        deepGuard(v, fn, k),
      ])
    );
  }
  return value;
}

function applyCityGuard(
  doc: WebsiteDataV2,
  facts: FactGuardFacts
): { doc: WebsiteDataV2; replacements: number } {
  const factCity = facts.city?.trim() || undefined;
  const factCityLower = factCity?.toLowerCase();
  const foreignCities = GERMAN_CITIES.filter(city => {
    if (!factCityLower) return true;
    const cl = city.toLowerCase();
    // Die Fakten-Stadt (auch als Bestandteil, z. B. „Frankfurt am Main"
    // vs. Listen-Eintrag „Frankfurt") wird nie ersetzt.
    return !factCityLower.includes(cl) && !cl.includes(factCityLower);
  });

  const state: CityGuardState = { replacements: 0 };
  const fn = (text: string) =>
    guardString(text, foreignCities, factCity, state);

  const candidate: WebsiteDataV2 = {
    ...doc,
    seo: deepGuard(doc.seo, fn) as WebsiteDataV2["seo"],
    sections: deepGuard(doc.sections, fn) as WebsiteDataV2["sections"],
    ...(doc.tagline !== undefined ? { tagline: fn(doc.tagline) } : {}),
    ...(doc.footerNote !== undefined ? { footerNote: fn(doc.footerNote) } : {}),
  };
  if (state.replacements === 0) return { doc, replacements: 0 };

  const validated = WebsiteDataV2Schema.safeParse(candidate);
  if (!validated.success) {
    console.warn(
      "[FactGuard] Stadt-Korrektur verworfen — Ergebnis wäre schema-invalid:",
      validated.error.message
    );
    return { doc, replacements: 0 };
  }
  return { doc: validated.data, replacements: state.replacements };
}

function extractDocText(doc: WebsiteDataV2): string {
  const parts: string[] = [];
  const collect = (value: unknown, key?: string): void => {
    if (typeof value === "string") {
      if ((key && SKIP_KEYS.has(key)) || isUrlLike(value)) return;
      parts.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const v of value) collect(v, key);
      return;
    }
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        collect(v, k);
      }
    }
  };
  collect(doc.seo);
  collect(doc.sections);
  return parts.join(" ");
}

interface IndustryContradiction {
  label: string;
  hits: string[];
}

function detectIndustryContradiction(
  doc: WebsiteDataV2,
  facts: FactGuardFacts
): IndustryContradiction | null {
  const docText = extractDocText(doc).toLowerCase();
  const allowed = [facts.category, facts.businessName, facts.contextText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const group of INDUSTRY_MARKER_GROUPS) {
    const hits = group.markers.filter(m => docText.includes(m));
    if (hits.length < 2) continue;
    const evidenced = group.markers.some(m => allowed.includes(m));
    if (!evidenced) return { label: group.label, hits };
  }
  return null;
}

function buildRetryHint(
  contradiction: IndustryContradiction,
  facts: FactGuardFacts
): string {
  return [
    `Dein vorheriger Entwurf beschrieb fälschlich Leistungen aus dem Bereich „${contradiction.label}" (Begriffe: ${contradiction.hits.join(", ")}). Das ist FALSCH — der Betrieb hat damit nichts zu tun.`,
    `Tatsächliche Branche/Kategorie: ${facts.category || "unbekannt — nutze ausschließlich die übrigen Fakten"}.`,
    `Leite die Branche NIEMALS aus dem Firmennamen ab. Beschreibe nur Leistungen, die durch Kategorie, Google-Beschreibung oder die bestehende Website des Betriebs belegt sind.`,
  ].join(" ");
}

/**
 * Baut den Kontext-Text für den Branchen-Guard aus Editorial Summary und
 * Website-Crawl — die beiden Faktenquellen, die eine ungewöhnliche, aber
 * echte Branche belegen können (verhindert falsche Retries).
 */
export function buildGuardContextText(
  editorialSummary: string | null | undefined,
  existingSite: ExistingSiteFacts | null | undefined
): string | undefined {
  const parts = [
    editorialSummary,
    existingSite?.title,
    existingSite?.description,
    existingSite?.text,
  ].filter((p): p is string => Boolean(p && p.trim()));
  return parts.length ? parts.join(" ") : undefined;
}

/**
 * Validiert ein generiertes Dokument gegen die Fakten. `retry` (ein erneuter
 * generateSiteContent-Lauf mit explizitem Hinweis) wird höchstens EINMAL
 * aufgerufen; sein Ergebnis durchläuft erneut den Stadt-Guard und wird dann
 * akzeptiert. Wirft nie wegen eines Retry-Fehlers.
 */
export async function guardGeneratedContent(
  doc: WebsiteDataV2,
  facts: FactGuardFacts,
  retry?: (hint: string) => Promise<WebsiteDataV2>
): Promise<WebsiteDataV2> {
  let guarded = applyCityGuard(doc, facts);
  if (guarded.replacements > 0) {
    console.warn(
      `[FactGuard] ${guarded.replacements}× fremde Stadt im Text ${facts.city ? `durch „${facts.city}" ersetzt` : "entfernt"} (Business „${facts.businessName}").`
    );
  }

  const contradiction = detectIndustryContradiction(guarded.doc, facts);
  if (contradiction) {
    console.warn(
      `[FactGuard] Branchen-Widerspruch „${contradiction.label}" (${contradiction.hits.join(", ")}) vs. Kategorie „${facts.category || "—"}" (Business „${facts.businessName}").`
    );
    if (retry) {
      try {
        const retried = await retry(buildRetryHint(contradiction, facts));
        const reguarded = applyCityGuard(retried, facts);
        if (reguarded.replacements > 0) {
          console.warn(
            `[FactGuard] Retry: ${reguarded.replacements}× fremde Stadt korrigiert.`
          );
        }
        return reguarded.doc;
      } catch (err) {
        console.warn(
          "[FactGuard] Branchen-Retry fehlgeschlagen — Erstfassung bleibt stehen:",
          err
        );
      }
    }
  }
  return guarded.doc;
}
