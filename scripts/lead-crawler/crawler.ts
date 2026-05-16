/**
 * Pageblitz Lead Crawler
 *
 * Fetches Branche × Stadt combinations via Google Places API,
 * saves all businesses to DB and runs website quality analysis.
 *
 * Usage:
 *   npx tsx scripts/lead-crawler/crawler.ts
 *   DRY_RUN=true npx tsx scripts/lead-crawler/crawler.ts
 *
 * Required env vars:
 *   DATABASE_URL          – MySQL connection string
 *   GOOGLE_PLACES_API_KEY – Google Maps / Places API key
 */

import mysql from "mysql2/promise";

// ── Configuration ────────────────────────────────────────────────────────────

const DRY_RUN = process.env.DRY_RUN === "true";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const PLACES_BASE = "https://maps.googleapis.com";

const INDUSTRIES = [
  "Friseur",
  "Elektriker",
  "Klempner",
  "Maler",
  "Zimmermann",
  "Dachdecker",
  "Schlosser",
  "Schreiner",
  "Kfz-Werkstatt",
  "Restaurant",
  "Bäckerei",
  "Fleischer",
  "Reinigung",
  "Kosmetikstudio",
  "Nagelstudio",
  "Physiotherapie",
  "Zahnarzt",
  "Tierarzt",
  "Fotograf",
  "Architekt",
];

const CITIES = [
  "Berlin",
  "Hamburg",
  "München",
  "Köln",
  "Frankfurt",
  "Stuttgart",
  "Düsseldorf",
  "Dortmund",
  "Essen",
  "Leipzig",
  "Bremen",
  "Dresden",
  "Hannover",
  "Nürnberg",
  "Duisburg",
  "Bochum",
  "Wuppertal",
  "Bielefeld",
  "Bonn",
  "Münster",
];

// ── DB helpers ───────────────────────────────────────────────────────────────

let _pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL env var is required");
    _pool = mysql.createPool(url);
  }
  return _pool;
}

async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

/**
 * Check whether this industry+city combination was already crawled in the
 * last 30 days (based on the searchQuery / searchRegion columns).
 */
async function wasRecentlyCrawled(searchQuery: string, searchRegion: string): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM businesses
     WHERE searchQuery = ? AND searchRegion = ?
       AND updatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     LIMIT 1`,
    [searchQuery, searchRegion]
  );
  return Number(rows[0]?.cnt ?? 0) > 0;
}

/**
 * Upsert a business record. Uses placeId as the unique key.
 * Returns the business id (insertId on new, existing id on update).
 */
async function upsertBusiness(data: {
  placeId: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: string | null;
  reviewCount: number;
  category: string | null;
  lat: string | null;
  lng: string | null;
  openingHours: string[];
  hasWebsite: number;
  leadType: string;
  searchQuery: string;
  searchRegion: string;
}): Promise<number> {
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO businesses
       (placeId, name, slug, address, phone, website, rating, reviewCount,
        category, lat, lng, openingHours, hasWebsite, leadType,
        searchQuery, searchRegion, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       name        = VALUES(name),
       address     = VALUES(address),
       phone       = VALUES(phone),
       website     = VALUES(website),
       rating      = VALUES(rating),
       reviewCount = VALUES(reviewCount),
       category    = VALUES(category),
       lat         = VALUES(lat),
       lng         = VALUES(lng),
       openingHours = VALUES(openingHours),
       hasWebsite  = VALUES(hasWebsite),
       leadType    = VALUES(leadType),
       searchQuery = VALUES(searchQuery),
       searchRegion = VALUES(searchRegion),
       updatedAt   = NOW()`,
    [
      data.placeId,
      data.name,
      data.slug,
      data.address,
      data.phone,
      data.website,
      data.rating,
      data.reviewCount,
      data.category,
      data.lat,
      data.lng,
      JSON.stringify(data.openingHours),
      data.hasWebsite,
      data.leadType,
      data.searchQuery,
      data.searchRegion,
    ]
  );

  if (result.insertId && result.insertId > 0) {
    return result.insertId;
  }

  // ON DUPLICATE KEY UPDATE: fetch existing id
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT id FROM businesses WHERE placeId = ? LIMIT 1",
    [data.placeId]
  );
  return Number(rows[0]?.id ?? 0);
}

/**
 * Update a business record with website analysis results.
 */
async function updateBusinessAnalysis(
  id: number,
  leadType: string,
  websiteAge: number | null,
  websiteScore: number,
  websiteAnalysis: object
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE businesses
     SET leadType = ?, websiteAge = ?, websiteScore = ?, websiteAnalysis = ?, updatedAt = NOW()
     WHERE id = ?`,
    [leadType, websiteAge, websiteScore, JSON.stringify(websiteAnalysis), id]
  );
}

// ── Google Places API helpers ────────────────────────────────────────────────

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
}

interface PlacesSearchResponse {
  status: string;
  results: PlaceResult[];
}

interface PlaceDetailsResponse {
  status: string;
  result?: {
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { weekday_text: string[] };
    types?: string[];
  };
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function googleGet<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${PLACES_BASE}${endpoint}`);
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

function extractCategory(types: string[]): string {
  const typeMap: Record<string, string> = {
    hair_care: "Friseur",
    electrician: "Elektriker",
    plumber: "Klempner",
    painter: "Maler",
    roofing_contractor: "Dachdecker",
    locksmith: "Schlosser",
    car_repair: "Kfz-Werkstatt",
    restaurant: "Restaurant",
    bakery: "Bäckerei",
    meal_delivery: "Lieferdienst",
    beauty_salon: "Kosmetikstudio",
    nail_salon: "Nagelstudio",
    physiotherapist: "Physiotherapie",
    dentist: "Zahnarzt",
    veterinary_care: "Tierarzt",
    photographer: "Fotograf",
    general_contractor: "Bauunternehmer",
    laundry: "Reinigung",
  };
  for (const t of types) {
    if (typeMap[t]) return typeMap[t];
  }
  return types[0] ?? "Dienstleistung";
}

// ── Website Analysis (inlined from server/websiteAnalysis.ts) ────────────────

const CURRENT_YEAR = new Date().getFullYear();
const OUTDATED_THRESHOLD_YEARS = 4;
const POOR_SCORE_THRESHOLD = 40;

async function getWaybackFirstYear(url: string): Promise<number | null> {
  try {
    const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp&filter=statuscode:200&from=19960101&to=${CURRENT_YEAR}0101`;
    const res = await fetch(cdxUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json() as string[][];
    if (!data || data.length < 2) return null;
    const timestamp = data[1]?.[0];
    if (!timestamp || timestamp.length < 4) return null;
    return parseInt(timestamp.slice(0, 4), 10);
  } catch {
    return null;
  }
}

async function analyzeWebsiteHtml(url: string): Promise<{
  copyrightYear: number | null;
  hasMobileViewport: boolean;
  hasModernCms: boolean;
  cmsVersion: string | null;
  isResponsive: boolean;
  hasContactForm: boolean;
  hasHttps: boolean;
  pageLoadIndicators: string[];
}> {
  const result = {
    copyrightYear: null as number | null,
    hasMobileViewport: false,
    hasModernCms: false,
    cmsVersion: null as string | null,
    isResponsive: false,
    hasContactForm: false,
    hasHttps: url.startsWith("https://"),
    pageLoadIndicators: [] as string[],
  };

  try {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageblitzBot/1.0; +https://pageblitz.de)",
        "Accept": "text/html",
      },
    });
    if (!res.ok) return result;

    result.hasHttps = res.url.startsWith("https://");
    const html = await res.text();
    const lower = html.toLowerCase();

    result.hasMobileViewport = lower.includes('name="viewport"') || lower.includes("name='viewport'");
    result.isResponsive = result.hasMobileViewport || lower.includes("@media") || lower.includes("bootstrap") || lower.includes("tailwind") || lower.includes("responsive");
    result.hasContactForm = lower.includes('<form') && (lower.includes('contact') || lower.includes('kontakt') || lower.includes('email') || lower.includes('message') || lower.includes('nachricht'));

    if (lower.includes("wp-content") || lower.includes("wp-includes")) {
      result.hasModernCms = true;
      const wpMatch = html.match(/wordpress[^"]*?([0-9]+\.[0-9]+)/i);
      result.cmsVersion = wpMatch ? `WordPress ${wpMatch[1]}` : "WordPress";
      result.pageLoadIndicators.push("WordPress");
    } else if (lower.includes("joomla")) {
      result.hasModernCms = true; result.cmsVersion = "Joomla"; result.pageLoadIndicators.push("Joomla");
    } else if (lower.includes("typo3")) {
      result.hasModernCms = true; result.cmsVersion = "TYPO3"; result.pageLoadIndicators.push("TYPO3");
    } else if (lower.includes("drupal")) {
      result.hasModernCms = true; result.cmsVersion = "Drupal"; result.pageLoadIndicators.push("Drupal");
    } else if (lower.includes("wix.com") || lower.includes("wixsite")) {
      result.hasModernCms = true; result.cmsVersion = "Wix"; result.pageLoadIndicators.push("Wix");
    } else if (lower.includes("squarespace")) {
      result.hasModernCms = true; result.cmsVersion = "Squarespace"; result.pageLoadIndicators.push("Squarespace");
    } else if (lower.includes("jimdo")) {
      result.hasModernCms = true; result.cmsVersion = "Jimdo"; result.pageLoadIndicators.push("Jimdo");
    }

    const copyrightPatterns = [
      /©\s*(?:copyright\s*)?(\d{4})/i,
      /copyright\s*©?\s*(\d{4})/i,
      /&copy;\s*(\d{4})/i,
      /alle rechte vorbehalten.*?(\d{4})/i,
      /all rights reserved.*?(\d{4})/i,
    ];
    for (const pattern of copyrightPatterns) {
      const match = html.match(pattern);
      if (match) {
        const year = parseInt(match[1], 10);
        if (year >= 2000 && year <= CURRENT_YEAR) { result.copyrightYear = year; break; }
      }
    }
    const yearRangeMatch = html.match(/©\s*(\d{4})\s*[-–]\s*(\d{4})/);
    if (yearRangeMatch) {
      const lastYear = parseInt(yearRangeMatch[2], 10);
      if (lastYear >= 2000 && lastYear <= CURRENT_YEAR) result.copyrightYear = lastYear;
    }
    if (lower.includes("react") || lower.includes("vue") || lower.includes("angular") || lower.includes("next.js")) {
      result.pageLoadIndicators.push("Modern JS Framework");
    }
  } catch {
    // timeout / network error
  }
  return result;
}

function calculateQualityScore(analysis: {
  hasHttps: boolean;
  hasMobileViewport: boolean;
  isResponsive: boolean;
  hasContactForm: boolean;
  hasModernCms: boolean;
  copyrightYear: number | null;
  firstSeenYear: number | null;
}): number {
  let score = 0;
  if (analysis.hasHttps) score += 20;
  if (analysis.hasMobileViewport) score += 25;
  if (analysis.isResponsive) score += 15;
  if (analysis.hasContactForm) score += 10;
  if (analysis.hasModernCms) score += 10;
  const referenceYear = analysis.copyrightYear || analysis.firstSeenYear;
  if (referenceYear) {
    const age = CURRENT_YEAR - referenceYear;
    if (age <= 1) score += 20;
    else if (age <= 2) score += 15;
    else if (age <= 3) score += 10;
    else if (age <= 5) score += 5;
  }
  return Math.min(100, Math.max(0, score));
}

async function analyzeWebsite(websiteUrl: string | null | undefined): Promise<{
  leadType: "no_website" | "outdated_website" | "poor_website" | "unknown";
  websiteAge: number | null;
  websiteScore: number;
  details: object;
}> {
  if (!websiteUrl) {
    return { leadType: "no_website", websiteAge: null, websiteScore: 0, details: {} };
  }
  const [firstSeenYear, htmlAnalysis] = await Promise.all([
    getWaybackFirstYear(websiteUrl),
    analyzeWebsiteHtml(websiteUrl),
  ]);

  let websiteAge: number | null = null;
  let ageSource = "none";
  if (firstSeenYear) { websiteAge = CURRENT_YEAR - firstSeenYear; ageSource = "wayback"; }
  else if (htmlAnalysis.copyrightYear) { websiteAge = CURRENT_YEAR - htmlAnalysis.copyrightYear; ageSource = "copyright"; }

  const websiteScore = calculateQualityScore({ ...htmlAnalysis, firstSeenYear });

  let leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = "unknown";
  if (websiteAge !== null && websiteAge >= OUTDATED_THRESHOLD_YEARS) leadType = "outdated_website";
  else if (websiteScore < POOR_SCORE_THRESHOLD) leadType = "poor_website";

  return {
    leadType,
    websiteAge,
    websiteScore,
    details: { firstSeenYear, ageSource, ...htmlAnalysis },
  };
}

// ── Slug helper ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nanoid(len: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// ── Main crawler logic ───────────────────────────────────────────────────────

async function crawlCombination(industry: string, city: string): Promise<void> {
  const searchQuery = industry;
  const searchRegion = city;
  const fullQuery = `${industry} in ${city}`;

  if (!DRY_RUN) {
    const alreadyCrawled = await wasRecentlyCrawled(searchQuery, searchRegion);
    if (alreadyCrawled) {
      console.log(`  [SKIP] ${fullQuery} – bereits in den letzten 30 Tagen gecrawlt`);
      return;
    }
  }

  console.log(`  [FETCH] ${fullQuery}`);

  if (DRY_RUN) {
    console.log(`  [DRY_RUN] Würde API-Aufruf machen: textsearch?query=${encodeURIComponent(fullQuery)}`);
    return;
  }

  // Step 1: Text Search
  let searchData: PlacesSearchResponse;
  try {
    searchData = await googleGet<PlacesSearchResponse>("/maps/api/place/textsearch/json", {
      query: fullQuery,
      language: "de",
    });
    await delay(200);
  } catch (err) {
    console.error(`  [ERROR] Text search failed for "${fullQuery}":`, err);
    return;
  }

  if (searchData.status !== "OK" || !searchData.results?.length) {
    console.log(`  [EMPTY] ${fullQuery} – keine Ergebnisse (status: ${searchData.status})`);
    return;
  }

  const places = searchData.results.slice(0, 20);
  console.log(`  [OK] ${places.length} Ergebnisse für "${fullQuery}"`);

  const toAnalyze: Array<{ businessId: number; websiteUrl: string }> = [];

  for (const place of places) {
    // Step 2: Place Details
    let details: PlaceDetailsResponse = { status: "OK" };
    try {
      details = await googleGet<PlaceDetailsResponse>("/maps/api/place/details/json", {
        place_id: place.place_id,
        fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types",
        language: "de",
      });
      await delay(200);
    } catch (err) {
      console.error(`  [ERROR] Place details failed for ${place.place_id}:`, err);
    }

    const r = details.result;
    const hasWebsite = !!(r?.website);
    const websiteUrl = r?.website ?? null;
    const category = extractCategory(place.types) || industry;
    const leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = hasWebsite ? "unknown" : "no_website";
    const slug = slugify(r?.name ?? place.name) + "-" + nanoid(6);

    let businessId: number;
    try {
      businessId = await upsertBusiness({
        placeId: place.place_id,
        name: r?.name ?? place.name,
        slug,
        address: r?.formatted_address ?? place.formatted_address ?? null,
        phone: r?.formatted_phone_number ?? null,
        website: websiteUrl,
        rating: (r?.rating ?? place.rating)?.toString() ?? null,
        reviewCount: r?.user_ratings_total ?? place.user_ratings_total ?? 0,
        category,
        lat: place.geometry?.location?.lat?.toString() ?? null,
        lng: place.geometry?.location?.lng?.toString() ?? null,
        openingHours: r?.opening_hours?.weekday_text ?? [],
        hasWebsite: hasWebsite ? 1 : 0,
        leadType,
        searchQuery,
        searchRegion,
      });
    } catch (err) {
      console.error(`  [ERROR] upsertBusiness failed for ${place.place_id}:`, err);
      continue;
    }

    if (hasWebsite && websiteUrl && leadType === "unknown") {
      toAnalyze.push({ businessId, websiteUrl });
    }
  }

  // Step 3: Website analysis (sequential to avoid hammering)
  for (const { businessId, websiteUrl } of toAnalyze) {
    try {
      const analysis = await analyzeWebsite(websiteUrl);
      await updateBusinessAnalysis(businessId, analysis.leadType, analysis.websiteAge, analysis.websiteScore, analysis.details);
      console.log(`    [ANALYSIS] Business ${businessId}: leadType=${analysis.leadType}, score=${analysis.websiteScore}`);
    } catch (err) {
      console.error(`    [ERROR] analyzeWebsite failed for business ${businessId}:`, err);
    }
    await delay(500);
  }
}

async function main(): Promise<void> {
  console.log("=== Pageblitz Lead Crawler ===");
  console.log(`DRY_RUN: ${DRY_RUN}`);
  console.log(`Industrien: ${INDUSTRIES.length}, Städte: ${CITIES.length}`);
  console.log(`Kombinationen gesamt: ${INDUSTRIES.length * CITIES.length}`);
  console.log("");

  if (!GOOGLE_PLACES_API_KEY && !DRY_RUN) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY ist nicht gesetzt!");
    process.exit(1);
  }

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  const total = INDUSTRIES.length * CITIES.length;

  for (const industry of INDUSTRIES) {
    for (const city of CITIES) {
      const idx = processed + skipped + errors + 1;
      process.stdout.write(`[${idx}/${total}] ${industry} × ${city}\n`);
      try {
        await crawlCombination(industry, city);
        processed++;
      } catch (err) {
        console.error(`  [ERROR] Kombination fehlgeschlagen: ${industry} × ${city}`, err);
        errors++;
      }
      // 2s pause between combinations
      if (!DRY_RUN) await delay(2000);
    }
  }

  console.log("");
  console.log("=== Crawler abgeschlossen ===");
  console.log(`Verarbeitet: ${processed}, Übersprungen (im Skip): ${skipped}, Fehler: ${errors}`);

  await closePool();
}

main().catch((err) => {
  console.error("Fataler Fehler:", err);
  closePool().finally(() => process.exit(1));
});
