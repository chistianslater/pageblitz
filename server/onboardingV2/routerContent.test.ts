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
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn().mockResolvedValue(undefined),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createOnboarding: vi.fn().mockResolvedValue(999),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../onboardingUpload", () => ({
  uploadPhoto: vi
    .fn()
    .mockResolvedValue({ url: "https://cdn/x.jpg", key: "k" }),
}));
vi.mock("../gmbPhotos", () => ({
  getGmbPhotos: vi.fn().mockResolvedValue(["https://g/1.jpg"]),
}));

import { appRouter } from "../routers";
import * as db from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { getGmbPhotos } from "../gmbPhotos";
const mockedDb = vi.mocked(db);

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
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/h.jpg" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "contact" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteByToken.mockResolvedValue({
    id: 42,
    slug: "preview-brandt",
    status: "preview",
    businessId: 7,
    websiteData: v2,
    customerEmail: null,
  } as any);
  mockedDb.getBusinessById.mockResolvedValue({
    id: 7,
    name: "Brandt",
    category: "Tischler",
    placeId: "ChIJabc",
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
    photoUrls: [],
  } as any);
});

describe("onboardingV2.getPhotoSources", () => {
  test("liefert gmb (nur echte placeId), stock und uploaded", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Brandt",
      category: "Tischler",
      placeId: "ChIJabc",
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      photoUrls: ["https://u/1.jpg"],
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual(["https://g/1.jpg"]);
    expect(r.stock.length).toBeGreaterThan(0);
    expect(r.uploaded).toEqual(["https://u/1.jpg"]);
  });

  test("self-placeId → gmb leer ohne Google-Aufruf", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "B",
      category: "Tischler",
      placeId: "self-x",
    } as any);
    const r = await caller().onboardingV2.getPhotoSources({ token: "tok" });
    expect(r.gmb).toEqual([]);
    expect(getGmbPhotos).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.uploadPhoto", () => {
  test("lädt hoch und hängt URL an photoUrls an", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      photoUrls: ["https://u/1.jpg"],
    } as any);
    const r = await caller().onboardingV2.uploadPhoto({
      token: "tok",
      imageData: "data:image/jpeg;base64,AAAA",
      mimeType: "image/jpeg",
    });
    expect(r.url).toBe("https://cdn/x.jpg");
    expect(r.uploaded).toEqual(["https://u/1.jpg", "https://cdn/x.jpg"]);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        photoUrls: ["https://u/1.jpg", "https://cdn/x.jpg"],
      })
    );
  });
});

describe("onboardingV2.setImages / updateTexts / updateOffer", () => {
  test("setImages persistiert hinter Guard und invalidiert Cache", async () => {
    const s = await caller().onboardingV2.setImages({
      token: "tok",
      patch: { hero: "https://x/h.jpg" },
    });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({ version: 2 }),
      })
    );
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect((s.doc!.sections[0] as any).imageUrl).toBe("https://x/h.jpg");
  });

  test("updateTexts markiert texts als erledigt", async () => {
    const s = await caller().onboardingV2.updateTexts({
      token: "tok",
      patch: { headline: "Neu" },
    });
    expect(s.checklist.find(i => i.id === "texts")?.status).toBe("done");
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        studioProgress: expect.objectContaining({ textsReviewed: true }),
      })
    );
  });

  test("updateOffer: ungültiger Patch (0 items) → BAD_REQUEST, kein Write", async () => {
    await expect(
      caller().onboardingV2.updateOffer({
        token: "tok",
        offer: { mode: "services", headline: "L", items: [] } as any,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("updateOffer menu ersetzt services", async () => {
    const s = await caller().onboardingV2.updateOffer({
      token: "tok",
      offer: {
        mode: "menu",
        categories: [
          { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
        ],
      },
    });
    expect(s.doc!.sections.map(x => x.type)).toContain("menu");
    expect(s.doc!.sections.map(x => x.type)).not.toContain("services");
  });
});
