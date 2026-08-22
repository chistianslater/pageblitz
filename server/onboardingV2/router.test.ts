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
    getGenerationJobByWebsiteId: vi.fn(),
    createGenerationJob: vi.fn().mockResolvedValue(501),
    createOnboarding: vi.fn().mockResolvedValue(999),
  };
});
vi.mock("../generationV2/runJob", () => ({
  runWebsiteGenerationV2Job: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import { appRouter } from "../routers";
import * as db from "../db";
import { runWebsiteGenerationV2Job } from "../generationV2/runJob";
import { invalidateSsrCache } from "../ssr/routes";
const mockedDb = vi.mocked(db);

const ctx = (): TrpcContext => ({
  user: null,
  req: { protocol: "https", headers: {} } as any,
  res: {} as any,
});
const v2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/h.jpg" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
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
  } as any);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
    studioProgress: null,
  } as any);
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined);
});

describe("onboardingV2.getState", () => {
  test("liefert Dokument, Checkliste und Job-Zustand", async () => {
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.getState({ token: "tok" });
    expect(s.websiteId).toBe(42);
    expect(s.stylePackId).toBe("werkbank");
    expect(s.checklist.find(i => i.id === "photos")?.status).toBe("done");
    expect(s.checklist.find(i => i.id === "legal")?.status).toBe("open");
    expect(s.checkoutReady).toBe(false);
    expect(s.job).toBeNull();
    expect(s.legacy).toBe(false);
  });

  test("liefert legal (E-Mail aus customerEmail vorbelegt), addOns, uploadedPhotos, openingHours", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      customerEmail: "kunde@x.de",
      websiteData: {
        ...v2,
        sections: [
          ...v2.sections,
          { type: "contact", openingHours: [{ day: "Mo", hours: "9–17" }] },
        ],
      },
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      websiteId: 42,
      legalOwner: "Max",
      legalEmail: null,
      addOnGallery: true,
      photoUrls: ["https://u/1.jpg"],
    } as any);
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.getState({ token: "tok" });
    expect(s.legal).toMatchObject({
      legalOwner: "Max",
      legalEmail: "kunde@x.de",
      legalPhone: "",
    });
    expect(s.addOns).toEqual({
      contactForm: false,
      gallery: true,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
    });
    expect(s.uploadedPhotos).toEqual(["https://u/1.jpg"]);
    expect(s.openingHours).toEqual([{ day: "Mo", hours: "9–17" }]);
  });
});

describe("onboardingV2 — Legacy-Dokument (v1)", () => {
  beforeEach(() => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: { hero: {} },
      customerEmail: null,
    } as any);
  });
  test("getState: doc null, legacy true, kein Polling-relevanter Job", async () => {
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.getState({ token: "tok" });
    expect(s.doc).toBeNull();
    expect(s.legacy).toBe(true);
  });
  test("ensureGeneration: BAD_REQUEST, kein neuer Job", async () => {
    await expect(
      appRouter
        .createCaller(ctx())
        .onboardingV2.ensureGeneration({ token: "tok" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.ensureGeneration", () => {
  test("v2-Dokument vorhanden → completed, kein neuer Job", async () => {
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.ensureGeneration({ token: "tok" });
    expect(r.status).toBe("completed");
    expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
  });
  test("kein v2-Dokument + kein aktiver Job → neuer Job, v2-Runner gestartet", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: null,
    } as any);
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.ensureGeneration({ token: "tok" });
    expect(r).toEqual({ jobId: 501, status: "pending" });
    expect(mockedDb.createGenerationJob).toHaveBeenCalledWith({
      websiteId: 42,
      status: "pending",
      progress: 0,
    });
    expect(runWebsiteGenerationV2Job).toHaveBeenCalledWith(501, 42);
  });
  test("laufender Job → wird zurückgegeben, kein Doppelstart", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: null,
    } as any);
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "processing",
      progress: 40,
      error: null,
    } as any);
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.ensureGeneration({ token: "tok" });
    expect(r).toEqual({ jobId: 77, status: "processing" });
    expect(runWebsiteGenerationV2Job).not.toHaveBeenCalled();
  });
  test("zwei gleichzeitige Aufrufe → In-Flight-Lock verhindert Doppelstart", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: null,
    } as any);
    const caller = appRouter.createCaller(ctx());
    const [a, b] = await Promise.all([
      caller.onboardingV2.ensureGeneration({ token: "tok" }),
      caller.onboardingV2.ensureGeneration({ token: "tok" }),
    ]);
    expect(mockedDb.createGenerationJob).toHaveBeenCalledTimes(1);
    expect(a.jobId).toBe(b.jobId);
    expect(a.jobId).toBe(501);
  });
});

describe("onboardingV2.getStyleCandidates", () => {
  test("liefert 2 Kandidaten mit Name/Essenz aus der Registry", async () => {
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.getStyleCandidates({ token: "tok", round: 0 });
    expect(r.candidates).toHaveLength(2);
    expect(r.candidates[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      essence: expect.any(String),
    });
  });
});

describe("onboardingV2.selectStylePack", () => {
  test("persistiert Pack + layoutStyle, setzt styleConfirmed, invalidiert Cache, gibt neuen State", async () => {
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.selectStylePack({ token: "tok", packId: "kanzlei" });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        layoutStyle: "kanzlei",
        websiteData: expect.objectContaining({ stylePackId: "kanzlei" }),
      })
    );
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ studioProgress: { styleConfirmed: true } })
    );
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
    expect(s.stylePackId).toBe("kanzlei");
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("done");
  });
  test("unbekanntes Pack → BAD_REQUEST; ohne v2-Dokument → BAD_REQUEST", async () => {
    await expect(
      appRouter
        .createCaller(ctx())
        .onboardingV2.selectStylePack({ token: "tok", packId: "disco" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: null,
    } as any);
    await expect(
      appRouter
        .createCaller(ctx())
        .onboardingV2.selectStylePack({ token: "tok", packId: "kanzlei" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  test("ohne Onboarding-Row → legt Row mit studioProgress an, statt zu updaten", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue(undefined);
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.selectStylePack({ token: "tok", packId: "kanzlei" });
    expect(mockedDb.createOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        status: "in_progress",
        stepCurrent: 0,
        studioProgress: { styleConfirmed: true },
      })
    );
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("done");
  });
});
