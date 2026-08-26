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
    updateBusiness: vi.fn().mockResolvedValue(undefined),
    getGenerationJobByWebsiteId: vi.fn(),
    createGenerationJob: vi.fn().mockResolvedValue(501),
    createOnboarding: vi.fn().mockResolvedValue(999),
  };
});
vi.mock("../generationV2/runJob", async importOriginal => {
  const actual =
    await importOriginal<typeof import("../generationV2/runJob")>();
  return {
    ...actual,
    runWebsiteGenerationV2Job: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));

import { appRouter } from "../routers";
import * as db from "../db";
import {
  buildInterimV2Doc,
  runWebsiteGenerationV2Job,
} from "../generationV2/runJob";
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
    expect(s.status).toBe("preview");
    expect(s.slug).toBe("preview-brandt");
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
      subpages: false,
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
  test("ensureGeneration ohne force: BAD_REQUEST, kein neuer Job", async () => {
    await expect(
      appRouter
        .createCaller(ctx())
        .onboardingV2.ensureGeneration({ token: "tok" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
  });

  test("ensureGeneration mit force auf einer Vorschau (status preview) → neuer v2-Job", async () => {
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.ensureGeneration({ token: "tok", force: true });
    expect(r).toEqual({ jobId: 501, status: "pending" });
    expect(mockedDb.createGenerationJob).toHaveBeenCalledWith({
      websiteId: 42,
      status: "pending",
      progress: 0,
    });
    expect(runWebsiteGenerationV2Job).toHaveBeenCalledWith(501, 42);
  });

  test("ensureGeneration mit force auf einer verkauften Website (status sold) → BAD_REQUEST, kein Job", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "sold",
      businessId: 7,
      websiteData: { hero: {} },
      customerEmail: null,
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      userId: 9,
      checkoutEmail: null,
    } as any);
    await expect(
      appRouter
        .createCaller({
          user: { id: 9, email: "kunde@x.de" },
          req: { protocol: "https", headers: {} } as any,
          res: {} as any,
        })
        .onboardingV2.ensureGeneration({ token: "tok", force: true })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("Support kontaktieren"),
    });
    expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
  });

  test("ensureGeneration mit force, aber bereits laufendem Job → wird zurückgegeben, kein Doppelstart", async () => {
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 88,
      status: "processing",
      progress: 20,
      error: null,
    } as any);
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.ensureGeneration({ token: "tok", force: true });
    expect(r).toEqual({ jobId: 88, status: "processing" });
    expect(runWebsiteGenerationV2Job).not.toHaveBeenCalled();
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
  test("liegengebliebenes Interim-Doc + failed Job → neuer Job statt fälschlich completed (Plan B7 Nachfix)", async () => {
    // Crash/Restore-Fehler zwischen Interim- und Final-Write: das
    // Platzhalter-Dokument liegt noch in websiteData, der Job ist failed.
    const interim = buildInterimV2Doc("werkbank", "Brandt", "Tischler", "s", {
      hero: "https://media.pageblitz.de/website-42/gmb-1.jpg",
    });
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: interim,
    } as any);
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "failed",
      progress: 55,
      error: "Server neu gestartet",
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
  test("echtes v2-Dokument + alter failed Job → completed, kein neuer Job (kein Überschreiben)", async () => {
    mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
      id: 77,
      status: "failed",
      progress: 30,
      error: "früherer Fehlschlag",
    } as any);
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

describe("onboardingV2 — Kategorie-Rückfrage (Plan B7 Task 5)", () => {
  /** Frische Preview ohne Dokument, deren Business keine Kategorie hat. */
  function seedNeedsCategory() {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "preview",
      businessId: 7,
      websiteData: null,
      customerEmail: null,
    } as any);
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schau und Horch",
      category: null,
    } as any);
  }

  describe("getState.needsCategory", () => {
    test("kein Dokument + leere Kategorie → true", async () => {
      seedNeedsCategory();
      const s = await appRouter
        .createCaller(ctx())
        .onboardingV2.getState({ token: "tok" });
      expect(s.needsCategory).toBe(true);
      // Whitespace-Kategorie zählt ebenfalls als leer.
      mockedDb.getBusinessById.mockResolvedValue({
        id: 7,
        name: "X",
        category: "   ",
      } as any);
      const s2 = await appRouter
        .createCaller(ctx())
        .onboardingV2.getState({ token: "tok" });
      expect(s2.needsCategory).toBe(true);
    });
    test("kein Dokument, erkannte Kategorie vorhanden → true (Bestätigung vor Generierung)", async () => {
      seedNeedsCategory();
      mockedDb.getBusinessById.mockResolvedValue({
        id: 7,
        name: "Brandt",
        category: "Tischler",
      } as any);
      const s = await appRouter
        .createCaller(ctx())
        .onboardingV2.getState({ token: "tok" });
      expect(s.needsCategory).toBe(true);
    });
    test("v2-Dokument vorhanden → false, auch bei leerer Kategorie (nach der Generierung ist die Frage sinnlos)", async () => {
      mockedDb.getBusinessById.mockResolvedValue({
        id: 7,
        name: "Brandt",
        category: null,
      } as any);
      const s = await appRouter
        .createCaller(ctx())
        .onboardingV2.getState({ token: "tok" });
      expect(s.needsCategory).toBe(false);
    });
    test("Legacy-Dokument (v1) → false (keine Sackgasse vor der LegacyCard)", async () => {
      mockedDb.getWebsiteByToken.mockResolvedValue({
        id: 42,
        slug: "s",
        status: "preview",
        businessId: 7,
        websiteData: { hero: {} },
        customerEmail: null,
      } as any);
      mockedDb.getBusinessById.mockResolvedValue({
        id: 7,
        name: "Brandt",
        category: null,
      } as any);
      const s = await appRouter
        .createCaller(ctx())
        .onboardingV2.getState({ token: "tok" });
      expect(s.needsCategory).toBe(false);
    });
  });

  describe("ensureGeneration bei needsCategory", () => {
    test("kein Auto-Start: BAD_REQUEST mit deutscher Meldung, kein Job", async () => {
      seedNeedsCategory();
      await expect(
        appRouter
          .createCaller(ctx())
          .onboardingV2.ensureGeneration({ token: "tok" })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: expect.stringContaining("was dein Betrieb macht"),
      });
      expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
      expect(runWebsiteGenerationV2Job).not.toHaveBeenCalled();
    });
  });

  describe("setCategory", () => {
    test("persistiert getrimmte Kategorie und startet die Generierung", async () => {
      seedNeedsCategory();
      const r = await appRouter.createCaller(ctx()).onboardingV2.setCategory({
        token: "tok",
        category: "  Werbeagentur  ",
      });
      expect(mockedDb.updateBusiness).toHaveBeenCalledWith(7, {
        category: "Werbeagentur",
      });
      expect(r).toEqual({ jobId: 501, status: "pending" });
      expect(runWebsiteGenerationV2Job).toHaveBeenCalledWith(501, 42);
    });
    test("bereits laufender Job → wird zurückgegeben, kein Doppelstart", async () => {
      seedNeedsCategory();
      mockedDb.getGenerationJobByWebsiteId.mockResolvedValue({
        id: 88,
        status: "processing",
        progress: 20,
        error: null,
      } as any);
      const r = await appRouter
        .createCaller(ctx())
        .onboardingV2.setCategory({ token: "tok", category: "Werbeagentur" });
      expect(r).toEqual({ jobId: 88, status: "processing" });
      expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
    });
    test("Validierung: zu kurz / zu lang → BAD_REQUEST mit deutscher Meldung, nichts persistiert", async () => {
      seedNeedsCategory();
      for (const category of ["F", "  x ", "A".repeat(61)]) {
        await expect(
          appRouter
            .createCaller(ctx())
            .onboardingV2.setCategory({ token: "tok", category })
        ).rejects.toMatchObject({
          code: "BAD_REQUEST",
          message: expect.stringContaining("2–60 Zeichen"),
        });
      }
      expect(mockedDb.updateBusiness).not.toHaveBeenCalled();
      expect(mockedDb.createGenerationJob).not.toHaveBeenCalled();
    });
    test("v2-Dokument vorhanden → BAD_REQUEST, keine Änderung", async () => {
      await expect(
        appRouter
          .createCaller(ctx())
          .onboardingV2.setCategory({ token: "tok", category: "Werbeagentur" })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(mockedDb.updateBusiness).not.toHaveBeenCalled();
    });
    test("Ownership: verkaufte Website + fremder Nutzer → FORBIDDEN", async () => {
      mockedDb.getWebsiteByToken.mockResolvedValue({
        id: 42,
        slug: "s",
        status: "sold",
        businessId: 7,
        websiteData: null,
        customerEmail: null,
      } as any);
      mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
        userId: 9,
        checkoutEmail: null,
      } as any);
      await expect(
        appRouter
          .createCaller(ctx())
          .onboardingV2.setCategory({ token: "tok", category: "Werbeagentur" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(mockedDb.updateBusiness).not.toHaveBeenCalled();
    });
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
  test("persistiert Pack, setzt styleConfirmed, invalidiert Cache, gibt neuen State", async () => {
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.selectStylePack({
        token: "tok",
        packId: "kanzlei",
        confirm: true,
      });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
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
  test("bloßes Ansehen einer Richtung persistiert Pack, aber bestätigt den Gate nicht", async () => {
    const s = await appRouter
      .createCaller(ctx())
      .onboardingV2.selectStylePack({
        token: "tok",
        packId: "kanzlei",
        confirm: false,
      });
    expect(mockedDb.updateWebsite).toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("open");
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
      .onboardingV2.selectStylePack({
        token: "tok",
        packId: "kanzlei",
        confirm: true,
      });
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
