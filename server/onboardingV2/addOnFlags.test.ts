import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../db", () => ({
  getSubscriptionByWebsiteId: vi.fn(),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
  getOnboardingByWebsiteId: vi.fn(),
  updateOnboarding: vi.fn().mockResolvedValue(undefined),
  createOnboarding: vi.fn().mockResolvedValue(1),
  getBusinessById: vi.fn(),
  getGenerationJobByWebsiteId: vi.fn(),
  updateWebsite: vi.fn(),
}));
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../stripeAddons", () => ({
  syncSubscriptionAddOns: vi.fn().mockResolvedValue({ added: [], removed: [] }),
}));

import * as db from "../db";
import * as stripeAddons from "../stripeAddons";
import { commitAddOnFlags } from "./addOnFlags";
import type { StudioWebsite } from "./ownership";

const mockedDb = vi.mocked(db);
const mockedSync = vi.mocked(stripeAddons.syncSubscriptionAddOns);

const allOff = {
  contactForm: false,
  gallery: false,
  menu: false,
  pricelist: false,
  aiChat: false,
  booking: false,
  team: false,
  subpages: false,
};

function loaded(status: "preview" | "active"): StudioWebsite {
  return {
    website: { id: 42, slug: "brandt", status } as any,
    doc: null,
    hasLegacyDoc: false,
  } as StudioWebsite;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSync.mockResolvedValue({ added: [], removed: [] });
  mockedDb.getOnboardingByWebsiteId.mockResolvedValue({
    websiteId: 42,
  } as any);
});

describe("commitAddOnFlags vor dem Checkout", () => {
  test("schreibt nur die Entwurfs-Flags, kein Subscription-Lookup, kein Sync", async () => {
    await commitAddOnFlags(loaded("preview"), { ...allOff, gallery: true });
    expect(mockedDb.getSubscriptionByWebsiteId).not.toHaveBeenCalled();
    expect(mockedSync).not.toHaveBeenCalled();
    expect(mockedDb.updateSubscription).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnGallery: true, addOnTeam: false })
    );
  });
});

describe("commitAddOnFlags nach dem Checkout: Sync nur für tatsächlich geänderte Keys (Review-Fund B6 Task 6)", () => {
  beforeEach(() => {
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      websiteId: 42,
      stripeSubscriptionId: "sub_live_1",
      // Dashboard-Kauf (customer.purchaseAddon) hat die Galerie gebucht.
      addOns: { contactForm: true, gallery: true },
    } as any);
  });

  test("Dashboard-Kauf gallery=true → Studio speichert ohne Galerie-Änderung → Sync ohne gallery-Key, Galerie bleibt in subscriptions.addOns", async () => {
    await commitAddOnFlags(loaded("active"), {
      ...allOff,
      contactForm: true,
      gallery: true,
      team: true,
    });
    expect(mockedSync).toHaveBeenCalledTimes(1);
    expect(mockedSync).toHaveBeenCalledWith("sub_live_1", { team: true });
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        addOns: expect.objectContaining({
          contactForm: true,
          gallery: true,
          team: true,
        }),
      })
    );
  });

  test("Patch entspricht dem Ist-Stand → kein Stripe-Aufruf, keine Subscription-Änderung, Entwurfs-Flags trotzdem gespiegelt", async () => {
    await commitAddOnFlags(loaded("active"), {
      ...allOff,
      contactForm: true,
      gallery: true,
    });
    expect(mockedSync).not.toHaveBeenCalled();
    expect(mockedDb.updateSubscription).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnGallery: true, addOnContactForm: true })
    );
  });

  test("explizite Abwahl (gallery true → false) → Sync mit { gallery: false }, subscriptions.addOns.gallery=false", async () => {
    await commitAddOnFlags(loaded("active"), { ...allOff, contactForm: true });
    expect(mockedSync).toHaveBeenCalledWith("sub_live_1", { gallery: false });
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        addOns: expect.objectContaining({ contactForm: true, gallery: false }),
      })
    );
  });

  test("Teil-Patch (updateTeam/updatePages: nur { team: true }) → Sync nur für team; andere Keys unangetastet", async () => {
    await commitAddOnFlags(loaded("active"), { team: true });
    expect(mockedSync).toHaveBeenCalledWith("sub_live_1", { team: true });
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        addOns: { contactForm: true, gallery: true, team: true },
      })
    );
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: true })
    );
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnGallery: expect.anything() })
    );
  });

  test("Stripe-Fehler → BAD_REQUEST, weder Subscription noch Entwurfs-Flags geschrieben", async () => {
    mockedSync.mockRejectedValue(new Error("card_declined"));
    await expect(
      commitAddOnFlags(loaded("active"), { ...allOff, team: true })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateSubscription).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });

  test("alte { features: {…} }-Form in subscriptions.addOns zählt als Ist-Stand", async () => {
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      id: 9,
      websiteId: 42,
      stripeSubscriptionId: "sub_live_1",
      addOns: { features: { gallery: true } },
    } as any);
    await commitAddOnFlags(loaded("active"), { ...allOff, gallery: true });
    expect(mockedSync).not.toHaveBeenCalled();
  });
});
