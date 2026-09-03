import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getWebsiteByToken: vi.fn(),
    getSubscriptionByWebsiteId: vi.fn(),
    getBusinessById: vi.fn(),
    getGenerationJobByWebsiteId: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn(),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createOnboarding: vi.fn(),
    getLatestWebsiteVersion: vi.fn().mockResolvedValue(null),
    insertWebsiteVersion: vi.fn().mockResolvedValue(1),
    replaceWebsiteVersion: vi.fn().mockResolvedValue(undefined),
    countWebsiteVersions: vi.fn().mockResolvedValue(0),
    deleteOldestWebsiteVersions: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../gmb/siteCrawl", async importOriginal => {
  const actual = await importOriginal<typeof import("../gmb/siteCrawl")>();
  return { ...actual, crawlSiteBranding: vi.fn() };
});
vi.mock("../onboardingUpload", () => ({
  uploadLogoFromUrl: vi.fn(),
}));

import { appRouter } from "../routers";
import * as db from "../db";
import { crawlSiteBranding } from "../gmb/siteCrawl";
import { uploadLogoFromUrl } from "../onboardingUpload";
const mockedDb = vi.mocked(db);
const mockedCrawl = vi.mocked(crawlSiteBranding);
const mockedUpload = vi.mocked(uploadLogoFromUrl);

const ctx = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});
const caller = () => appRouter.createCaller(ctx());

const v2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  businessCategory: "Tischler",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/h.jpg" },
    { type: "contact", phone: "0231 1" },
  ],
};

function loadDoc(doc: unknown) {
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    businessId: 7,
    websiteData: doc,
    customerEmail: null,
  } as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  loadDoc(v2);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
    website: "https://brandt.example/",
  } as any);
  mockedCrawl.mockResolvedValue({
    origin: "https://brandt.example",
    logoUrl: "https://brandt.example/logo.svg",
    accent: "#a3402a",
    fonts: ["Playfair Display", "Lato"],
  });
  mockedUpload.mockResolvedValue({
    url: "https://media.pageblitz.de/onboarding/42/logo-x.webp",
    key: "k",
    width: 240,
    height: 80,
    sizeBytes: 1234,
  });
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
  } as any);
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getLatestWebsiteVersion.mockResolvedValue(null);
});

describe("Marken-Import (2026-09-03)", () => {
  test("Vorschau liefert Logo, Farbe samt Namen und Schriftpaar, ohne zu schreiben", async () => {
    const result = await caller().onboardingV2.brandImportPreview({
      token: "tok",
    });
    expect(mockedCrawl).toHaveBeenCalledWith("https://brandt.example/");
    expect(result).toEqual({
      available: true,
      suggestion: {
        domain: "brandt.example",
        logoUrl: "https://brandt.example/logo.svg",
        accent: "#a3402a",
        accentName: "Terrakotta",
        fontPairId: "elegant",
        fonts: ["Playfair Display", "Lato"],
        hasAnything: true,
      },
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("ohne Website im Betriebsprofil gibt es keine Vorschau und keinen Crawl", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      website: null,
    } as any);
    expect(
      await caller().onboardingV2.brandImportPreview({ token: "tok" })
    ).toEqual({
      available: false,
    });
    expect(mockedCrawl).not.toHaveBeenCalled();
  });

  test("Crawl ohne Treffer → available true, aber nichts übernehmbar", async () => {
    mockedCrawl.mockResolvedValue({
      origin: "https://brandt.example",
      logoUrl: null,
      accent: null,
      fonts: [],
    });
    const result = await caller().onboardingV2.brandImportPreview({
      token: "tok",
    });
    expect(result.available).toBe(true);
    if (!result.available) throw new Error("unreachable");
    expect(result.suggestion.hasAnything).toBe(false);
  });

  test("Übernehmen schreibt genau die angehakten Teile in einem Stand", async () => {
    const state = await caller().onboardingV2.applyBrandImport({
      token: "tok",
      logo: true,
      accent: true,
      fontPair: false,
    });
    expect(mockedUpload).toHaveBeenCalledWith(
      "https://brandt.example/logo.svg",
      42
    );
    expect(state.doc?.logo).toEqual({
      kind: "image",
      url: "https://media.pageblitz.de/onboarding/42/logo-x.webp",
    });
    expect(state.doc?.colorOverrides?.accent).toBe("#a3402a");
    expect(state.doc?.fontPairId).toBeUndefined();
    const inserted = mockedDb.insertWebsiteVersion.mock.calls.map(c => c[0]);
    expect(inserted.at(-1)).toMatchObject({
      trigger: "panel",
      label: "Marke übernommen: Logo, Farbe",
    });
  });

  test("Übernehmen ohne Auswahl → BAD_REQUEST, kein Write", async () => {
    await expect(
      caller().onboardingV2.applyBrandImport({
        token: "tok",
        logo: false,
        accent: false,
        fontPair: false,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("Logo-Abruf scheitert → Rest wird trotzdem übernommen", async () => {
    mockedUpload.mockResolvedValue(null);
    const state = await caller().onboardingV2.applyBrandImport({
      token: "tok",
      logo: true,
      accent: false,
      fontPair: true,
    });
    expect(state.doc?.logo).toBeUndefined();
    expect(state.doc?.fontPairId).toBe("elegant");
  });
});
