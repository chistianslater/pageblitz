import { describe, expect, test, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

// server/routers.ts konstruiert beim Modul-Import `new Stripe(process.env.STRIPE_SECRET_KEY
// || "")` — ohne Key wirft die Stripe-SDK sofort beim Import ("Neither apiKey nor
// config.authenticator provided"), bevor überhaupt ein Test läuft. vi.hoisted() garantiert,
// dass dieser Stub VOR dem (weiter unten stehenden, aber ESM-hoisted) "./routers"-Import
// gesetzt wird — ein simples `process.env.X = ...` vor dem Import würde NICHT reichen, weil
// statische ESM-Importe immer vor dem übrigen Modulcode ausgewertet werden, unabhängig von
// der Textreihenfolge. Rein testinterner Dummy-Wert, keine echte Stripe-Kommunikation in
// diesen Tests.
vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

// ── Mocks ────────────────────────────────────────────────────────────────
// "./db" wird selektiv gemockt: die DB-Aufrufe, die in den getesteten
// Prozeduren tatsächlich verwendet werden, werden durch vi.fn() ersetzt;
// alle anderen Exporte bleiben real (importOriginal), damit der Rest von
// routers.ts beim Modul-Import nicht bricht.
vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getWebsiteById: vi.fn(),
    getWebsiteByToken: vi.fn(),
    getWebsiteByBusinessId: vi.fn(),
    updateWebsite: vi.fn(),
    getWebsitesByUserId: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn(),
    getBusinessById: vi.fn(),
    listTemplateUploadsByPool: vi.fn(),
    getNextLayoutForIndustry: vi.fn(),
    createGeneratedWebsite: vi.fn(),
    createGenerationJob: vi.fn(),
  };
});
vi.mock("./ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./onboardingUpload", () => ({
  uploadLogo: vi.fn().mockResolvedValue({
    url: "https://cdn.example.com/logo.png",
    key: "logo.png",
  }),
  uploadPhoto: vi.fn(),
}));
// invokeLLM wird von classifyIndustry() UND der eigentlichen Regenerate-
// Content-Generierung aufgerufen (zwei separate Calls in website.regenerate)
// — echte Netzwerk-Aufrufe an das LLM sind in Unit-Tests nicht zulässig.
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
// runWebsiteGenerationV2Job stößt die Hintergrund-Pipeline an (nicht
// awaited von website.generate) — in Unit-Tests gemockt, damit kein echter
// LLM-/DB-Hintergrundlauf nach Testende weiterläuft. resolveV2Images bleibt
// real (importOriginal), da website.regenerate es unverändert nutzt.
vi.mock("./generationV2/runJob", async importOriginal => {
  const actual = await importOriginal<typeof import("./generationV2/runJob")>();
  return {
    ...actual,
    runWebsiteGenerationV2Job: vi.fn(),
  };
});

import { appRouter } from "./routers";
import * as db from "./db";
import { invalidateSsrCache } from "./ssr/routes";
import { invokeLLM } from "./_core/llm";
import { runWebsiteGenerationV2Job } from "./generationV2/runJob";

const mockedDb = vi.mocked(db);
const mockedInvalidateSsrCache = vi.mocked(invalidateSsrCache);
const mockedInvokeLLM = vi.mocked(invokeLLM);
const mockedRunWebsiteGenerationV2Job = vi.mocked(runWebsiteGenerationV2Job);

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(userId = 2): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "user-" + userId,
      email: "user@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function v2Doc(overrides: Partial<WebsiteDataV2> = {}): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: "werkbank",
    businessName: "Schreinerei Brandt",
    sections: [
      { type: "hero", headline: "Massarbeit." },
      {
        type: "services",
        headline: "Leistungen",
        items: [{ title: "Möbelbau" }],
      },
    ],
    seo: { title: "Schreinerei Brandt", description: "Möbelbau in Dortmund." },
    ...overrides,
  };
}

function createAdminContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "admin-" + userId,
      email: "admin@example.com",
      name: "Test Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function baseWebsiteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    businessId: 7,
    slug: "schreinerei-brandt",
    status: "active",
    websiteData: v2Doc(),
    colorScheme: {},
    industry: "Schreinerei",
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Zentraler Write-Guard (C-3)", () => {
  test("onboarding.regenerateLegalPages auf v2-Website schreibt nach websiteData.legal.* statt top-level", async () => {
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      legalOwner: "Max Brandt",
      legalEmail: "info@brandt.de",
      legalStreet: "Hauptstraße 1",
      legalZip: "44135",
      legalCity: "Dortmund",
    } as any);
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.onboarding.regenerateLegalPages({
      websiteId: 42,
    });

    expect(result.success).toBe(true);
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    const writtenWebsiteData = (patch as any).websiteData;
    expect(writtenWebsiteData.legal?.impressumHtml).toBeTruthy();
    expect(writtenWebsiteData.legal?.datenschutzHtml).toBeTruthy();
    // v1-only Top-Level-Felder dürfen NICHT in websiteData landen (strict schema)
    expect(writtenWebsiteData.impressumHtml).toBeUndefined();
    expect(writtenWebsiteData.datenschutzHtml).toBeUndefined();
    expect(mockedInvalidateSsrCache).toHaveBeenCalledWith("schreinerei-brandt");
  });
});

describe("Zentraler Write-Guard — verbliebene Schreibpfade (Teilprojekt B)", () => {
  // customer.updateAddons wurde in Task 4 (Dashboard v2) auf reine
  // Feature-Flags (Kontaktformular, KI-Chat, Calendly) reduziert — der
  // v1-Pfad, der Galerie-/Menü-/Preislisten-Sektionen direkt in
  // `websiteData` schrieb (und damit v2-Dokumente korrumpieren konnte),
  // existiert nicht mehr. `customer.uploadLogoForWebsite` und
  // `customer.updateWebsiteContent` sind mit dem Dashboard-Umbau ebenfalls
  // entfallen (Inhaltsbearbeitung läuft ausschließlich über das Studio,
  // `onboardingV2.*`) — ihre Guard-Tests sind damit hinfällig.

  test("website.regenerate auf v2-Website mit korrumpierendem LLM-Payload → TRPCError, kein Write", async () => {
    // Task 3 (Cutover): website.regenerate läuft ab jetzt über die v2-
    // Content-Pipeline (server/generationV2, wie ensureGeneration) statt der
    // alten Inline-LLM-Prompt-Pipeline — selectPack ruft intern
    // getNextLayoutForIndustry, generateSiteContent ruft intern llmComplete
    // (== der hier gemockte invokeLLM).
    // status: "preview" explizit, damit dieser Test den LLM-Validierungspfad
    // prüft statt vorzeitig am Regenerate-Status-Guard (Abschluss-Fixwelle B)
    // zu scheitern.
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({ status: "preview" })
    );
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
      category: "Schreinerei",
      rating: null,
      reviewCount: 0,
      googleReviews: null,
      openingHours: null,
      phone: null,
      address: null,
      placeId: null,
      email: null,
      searchRegion: null,
    } as any);
    mockedDb.getNextLayoutForIndustry.mockResolvedValue("kanzlei" as any);
    // 1. Call: classifyIndustry() erwartet ein einzelnes Wort.
    // 2.+3. Call: die zwei Versuche von generateSiteContent (genau 1 Retry) —
    // beide bewusst v1-förmig (kein seo-Feld), damit die v2-Schema-
    // Validierung zuverlässig scheitert statt bei nur einem Fehlversuch
    // still auf den zweiten Call durchzufallen.
    const invalidContent = () =>
      JSON.stringify({
        tagline: "Neue Perspektiven.",
        sections: [
          { type: "hero", headline: "Willkommen" },
          {
            type: "services",
            headline: "Leistungen",
            items: [{ title: "Möbelbau" }],
          },
        ],
      });
    mockedInvokeLLM
      .mockResolvedValueOnce({
        choices: [{ message: { content: "handwerk" } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: invalidContent() } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [{ message: { content: invalidContent() } }],
      } as any);

    const caller = appRouter.createCaller(createAdminContext());
    await expect(caller.website.regenerate({ websiteId: 42 })).rejects.toThrow(
      TRPCError
    );
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("website.regenerate auf verkaufter Website (status !== preview) → BAD_REQUEST, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({ status: "sold" })
    );

    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.website.regenerate({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.getBusinessById).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("website.generate — v2-Job statt synchroner v1-Generierung (Task 4)", () => {
  test("legt Preview-Website + Job an und startet die v2-Pipeline", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
      category: "Schreiner",
      placeId: "p1",
    } as any);
    mockedDb.getWebsiteByBusinessId.mockResolvedValue(undefined as any);
    mockedDb.createGeneratedWebsite.mockResolvedValue(42 as any);
    mockedDb.createGenerationJob.mockResolvedValue(99 as any);
    mockedRunWebsiteGenerationV2Job.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAdminContext());
    const res = await caller.website.generate({ businessId: 7 });

    expect(res).toMatchObject({ websiteId: 42, jobId: 99 });
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 7,
        status: "preview",
        websiteData: null,
      })
    );
    expect(mockedDb.createGeneratedWebsite.mock.calls[0][0]).not.toHaveProperty(
      "layoutStyle"
    );
    expect(mockedRunWebsiteGenerationV2Job).toHaveBeenCalledWith(99, 42);
  });

  test("CONFLICT, wenn bereits eine Website für dieses Business existiert", async () => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
      category: "Schreiner",
      placeId: "p1",
    } as any);
    mockedDb.getWebsiteByBusinessId.mockResolvedValue(baseWebsiteRow());

    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.website.generate({ businessId: 7 })
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
  });
});

describe("website.get — Token-Leak geschlossen (Final-Review Befund 2)", () => {
  test("Abfrage per id → previewToken/customerEmail/contactEmail/Stripe-IDs NICHT in der Antwort", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({
        previewToken: "secret-token-abc",
        customerEmail: "kundin@example.com",
        contactEmail: "kontakt@example.com",
        stripeSessionId: "cs_test_123",
        stripeSubscriptionId: "sub_test_123",
      })
    );
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
    } as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.website.get({ id: 42 });

    expect(result.website.previewToken).toBeFalsy();
    expect((result.website as any).customerEmail).toBeFalsy();
    expect((result.website as any).contactEmail).toBeFalsy();
    expect((result.website as any).stripeSessionId).toBeFalsy();
    expect((result.website as any).stripeSubscriptionId).toBeFalsy();
    // Öffentliche Felder bleiben erhalten
    expect(result.website.slug).toBe("schreinerei-brandt");
    expect(result.website.websiteData).toBeTruthy();
  });

  test("Abfrage per token → previewToken bleibt erhalten (Aufrufer kennt ihn bereits)", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(
      baseWebsiteRow({
        previewToken: "secret-token-abc",
        customerEmail: "kundin@example.com",
      })
    );
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
    } as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.website.get({ token: "secret-token-abc" });

    expect(result.website.previewToken).toBe("secret-token-abc");
    expect((result.website as any).customerEmail).toBe("kundin@example.com");
  });
});

describe("customer.updateAddons — eine Quelle der Wahrheit (Final-Review Befund 4)", () => {
  test("aiChat=false → Spalte addOnAiChat UND websiteData.features.aiChat werden zurückgesetzt", async () => {
    const ownedWebsite = baseWebsiteRow({
      websiteData: { ...v2Doc(), features: { aiChat: true } },
    });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null, business: null },
    ] as any);
    mockedDb.getWebsiteById.mockResolvedValue(ownedWebsite);

    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customer.updateAddons({
      websiteId: 42,
      addOns: { aiChat: false },
    });

    expect(result.success).toBe(true);
    const [id, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect(id).toBe(42);
    expect((patch as any).addOnAiChat).toBe(false);
    expect((patch as any).websiteData.features).toBeUndefined();
  });

  test("contactForm=true → websiteData.features.contactForm gesetzt (vorher: nur onboarding_responses, Insel blieb ungegatet)", async () => {
    const ownedWebsite = baseWebsiteRow({ websiteData: v2Doc() });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null, business: null },
    ] as any);
    mockedDb.getWebsiteById.mockResolvedValue(ownedWebsite);

    const caller = appRouter.createCaller(createUserContext());
    await caller.customer.updateAddons({
      websiteId: 42,
      addOns: { contactForm: true },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnContactForm: true })
    );
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.features).toEqual({
      contactForm: true,
    });
  });

  test("weder contactForm noch aiChat übergeben → applyFeatureFlags nicht aufgerufen, kein websiteData-Write", async () => {
    const ownedWebsite = baseWebsiteRow({ websiteData: v2Doc() });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null, business: null },
    ] as any);
    mockedDb.getWebsiteById.mockResolvedValue(ownedWebsite);

    const caller = appRouter.createCaller(createUserContext());
    await caller.customer.updateAddons({
      websiteId: 42,
      addOns: { calendlyUrl: "https://calendly.com/x" },
    });

    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("fremde Website (nicht in getWebsitesByUserId) → FORBIDDEN, kein Write", async () => {
    mockedDb.getWebsitesByUserId.mockResolvedValue([] as any);

    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.customer.updateAddons({
        websiteId: 42,
        addOns: { aiChat: true },
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});
