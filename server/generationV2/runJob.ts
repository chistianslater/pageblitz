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
  website: { id: number; slug: string },
  business: V2JobBusiness,
  category: string,
  industryKey: string
): Promise<void> {
  await updateGenerationJob(jobId, { progress: 30 });
  const packId = await selectPack(category, industryKey);
  await updateGenerationJob(jobId, { progress: 50 });

  const images = await resolveV2Images(business, category, industryKey);
  const websiteData = await generateSiteContent({
    packId,
    ...buildV2GenerationFacts(business, category, website.slug, images),
  });

  await updateGenerationJob(jobId, { progress: 90 });
  await updateWebsite(website.id, { websiteData: websiteData as any });
  invalidateSsrCache(website.slug);
  await updateGenerationJob(jobId, {
    status: "completed",
    progress: 100,
    result: { success: true, alreadyGenerated: false, usedFallback: false },
  });
  console.log(
    `[Generation Job ${jobId}] Completed (v2) for website ${website.id}, pack=${packId}`
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
