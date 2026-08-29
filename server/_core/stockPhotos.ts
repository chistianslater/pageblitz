/**
 * Unsplash stock photo search
 * Requires UNSPLASH_ACCESS_KEY env var (free at unsplash.com/oauth/applications)
 * Rate limit: 50 req/hour (demo) – covered by 5-min in-memory cache
 */

const UNSPLASH_BASE = "https://api.unsplash.com";

// Simple in-memory TTL cache – keyed by "query:page:perPage"
const cache = new Map<string, { data: StockSearchResult; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface StockPhoto {
  id: string;
  url: string;         // full-res landscape (w=1600)
  thumb: string;       // thumbnail (w=400)
  photographer: string;
  photographerUrl: string;
}

export interface StockSearchResult {
  photos: StockPhoto[];
  total: number;
  totalPages: number;
}


/**
 * Unsplash ist englisch verschlagwortet — deutsche Komposita wie
 * „Kosmetikstudio" liefern 0 Treffer (User-Bug 2026-08-29). Kuratierte
 * Übersetzungen für die Branchen-Suchbegriffe; bei 0 Treffern wird einmal
 * mit der Übersetzung (bzw. dem entschärften Grundwort) erneut gesucht.
 */
const GERMAN_QUERY_FALLBACKS: Record<string, string> = {
  friseur: "hair salon",
  friseursalon: "hair salon",
  kosmetik: "beauty salon",
  kosmetikstudio: "beauty salon",
  nagelstudio: "nail salon",
  zahnarzt: "dentist clinic",
  zahnarztpraxis: "dentist clinic",
  arzt: "doctor practice",
  arztpraxis: "doctor practice",
  physiotherapie: "physiotherapy",
  rechtsanwalt: "lawyer office",
  anwaltskanzlei: "lawyer office",
  kanzlei: "law office",
  steuerberater: "accountant office",
  steuerberatung: "accountant office",
  immobilien: "real estate",
  immobilienmakler: "real estate agent",
  handwerk: "craftsman workshop",
  handwerker: "craftsman",
  schreinerei: "carpentry workshop",
  tischlerei: "carpentry workshop",
  baeckerei: "bakery",
  bäckerei: "bakery",
  konditorei: "pastry shop",
  metzgerei: "butcher shop",
  reinigung: "cleaning service",
  gebäudereinigung: "cleaning service",
  gebaeudereinigung: "cleaning service",
  hausreinigung: "house cleaning",
  hundesalon: "dog grooming",
  hundefriseur: "dog grooming",
  musikschule: "music school",
  elektriker: "electrician",
  elektroinstallation: "electrician",
  maler: "painter decorator",
  malerbetrieb: "painter decorator",
  klempner: "plumber",
  sanitär: "plumber",
  sanitaer: "plumber",
  gärtner: "gardener",
  gaertner: "gardener",
  gärtnerei: "garden nursery",
  gaertnerei: "garden nursery",
  gartenbau: "landscaping",
  tierarzt: "veterinarian",
  tierarztpraxis: "veterinarian",
  apotheke: "pharmacy",
  yogastudio: "yoga studio",
  fahrschule: "driving school",
  "kfz-werkstatt": "car repair shop",
  kfzwerkstatt: "car repair shop",
  autowerkstatt: "car repair shop",
  werkstatt: "workshop",
  schlüsseldienst: "locksmith",
  schluesseldienst: "locksmith",
  architekt: "architect office",
  architekturbüro: "architect office",
  architekturbuero: "architect office",
  innenarchitekt: "interior design",
  innenarchitektur: "interior design",
  buchhaltung: "bookkeeping office",
  logopädie: "speech therapy",
  logopaedie: "speech therapy",
  ergotherapie: "occupational therapy",
  hebamme: "midwife",
  pilatesstudio: "pilates studio",
  reisebüro: "travel agency",
  reisebuero: "travel agency",
  fotostudio: "photo studio",
  fotograf: "photographer",
  fitnessstudio: "gym fitness",
  gasthaus: "german restaurant",
  gaststätte: "german restaurant",
  gaststaette: "german restaurant",
  ferienwohnung: "holiday apartment",
  pflegedienst: "home care nurse",
  versicherungsmakler: "insurance broker",
};

/** Grundwort-Heuristik: „…studio/-salon/-praxis/-service/-betrieb" abwerfen. */
const COMPOUND_SUFFIXES =
  /(studio|salon|praxis|service|betrieb|meisterbetrieb|zentrum|haus)$/;

function fallbackQueryFor(query: string): string | null {
  const key = query.toLowerCase().trim();
  const direct = GERMAN_QUERY_FALLBACKS[key];
  if (direct) return direct;
  const stripped = key.replace(COMPOUND_SUFFIXES, "").trim();
  if (stripped && stripped !== key) {
    return GERMAN_QUERY_FALLBACKS[stripped] ?? stripped;
  }
  return null;
}

export async function searchStockPhotos(
  query: string,
  page = 1,
  perPage = 12
): Promise<StockSearchResult> {
  const empty: StockSearchResult = { photos: [], total: 0, totalPages: 0 };

  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    console.warn("[stockPhotos] UNSPLASH_ACCESS_KEY not set");
    return empty;
  }

  const cacheKey = `${query.toLowerCase().trim()}:${page}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(perPage),
      page: String(page),
      orientation: "landscape",
    });
    const res = await fetch(`${UNSPLASH_BASE}/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${apiKey}` },
    });

    if (!res.ok) {
      console.warn(`[stockPhotos] Unsplash error ${res.status}`);
      return empty;
    }

    const data = await res.json();
    const result: StockSearchResult = {
      photos: (data.results || []).map((p: any) => ({
        id: String(p.id),
        // Append utm params for Unsplash attribution compliance
        url:  p.urls.regular  + "&utm_source=pageblitz&utm_medium=referral",
        thumb: p.urls.small   + "&utm_source=pageblitz&utm_medium=referral",
        photographer: p.user?.name ?? "Unbekannt",
        photographerUrl: (p.user?.links?.html ?? "https://unsplash.com") + "?utm_source=pageblitz&utm_medium=referral",
      })),
      total: data.total ?? 0,
      totalPages: data.total_pages ?? 0,
    };

    if (result.total === 0) {
      const fallback = fallbackQueryFor(query);
      if (fallback && fallback.toLowerCase() !== query.toLowerCase().trim()) {
        const translated = await searchStockPhotos(fallback, page, perPage);
        // Unter dem ORIGINAL-Key cachen, damit Folge-Seiten derselben
        // deutschen Suche nicht jedes Mal doppelt anfragen.
        cache.set(cacheKey, {
          data: translated,
          expires: Date.now() + CACHE_TTL_MS,
        });
        return translated;
      }
    }

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (e) {
    console.error("[stockPhotos] fetch failed:", e);
    return empty;
  }
}
