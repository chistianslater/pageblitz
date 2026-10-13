/**
 * Mock-Generierung (PB_LLM_MOCK=1) ohne Kategorie — wie ein Dev-Seed vor
 * `setCategory`/`ensureGeneration`: Zwischenstand und fertige Seite sind
 * System-Dokumente (rev 3), Textstimme steht in `stylePackId`, keine
 * Pack-Farben oder -Schriften.
 */
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getWebsiteById: vi.fn(),
  getBusinessById: vi.fn(),
  getNextLayoutForIndustry: vi.fn(
    async (_key: string, pool: string[]) => pool[0]
  ),
  updateGenerationJob: vi.fn().mockResolvedValue(undefined),
  updateWebsite: vi.fn().mockResolvedValue(undefined),
  recordIndustryGap: vi.fn().mockResolvedValue(undefined),
  getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../industryClassifier", () => ({
  classifyIndustry: vi.fn().mockResolvedValue("default"),
}));
vi.mock("../gmbPhotos", () => ({
  mirrorGmbPhotosToR2: vi.fn().mockResolvedValue([]),
}));
vi.mock("./unsplashFill", () => ({
  unsplashFill: vi.fn().mockResolvedValue({ urls: [], credits: [] }),
}));
vi.mock("./aiStockImages", () => ({
  generateIndustryImages: vi.fn().mockResolvedValue(null),
}));
vi.mock("./heroPhoto", async importOriginal => ({
  ...(await importOriginal<typeof import("./heroPhoto")>()),
  withStagePhoto: vi.fn(async (images: unknown) => images),
}));
vi.mock("../gmb/siteCrawl", () => ({ crawlExistingSite: vi.fn() }));

import * as db from "../db";
import { runWebsiteGenerationV2Job } from "./runJob";
import { TEXT_VOICES } from "../../shared/textVoices";

const mockedDb = vi.mocked(db);

describe("Mock-Generierung ohne Kategorie", () => {
  beforeAll(() => vi.stubEnv("PB_LLM_MOCK", "1"));
  afterAll(() => vi.unstubAllEnvs());

  test("Zwischenstand und fertige Seite sind rev 3 mit System", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 5,
      slug: "dev-seed",
      businessId: 9,
      websiteData: null,
    } as never);
    mockedDb.getBusinessById.mockResolvedValue({
      id: 9,
      name: "Muster Betrieb",
      category: null,
      searchRegion: null,
      phone: null,
      email: null,
      address: null,
      rating: null,
      reviewCount: null,
      openingHours: null,
      placeId: "self-9",
      website: null,
      googleReviews: null,
      editorialSummary: null,
    } as never);

    await runWebsiteGenerationV2Job(1, 5);

    expect(mockedDb.updateGenerationJob).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ status: "completed" })
    );
    const writes = mockedDb.updateWebsite.mock.calls.map(
      c => (c[1] as { websiteData: Record<string, unknown> }).websiteData
    );
    expect(writes).toHaveLength(2);
    for (const doc of writes) {
      expect(doc.designRevision).toBe(3);
      expect(doc.system).toBeTruthy();
      expect(doc.palette).toBeTruthy();
      expect(doc.fontPairId).toBeUndefined();
      expect(doc.colorOverrides).toBeUndefined();
      expect(Object.keys(TEXT_VOICES)).toContain(doc.stylePackId);
    }
    expect(writes[0].system).toBe(writes[1].system);
    expect(writes[0].palette).toBe(writes[1].palette);
  });
});
