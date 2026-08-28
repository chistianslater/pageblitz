import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
  listWebsites: vi.fn().mockResolvedValue([]),
  updateGenerationJob: vi.fn().mockResolvedValue(undefined),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
  // upsertOnboarding (server/onboardingV2/state.ts) für die Spiegelung der
  // generierten Add-on-Defaults (Plan B6 Task 6, Gastro-Speisekarte).
  getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../industryClassifier", () => ({
  classifyIndustry: vi.fn().mockResolvedValue("handwerk"),
}));
// Seit Plan B7 Task 3 spiegelt der Job GMB-Fotos nach R2 (Key-Leak
// geschlossen) — resolveV2Images nutzt mirrorGmbPhotosToR2 statt getGmbPhotos.
vi.mock("../gmbPhotos", () => ({ mirrorGmbPhotosToR2: vi.fn() }));
vi.mock("../gmb/siteCrawl", () => ({ crawlExistingSite: vi.fn() }));
vi.mock("./selectPack", () => ({
  selectPack: vi.fn().mockResolvedValue("werkbank"),
}));
vi.mock("./generateSiteContent", () => ({ generateSiteContent: vi.fn() }));
// Fakten-Guard hier als Passthrough gemockt (eigene Tests in
// factGuard.test.ts) — einzelne Tests lassen ihn gezielt werfen, um zu
// beweisen, dass er INNERHALB des try/restore-Blocks läuft.
vi.mock("./factGuard", async importOriginal => {
  const original = await importOriginal<typeof import("./factGuard")>();
  return {
    buildGuardContextText: original.buildGuardContextText,
    guardGeneratedContent: vi.fn(async (doc: unknown) => doc),
  };
});

import * as db from "../db";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import { crawlExistingSite } from "../gmb/siteCrawl";
import { invalidateSsrCache } from "../ssr/routes";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { generateSiteContent } from "./generateSiteContent";
import { guardGeneratedContent } from "./factGuard";
import {
  buildInterimV2Doc,
  collectOccupiedDesignFingerprints,
  resolveV2Images,
  runWebsiteGenerationV2Job,
} from "./runJob";
import { DEFAULT_DESIGN_PROFILE } from "../../shared/siteContract/designProfile";

const mockedDb = vi.mocked(db);
const mockedMirror = vi.mocked(mirrorGmbPhotosToR2);
const mockedCrawl = vi.mocked(crawlExistingSite);
const mockedGen = vi.mocked(generateSiteContent);
const mockedGuard = vi.mocked(guardGeneratedContent);

const R2_1 = "https://media.pageblitz.de/website-42/gmb-1.jpg";
const R2_2 = "https://media.pageblitz.de/website-42/gmb-2.jpg";
const R2_3 = "https://media.pageblitz.de/website-42/gmb-3.jpg";

describe("collectOccupiedDesignFingerprints", () => {
  test("berücksichtigt nur schema-valide Profile derselben Branche", () => {
    const sameCategory = {
      ...doc,
      businessCategory: "Tischler",
      designProfile: DEFAULT_DESIGN_PROFILE,
    };
    const otherCategory = {
      ...sameCategory,
      businessCategory: "Restaurant",
    };
    const result = collectOccupiedDesignFingerprints(
      [
        { websiteData: sameCategory },
        { websiteData: otherCategory },
        { websiteData: { kaputt: true } },
      ],
      "tischler"
    );
    expect(result.size).toBe(1);
    expect([...result][0]).toContain("werkbank|split|list");
  });
});

const website = { id: 42, slug: "preview-brandt", businessId: 7 };
const business = {
  id: 7,
  name: "Schreinerei Brandt",
  category: "Tischler",
  searchRegion: "Dortmund",
  phone: "0231 123",
  email: null,
  address: null,
  rating: "4.8",
  reviewCount: 12,
  openingHours: ["Montag: 08:00–17:00"],
  placeId: "ChIJabc",
  website: null,
  googleReviews: null,
  editorialSummary: null,
};
const doc = {
  version: 2 as const,
  stylePackId: "werkbank" as const,
  businessName: "Schreinerei Brandt",
  sections: [{ type: "hero" as const, headline: "Massarbeit." }],
  seo: { title: "t", description: "d" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteById.mockResolvedValue(website as any);
  mockedDb.getBusinessById.mockResolvedValue(business as any);
  mockedGen.mockResolvedValue(doc);
  mockedCrawl.mockResolvedValue(null);
  mockedGuard.mockImplementation(async d => d as any);
});

describe("resolveV2Images", () => {
  test("gespiegelte GMB-Fotos haben Vorrang: Foto 1 = Hero, Foto 2 = Über uns; ab 3 Fotos zusätzlich Galerie", async () => {
    mockedMirror.mockResolvedValue([R2_1, R2_2, R2_3]);
    await expect(
      resolveV2Images(
        { placeId: "ChIJabc", name: "X" },
        "Tischler",
        "handwerk",
        42
      )
    ).resolves.toEqual({
      hero: R2_1,
      about: R2_2,
      gallery: [R2_1, R2_2, R2_3],
    });
    expect(mockedMirror).toHaveBeenCalledWith("ChIJabc", 42, 8);
  });
  test("unter 3 GMB-Fotos bleibt Stock-Galerie als Platzhalter", async () => {
    mockedMirror.mockResolvedValue([R2_1, R2_2]);
    const result = await resolveV2Images(
      { placeId: "ChIJabc", name: "X" },
      "Tischler",
      "handwerk",
      42
    );
    expect(result.hero).toBe(R2_1);
    expect(result.about).toBe(R2_2);
    expect(result.gallery?.length).toBeGreaterThanOrEqual(3);
    expect(
      result.gallery?.every(url => url.startsWith("https://images.unsplash.com"))
    ).toBe(true);
  });
  test("self-Place-IDs fragen Google gar nicht erst, Branchen-Stock füllt Hero/About/Galerie", async () => {
    const result = await resolveV2Images(
      { placeId: "self-abc", name: "X" },
      "Tischler",
      "handwerk",
      42
    );
    expect(mockedMirror).not.toHaveBeenCalled();
    expect(result.hero).toMatch(/^https?:\/\//);
    expect(result.about).toMatch(/^https?:\/\//);
    expect(result.gallery?.length).toBeGreaterThanOrEqual(3);
  });
  test("Spiegelung liefert nichts (z. B. R2 nicht konfiguriert) → Stock-Fallback statt Google-URL", async () => {
    mockedMirror.mockResolvedValue([]);
    const result = await resolveV2Images(
      { placeId: "ChIJabc", name: "X" },
      "Tischler",
      "handwerk",
      42
    );
    expect(result.hero).toMatch(/^https?:\/\//);
    expect(result.about).toMatch(/^https?:\/\//);
    expect(result.gallery?.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(result)).not.toContain("maps.googleapis.com");
  });
});

describe("runWebsiteGenerationV2Job", () => {
  test("lädt Website+Business, übergibt Fakten+Bilder, persistiert, invalidiert Cache, schließt Job ab", async () => {
    mockedMirror.mockResolvedValue([R2_1]);
    await runWebsiteGenerationV2Job(99, 42);

    expect(mockedGen).toHaveBeenCalledTimes(1);
    const args = mockedGen.mock.calls[0][0];
    expect(args.packId).toBe("werkbank");
    expect(args.facts?.images?.hero).toBe(R2_1);
    expect(args.facts?.images?.about).toMatch(/^https?:\/\//);
    expect(args.facts?.images?.gallery?.length).toBeGreaterThanOrEqual(3);
    expect(args.facts?.contact?.phone).toBe("0231 123");
    expect(args.facts?.contact?.openingHours).toEqual([
      { day: "Montag", hours: "08:00–17:00" },
    ]);
    expect(args.facts?.google).toEqual({ rating: 4.8, reviewCount: 12 });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      websiteData: expect.objectContaining({
        ...doc,
        designProfile: expect.any(Object),
      }),
    });
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "completed",
      progress: 100,
      result: { success: true, alreadyGenerated: false, usedFallback: false },
    });
  });

  test("Regenerierung bewahrt ein bereits bestätigtes Designprofil", async () => {
    mockedMirror.mockResolvedValue([]);
    const existingProfile = {
      ...DEFAULT_DESIGN_PROFILE,
      heroLayout: "centered" as const,
      servicesLayout: "featured" as const,
      seed: 77,
    };
    mockedDb.getWebsiteById.mockResolvedValue({
      ...website,
      websiteData: { ...doc, designProfile: existingProfile },
    } as any);

    await runWebsiteGenerationV2Job(99, 42);

    const finalDoc = mockedDb.updateWebsite.mock.calls.at(-1)?.[1]
      .websiteData as any;
    expect(finalDoc.designProfile).toEqual(existingProfile);
    expect(mockedDb.listWebsites).not.toHaveBeenCalled();
  });

  test("Fehler der optionalen Kollisionsprüfung blockiert die Generierung nicht", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedDb.listWebsites.mockRejectedValueOnce(new Error("DB kurz weg"));

    await runWebsiteGenerationV2Job(99, 42);

    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(
      99,
      expect.objectContaining({ status: "completed" })
    );
    const finalDoc = mockedDb.updateWebsite.mock.calls.at(-1)?.[1]
      .websiteData as any;
    expect(finalDoc.designProfile).toBeDefined();
  });

  test("Key-Leak-Regression (Plan B7 Task 3): kein `key=` und kein maps.googleapis.com in irgendeinem persistierten Dokument", async () => {
    mockedMirror.mockResolvedValue([R2_1, R2_2, R2_3]);
    mockedDb.getBusinessById.mockResolvedValue({
      ...business,
      googleReviews: [
        { author_name: "Anna Beispiel", rating: 5, text: "Top!", time: 1 },
      ],
    } as any);
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.updateWebsite.mock.calls.length).toBeGreaterThan(0);
    for (const call of mockedDb.updateWebsite.mock.calls) {
      const persisted = JSON.stringify(call[1].websiteData ?? "");
      expect(persisted).not.toContain("key=");
      expect(persisted).not.toContain("maps.googleapis.com");
    }
    // Auch die Fakten für das LLM enthalten nur R2-URLs.
    const args = mockedGen.mock.calls[0][0];
    expect(JSON.stringify(args.facts?.images)).not.toContain("key=");
  });

  test("Website-Crawl (Task 2/3): business.website wird gecrawlt und als existingSite in die Fakten gereicht; ohne Website kein Crawl", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedDb.getBusinessById.mockResolvedValue({
      ...business,
      website: "https://www.brandt-schreinerei.de",
    } as any);
    mockedCrawl.mockResolvedValue({
      title: "Schreinerei Brandt",
      text: "Möbel nach Maß aus Dortmund.",
    });
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedCrawl).toHaveBeenCalledWith(
      "https://www.brandt-schreinerei.de"
    );
    const args = mockedGen.mock.calls[0][0];
    expect(args.facts?.existingSite).toEqual({
      title: "Schreinerei Brandt",
      text: "Möbel nach Maß aus Dortmund.",
    });

    vi.clearAllMocks();
    mockedDb.getWebsiteById.mockResolvedValue(website as any);
    mockedDb.getBusinessById.mockResolvedValue(business as any);
    mockedGen.mockResolvedValue(doc);
    mockedGuard.mockImplementation(async d => d as any);
    mockedMirror.mockResolvedValue([]);
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedCrawl).not.toHaveBeenCalled();
  });

  test("Fakten-Guard läuft nach der LLM-Phase und sein Ergebnis wird persistiert", async () => {
    mockedMirror.mockResolvedValue([]);
    const corrected = { ...doc, businessName: "Korrigiert" };
    mockedGuard.mockResolvedValue(corrected as any);
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedGuard).toHaveBeenCalledTimes(1);
    const guardFacts = mockedGuard.mock.calls[0][1];
    expect(guardFacts).toMatchObject({
      businessName: "Schreinerei Brandt",
      category: "Tischler",
      city: "Dortmund",
    });
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: expect.objectContaining({
        ...corrected,
        designProfile: expect.any(Object),
      }),
    });
  });

  test("Add-on-Defaults aus dem Dokument (addOns.menu der Gastro-Generierung) werden als Entwurfs-Flags in onboarding_responses gespiegelt (Plan B6 Task 6)", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedGen.mockResolvedValue({ ...doc, addOns: { menu: true } });
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.createOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 42, addOnMenu: true })
    );
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(
      99,
      expect.objectContaining({ status: "completed" })
    );
  });

  test("addOns.gallery (GMB-Foto-Galerie der Generierung) wird ebenfalls als Entwurfs-Flag gespiegelt", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedGen.mockResolvedValue({ ...doc, addOns: { gallery: true } });
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.createOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 42, addOnGallery: true })
    );
  });

  test("ohne addOns im Dokument keine Onboarding-Schreibung", async () => {
    mockedMirror.mockResolvedValue([]);
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.createOnboarding).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });

  test("Galerie-Sektion ohne addOns.gallery wird nicht als Extra nach onboarding_responses gespiegelt", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedGen.mockResolvedValue({
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "gallery" as const,
          headline: "Einblicke",
          images: [
            { url: "/demo/a.webp", alt: "a" },
            { url: "/demo/b.webp", alt: "b" },
            { url: "/demo/c.webp", alt: "c" },
          ],
        },
      ],
    });
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.createOnboarding).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });

  test("Zwischenstand nach der Bild-Phase: schema-valides Interim-Doc mit Bildern + deutschen Platzhaltertexten wird persistiert und der SSR-Cache invalidiert, BEVOR das LLM läuft (Zeitmaschine, Task 4)", async () => {
    mockedMirror.mockResolvedValue([R2_1, R2_2]);
    await runWebsiteGenerationV2Job(99, 42);

    // Zwei Dokument-Writes: erst Interim, dann final.
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(2);
    const interim = mockedDb.updateWebsite.mock.calls[0][1].websiteData as any;
    expect(WebsiteDataV2Schema.safeParse(interim).success).toBe(true);
    expect(interim.stylePackId).toBe("werkbank");
    expect(interim.businessName).toBe("Schreinerei Brandt");
    expect(interim.businessCategory).toBe("Tischler");
    const hero = interim.sections.find((s: any) => s.type === "hero");
    expect(hero.headline).toBe("Schreinerei Brandt");
    expect(hero.subheadline).toMatch(/entstehen/);
    expect(hero.imageUrl).toBe(R2_1);
    const about = interim.sections.find((s: any) => s.type === "about");
    expect(about.imageUrl).toBe(R2_2);
    const gallery = interim.sections.find((s: any) => s.type === "gallery");
    expect(gallery.images.length).toBeGreaterThanOrEqual(3);
    expect(interim.addOns?.gallery).not.toBe(true);
    expect(JSON.stringify(interim).toLowerCase()).not.toContain("lorem");

    // Interim-Write + Cache-Invalidierung liegen VOR dem LLM-Aufruf.
    expect(mockedDb.updateWebsite.mock.invocationCallOrder[0]).toBeLessThan(
      mockedGen.mock.invocationCallOrder[0]
    );
    expect(invalidateSsrCache).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(invalidateSsrCache).mock.invocationCallOrder[0]
    ).toBeLessThan(mockedGen.mock.invocationCallOrder[0]);

    // Finaler Write überschreibt den Zwischenstand mit dem LLM-Dokument.
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: expect.objectContaining({
        ...doc,
        designProfile: expect.any(Object),
      }),
    });
  });

  test("buildInterimV2Doc ist auch ohne Bilder schema-valide (assertV2SafeWrite-konform)", () => {
    const interim = buildInterimV2Doc(
      "werkbank",
      "Schreinerei Brandt",
      "Tischler",
      "preview-brandt",
      {}
    );
    expect(WebsiteDataV2Schema.safeParse(interim).success).toBe(true);
  });

  test("LLM-Fehler NACH dem Zwischenstand: vorheriges websiteData wird wiederhergestellt (hier: null), Cache invalidiert, Job failed", async () => {
    mockedMirror.mockResolvedValue([R2_1]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await runWebsiteGenerationV2Job(99, 42);

    // Write 1 = Interim, Write 2 = Restore des Ausgangszustands (kein Doc).
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(2);
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: null,
    });
    expect(invalidateSsrCache).toHaveBeenCalledTimes(2);
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "failed",
      error: "LLM kaputt",
    });
  });

  test("Guard-Fehler NACH dem Zwischenstand (neuer Await, Task-4-Review-Regel): Restore + Job failed — kein liegengebliebenes Platzhalter-Dokument", async () => {
    mockedMirror.mockResolvedValue([R2_1]);
    mockedGuard.mockRejectedValue(new Error("Guard kaputt"));
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(2);
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: null,
    });
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "failed",
      error: "Guard kaputt",
    });
  });

  test("LLM-Fehler bei Regenerierung: das zuvor gespeicherte v2-Dokument wird wiederhergestellt statt genullt", async () => {
    const previous = { ...doc, businessName: "Alter Stand" };
    mockedDb.getWebsiteById.mockResolvedValue({
      ...website,
      websiteData: previous,
    } as any);
    mockedMirror.mockResolvedValue([]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: previous,
    });
  });

  test("Fehler → Job failed mit Meldung, kein Throw nach außen", async () => {
    mockedMirror.mockResolvedValue([]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await expect(runWebsiteGenerationV2Job(99, 42)).resolves.toBeUndefined();
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "failed",
      error: "LLM kaputt",
    });
  });
});
