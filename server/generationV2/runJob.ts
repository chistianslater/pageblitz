import {
  getBusinessById,
  getWebsiteById,
  updateGenerationJob,
  updateWebsite,
} from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { classifyIndustry } from "../industryClassifier";
import { getGmbPhotos } from "../gmbPhotos";
import { getGalleryImages, getHeroImageUrl } from "../industryImages";
import { generateSiteContent } from "./generateSiteContent";
import { selectPack } from "./selectPack";
import { buildV2GenerationFacts } from "./facts";
import { upsertOnboarding } from "../onboardingV2/state";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { SECTION_ADDON_KEYS } from "../../shared/pricing";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { InsertOnboardingResponse } from "../../drizzle/schema";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";

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
}

export interface V2Images {
  hero?: string;
  about?: string;
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
      description: "Diese Website wird gerade erstellt.",
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

/**
 * Bilder kommen NIE vom LLM: echte GMB-Fotos zuerst (Foto 1 = Hero, Foto 2 =
 * Über uns), sonst Branchen-Stock aus industryImages. "self-…"-Place-IDs sind
 * Platzhalter ohne Google-Eintrag — dort wird Google gar nicht erst gefragt.
 */
export async function resolveV2Images(
  business: { placeId: string | null; name: string },
  category: string,
  industryKey: string
): Promise<V2Images> {
  const gmb =
    business.placeId && !business.placeId.startsWith("self-")
      ? await getGmbPhotos(business.placeId, 3)
      : [];
  if (gmb.length > 0) {
    return { hero: gmb[0], ...(gmb[1] ? { about: gmb[1] } : {}) };
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
  const images = await resolveV2Images(business, category, industryKey);
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
  await updateGenerationJob(jobId, { progress: 55 });
  await devPhasePause();

  let websiteData: WebsiteDataV2;
  try {
    websiteData = await generateSiteContent({
      packId,
      ...buildV2GenerationFacts(business, category, website.slug, images),
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
      { ...business, openingHours: business.openingHours as string[] | null },
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
