import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
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
vi.mock("../gmbPhotos", () => ({ getGmbPhotos: vi.fn() }));
vi.mock("./selectPack", () => ({
  selectPack: vi.fn().mockResolvedValue("werkbank"),
}));
vi.mock("./generateSiteContent", () => ({ generateSiteContent: vi.fn() }));

import * as db from "../db";
import { getGmbPhotos } from "../gmbPhotos";
import { invalidateSsrCache } from "../ssr/routes";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { generateSiteContent } from "./generateSiteContent";
import {
  buildInterimV2Doc,
  resolveV2Images,
  runWebsiteGenerationV2Job,
} from "./runJob";

const mockedDb = vi.mocked(db);
const mockedPhotos = vi.mocked(getGmbPhotos);
const mockedGen = vi.mocked(generateSiteContent);

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
});

describe("resolveV2Images", () => {
  test("GMB-Fotos haben Vorrang: Foto 1 = Hero, Foto 2 = Über uns", async () => {
    mockedPhotos.mockResolvedValue([
      "https://g/1.jpg",
      "https://g/2.jpg",
      "https://g/3.jpg",
    ]);
    await expect(
      resolveV2Images({ placeId: "ChIJabc", name: "X" }, "Tischler", "handwerk")
    ).resolves.toEqual({ hero: "https://g/1.jpg", about: "https://g/2.jpg" });
  });
  test("self-Place-IDs fragen Google gar nicht erst, Branchen-Stock greift", async () => {
    const result = await resolveV2Images(
      { placeId: "self-abc", name: "X" },
      "Tischler",
      "handwerk"
    );
    expect(mockedPhotos).not.toHaveBeenCalled();
    expect(result.hero).toMatch(/^https?:\/\//);
  });
});

describe("runWebsiteGenerationV2Job", () => {
  test("lädt Website+Business, übergibt Fakten+Bilder, persistiert, invalidiert Cache, schließt Job ab", async () => {
    mockedPhotos.mockResolvedValue(["https://g/1.jpg"]);
    await runWebsiteGenerationV2Job(99, 42);

    expect(mockedGen).toHaveBeenCalledTimes(1);
    const args = mockedGen.mock.calls[0][0];
    expect(args.packId).toBe("werkbank");
    expect(args.facts?.images).toEqual({ hero: "https://g/1.jpg" });
    expect(args.facts?.contact?.phone).toBe("0231 123");
    expect(args.facts?.contact?.openingHours).toEqual([
      { day: "Montag", hours: "08:00–17:00" },
    ]);
    expect(args.facts?.google).toEqual({ rating: 4.8, reviewCount: 12 });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      websiteData: doc,
    });
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "completed",
      progress: 100,
      result: { success: true, alreadyGenerated: false, usedFallback: false },
    });
  });
  test("Add-on-Defaults aus dem Dokument (addOns.menu der Gastro-Generierung) werden als Entwurfs-Flags in onboarding_responses gespiegelt (Plan B6 Task 6)", async () => {
    mockedPhotos.mockResolvedValue([]);
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

  test("ohne addOns im Dokument keine Onboarding-Schreibung", async () => {
    mockedPhotos.mockResolvedValue([]);
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.createOnboarding).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });

  test("Zwischenstand nach der Bild-Phase: schema-valides Interim-Doc mit Bildern + deutschen Platzhaltertexten wird persistiert und der SSR-Cache invalidiert, BEVOR das LLM läuft (Zeitmaschine, Task 4)", async () => {
    mockedPhotos.mockResolvedValue(["https://g/1.jpg", "https://g/2.jpg"]);
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
    expect(hero.imageUrl).toBe("https://g/1.jpg");
    const about = interim.sections.find((s: any) => s.type === "about");
    expect(about.imageUrl).toBe("https://g/2.jpg");
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
      websiteData: doc,
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
    mockedPhotos.mockResolvedValue(["https://g/1.jpg"]);
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

  test("LLM-Fehler bei Regenerierung: das zuvor gespeicherte v2-Dokument wird wiederhergestellt statt genullt", async () => {
    const previous = { ...doc, businessName: "Alter Stand" };
    mockedDb.getWebsiteById.mockResolvedValue({
      ...website,
      websiteData: previous,
    } as any);
    mockedPhotos.mockResolvedValue([]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await runWebsiteGenerationV2Job(99, 42);
    expect(mockedDb.updateWebsite).toHaveBeenLastCalledWith(42, {
      websiteData: previous,
    });
  });

  test("Fehler → Job failed mit Meldung, kein Throw nach außen", async () => {
    mockedPhotos.mockResolvedValue([]);
    mockedGen.mockRejectedValue(new Error("LLM kaputt"));
    await expect(runWebsiteGenerationV2Job(99, 42)).resolves.toBeUndefined();
    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(99, {
      status: "failed",
      error: "LLM kaputt",
    });
  });
});
