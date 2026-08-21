import { describe, expect, test, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";
import type { WebsiteDataV2 } from "../shared/siteContract/types";

// server/routers.ts konstruiert beim Modul-Import `new Stripe(process.env.STRIPE_SECRET_KEY
// || "")` — ohne Key wirft die Stripe-SDK sofort beim Import, bevor ein Test läuft.
// vi.hoisted() garantiert, dass dieser Stub VOR dem (ESM-hoisted) "./routers"-Import gesetzt
// wird. Rein testinterner Dummy-Wert, keine echte Stripe-Kommunikation in diesen Tests.
vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getWebsiteById: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateBusiness: vi.fn(),
    updateWebsite: vi.fn(),
    updateOnboarding: vi.fn(),
    canActivateWebsite: vi.fn(),
  };
});
// notifyOwner wirft ohne konfigurierte ENV.forgeApiUrl/forgeApiKey — im Test
// irrelevant für die geprüfte Filterlogik, daher als No-Op gemockt.
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));
vi.mock("./umami", () => ({
  registerUmamiWebsite: vi.fn().mockResolvedValue(null),
  getUmamiStats: vi.fn(),
}));

import { appRouter } from "./routers";
import * as db from "./db";

const mockedDb = vi.mocked(db);

function createPublicContext(): TrpcContext {
  return {
    user: null,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("onboarding.complete — defensive Filterung stale Section-Typen (I-1)", () => {
  test("stale 'process'-Wert in hiddenSections → complete wirft NICHT, Sektion wird gefiltert", async () => {
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      businessId: 7,
      slug: "schreinerei-brandt",
      websiteData: v2Doc(),
      colorScheme: {},
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      businessName: "Schreinerei Brandt",
      // "process" ist ein v1-only Sektionstyp, der in v2 (SECTION_TYPES)
      // nicht mehr existiert — stammt aus dem alten hideSections-Schritt.
      hiddenSections: ["process", "services"],
      sectionOrder: ["hero", "features", "contact"],
      topServices: [],
    } as any);
    mockedDb.canActivateWebsite.mockResolvedValue({ ok: false } as any);
    mockedDb.updateWebsite.mockResolvedValue(undefined as any);
    mockedDb.updateOnboarding.mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.onboarding.complete({ websiteId: 42 })
    ).resolves.toEqual({ success: true });

    expect(mockedDb.updateWebsite).toHaveBeenCalledTimes(1);
    const [, patch] = mockedDb.updateWebsite.mock.calls[0];
    const writtenWebsiteData = (patch as any).websiteData;
    expect(writtenWebsiteData.hiddenSections).toEqual(["services"]);
    expect(writtenWebsiteData.sectionOrder).toEqual(["hero", "contact"]);
  });
});
