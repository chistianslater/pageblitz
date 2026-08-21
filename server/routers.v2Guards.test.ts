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
    updateWebsite: vi.fn(),
    getWebsitesByUserId: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn(),
    getBusinessById: vi.fn(),
    listTemplateUploadsByPool: vi.fn(),
    getNextLayoutForIndustry: vi.fn(),
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

import { appRouter } from "./routers";
import * as db from "./db";
import { invalidateSsrCache } from "./ssr/routes";
import { invokeLLM } from "./_core/llm";

const mockedDb = vi.mocked(db);
const mockedInvalidateSsrCache = vi.mocked(invalidateSsrCache);
const mockedInvokeLLM = vi.mocked(invokeLLM);

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

describe("selfService.generateInitialContent — v2-Guard (C-1)", () => {
  test("v2-Website: kein Schreiben, keine layoutStyle-Rotation, Antwort-Shape bleibt erhalten", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.selfService.generateInitialContent({
      websiteId: 42,
      businessName: "Schreinerei Brandt",
      businessCategory: "Schreinerei",
    });

    expect(result.success).toBe(true);
    // Antwort-Shape identisch zum v1-Pfad — Client liest nur result.success
    // und fällt bei fehlenden Feldern auf lokale Werte zurück.
    expect(result).toHaveProperty("tagline");
    expect(result).toHaveProperty("services");
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("selfService.selectWebsiteTemplate — Picker-Persistenz für v2 (C-2)", () => {
  test("v2-Dokument + Layout 'Kanzlei' → stylePackId 'kanzlei' wird persistiert", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.selfService.selectWebsiteTemplate({
      websiteId: 42,
      layoutStyle: "Kanzlei",
    });

    expect(result.success).toBe(true);
    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    expect((patch as any).websiteData.stylePackId).toBe("kanzlei");
    expect((patch as any).layoutStyle).toBe("Kanzlei");
    expect(mockedInvalidateSsrCache).toHaveBeenCalledWith("schreinerei-brandt");
  });

  test("v2-Dokument + unbekanntes Pack → BAD_REQUEST, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());

    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.selfService.selectWebsiteTemplate({
        websiteId: 42,
        layoutStyle: "nicht-existent",
      })
    ).rejects.toThrow(TRPCError);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("Zentraler Write-Guard (C-3)", () => {
  test("customer.uploadLogoForWebsite auf v2-Website → sauberer Fehler statt stiller Korruption", async () => {
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: baseWebsiteRow(), subscription: { status: "active" } },
    ] as any);

    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.customer.uploadLogoForWebsite({
        websiteId: 42,
        imageData: "data:image/png;base64,AAAA",
      })
    ).rejects.toThrow(TRPCError);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

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
  test("customer.updateAddons auf v2-Website mit korrumpierendem Payload → TRPCError, kein Write", async () => {
    mockedDb.getWebsitesByUserId.mockResolvedValue([
      { website: baseWebsiteRow(), subscription: { status: "active" } },
    ] as any);
    mockedDb.updateOnboarding.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.customer.updateAddons({
        websiteId: 42,
        addOns: {
          gallery: { enabled: true, photos: ["https://cdn.example.com/1.jpg"] },
        },
      })
    ).rejects.toThrow(TRPCError);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("website.regenerate auf v2-Website mit korrumpierendem LLM-Payload → TRPCError, kein Write", async () => {
    mockedDb.getWebsiteById.mockResolvedValue(baseWebsiteRow());
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
    } as any);
    mockedDb.listTemplateUploadsByPool.mockResolvedValue([]);
    mockedDb.getNextLayoutForIndustry.mockResolvedValue("Kanzlei" as any);
    // 1. Call: classifyIndustry() erwartet ein einzelnes Wort.
    // 2. Call: die eigentliche Regenerate-Content-Generierung — bewusst
    // v1-förmig (kein version/stylePackId/seo), um die v2-Schema-Validierung
    // im Guard zuverlässig scheitern zu lassen.
    mockedInvokeLLM
      .mockResolvedValueOnce({
        choices: [{ message: { content: "handwerk" } }],
      } as any)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tagline: "Neue Perspektiven.",
                sections: [
                  { type: "hero", headline: "Willkommen" },
                  {
                    type: "services",
                    headline: "Leistungen",
                    items: [{ title: "Möbelbau" }],
                  },
                ],
              }),
            },
          },
        ],
      } as any);

    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.website.regenerate({ websiteId: 42 })
    ).rejects.toThrow(TRPCError);
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});
