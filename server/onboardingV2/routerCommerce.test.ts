import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

// Bewusst NICHT gemockt: ../legalGenerator — echte Generatoren nutzen, damit
// s.doc!.legal!.impressumHtml gegen den erzeugten Text geprüft werden kann.
vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getWebsiteByToken: vi.fn(),
    getSubscriptionByWebsiteId: vi.fn(),
    getBusinessById: vi.fn(),
    getGenerationJobByWebsiteId: vi.fn(),
    getOnboardingByWebsiteId: vi.fn(),
    updateOnboarding: vi.fn(),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createOnboarding: vi.fn(),
  };
});
vi.mock("../ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("../_core/lifecycleScheduler", () => ({
  sendImmediateWelcomeEmail: vi.fn(),
  scheduleInitialLifecycleEmails: vi.fn(),
}));

import { appRouter } from "../routers";
import * as db from "../db";
import * as lifecycleScheduler from "../_core/lifecycleScheduler";
const mockedDb = vi.mocked(db);
const mockedLifecycle = vi.mocked(lifecycleScheduler);

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

/**
 * In-Memory-Onboarding-Zeile, die von updateOnboarding/createOnboarding
 * gepflegt und von getOnboardingByWebsiteId gelesen wird — so sieht
 * `buildState` (aufgerufen aus `persistDoc`/`updateAddons`) nach einem
 * Write die tatsächlich geschriebenen Werte, obwohl die DB gemockt ist.
 */
let onboardingRow: Record<string, unknown> | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  onboardingRow = {
    websiteId: 42,
    studioProgress: null,
    photoUrls: [],
    addOnContactForm: false,
    addOnGallery: false,
    addOnMenu: false,
    addOnPricelist: false,
    addOnAiChat: false,
    addOnBooking: false,
    addOnTeam: false,
    legalOwner: null,
    legalEmail: null,
    legalStreet: null,
    legalZip: null,
    legalCity: null,
    legalPhone: null,
    legalVatId: null,
  };

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
  mockedDb.getGenerationJobByWebsiteId.mockResolvedValue(undefined as any);
  mockedDb.getOnboardingByWebsiteId.mockImplementation(
    async () => onboardingRow as any
  );
  mockedDb.updateOnboarding.mockImplementation(async (_id, data) => {
    onboardingRow = { ...(onboardingRow ?? { websiteId: 42 }), ...data };
  });
  mockedDb.createOnboarding.mockImplementation(async data => {
    onboardingRow = { ...data };
    return 999;
  });
});

describe("onboardingV2.updateLegal", () => {
  const legal = {
    legalOwner: "Max Brandt",
    legalStreet: "Weg 1",
    legalZip: "44135",
    legalCity: "Dortmund",
    legalEmail: "m@b.de",
    legalPhone: "0231 1",
    openingHours: [{ day: "Mo–Fr", hours: "9–17 Uhr" }],
  };

  test("schreibt Onboarding-Row, generiert Rechtstexte, patcht contact + legal, Checkliste legal done", async () => {
    const s = await caller().onboardingV2.updateLegal({ token: "tok", legal });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ legalOwner: "Max Brandt", legalZip: "44135" })
    );
    expect(s.doc!.legal!.impressumHtml).toContain("Max Brandt");
    const contact = s.doc!.sections.find(x => x.type === "contact") as any;
    expect(contact.phone).toBe("0231 1");
    expect(contact.openingHours).toEqual(legal.openingHours);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ hasLegalPages: true })
    );
    expect(s.checklist.find(i => i.id === "legal")?.status).toBe("done");
  });

  test("PLZ ungültig → BAD_REQUEST, kein Write", async () => {
    await expect(
      caller().onboardingV2.updateLegal({
        token: "tok",
        legal: { ...legal, legalZip: "123" },
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.updateAddons", () => {
  test("Flags persistiert, addonsReviewed, kein Dokument-Write", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: true,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: true,
        booking: false,
        team: false,
      },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        addOnContactForm: true,
        addOnAiChat: true,
        addOnGallery: false,
      })
    );
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(s.addOns.aiChat).toBe(true);
    expect(s.checklist.find(i => i.id === "addons")?.status).toBe("done");
  });
});

describe("onboardingV2.setCustomerEmail", () => {
  test("speichert E-Mail + captureStatus, stößt Lifecycle-Mails an", async () => {
    const s = await caller().onboardingV2.setCustomerEmail({
      token: "tok",
      email: "kunde@x.de",
    });

    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        customerEmail: "kunde@x.de",
        captureStatus: "email_captured",
      })
    );
    expect(s.customerEmail).toBe("kunde@x.de");
    expect(mockedLifecycle.sendImmediateWelcomeEmail).toHaveBeenCalledWith(
      42,
      "kunde@x.de"
    );
    expect(
      mockedLifecycle.scheduleInitialLifecycleEmails
    ).toHaveBeenCalledWith(42, "kunde@x.de");
  });

  test("marketingConsent → Zeitstempel gesetzt", async () => {
    await caller().onboardingV2.setCustomerEmail({
      token: "tok",
      email: "kunde@x.de",
      marketingConsent: true,
    });

    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        marketingConsent: true,
        marketingConsentAt: expect.any(Number),
      })
    );
  });

  test("Lifecycle-Fehler blockiert den Request nicht", async () => {
    mockedLifecycle.sendImmediateWelcomeEmail.mockRejectedValueOnce(
      new Error("mail down")
    );
    const s = await caller().onboardingV2.setCustomerEmail({
      token: "tok",
      email: "kunde@x.de",
    });
    expect(s.customerEmail).toBe("kunde@x.de");
  });
});
