import { unsplashFill, type PhotoCredit } from "./unsplashFill";
import { resolveIndustryFamily } from "./industryFamily";
import { AKTUELLER_DESIGN_STAND } from "../../shared/siteContract/designStand";
import {
  entryProfile,
  type EntryPhotos,
} from "../../shared/designSystems/entry";
import {
  getBusinessById,
  getWebsiteById,
  updateGenerationJob,
  updateWebsite,
  recordIndustryGap,
} from "../db";
import { hasDirectVoiceMatch } from "../../shared/textVoices";
import { invalidateSsrCache } from "../ssr/routes";
import { classifyIndustry } from "../industryClassifier";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import {
  buildStockFallbackImages,
  eveningImages,
  getIndustryImages,
  istNeutralesSet,
} from "../industryImages";
import { generateIndustryImages } from "./aiStockImages";
import { crawlExistingSite } from "../gmb/siteCrawl";
import { withStagePhoto } from "./heroPhoto";
import { generateSiteContent } from "./generateSiteContent";
import { selectVoice } from "./selectVoice";
import { buildV2GenerationFacts } from "./facts";
import { buildGuardContextText, guardGeneratedContent } from "./factGuard";
import type { GmbReview } from "../gmb/details";
import { upsertOnboarding } from "../onboardingV2/state";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { SECTION_ADDON_KEYS } from "../../shared/pricing";
import { PLACEHOLDER_OPENING_HOURS } from "../../shared/onboardingV2/openingHours";
import { withPrimarySystem } from "../../shared/designSystems/apply";
import { systemsForDoc } from "../../shared/designSystems/assignment";
import { isReleased } from "../../shared/designSystems/registry";
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
 * withGeneratedAddOnDefaults) als Entwurfs-Flags nach
 * onboarding_responses — so zeigt das Extras-Panel „Aktiv", die
 * Checkout-Summe enthält das Extra, und der Kunde kann es abwählen
 * (Plan B6 Task 6, Spec §5.5). Galerie/Preisliste/Team/Unterseiten
 * werden nicht vorausgewählt, auch wenn die Sektion schon Platzhalter-
 * oder GMB-Fotos trägt. Ohne `addOns` kein Write.
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
  /** Belegte Google-Angaben (JSON-Spalte, Migration 0038) — Bauplan Gastro. */
  amenities?: unknown;
}

export interface V2Images {
  hero?: string;
  about?: string;
  /**
   * Galerie-URLs: echte GMB-Fotos (R2) sobald ≥ 3 existieren, sonst
   * Branchen-Stock als Platzhalter, damit die Website nie mit leerer
   * Galerie-Sektion dasteht. Nie Google-URLs mit API-Key.
   */
  gallery?: string[];
  /**
   * Hero-Foto ist ein großes Querformat (withStagePhoto). Steuert den
   * Einstieg „Bühne" vs. „Farbfläche"; nie im Dokument gespeichert.
   */
  heroLandscape?: boolean;
  /** Bildnachweis der Unsplash-Fotos (landet als `photoCredits` im Dokument). */
  credits?: PhotoCredit[];
}

const OWN_PHOTO_URL = /https?:\/\/[^"\s]+\/gmb-[^"\s]+/g;

/**
 * Neuerstellung verliert keine Fotos (2026-10-06): Kommen beim erneuten
 * Spiegeln weniger eigene Google-Fotos an, als die Seite schon hatte
 * (Google drosselt, Foto kurz nicht abrufbar), bleiben die bereits nach R2
 * gespiegelten. Die Fotoprüfung sortiert danach wie gewohnt aus.
 */
export function keepOwnPhotos(found: V2Images, previousDoc: unknown): V2Images {
  const previous = Array.from(
    new Set(JSON.stringify(previousDoc ?? null).match(OWN_PHOTO_URL) ?? [])
  );
  const current = new Set(
    [found.hero, found.about, ...(found.gallery ?? [])].filter(
      (u): u is string => Boolean(u && u.includes("/gmb-"))
    )
  );
  if (current.size >= previous.length) return found;
  return {
    ...found,
    hero: previous[0],
    about: previous[1] ?? found.about,
    gallery: previous.length >= MIN_GALLERY_PHOTOS ? previous : found.gallery,
  };
}

/** Echte Fotos neben dem Hero-Bild — die Farbfläche braucht mindestens eins. */
export function entryPhotos(images: V2Images): EntryPhotos {
  const extra = new Set(
    [images.about, ...(images.gallery ?? [])].filter(
      (u): u is string => Boolean(u) && u !== images.hero
    )
  );
  return {
    heroLandscape: images.heroLandscape === true,
    extraPhotos: extra.size,
  };
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
 * Gestaltung wie bei einer neuen Seite (2026-10-05, ohne Packs seit
 * 2026-10-13): aktueller Design-Stand, Einstieg nach Fotomaterial und das
 * Hauptsystem der Branche mit Standard-Farbstimmung [E3]. Für die Admin-
 * Neuerstellung. Alte Farbwerte und Schriftpaare fallen weg.
 */
export function withNewSiteDesign(
  doc: WebsiteDataV2,
  packId: PackId,
  images: V2Images
): WebsiteDataV2 {
  const {
    system: _system,
    palette: _palette,
    designRevision: _revision,
    colorOverrides: _colors,
    fontPairId: _fontPair,
    ...content
  } = doc;
  const designed = WebsiteDataV2Schema.parse({
    ...content,
    designStand: AKTUELLER_DESIGN_STAND,
    designProfile: entryProfile(
      {
        stylePackId: packId,
        businessName: doc.businessName,
        businessCategory: doc.businessCategory,
        sections: doc.sections,
      },
      entryPhotos(images)
    ),
  });
  return withPrimarySystem(designed);
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
  images: V2Images,
  industryKey?: string
): WebsiteDataV2 {
  // Dieselbe Familienwahl wie die fertige Seite (generateSiteContent), damit
  // der Zwischenstand schon im richtigen Designsystem erscheint. Standard
  // bleibt ohne Feld (wie withFamily).
  const family = resolveIndustryFamily(category, businessName, industryKey);
  const interim = {
    version: 2 as const,
    stylePackId: packId,
    businessName,
    businessCategory: category,
    slug,
    ...(family === "standard" ? {} : { blueprintFamily: family }),
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
      ...(images.gallery && images.gallery.length >= MIN_GALLERY_PHOTOS
        ? [
            {
              type: "gallery" as const,
              headline: "Einblicke",
              images: images.gallery.map((url, i) => ({
                url,
                alt: `${businessName} – Eindruck ${i + 1}`,
              })),
            },
          ]
        : []),
      {
        type: "contact" as const,
        headline: "Kontakt",
        openingHours: PLACEHOLDER_OPENING_HOURS.map(entry => ({ ...entry })),
      },
    ],
    // Galerie-Fotos dürfen im Zwischenstand stehen (Hero/About/Galerie
    // wirken vollständig). Das Extra bleibt aus — engine.ts blendet die
    // Sektion ohne `addOns.gallery` aus, bis der Kunde sie bucht.
  };
  // Harte Garantie statt Annahme: der Zwischenstand MUSS dem Vertrag genügen
  // (SSR-Preview und assertV2SafeWrite verlassen sich darauf) und ist wie
  // jedes geschriebene Dokument ein System-Dokument (rev 3).
  return withPrimarySystem(
    WebsiteDataV2Schema.parse({
      ...interim,
      designStand: AKTUELLER_DESIGN_STAND,
      designProfile: entryProfile(interim, entryPhotos(images)),
    })
  );
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
/** So viele Fotos soll eine Seite haben (Einstieg, Über uns, Galerie). */
const TARGET_PHOTOS = 9;
/** Zusätzliche Unsplash-Kandidaten, weil die Fotoprüfung aussortiert. */
const FILL_RESERVE = 3;
/** Galerie nur, wenn mindestens so viele brauchbare GMB-Fotos existieren (Spec §2.2). */
const MIN_GALLERY_PHOTOS = 3;

/**
 * Bilder kommen NIE vom LLM: echte GMB-Fotos zuerst (Foto 1 = Hero, Foto 2 =
 * Über uns, ab ≥ 3 Fotos zusätzlich alle als Galerie). Fehlen GMB-Fotos
 * (kein Eintrag, self-Place-ID, Spiegelung leer), greift Branchen-Stock
 * für Hero, Über uns UND Galerie — die Website sieht sofort vollständig
 * aus statt mit leerem Hero/About/Galerie. Später gewählte Fotos ersetzen
 * die Defaults (PhotosPanel Auto-Apply).
 *
 * Key-Leak geschlossen (Plan B7 Task 3): GMB-Fotos werden über
 * `mirrorGmbPhotosToR2` serverseitig geladen und nach R2 gespiegelt — ins
 * Dokument gelangen ausschließlich R2-URLs, nie die Google-Photo-URL mit
 * `key=`. Schlägt die Spiegelung fehl (z. B. R2 nicht konfiguriert), greift
 * der Stock-Fallback statt jemals einer Key-URL.
 */
/**
 * Wird die Seite eine Nacht-Seite (Hauptsystem der Branche, freigeschaltet)?
 * Dann bevorzugt die Stockfoto-Ergänzung die Abendmotive des Bildsatzes
 * (Nacht N2+N3). Andere Systeme bleiben unverändert.
 */
export function prefersEveningPhotos(
  category: string,
  businessName: string,
  released: boolean = isReleased("nacht"),
  industryKey?: string
): boolean {
  if (!released) return false;
  // Dieselbe Familienwahl wie bei der fertigen Seite (Kategorie, Name,
  // Branchenschlüssel), sonst weicht das Bildset vom Design ab.
  const blueprintFamily = resolveIndustryFamily(category, businessName, industryKey);
  const [primary] = systemsForDoc({
    businessCategory: category,
    businessName,
    blueprintFamily,
  });
  return primary === "nacht";
}

export async function resolveV2Images(
  business: { placeId: string | null; name: string },
  category: string,
  industryKey: string,
  websiteId: number,
  evening: boolean = prefersEveningPhotos(
    category,
    business.name,
    isReleased("nacht"),
    industryKey
  )
): Promise<V2Images> {
  const stock = buildStockFallbackImages(category, business.name, industryKey, {
    evening,
  });
  const gmb =
    business.placeId && !business.placeId.startsWith("self-")
      ? await mirrorGmbPhotosToR2(business.placeId, websiteId, MAX_GMB_PHOTOS)
      : [];
  // Reichlich bebildert (Betreiber 2026-10-07: „je mehr Fotos, desto besser,
  // nur hochwertig"): eigene Fotos zuerst, Unsplash zur genauen Kategorie
  // füllt auf. Ein paar mehr als nötig — die Fotoprüfung sortiert aus.
  const fill =
    gmb.length < TARGET_PHOTOS
      ? await unsplashFill(
          category,
          resolveIndustryFamily(category, business.name, industryKey),
          TARGET_PHOTOS - gmb.length + FILL_RESERVE,
          {},
          business.name
        )
      : { urls: [], credits: [] };
  if (fill.urls.length > 0) {
    // Ohne eigene Fotos stehen bei Nacht die Abendmotive vorn (dunkler
    // Einstieg); eigene Fotos gehen immer vor.
    const night =
      evening && gmb.length === 0
        ? eveningImages(category, business.name, industryKey)
        : [];
    const pool = Array.from(new Set([...gmb, ...night, ...fill.urls]));
    return {
      hero: pool[0],
      about: pool[1],
      gallery: pool,
      credits: fill.credits,
    };
  }
  if (gmb.length === 0) {
    // Ohne Google-Fotos UND ohne passende Branchengruppe blieben generische
    // Büromotive übrig (Betreiber-Befund 2026-09-20: Laptops beim Friseur).
    // Dann lieber Bilder zur Kategorie erzeugen.
    const satz = getIndustryImages(category, business.name, industryKey);
    if (istNeutralesSet(satz)) {
      const erzeugt = await generateIndustryImages(category, websiteId);
      if (erzeugt) return erzeugt;
    }
    return stock;
  }
  const about = gmb[1] ?? stock.about;
  const gallery = gmb.length >= MIN_GALLERY_PHOTOS ? gmb : stock.gallery;
  return {
    hero: gmb[0],
    ...(about ? { about } : {}),
    ...(gallery ? { gallery } : {}),
  };
}

/**
 * v2-Generierungspfad (aufgerufen von runWebsiteGenerationV2Job unten;
 * routers.ts' website.generate/outreach.queueBusinesses und
 * outreachPipeline.ts rufen seit Plan B4b direkt runWebsiteGenerationV2Job
 * auf, kein separater Wrapper mehr):
 * Textstimme per Rotation wählen, Inhalte vom LLM holen
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
  // Branchen-Lücken-Logging (Backlog 16): Kategorien, die keine Stimme direkt
  // matcht (z. B. „Naturschutzbund"), fürs Admin-Panel zählen — daraus
  // werden neue Template-Richtungen priorisiert. Der generische Leerfall-
  // Fallback „Dienstleistung" zählt nicht als echte Lücke. Fire-and-forget,
  // recordIndustryGap wirft nie (fängt intern).
  const trimmedCategory = category.trim();
  if (
    trimmedCategory &&
    trimmedCategory.toLowerCase() !== "dienstleistung" &&
    !hasDirectVoiceMatch(trimmedCategory)
  ) {
    void recordIndustryGap(trimmedCategory, website.id);
  }
  const packId = await selectVoice(
    category,
    industryKey,
    business.editorialSummary ?? undefined
  );
  // Fortschrittsstufen sind an generationProgress.PHASES gekoppelt:
  // 30–54 „Bilder werden gesetzt", 55–89 „Texte entstehen", ≥ 90 „Vorschau".
  await devPhasePause();
  // Website-Crawl parallel zur Bild-Phase (Plan B7 Task 2/3):
  // `crawlExistingSite` rejected nie (jeder Fehler → null), das Promise darf
  // deshalb unbeaufsichtigt neben der Bild-Phase laufen.
  const existingSitePromise = business.website
    ? crawlExistingSite(business.website)
    : Promise.resolve(null);
  const images = await withStagePhoto(
    await resolveV2Images(business, category, industryKey, website.id),
    {},
    category
  );
  const tImages = Date.now();

  // Zeitmaschine (Task 4): Zwischenstand mit Bildern + Platzhaltertexten
  // persistieren und den SSR-Cache invalidieren, BEVOR die lange LLM-Phase
  // beginnt — die Studio-Vorschau (/preview-ssr, ungecacht) zeigt ihn sofort.
  const previousWebsiteData = website.websiteData ?? null;
  let interim = buildInterimV2Doc(
    packId,
    business.name,
    category,
    website.slug,
    images,
    industryKey
  );
  // Bei einer Neuerstellung bleibt die Gestaltung des vorigen Stands
  // (Einstieg, Design-Stand, Akzent → Farbstimmung); sonst die neue.
  const previousParsed = WebsiteDataV2Schema.safeParse(previousWebsiteData);
  const previous = previousParsed.success ? previousParsed.data : undefined;
  const colorOverrides = previous?.colorOverrides ?? interim.colorOverrides;
  interim = withPrimarySystem(
    WebsiteDataV2Schema.parse({
      ...interim,
      designProfile: previous?.designProfile ?? interim.designProfile,
      ...(colorOverrides ? { colorOverrides } : {}),
      designStand: previous?.designStand || interim.designStand,
    })
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
    websiteData = await generateSiteContent({
      packId,
      ...factArgs,
      industryKey,
    });
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
      hint =>
        generateSiteContent({
          packId,
          ...factArgs,
          industryKey,
          retryHint: hint,
        })
    );
    // Die vor der ersten Vorschau gewählte Gestaltung bleibt auch nach
    // der Texterstellung erhalten.
    websiteData = WebsiteDataV2Schema.parse({
      ...websiteData,
      designStand: interim.designStand,
      ...(interim.colorOverrides
        ? { colorOverrides: interim.colorOverrides }
        : {}),
      designProfile: interim.designProfile,
    });
    // blueprintFamily steht jetzt (generateSiteContent/withFamily): das
    // freigeschaltete Hauptsystem der Branche anwenden.
    websiteData = WebsiteDataV2Schema.parse(withPrimarySystem(websiteData));
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
    `[Generation Job ${jobId}] Completed (v2) for website ${website.id}, stimme=${packId} — Bilder ${tImages - t0} ms, Texte ${tLlm - tImages} ms, gesamt ${Date.now() - t0} ms`
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
