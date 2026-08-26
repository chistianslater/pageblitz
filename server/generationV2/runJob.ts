import {
  getBusinessById,
  listWebsites,
  getWebsiteById,
  updateGenerationJob,
  updateWebsite,
} from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { classifyIndustry } from "../industryClassifier";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import { getGalleryImages, getHeroImageUrl } from "../industryImages";
import { crawlExistingSite } from "../gmb/siteCrawl";
import { generateSiteContent } from "./generateSiteContent";
import { selectPack } from "./selectPack";
import { buildV2GenerationFacts } from "./facts";
import { buildGuardContextText, guardGeneratedContent } from "./factGuard";
import type { GmbReview } from "../gmb/details";
import { upsertOnboarding } from "../onboardingV2/state";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { SECTION_ADDON_KEYS } from "../../shared/pricing";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { InsertOnboardingResponse } from "../../drizzle/schema";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  deriveDistinctDesignProfile,
  designFingerprint,
} from "../../shared/siteContract/designProfile";

/** Entwurfs-Flags in onboarding_responses je Sektions-Add-on (wie server/onboardingV2/addOnFlags.ts). */
const ONBOARDING_ADDON_COLUMNS: Record<
  (typeof SECTION_ADDON_KEYS)[number],
  keyof InsertOnboardingResponse
> = {
  gallery: "addOnGallery",
  menu: "addOnMenu",
  pricelist: "addOnPricelist",
  team: "addOnTeam",
  subpages: "addOnSubpages",
};

/**
 * Spiegelt die vom Generator gesetzten Add-on-Defaults (aktuell nur
 * `addOns.menu` für Gastro, siehe generateSiteContent.ts
 * withGeneratedAddOnDefaults; im Mock-Pfad die Fixture-addOns) als
 * Entwurfs-Flags nach onboarding_responses — so zeigt das Extras-Panel
 * „Aktiv", die Checkout-Summe enthält das Extra, und der Kunde kann es
 * abwählen (Plan B6 Task 6, Spec §5.5). Ohne `addOns` kein Write.
 */
async function mirrorGeneratedAddOns(
  websiteId: number,
  doc: WebsiteDataV2
): Promise<void> {
  const patch: Partial<InsertOnboardingResponse> = {};
  for (const key of SECTION_ADDON_KEYS) {
    if (doc.addOns?.[key] === true) {
      (patch as Record<string, unknown>)[ONBOARDING_ADDON_COLUMNS[key]] = true;
    }
  }
  if (Object.keys(patch).length === 0) return;
  await upsertOnboarding(websiteId, patch);
}

export interface V2JobBusiness {
  name: string;
  category: string | null;
  searchRegion: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  rating: string | null;
  reviewCount: number | null;
  openingHours: string[] | null;
  placeId: string | null;
  /** Bestehende Betriebs-Website (GMB-Feld, Task 1 persistiert) — Quelle für den Fakten-Crawl. */
  website: string | null;
  /** Persistierte rohe Google-Reviews (max 8, persistGmbDetails) — Quelle der Testimonials. */
  googleReviews: GmbReview[] | null;
  /** Googles Editorial Summary — reiner Prompt-Kontext, landet nie im Dokument. */
  editorialSummary: string | null;
}

export interface V2Images {
  hero?: string;
  about?: string;
  /**
   * Nach R2 gespiegelte GMB-Fotos für die Galerie-Sektion (Spec §2.2: nur
   * gesetzt, wenn ≥ 3 brauchbare Fotos existieren; ausschließlich R2-URLs,
   * nie Google-URLs mit API-Key).
   */
  gallery?: string[];
}

/**
 * Deterministische SEO-Beschreibung des Zeitmaschinen-Zwischenstands —
 * EINZIGE Quelle für `buildInterimV2Doc` UND `isInterimV2Doc`: der Marker
 * reist im Dokument selbst mit (kein Schema-Feld, keine zweite Wahrheit in
 * der DB) und erkennt ein liegengebliebenes Platzhalter-Dokument auch nach
 * Crash/Restore-Fehler zwischen Interim- und Final-Write.
 */
const INTERIM_SEO_DESCRIPTION = "Diese Website wird gerade erstellt.";

/**
 * Ist `doc` der Zeitmaschinen-Zwischenstand (Platzhalter aus
 * `buildInterimV2Doc`)? Ein final generiertes Dokument trägt nie exakt
 * diese SEO-Beschreibung (der Interim-Write ist die einzige Quelle des
 * Satzes). Genutzt von `ensureGeneration` (server/onboardingV2/router.ts):
 * failed Job + Interim-Doc ⇒ Retry startet einen neuen Job statt
 * fälschlich "completed" zu melden.
 */
export function isInterimV2Doc(doc: WebsiteDataV2): boolean {
  return doc.seo.description === INTERIM_SEO_DESCRIPTION;
}

/**
 * Zwischenstand für die Zeitmaschinen-Warte-UX (Plan B7 Task 4, Spec §2.3):
 * direkt nach der Bild-Phase persistiert runJob dieses schema-valide
 * v2-Dokument (Bilder gesetzt, kurze neutrale deutsche Platzhaltertexte —
 * keine Lorem-Floskeln), damit die Studio-Vorschau die Website sichtbar
 * „entstehen" sieht, während das LLM noch schreibt. Der finale Write
 * überschreibt es vollständig; die Phase steckt wie bisher NUR im
 * Job-`progress`, nicht im Dokument (kein neues Schema-Feld).
 */
export function buildInterimV2Doc(
  packId: PackId,
  businessName: string,
  category: string,
  slug: string,
  images: V2Images
): WebsiteDataV2 {
  const interim = {
    version: 2 as const,
    stylePackId: packId,
    businessName,
    businessCategory: category,
    slug,
    seo: {
      title: businessName,
      description: INTERIM_SEO_DESCRIPTION,
    },
    sections: [
      {
        type: "hero" as const,
        headline: businessName,
        subheadline: "Einen Moment — deine Texte entstehen gerade …",
        ...(images.hero ? { imageUrl: images.hero } : {}),
      },
      ...(images.about
        ? [
            {
              type: "about" as const,
              headline: "Über uns",
              body: "Die Inhalte zu deinem Betrieb werden gerade geschrieben.",
              imageUrl: images.about,
            },
          ]
        : []),
    ],
  };
  // Harte Garantie statt Annahme: der Zwischenstand MUSS dem Vertrag genügen
  // (SSR-Preview und assertV2SafeWrite verlassen sich darauf).
  return WebsiteDataV2Schema.parse(interim);
}

/**
 * Nur für Playwright/Dev (nie production): verlangsamt die Phasen des
 * Generierungs-Jobs künstlich, damit die Zeitmaschinen-Zustände (Skeleton →
 * Zwischenstand → final) im E2E-Test deterministisch sichtbar sind — mit
 * PB_LLM_MOCK=1 wäre der Job sonst in Millisekunden fertig (flaky Asserts).
 */
async function devPhasePause(): Promise<void> {
  const ms = Number(process.env.PB_V2_PHASE_DELAY_MS);
  if (!Number.isFinite(ms) || ms <= 0) return;
  if (process.env.NODE_ENV === "production") return;
  await new Promise(resolve => setTimeout(resolve, ms));
}

/** Max. GMB-Fotos pro Job (Spec §2.1: „photos bis 8"). */
const MAX_GMB_PHOTOS = 8;
/** Galerie nur, wenn mindestens so viele brauchbare GMB-Fotos existieren (Spec §2.2). */
const MIN_GALLERY_PHOTOS = 3;

/**
 * Fingerprints der zuletzt erzeugten Websites derselben Branche. Alte
 * Dokumente ohne Designprofil werden ignoriert (sie behalten bewusst den
 * rückwärtskompatiblen Default-Aufbau).
 */
export function collectOccupiedDesignFingerprints(
  rows: Array<{ websiteData?: unknown }>,
  category: string
): Set<string> {
  const normalizedCategory = category.trim().toLowerCase();
  const occupied = new Set<string>();
  for (const row of rows) {
    const parsed = WebsiteDataV2Schema.safeParse(row.websiteData);
    if (!parsed.success || !parsed.data.designProfile) continue;
    if (
      (parsed.data.businessCategory ?? "").trim().toLowerCase() !==
      normalizedCategory
    )
      continue;
    occupied.add(
      designFingerprint({
        stylePackId: parsed.data.stylePackId,
        profile: parsed.data.designProfile,
        fontPairId: parsed.data.fontPairId,
        accent: parsed.data.colorOverrides?.accent,
      })
    );
  }
  return occupied;
}

/**
 * Bilder kommen NIE vom LLM: echte GMB-Fotos zuerst (Foto 1 = Hero, Foto 2 =
 * Über uns, ab ≥ 3 Fotos zusätzlich alle als Galerie), sonst Branchen-Stock
 * aus industryImages (ohne Galerie — die Galerie zeigt nur echte Betriebs-
 * Fotos, nie Stock). "self-…"-Place-IDs sind Platzhalter ohne Google-Eintrag
 * — dort wird Google gar nicht erst gefragt.
 *
 * Key-Leak geschlossen (Plan B7 Task 3): GMB-Fotos werden über
 * `mirrorGmbPhotosToR2` serverseitig geladen und nach R2 gespiegelt — ins
 * Dokument gelangen ausschließlich R2-URLs, nie die Google-Photo-URL mit
 * `key=`. Schlägt die Spiegelung fehl (z. B. R2 nicht konfiguriert), greift
 * der Stock-Fallback statt jemals einer Key-URL.
 */
export async function resolveV2Images(
  business: { placeId: string | null; name: string },
  category: string,
  industryKey: string,
  websiteId: number
): Promise<V2Images> {
  const gmb =
    business.placeId && !business.placeId.startsWith("self-")
      ? await mirrorGmbPhotosToR2(business.placeId, websiteId, MAX_GMB_PHOTOS)
      : [];
  if (gmb.length > 0) {
    return {
      hero: gmb[0],
      ...(gmb[1] ? { about: gmb[1] } : {}),
      // Die Galerie zeigt alle Betriebs-Fotos (inkl. Hero/About-Motiv) —
      // wie auf echten Betriebs-Websites üblich; unter 3 Fotos wäre eine
      // Galerie zu dünn und entfällt (Spec §2.2).
      ...(gmb.length >= MIN_GALLERY_PHOTOS ? { gallery: gmb } : {}),
    };
  }
  const hero = getHeroImageUrl(category, business.name, industryKey);
  const gallery = getGalleryImages(category, business.name, industryKey);
  return { hero, ...(gallery[0] ? { about: gallery[0] } : {}) };
}

/**
 * v2-Generierungspfad (aufgerufen von runWebsiteGenerationV2Job unten;
 * routers.ts' website.generate/outreach.queueBusinesses und
 * outreachPipeline.ts rufen seit Plan B4b direkt runWebsiteGenerationV2Job
 * auf, kein separater Wrapper mehr):
 * Pack per Rotation wählen, Inhalte vom LLM holen
 * (zod-validiert, genau 1 Retry, kein stiller Fallback), als websiteData
 * persistieren (gleiche JSON-Spalte wie v1) und den SSR-Cache für den Slug
 * invalidieren, damit die neue Seite sofort sichtbar ist statt bis zu
 * CACHE_TTL_MS (60s) auf den TTL-Ablauf zu warten.
 */
async function runWebsiteGenerationV2(
  jobId: number,
  website: { id: number; slug: string; websiteData?: unknown },
  business: V2JobBusiness,
  category: string,
  industryKey: string
): Promise<void> {
  const t0 = Date.now();
  await updateGenerationJob(jobId, { progress: 30 });
  const packId = await selectPack(category, industryKey);
  // Fortschrittsstufen sind an generationProgress.PHASES gekoppelt:
  // 30–54 „Bilder werden gesetzt", 55–89 „Texte entstehen", ≥ 90 „Vorschau".
  await devPhasePause();
  // Website-Crawl parallel zur Bild-Phase (Plan B7 Task 2/3):
  // `crawlExistingSite` rejected nie (jeder Fehler → null), das Promise darf
  // deshalb unbeaufsichtigt neben der Bild-Phase laufen.
  const existingSitePromise = business.website
    ? crawlExistingSite(business.website)
    : Promise.resolve(null);
  const images = await resolveV2Images(
    business,
    category,
    industryKey,
    website.id
  );
  const tImages = Date.now();

  // Zeitmaschine (Task 4): Zwischenstand mit Bildern + Platzhaltertexten
  // persistieren und den SSR-Cache invalidieren, BEVOR die lange LLM-Phase
  // beginnt — die Studio-Vorschau (/preview-ssr, ungecacht) zeigt ihn sofort.
  const previousWebsiteData = website.websiteData ?? null;
  const interim = buildInterimV2Doc(
    packId,
    business.name,
    category,
    website.slug,
    images
  );
  assertV2SafeWrite(previousWebsiteData, interim);
  await updateWebsite(website.id, { websiteData: interim as any });
  invalidateSsrCache(website.slug);

  let websiteData: WebsiteDataV2;
  try {
    // WICHTIG: ALLES zwischen Interim- und Final-Write (Progress-Update,
    // Dev-Pause, Crawl-Await, LLM, Fakten-Guard inkl. seines LLM-Retrys)
    // muss in DIESEM try laufen — sonst überlebt bei einem Fehler das
    // Platzhalter-Dokument und ensureGeneration hielte die Website für
    // fertig generiert.
    await updateGenerationJob(jobId, { progress: 55 });
    await devPhasePause();
    const existingSite = await existingSitePromise;
    const factArgs = buildV2GenerationFacts(
      business,
      category,
      website.slug,
      images,
      existingSite
    );
    websiteData = await generateSiteContent({ packId, ...factArgs });
    // Halluzinations-Guard (Spec §2.2): fremde Stadt deterministisch
    // korrigieren; harter Branchen-Widerspruch → genau ein LLM-Retry mit
    // explizitem Hinweis, danach akzeptieren.
    websiteData = await guardGeneratedContent(
      websiteData,
      {
        businessName: business.name,
        city: factArgs.facts?.contact?.city,
        category,
        contextText: buildGuardContextText(
          business.editorialSummary,
          existingSite
        ),
      },
      hint => generateSiteContent({ packId, ...factArgs, retryHint: hint })
    );
    // Komposition wird erst aus dem finalen Inhalt abgeleitet (Anzahl
    // Leistungen/Bilder/Sektionen). Gegen die jüngsten Websites derselben
    // Branche prüfen, damit nicht zweimal dieselbe sichtbare Kombination
    // aus Richtung + Layout + Bildbehandlung entsteht.
    const previousParsed = WebsiteDataV2Schema.safeParse(previousWebsiteData);
    let designProfile = previousParsed.success
      ? previousParsed.data.designProfile
      : undefined;
    if (!designProfile) {
      let occupied = new Set<string>();
      try {
        const recentWebsites = await listWebsites(200, 0);
        occupied = collectOccupiedDesignFingerprints(
          recentWebsites,
          category
        );
      } catch (err) {
        // Individualisierung ist wichtig, darf aber nie die eigentliche
        // Website-Generierung blockieren. Ohne Vergleichsdaten bleibt die
        // Ableitung durch Betriebsname/Kategorie trotzdem deterministisch.
        console.warn(
          "[DesignProfile] Kollisionsprüfung nicht verfügbar, nutze deterministische Ableitung:",
          err
        );
      }
      designProfile = deriveDistinctDesignProfile(
        {
          stylePackId: packId,
          businessName: websiteData.businessName,
          businessCategory: websiteData.businessCategory,
          sections: websiteData.sections,
          fontPairId: websiteData.fontPairId,
          accent: websiteData.colorOverrides?.accent,
        },
        occupied
      );
    }
    websiteData = WebsiteDataV2Schema.parse({
      ...websiteData,
      designProfile,
    });
  } catch (err) {
    // Der Zwischenstand darf einen Fehlschlag nicht überleben: sonst sähe
    // ensureGeneration ein (Platzhalter-)Dokument und würde nie neu
    // generieren. Ausgangszustand wiederherstellen, dann normaler
    // Fehlerpfad (Job "failed" im Aufrufer).
    await updateWebsite(website.id, {
      websiteData: previousWebsiteData as any,
    });
    invalidateSsrCache(website.slug);
    throw err;
  }
  const tLlm = Date.now();
  // Zweiter Pausenpunkt nur für Playwright (devPhasePause, s. o.): hält den
  // Zwischenstand lange genug sichtbar, damit der E2E-Test das Vorschau-
  // iframe der Zeitmaschine deterministisch zu fassen bekommt.
  await devPhasePause();

  await updateGenerationJob(jobId, { progress: 90 });
  assertV2SafeWrite(interim, websiteData);
  await updateWebsite(website.id, { websiteData: websiteData as any });
  await mirrorGeneratedAddOns(website.id, websiteData);
  invalidateSsrCache(website.slug);
  await updateGenerationJob(jobId, {
    status: "completed",
    progress: 100,
    result: { success: true, alreadyGenerated: false, usedFallback: false },
  });
  console.log(
    `[Generation Job ${jobId}] Completed (v2) for website ${website.id}, pack=${packId} — Bilder ${tImages - t0} ms, Texte ${tLlm - tImages} ms, gesamt ${Date.now() - t0} ms`
  );
}

/**
 * Eigenständiger v2-Job (Studio/onboardingV2.ensureGeneration,
 * website.generate, outreach.queueBusinesses, outreachPipeline.ts —
 * seit Plan B4b der einzige Generierungspfad im gesamten Repo): immer der
 * v2-Pfad, kein Flag mehr. Fehler landen im Job (status "failed" +
 * Meldung) statt als unbehandelte Rejection.
 */
export async function runWebsiteGenerationV2Job(
  jobId: number,
  websiteId: number
): Promise<void> {
  try {
    await updateGenerationJob(jobId, { status: "processing", progress: 10 });
    const website = await getWebsiteById(websiteId);
    if (!website) throw new Error("Website nicht gefunden");
    const business = await getBusinessById(website.businessId);
    if (!business) throw new Error("Unternehmen nicht gefunden");
    const category = business.category || "Dienstleistung";
    const industryKey = await classifyIndustry(category, business.name);
    await runWebsiteGenerationV2(
      jobId,
      website,
      {
        ...business,
        openingHours: business.openingHours as string[] | null,
        googleReviews: business.googleReviews as GmbReview[] | null,
      },
      category,
      industryKey
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[Generation Job ${jobId}] v2-Generierung fehlgeschlagen:`,
      err
    );
    await updateGenerationJob(jobId, { status: "failed", error: message });
  }
}
