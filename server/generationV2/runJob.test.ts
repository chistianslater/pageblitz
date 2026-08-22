import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
  updateGenerationJob: vi.fn().mockResolvedValue(undefined),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
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
import { generateSiteContent } from "./generateSiteContent";
import { resolveV2Images, runWebsiteGenerationV2Job } from "./runJob";

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
