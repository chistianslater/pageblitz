/**
 * outreachPipeline.ts
 *
 * Automated pipeline: GMB crawl → email scraping → website generation → outreach queue
 * Runs on a configurable interval. State is persisted to pipeline-state.json.
 */

import fs from "fs";
import path from "path";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { scrapeEmailFromWebsite, hasMxRecord } from "./emailScraper";
import {
  upsertBusiness,
  getBusinessById,
  createGeneratedWebsite,
  createGenerationJob,
  createOutreachEmail,
  getWebsiteByBusinessId,
  updateBusiness,
} from "./db";
import { nanoid } from "nanoid";
import { getHeroImageUrl, getIndustryColorScheme, getLayoutPool } from "./industryImages";
import { getNextLayoutForIndustry } from "./db";
import { invokeLLM } from "./_core/llm";
import { analyzeWebsite } from "./websiteAnalysis";

// ── State file ────────────────────────────────────────────────────────────────

const STATE_FILE = path.join(process.cwd(), "pipeline-state.json");

export interface PipelineConfig {
  enabled: boolean;
  dailyLimit: number;
  batchSize: number;
  intervalMinutes: number;
  targetCitySlugs: string[];
  targetIndustryKeys: string[];
}

export interface PipelineState {
  config: PipelineConfig;
  currentCityIdx: number;
  currentIndustryIdx: number;
  todayCount: number;
  todayDate: string;
  lastRunAt: string | null;
  lastRunResult: string | null;
  totalQueued: number;
  totalFound: number;
  totalEmailsFound: number;
  isRunning: boolean;
  runLog: Array<{ at: string; msg: string; queued: number }>;
}

const DEFAULT_CONFIG: PipelineConfig = {
  enabled: false,
  dailyLimit: 50,
  batchSize: 5,
  intervalMinutes: 60,
  targetCitySlugs: [],
  targetIndustryKeys: [],
};

const DEFAULT_STATE: PipelineState = {
  config: DEFAULT_CONFIG,
  currentCityIdx: 0,
  currentIndustryIdx: 0,
  todayCount: 0,
  todayDate: "",
  lastRunAt: null,
  lastRunResult: null,
  totalQueued: 0,
  totalFound: 0,
  totalEmailsFound: 0,
  isRunning: false,
  runLog: [],
};

export function loadState(): PipelineState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
      };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

export function saveState(state: PipelineState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("[Pipeline] Failed to save state:", e);
  }
}

// ── Industry/City configuration ──────────────────────────────────────────────

export const PIPELINE_INDUSTRIES: Array<{ key: string; query: string; label: string }> = [
  { key: "friseur", query: "Friseur", label: "Friseur" },
  { key: "zahnarzt", query: "Zahnarzt", label: "Zahnarzt" },
  { key: "physiotherapie", query: "Physiotherapie", label: "Physiotherapie" },
  { key: "kosmetik", query: "Kosmetikstudio", label: "Kosmetik" },
  { key: "rechtsanwalt", query: "Rechtsanwalt", label: "Rechtsanwalt" },
  { key: "steuerberater", query: "Steuerberater", label: "Steuerberater" },
  { key: "elektriker", query: "Elektriker", label: "Elektriker" },
  { key: "schreiner", query: "Schreiner", label: "Schreiner" },
  { key: "maler", query: "Maler", label: "Maler" },
  { key: "restaurant", query: "Restaurant", label: "Restaurant" },
  { key: "baeckerei", query: "Bäckerei", label: "Bäckerei" },
  { key: "fitnessstudio", query: "Fitnessstudio", label: "Fitnessstudio" },
  { key: "immobilienmakler", query: "Immobilienmakler", label: "Immobilienmakler" },
  { key: "architekt", query: "Architekt", label: "Architekt" },
  { key: "fotograf", query: "Fotograf", label: "Fotograf" },
  { key: "hundeschule", query: "Hundeschule", label: "Hundeschule" },
  { key: "reinigung", query: "Reinigungsservice", label: "Reinigung" },
  { key: "kfz", query: "KFZ-Werkstatt", label: "KFZ-Werkstatt" },
  { key: "nagelstudio", query: "Nagelstudio", label: "Nagelstudio" },
  { key: "yoga", query: "Yogastudio", label: "Yogastudio" },
];

export const PIPELINE_CITIES: string[] = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf",
  "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hannover", "Nürnberg",
  "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster",
  "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden", "Gelsenkirchen",
  "Mönchengladbach", "Braunschweig", "Kiel", "Magdeburg", "Freiburg",
  "Aachen", "Krefeld", "Lübeck", "Oberhausen", "Erfurt", "Rostock",
  "Mainz", "Kassel", "Hagen", "Hamm", "Saarbrücken", "Mülheim",
  "Potsdam", "Ludwigshafen", "Oldenburg", "Osnabrück", "Leverkusen",
];

// ── Local helper: classify industry via LLM (mirrors routers.ts classifyIndustry) ──

async function classifyIndustryLocal(category: string, businessName: string): Promise<string> {
  try {
    const prompt = `Klassifiziere dieses Unternehmen in eine der folgenden Branchen-Schlüsselwörter:
beauty, restaurant, fitness, automotive, medical, legal, trades, retail, tech, education, hospitality, other

Unternehmensname: ${businessName}
Kategorie: ${category}

Antworte NUR mit dem Schlüsselwort (z.B. "beauty").`;
    const result = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 10,
    });
    const key = result.trim().toLowerCase().replace(/[^a-z]/g, "");
    const valid = ["beauty", "restaurant", "fitness", "automotive", "medical", "legal", "trades", "retail", "tech", "education", "hospitality"];
    return valid.includes(key) ? key : "other";
  } catch {
    return "other";
  }
}

function slugifyLocal(text: string): string {
  return text.toLowerCase()
    .replace(/[äöüß]/g, (m: string) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function extractGmbCategory(types: string[] = []): string {
  const SKIP = new Set([
    "point_of_interest", "establishment", "food", "store", "health",
    "premise", "locality", "political", "local_business", "geocode", "route",
  ]);
  for (const t of types) {
    if (!SKIP.has(t)) return t.replace(/_/g, " ");
  }
  return types[0]?.replace(/_/g, " ") || "Dienstleistung";
}

// ── Core pipeline logic ───────────────────────────────────────────────────────

let pipelineTimer: NodeJS.Timeout | null = null;

export async function runPipelineCycle(): Promise<{
  queued: number;
  found: number;
  emailsFound: number;
  msg: string;
}> {
  const state = loadState();

  if (state.isRunning) {
    return { queued: 0, found: 0, emailsFound: 0, msg: "Already running" };
  }

  if (!state.config.enabled) {
    return { queued: 0, found: 0, emailsFound: 0, msg: "Pipeline disabled" };
  }

  // Reset daily counter on new day
  const today = new Date().toISOString().slice(0, 10);
  if (state.todayDate !== today) {
    state.todayDate = today;
    state.todayCount = 0;
  }

  const remainingToday = state.config.dailyLimit - state.todayCount;
  if (remainingToday <= 0) {
    return {
      queued: 0,
      found: 0,
      emailsFound: 0,
      msg: `Daily limit (${state.config.dailyLimit}) reached`,
    };
  }

  state.isRunning = true;
  saveState(state);

  let queued = 0;
  let found = 0;
  let emailsFound = 0;

  try {
    // Pick current city and industry
    const cities =
      state.config.targetCitySlugs.length > 0
        ? PIPELINE_CITIES.filter((c) =>
            state.config.targetCitySlugs.includes(c.toLowerCase())
          )
        : PIPELINE_CITIES;
    const industries =
      state.config.targetIndustryKeys.length > 0
        ? PIPELINE_INDUSTRIES.filter((i) =>
            state.config.targetIndustryKeys.includes(i.key)
          )
        : PIPELINE_INDUSTRIES;

    if (!cities.length || !industries.length) {
      state.isRunning = false;
      saveState(state);
      return {
        queued: 0,
        found: 0,
        emailsFound: 0,
        msg: "No cities or industries configured",
      };
    }

    const cityIdx = state.currentCityIdx % cities.length;
    const industryIdx = state.currentIndustryIdx % industries.length;
    const city = cities[cityIdx];
    const industry = industries[industryIdx];

    // Advance indices for next run
    let nextIndustryIdx = industryIdx + 1;
    let nextCityIdx = cityIdx;
    if (nextIndustryIdx >= industries.length) {
      nextIndustryIdx = 0;
      nextCityIdx = (cityIdx + 1) % cities.length;
    }
    state.currentIndustryIdx = nextIndustryIdx;
    state.currentCityIdx = nextCityIdx;

    console.log(`[Pipeline] Running cycle: ${industry.query} in ${city}`);

    // 1. GMB text search (up to 2 pages = ~40 results)
    const searchQuery = `${industry.query} ${city}`;
    const allPlaces: any[] = [];
    let pageToken: string | undefined;

    for (let page = 0; page < 2; page++) {
      const params: Record<string, string> = { query: searchQuery, language: "de" };
      if (pageToken) params.pagetoken = pageToken;
      try {
        const result = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          params
        );
        if (result.status !== "OK" || !result.results?.length) break;
        allPlaces.push(...result.results);
        if (!result.next_page_token) break;
        pageToken = result.next_page_token;
        // Google requires a short delay before using next_page_token
        await new Promise((r) => setTimeout(r, 2000));
      } catch {
        break;
      }
    }

    found = allPlaces.length;
    const maxToProcess = Math.min(state.config.batchSize, remainingToday);

    // 2. Process each place
    const toQueue: number[] = [];

    for (const place of allPlaces) {
      if (toQueue.length >= maxToProcess) break;

      try {
        // Check if business already in DB
        const existing = await (async () => {
          const db = await (await import("./db")).getDb();
          if (!db) return undefined;
          const { businesses } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const rows = await db
            .select()
            .from(businesses)
            .where(eq(businesses.placeId, place.place_id))
            .limit(1);
          return rows[0];
        })();

        if (existing) {
          // Already in DB – skip if website already generated or leadType is "unknown" (good website)
          const alreadyGenerated = await getWebsiteByBusinessId(existing.id);
          if (alreadyGenerated) continue;
          if (existing.leadType === "unknown") continue; // decent website, not a target

          if (existing.email) {
            toQueue.push(existing.id);
            continue;
          }

          // Try scraping email if we have a website URL
          if (existing.website) {
            try {
              const email = await scrapeEmailFromWebsite(existing.website);
              if (email && email.includes("@")) {
                const mxOk = await hasMxRecord(email);
                if (mxOk) {
                  await updateBusiness(existing.id, { email });
                  emailsFound++;
                  toQueue.push(existing.id);
                }
              }
            } catch {
              // skip email scraping errors
            }
          }
          continue;
        }

        // New business – fetch details
        let details: PlaceDetailsResult | null = null;
        try {
          details = await makeRequest<PlaceDetailsResult>(
            "/maps/api/place/details/json",
            {
              place_id: place.place_id,
              fields:
                "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types",
              language: "de",
            }
          );
        } catch {
          // continue without details
        }

        const r = details?.result;
        const category = extractGmbCategory(place.types || r?.types || []);
        const websiteUrl = r?.website || null;

        // ── Website quality analysis ──────────────────────────────────────────
        // Run BEFORE saving so we can store the correct leadType immediately.
        // Skip businesses whose website looks modern/good (leadType = "unknown").
        let leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = "no_website";
        if (websiteUrl) {
          try {
            const analysis = await analyzeWebsite(websiteUrl);
            leadType = analysis.leadType;
          } catch {
            leadType = "unknown"; // can't analyse → skip to be safe
          }
          // Only proceed if website is genuinely bad or outdated.
          // "unknown" means decent website → not a good lead, skip.
          if (leadType === "unknown") continue;
        }

        const businessId = await upsertBusiness({
          placeId: place.place_id,
          name: r?.name || place.name,
          address: r?.formatted_address || place.formatted_address || null,
          phone: r?.formatted_phone_number || null,
          email: null,
          website: websiteUrl,
          category,
          rating: r?.rating ?? place.rating ?? null,
          reviewCount: r?.user_ratings_total ?? 0,
          lat: place.geometry?.location?.lat ?? null,
          lng: place.geometry?.location?.lng ?? null,
          leadType,
        });

        // Scrape email from website (only if they have one and it's a bad lead)
        if (websiteUrl) {
          try {
            const email = await scrapeEmailFromWebsite(websiteUrl);
            if (email && email.includes("@")) {
              const mxOk = await hasMxRecord(email);
              if (mxOk) {
                await updateBusiness(businessId, { email });
                emailsFound++;
                toQueue.push(businessId);
              }
            }
          } catch {
            // skip
          }
        }
      } catch (e) {
        console.error("[Pipeline] Error processing place:", place.place_id, e);
      }
    }

    // 3. Generate websites and queue outreach emails for businesses with emails
    for (const businessId of toQueue) {
      if (queued >= maxToProcess) break;
      try {
        const business = await getBusinessById(businessId);
        if (!business || !business.email) continue;

        const category = business.category || "Dienstleistung";
        const industryKey = await classifyIndustryLocal(category, business.name);
        const colorScheme = getIndustryColorScheme(category, business.name, industryKey);
        const { pool: layoutPool } = getLayoutPool(category, business.name, industryKey);
        const layoutStyle = await getNextLayoutForIndustry(industryKey, layoutPool);
        const heroImageUrl = getHeroImageUrl(category, business.name, industryKey);

        const slug = slugifyLocal(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);

        const websiteId = await createGeneratedWebsite({
          businessId,
          slug,
          status: "preview",
          websiteData: null,
          colorScheme,
          industry: category,
          previewToken,
          addons: [],
          heroImageUrl,
          layoutStyle,
        });

        const jobId = await createGenerationJob({
          websiteId,
          status: "pending",
          progress: 0,
        });

        // Start background generation (non-blocking via bridge to avoid circular imports)
        import("./pipelineGenerationBridge")
          .then((m) => m.triggerGeneration(jobId, websiteId))
          .catch((e) =>
            console.error(
              `[Pipeline] Generation failed for job ${jobId}:`,
              e
            )
          );

        // Status "generating" while website builds → auto-transitions to "draft"
        // after generation completes. Admin must manually approve ("queued") before
        // the orchestrator will send the email. No email goes out without approval.
        await createOutreachEmail({
          businessId,
          websiteId,
          recipientEmail: business.email,
          subject: "Ihre neue Website ist fertig",
          body: "",
          status: "generating",
        });

        queued++;
      } catch (e) {
        console.error("[Pipeline] Error queuing business:", businessId, e);
      }
    }

    const freshState = loadState();
    freshState.todayCount = (freshState.todayCount || 0) + queued;
    freshState.totalQueued = (freshState.totalQueued || 0) + queued;
    freshState.totalFound = (freshState.totalFound || 0) + found;
    freshState.totalEmailsFound = (freshState.totalEmailsFound || 0) + emailsFound;
    freshState.lastRunAt = new Date().toISOString();
    freshState.currentCityIdx = state.currentCityIdx;
    freshState.currentIndustryIdx = state.currentIndustryIdx;
    const msg = `${industry.query} in ${city}: ${found} gefunden, ${emailsFound} Emails, ${queued} eingereiht`;
    freshState.lastRunResult = msg;
    freshState.runLog = [
      { at: freshState.lastRunAt, msg, queued },
      ...(freshState.runLog || []).slice(0, 49),
    ];
    freshState.isRunning = false;
    saveState(freshState);

    console.log(`[Pipeline] Cycle done: ${msg}`);
    return { queued, found, emailsFound, msg };
  } catch (e: any) {
    console.error("[Pipeline] Cycle error:", e);
    const errState = loadState();
    errState.isRunning = false;
    saveState(errState);
    return { queued, found, emailsFound, msg: `Error: ${e?.message || String(e)}` };
  }
}

export function startPipelineScheduler() {
  console.log("[Pipeline] Scheduler starting...");

  const tick = async () => {
    const state = loadState();
    if (!state.config.enabled) {
      // Check again in 5 minutes even if disabled
      pipelineTimer = setTimeout(tick, 5 * 60 * 1000);
      return;
    }
    try {
      await runPipelineCycle();
    } catch (e) {
      console.error("[Pipeline] Scheduler tick error:", e);
    }
    // Reschedule based on current config
    const currentState = loadState();
    const intervalMs = (currentState.config.intervalMinutes || 60) * 60 * 1000;
    pipelineTimer = setTimeout(tick, intervalMs);
  };

  // Start first tick after 30 seconds (let server warm up)
  pipelineTimer = setTimeout(tick, 30_000);
}

export function stopPipelineScheduler() {
  if (pipelineTimer) {
    clearTimeout(pipelineTimer);
    pipelineTimer = null;
  }
}
