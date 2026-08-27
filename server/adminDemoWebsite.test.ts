import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./db", () => ({
  createGeneratedWebsite: vi.fn().mockResolvedValue(42),
  createOnboarding: vi.fn().mockResolvedValue(3),
  createSubscription: vi.fn().mockResolvedValue(9),
  getOnboardingByWebsiteId: vi.fn(),
  getSubscriptionByWebsiteId: vi.fn(),
  getWebsiteBySlug: vi.fn(),
  updateSubscription: vi.fn(),
  updateWebsite: vi.fn(),
  upsertBusiness: vi.fn().mockResolvedValue(7),
}));

import * as db from "./db";
import { ensureAdminDemoWebsite } from "./adminDemoWebsite";

const mockedDb = vi.mocked(db);
const admin = {
  id: 5,
  email: "ADMIN@PAGEBLITZ.DE",
  role: "admin" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedDb.getWebsiteBySlug.mockResolvedValue(undefined);
  mockedDb.getSubscriptionByWebsiteId.mockResolvedValue(undefined);
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue(undefined);
});

describe("ensureAdminDemoWebsite", () => {
  test("weist Nicht-Admins ab", async () => {
    await expect(
      ensureAdminDemoWebsite({ ...admin, role: "user" })
    ).rejects.toThrow("nur für Administratoren");
    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
  });

  test("legt eine vollständige isolierte Kundenbackend-Demo an", async () => {
    const result = await ensureAdminDemoWebsite(admin);

    expect(mockedDb.upsertBusiness).toHaveBeenCalledWith(
      expect.objectContaining({
        placeId: "admin-customer-demo:5",
        slug: "admin-demo-5",
      })
    );
    expect(mockedDb.createGeneratedWebsite).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 7,
        slug: "admin-demo-5",
        status: "active",
        source: "admin",
        customerEmail: "admin@pageblitz.de",
        addOnAiChat: true,
        addOnBooking: true,
        addOnTeam: true,
        addOnSubpages: true,
        websiteData: expect.objectContaining({
          version: 2,
          businessName: "Pageblitz Demo-Werkstatt",
          features: expect.objectContaining({
            contactForm: true,
            aiChat: true,
            booking: true,
            subpages: true,
          }),
        }),
      })
    );
    expect(mockedDb.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        userId: 5,
        status: "active",
        plan: "admin-demo",
        addOns: expect.objectContaining({
          contactForm: true,
          gallery: true,
          aiChat: true,
          booking: true,
        }),
      })
    );
    expect(mockedDb.createOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        status: "completed",
      })
    );
    expect(result).toEqual({
      websiteId: 42,
      slug: "admin-demo-5",
      previewToken: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
      created: true,
    });
  });

  test("verwendet die bestehende Demo, ohne deren Inhalte zurückzusetzen", async () => {
    mockedDb.getWebsiteBySlug.mockResolvedValue({
      id: 42,
      previewToken: "t".repeat(32),
      websiteData: { edited: true },
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      userId: 5,
      status: "active",
    } as any);
    mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
      id: 3,
      websiteId: 42,
    } as any);

    const result = await ensureAdminDemoWebsite(admin);

    expect(mockedDb.createGeneratedWebsite).not.toHaveBeenCalled();
    expect(mockedDb.createSubscription).not.toHaveBeenCalled();
    expect(mockedDb.createOnboarding).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(42, {
      status: "active",
      previewToken: "t".repeat(32),
      subscriptionStatus: "active",
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ websiteData: expect.anything() })
    );
    expect(result).toEqual({
      websiteId: 42,
      slug: "admin-demo-5",
      previewToken: "t".repeat(32),
      created: false,
    });
  });
});
