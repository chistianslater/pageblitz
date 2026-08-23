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
    getNextLayoutForIndustry: vi.fn(),
    createGeneratedWebsite: vi.fn(),
    createGenerationJob: vi.fn(),
    getSubscriptionByWebsiteId: vi.fn(),
    updateSubscription: vi.fn(),
    canActivateWebsite: vi.fn(),
  };
});
vi.mock("./ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
// Stripe-Item-Sync (Plan B6 Task 6) — customer.purchaseAddon nutzt dieselbe
// Kette wie der Studio-Toggle; die Item-Logik ist in stripeAddons.test.ts.
vi.mock("./stripeAddons", () => ({
  syncSubscriptionAddOns: vi.fn().mockResolvedValue({ added: [], removed: [] }),
}));
vi.mock("./onboardingUpload", () => ({
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
// getUmamiStats ruft echtes Umami-Backend per fetch() auf — in Unit-Tests
// gemockt (customer.getAnalytics, B5 Task 3: umamiWebsiteId-Statistik).
vi.mock("./umami", () => ({
  getUmamiStats: vi.fn(),
  getUmamiScriptUrl: vi.fn(() => "https://analytics.example.de/script.js"),
}));
// Umami-Provisionierung (Plan B6 Task 7) läuft bei jeder Aktivierung — in
// Unit-Tests gemockt, die Registrierungs-/Write-Logik ist in
// umamiProvisioning.test.ts.
vi.mock("./umamiProvisioning", () => ({
  provisionUmamiForWebsite: vi.fn().mockResolvedValue(null),
}));

import { appRouter } from "./routers";
import * as stripeAddonsModule from "./stripeAddons";
const mockedStripeAddons = vi.mocked(stripeAddonsModule);
import * as db from "./db";
import { invalidateSsrCache } from "./ssr/routes";
import { invokeLLM } from "./_core/llm";
import { runWebsiteGenerationV2Job } from "./generationV2/runJob";
import { getUmamiStats } from "./umami";
import { provisionUmamiForWebsite } from "./umamiProvisioning";

const mockedDb = vi.mocked(db);
const mockedProvisionUmami = vi.mocked(provisionUmamiForWebsite);
const mockedInvalidateSsrCache = vi.mocked(invalidateSsrCache);
const mockedInvokeLLM = vi.mocked(invokeLLM);
const mockedRunWebsiteGenerationV2Job = vi.mocked(runWebsiteGenerationV2Job);
const mockedGetUmamiStats = vi.mocked(getUmamiStats);

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
    industry: "Schreinerei",
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Zentraler Write-Guard (C-3)", () => {
  test("onboarding.regenerateLegalPages ohne Login (anonym) → UNAUTHORIZED, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());

    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.onboarding.regenerateLegalPages({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mockedDb.getOnboardingByWebsiteId).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("onboarding.regenerateLegalPages im Admin-Kontext schreibt nach websiteData.legal.* statt top-level", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      legalOwner: "Max Brandt",
      legalEmail: "info@brandt.de",
      legalStreet: "Hauptstraße 1",
      legalZip: "44135",
      legalCity: "Dortmund",
    } as any);
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.onboarding.regenerateLegalPages({
      websiteId: 42,
    });

    expect(result).toEqual({ success: true, regenerated: true });
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

  test("onboarding.regenerateLegalPages als eingeloggter Abo-Inhaber schreibt erfolgreich", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 1,
      websiteId: 42,
      userId: 2,
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      legalOwner: "Max Brandt",
      legalEmail: "info@brandt.de",
      legalStreet: "Hauptstraße 1",
      legalZip: "44135",
      legalCity: "Dortmund",
    } as any);
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createUserContext(2));
    const result = await caller.onboarding.regenerateLegalPages({
      websiteId: 42,
    });

    expect(result).toEqual({ success: true, regenerated: true });
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
  });

  test("onboarding.regenerateLegalPages als eingeloggter Nutzer ohne passende Subscription (anderer userId) → FORBIDDEN, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    // Subscription existiert, gehört aber einem anderen Nutzer (websiteId
    // stimmt, userId nicht) — isSubscriptionOwner muss false bleiben.
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 1,
      websiteId: 42,
      userId: 999,
    } as any);

    const caller = appRouter.createCaller(createUserContext(2));
    await expect(
      caller.onboarding.regenerateLegalPages({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedDb.getOnboardingByWebsiteId).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("onboarding.regenerateLegalPages als eingeloggter Nutzer ohne jede Subscription (getSubscriptionByWebsiteId → null) → FORBIDDEN, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createUserContext(2));
    await expect(
      caller.onboarding.regenerateLegalPages({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedDb.getOnboardingByWebsiteId).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
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

describe("customer.purchaseAddon — subpages (Plan B6 Task 5)", () => {
  test("subpages → subscriptions.addOns.subpages=true UND Spalte addOnSubpages + features.subpages (applyFeatureFlags)", async () => {
    const ownedWebsite = baseWebsiteRow({ websiteData: v2Doc() });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      {
        website: ownedWebsite,
        subscription: { id: 9, stripeSubscriptionId: null, addOns: {} },
        business: null,
      },
    ] as any);
    mockedDb.getWebsiteById.mockResolvedValue(ownedWebsite);

    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customer.purchaseAddon({
      websiteId: 42,
      addonKey: "subpages",
    });

    expect(result).toEqual({ success: true });
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ addOns: { subpages: true } })
    );
    const [id, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect(id).toBe(42);
    expect((patch as any).addOnSubpages).toBe(true);
    expect((patch as any).websiteData.features).toEqual({ subpages: true });
  });

  test("mit Stripe-Subscription: syncSubscriptionAddOns(key: true) + Dokument addOns/features; Stripe-Fehler → BAD_REQUEST ohne Write", async () => {
    const ownedWebsite = baseWebsiteRow({ websiteData: v2Doc() });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      {
        website: ownedWebsite,
        subscription: { id: 9, stripeSubscriptionId: "sub_live", addOns: {} },
        business: null,
      },
    ] as any);
    mockedDb.getWebsiteById.mockResolvedValue(ownedWebsite);
    const caller = appRouter.createCaller(createUserContext());
    await caller.customer.purchaseAddon({ websiteId: 42, addonKey: "team" });
    expect(mockedStripeAddons.syncSubscriptionAddOns).toHaveBeenCalledWith(
      "sub_live",
      { team: true }
    );
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).addOnTeam).toBe(true);
    expect((patch as any).websiteData.addOns).toEqual({ team: true });

    vi.clearAllMocks();
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      {
        website: ownedWebsite,
        subscription: { id: 9, stripeSubscriptionId: "sub_live", addOns: {} },
        business: null,
      },
    ] as any);
    mockedStripeAddons.syncSubscriptionAddOns.mockRejectedValueOnce(
      new Error("price missing")
    );
    await expect(
      caller.customer.purchaseAddon({ websiteId: 42, addonKey: "aiChat" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateSubscription).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("subpages bereits gebucht → alreadyOwned, kein Write", async () => {
    const ownedWebsite = baseWebsiteRow({ websiteData: v2Doc() });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      {
        website: ownedWebsite,
        subscription: {
          id: 9,
          stripeSubscriptionId: null,
          addOns: { subpages: true },
        },
        business: null,
      },
    ] as any);
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customer.purchaseAddon({
      websiteId: 42,
      addonKey: "subpages",
    });
    expect(result).toEqual({ success: true, alreadyOwned: true });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
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

describe("customer.getAnalytics — Statistik liest umamiWebsiteId (B5 Task 3)", () => {
  test("umamiWebsiteId gesetzt → getUmamiStats wird mit der ID aufgerufen", async () => {
    const ownedWebsite = baseWebsiteRow({ umamiWebsiteId: "umami-42" });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null },
    ] as any);
    const fakeStats = { pageviews: 12, visitors: 5 };
    mockedGetUmamiStats.mockResolvedValue(fakeStats as any);

    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customer.getAnalytics({ websiteId: 42 });

    expect(mockedGetUmamiStats).toHaveBeenCalledWith("umami-42");
    expect(result).toEqual(fakeStats);
  });

  test("kein umamiWebsiteId → null, getUmamiStats wird nicht aufgerufen", async () => {
    const ownedWebsite = baseWebsiteRow({ umamiWebsiteId: null });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null },
    ] as any);

    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customer.getAnalytics({ websiteId: 42 });

    expect(mockedGetUmamiStats).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test("fremde Website (nicht in getWebsitesByUserId) → FORBIDDEN", async () => {
    mockedDb.getWebsitesByUserId.mockResolvedValue([] as any);

    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.customer.getAnalytics({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mockedGetUmamiStats).not.toHaveBeenCalled();
  });
});

describe("Umami-Provisionierung bei Aktivierung (Plan B6 Task 7)", () => {
  test("customer.setLive → status active, danach provisionUmamiForWebsite(websiteId)", async () => {
    const ownedWebsite = baseWebsiteRow({ status: "sold" });
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: ownedWebsite, subscription: null },
    ] as any);
    mockedDb.canActivateWebsite.mockResolvedValue({ ok: true });

    const caller = appRouter.createCaller(createUserContext());
    await caller.customer.setLive({ websiteId: 42 });

    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      status: "active",
      captureStatus: "converted",
    });
    expect(mockedProvisionUmami).toHaveBeenCalledWith(42);
    const updateOrder = mockedDb.updateWebsite.mock.invocationCallOrder[0];
    const provisionOrder = mockedProvisionUmami.mock.invocationCallOrder[0];
    expect(updateOrder).toBeLessThan(provisionOrder);
  });

  test("customer.setLive: Aktivierung nicht erlaubt → PRECONDITION_FAILED, keine Provisionierung", async () => {
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: baseWebsiteRow({ status: "sold" }), subscription: null },
    ] as any);
    mockedDb.canActivateWebsite.mockResolvedValue({
      ok: false,
      reason: "Kein Abonnement vorhanden",
    });

    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.customer.setLive({ websiteId: 42 })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(mockedProvisionUmami).not.toHaveBeenCalled();
  });

  test("website.updateStatus (Admin) → active provisioniert, inactive nicht", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.website.updateStatus({ id: 42, status: "active" });
    expect(mockedProvisionUmami).toHaveBeenCalledWith(42);

    mockedProvisionUmami.mockClear();
    await caller.website.updateStatus({ id: 42, status: "inactive" });
    expect(mockedProvisionUmami).not.toHaveBeenCalled();
  });

  test("customer.setWebsiteActive (Admin) → provisioniert", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await caller.customer.setWebsiteActive({ websiteId: 42 });
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      status: "active",
    });
    expect(mockedProvisionUmami).toHaveBeenCalledWith(42);
  });
});

describe("website.get — Umami-Einbindung nur für aktive Sites mit ID (Plan B6 Task 7)", () => {
  beforeEach(() => {
    mockedDb.getBusinessById.mockResolvedValue({
      id: 7,
      name: "Schreinerei Brandt",
    } as any);
  });

  test("status active + umamiWebsiteId → umami { websiteId, scriptUrl }", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({ status: "active", umamiWebsiteId: "umami-42" })
    );
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.website.get({ id: 42 });
    expect(result.umami).toEqual({
      websiteId: "umami-42",
      scriptUrl: "https://analytics.example.de/script.js",
    });
  });

  test("status sold mit ID → umami null; active ohne ID → umami null", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({ status: "sold", umamiWebsiteId: "umami-42" })
    );
    expect((await caller.website.get({ id: 42 })).umami).toBeNull();
    mockedDb.getWebsiteById.mockResolvedValue(
      baseWebsiteRow({ status: "active", umamiWebsiteId: null })
    );
    expect((await caller.website.get({ id: 42 })).umami).toBeNull();
  });
});
