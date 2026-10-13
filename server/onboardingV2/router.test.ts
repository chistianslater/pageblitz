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
// Freischaltung der Designsysteme steuerbar. Standard = Produktion: alle
// sechs Systeme frei (ohne freies System lässt sich keine Seite mehr lesen,
// Packs entfernen Task 2).
const ALL_SYSTEMS = ["journal", "raster", "werkstoff", "plakat", "klar", "nacht"];
const released = vi.hoisted(() => ({ ids: [] as string[] }));
vi.mock("../../shared/designSystems/registry", async importOriginal => {
  const actual =
    await importOriginal<
      typeof import("../../shared/designSystems/registry")
    >();
  return {
    ...actual,
    isReleased: (id: string) =>
      released.ids.includes(id) && Boolean((actual.DESIGN_SYSTEMS as any)[id]),
  };
});

import { appRouter } from "../routers";
import * as db from "../db";
import {
  buildInterimV2Doc,
  runWebsiteGenerationV2Job,
} from "../generationV2/runJob";
import { invalidateSsrCache } from "../ssr/routes";
import { systemsForDoc } from "../../shared/designSystems/assignment";
import { DESIGN_SYSTEM_IDS } from "../../shared/designSystems/types";
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
  released.ids = [...ALL_SYSTEMS];
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
  test("liefert nur Systemkarten mit Name, Essenz und drei Farbstimmungen", async () => {
    const r = await appRouter
      .createCaller(ctx())
      .onboardingV2.getStyleCandidates({ token: "tok", round: 0 });
    expect(r.candidates.length).toBeGreaterThan(0);
    for (const c of r.candidates) {
      expect(c).toMatchObject({
        kind: "system",
        id: expect.any(String),
        name: expect.any(String),
        essence: expect.any(String),
      });
      expect(c.palettes).toHaveLength(3);
    }
  });
});

describe("onboardingV2 — keine Pack-Wahl mehr (Packs entfernen, Task 3)", () => {
  test("selectStylePack und der Marken-Import existieren nicht mehr", () => {
    const procedures = appRouter._def.procedures as Record<string, unknown>;
    expect(procedures["onboardingV2.selectStylePack"]).toBeUndefined();
    expect(procedures["onboardingV2.brandImportPreview"]).toBeUndefined();
    expect(procedures["onboardingV2.applyBrandImport"]).toBeUndefined();
    expect(procedures["onboardingV2.selectDesignSystem"]).toBeDefined();
  });
});

describe("onboardingV2 — Designsysteme im Studio (Task 16)", () => {
  const friseurDoc = {
    ...v2,
    stylePackId: "salon-noir",
    businessName: "Salon Lindner",
    businessCategory: "Friseursalon",
    blueprintFamily: "beauty",
  };
  const friseurToken = "tok-friseur";
  const caller = () => appRouter.createCaller(ctx()).onboardingV2;
  const loadDoc = (_token: string) => {
    const calls = mockedDb.updateWebsite.mock.calls;
    return (calls[calls.length - 1][1] as any).websiteData;
  };
  const useDoc = (doc: object) =>
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-lindner",
      status: "preview",
      businessId: 7,
      websiteData: doc,
      customerEmail: null,
    } as any);

  beforeEach(() => {
    useDoc(friseurDoc);
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Salon Lindner",
      category: "Friseursalon",
    } as any);
  });

  // Packs entfernen (Task 3, E2): Das Studio liest jede Seite als System-
  // Dokument und bietet nur noch Systeme an. Runde 0 = Branchen-Tripel ohne
  // das aktuelle System, Runde 1 = übrige freigeschaltete Systeme, danach
  // wieder von vorn.
  test("Runde 0: Alternativen aus dem Tripel ohne das aktuelle System, nur Systeme", async () => {
    const { candidates } = await caller().getStyleCandidates({
      token: friseurToken,
    });
    expect(candidates.map(c => c.id)).toEqual(["nacht", "plakat"]);
    expect(candidates[0]).toMatchObject({
      kind: "system",
      id: "nacht",
      name: "Nacht",
    });
    expect(candidates[0].palettes).toHaveLength(3);
  });

  test("Runde 1 („Andere Richtungen“): die übrigen freigeschalteten Systeme, danach wieder von vorn", async () => {
    const one = await caller().getStyleCandidates({ token: friseurToken, round: 1 });
    expect(one.candidates.map(c => c.id)).toEqual(["raster", "werkstoff", "klar"]);
    expect(one.candidates.every(c => c.kind === "system")).toBe(true);
    const two = await caller().getStyleCandidates({ token: friseurToken, round: 2 });
    expect(two.candidates.map(c => c.id)).toEqual(["nacht", "plakat"]);
    const three = await caller().getStyleCandidates({ token: friseurToken, round: 3 });
    expect(three.candidates.map(c => c.id)).toEqual(["raster", "werkstoff", "klar"]);
  });

  test("Seite trägt ein System außerhalb des Tripels: Runde 0 = ganzes Tripel, Runde 1 = Rest ohne aktuelles", async () => {
    useDoc({ ...friseurDoc, designRevision: 3, system: "klar", palette: "papier" });
    const zero = await caller().getStyleCandidates({ token: friseurToken });
    expect(zero.candidates.map(c => c.id)).toEqual(["journal", "nacht", "plakat"]);
    const one = await caller().getStyleCandidates({ token: friseurToken, round: 1 });
    expect(one.candidates.map(c => c.id)).toEqual(["raster", "werkstoff"]);
  });

  test("nur freigeschaltete Systeme; leere Runde 0 springt auf die übrigen", async () => {
    released.ids = ["journal", "raster"];
    const zero = await caller().getStyleCandidates({ token: friseurToken });
    expect(zero.candidates.map(c => c.id)).toEqual(["raster"]);
    const one = await caller().getStyleCandidates({ token: friseurToken, round: 1 });
    expect(one.candidates.map(c => c.id)).toEqual(["raster"]);
  });

  test("ohne Dokument: Kandidaten aus Kategorie und Name des Betriebs", async () => {
    useDoc(null as any);
    const { candidates } = await caller().getStyleCandidates({ token: friseurToken });
    expect(candidates.map(c => c.id)).toEqual(["journal", "nacht", "plakat"]);
  });

  test.each([
    ["trade", "Tischlerei", "Brandt"],
    ["gastro", "Restaurant", "Zur Linde"],
    ["gastro", "Café", "Café Muster"],
    ["beauty", "Friseursalon", "Kante Barbershop"],
    ["courses", "Tanzschule", "Tanzschule Muster"],
    ["health", "Zahnarzt", "Praxis Muster"],
    ["advice", "Steuerberater", "Kanzlei Muster"],
    ["auto", "Autowerkstatt", "Autohaus Muster"],
    ["stay", "Hotel", "Hotel Muster"],
    ["industry", "Betrieb", "Muster GmbH"],
    ["standard", "Betrieb", "Muster"],
  ])("%s (%s): Seite trägt das Hauptsystem, Runde 0 die übrigen zwei, Runde 1 der Rest", async (family, category, name) => {
    const doc = { ...v2, businessCategory: category, businessName: name, blueprintFamily: family };
    useDoc(doc);
    const triple = systemsForDoc(doc as any);
    const [primary, alt1, alt2] = triple;
    const state = await caller().getState({ token: "tok" });
    expect(state.doc?.system).toBe(primary);
    const zero = await caller().getStyleCandidates({ token: "tok" });
    expect(zero.candidates.map(c => c.id)).toEqual([alt1, alt2]);
    const one = await caller().getStyleCandidates({ token: "tok", round: 1 });
    expect(one.candidates.map(c => c.id)).toEqual(
      DESIGN_SYSTEM_IDS.filter(id => !(triple as readonly string[]).includes(id))
    );
  });

  test("aktuelles System der Seite wird nie angeboten", async () => {
    released.ids = ["journal"];
    useDoc({
      ...friseurDoc,
      designRevision: 3,
      system: "journal",
      palette: "papier",
    });
    for (const round of [0, 1]) {
      const { candidates } = await caller().getStyleCandidates({
        token: friseurToken,
        round,
      });
      expect(candidates).toEqual([]);
    }
  });

  test("selectDesignSystem setzt rev 3", async () => {
    released.ids = ["journal"];
    const s = await caller().selectDesignSystem({
      token: friseurToken,
      system: "journal",
      palette: "ton",
    });
    const doc = loadDoc(friseurToken);
    expect(doc.designRevision).toBe(3);
    expect(doc.system).toBe("journal");
    expect(doc.palette).toBe("ton");
    expect(doc.fontPairId).toBeUndefined();
    expect(invalidateSsrCache).toHaveBeenCalledWith("preview-lindner");
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("open");
  });

  test("selectDesignSystem mit confirm bestätigt den Design-Schritt", async () => {
    released.ids = ["journal"];
    const s = await caller().selectDesignSystem({
      token: friseurToken,
      system: "journal",
      confirm: true,
    });
    expect(loadDoc(friseurToken).palette).toMatch(/^(papier|salbei|ton)$/);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ studioProgress: { styleConfirmed: true } })
    );
    expect(s.checklist.find(i => i.id === "style")?.status).toBe("done");
  });

  test("selectDesignSystem mit confirm ohne Onboarding-Row → legt Row mit studioProgress an, statt zu updaten", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue(undefined);
    const s = await caller().selectDesignSystem({
      token: friseurToken,
      system: "nacht",
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

  test("selectDesignSystem lehnt nicht freigeschaltetes System ab", async () => {
    released.ids = ["journal"];
    await expect(
      caller().selectDesignSystem({ token: friseurToken, system: "nacht" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("selectDesignSystem lehnt unbekannte Palette ab statt still zu ersetzen", async () => {
    released.ids = ["journal"];
    await expect(
      caller().selectDesignSystem({
        token: friseurToken,
        system: "journal",
        palette: "nacht",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller().selectDesignSystem({
        token: friseurToken,
        system: "journal",
        palette: "x;color:red" as any,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("selectDesignSystem: verkaufte Website + fremder Nutzer → FORBIDDEN, nichts gespeichert", async () => {
    released.ids = ["journal"];
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "s",
      status: "sold",
      businessId: 7,
      websiteData: friseurDoc,
      customerEmail: null,
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      userId: 9,
      checkoutEmail: null,
    } as any);
    await expect(
      caller().selectDesignSystem({ token: friseurToken, system: "journal" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("selectDesignSystem ohne Dokument → BAD_REQUEST", async () => {
    released.ids = ["journal"];
    useDoc(null as any);
    await expect(
      caller().selectDesignSystem({ token: friseurToken, system: "journal" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
