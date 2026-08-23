import { beforeEach, describe, expect, test, vi } from "vitest";
import { ZodError } from "zod";
import type { TrpcContext } from "../_core/context";
import { formatZodTrpcMessage } from "../_core/trpc";
import { LegalPatchSchema } from "../../shared/onboardingV2/patches";

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
    // applyFeatureFlags (server/onboardingV2/applyFeatures.ts, genutzt von
    // onboardingV2.updateAddons) lädt die Website zusätzlich per id — ohne
    // Mock würde die echte getWebsiteById gegen die (in Tests nicht
    // konfigurierte) DB laufen und `undefined` liefern, wodurch der
    // Feature-Write in applyFeatureFlags still übersprungen würde.
    getWebsiteById: vi.fn(),
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
// Stripe selbst ist in checkout.test.ts abgedeckt (Metadaten, unit_amount,
// URLs) — hier nur prüfen, dass der Router sie korrekt aufruft/nicht aufruft.
vi.mock("./checkout", () => ({
  createStudioCheckoutSession: vi.fn().mockResolvedValue({
    url: "https://stripe/session",
    sessionId: "cs_1",
    totalCents: 2380,
  }),
}));

import { appRouter } from "../routers";
import * as db from "../db";
import * as lifecycleScheduler from "../_core/lifecycleScheduler";
import * as checkoutModule from "./checkout";
const mockedDb = vi.mocked(db);
const mockedLifecycle = vi.mocked(lifecycleScheduler);
const mockedCheckout = vi.mocked(checkoutModule);

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
  mockedDb.getWebsiteById.mockResolvedValue({
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

  /**
   * Finding I2: die tRPC-`errorFormatter` (server/_core/trpc.ts) formatiert
   * ZodError-Ursachen deutsch statt den rohen JSON-Issues-String
   * durchzureichen. `appRouter.createCaller` (wie in allen Tests dieser
   * Datei) ruft Prozeduren jedoch direkt auf und durchläuft die
   * `errorFormatter` NICHT — die läuft erst am HTTP-Adapter
   * (createExpressMiddleware/resolveResponse), der hier nicht getestet
   * wird. Deshalb zwei Ebenen: (1) der reale HTTP-Pfad bleibt bei
   * BAD_REQUEST, wie gehabt; (2) die Formatierungslogik selbst wird direkt
   * gegen einen echten ZodError aus LegalPatchSchema geprüft.
   */
  test("PLZ ungültig → formatZodTrpcMessage liefert deutsche Meldung ohne JSON-Klammern", () => {
    const result = LegalPatchSchema.safeParse({ ...legal, legalZip: "1234" });
    expect(result.success).toBe(false);
    const message = formatZodTrpcMessage(result.error as ZodError);

    // Keine rohe JSON-Serialisierung der Issues (kein führendes "[{" bzw.
    // kein serialisiertes "code"-Feld) — genau das war vor I2 der Fehler.
    expect(message).not.toMatch(/^\s*\[/);
    expect(message).not.toContain('"code"');
    expect(message).not.toContain('"origin"');
    // Deutsche zod-Meldung statt "Invalid string: must match pattern …".
    expect(message.toLowerCase()).not.toContain("invalid");
    expect(message).toMatch(/ungültig|muster|zeichen/i);
  });
});

describe("onboardingV2.updateAddons", () => {
  test("Flags persistiert, addonsReviewed, Dokument-Write mit features.contactForm=true", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: true,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: false,
        booking: false,
        team: false,
        subpages: false,
      },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        addOnContactForm: true,
        addOnAiChat: false,
        addOnGallery: false,
      })
    );
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({
          features: expect.objectContaining({ contactForm: true }),
        }),
      })
    );
    expect(s.addOns.contactForm).toBe(true);
    expect(s.doc!.features?.contactForm).toBe(true);
    expect(s.checklist.find(i => i.id === "addons")?.status).toBe("done");
  });

  test("aiChat=true → OK, Dokument features.aiChat=true (seit Plan B3 buchbar)", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: false,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: true,
        booking: false,
        team: false,
        subpages: false,
      },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnAiChat: true })
    );
    expect(s.doc!.features?.aiChat).toBe(true);
  });

  test("booking=true → OK (seit Plan B3 buchbar)", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: false,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: false,
        booking: true,
        team: false,
        subpages: false,
      },
    });

    expect(s.doc!.features?.booking).toBe(true);
  });

  test("team=true → OK, addOnTeam gesetzt, keine leere Sektion angelegt (seit Plan B5 buchbar)", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: false,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: false,
        booking: false,
        team: true,
        subpages: false,
      },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: true })
    );
    expect(s.addOns.team).toBe(true);
    // Einschalten legt keine leere Team-Sektion an — die entsteht erst über
    // updateTeam mit dem ersten Mitglied.
    expect(s.doc!.sections.some(x => x.type === "team")).toBe(false);
  });

  test("subpages=true → OK, addOnSubpages gesetzt, Dokument unverändert (Plan B6 Task 5: Inhalt kommt über updatePages)", async () => {
    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: false,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: false,
        booking: false,
        team: false,
        subpages: true,
      },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnSubpages: true })
    );
    expect(s.addOns.subpages).toBe(true);
    expect(s.doc!.pages).toBeUndefined();
  });

  test("team: true→false entfernt eine vorhandene Team-Sektion aus dem Dokument", async () => {
    const v2WithTeam = {
      ...v2,
      sections: [
        ...v2.sections,
        { type: "team", members: [{ name: "Anna Beispiel" }] },
      ],
    };
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2WithTeam,
      customerEmail: null,
    } as any);
    mockedDb.getWebsiteById.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2WithTeam,
      customerEmail: null,
    } as any);
    onboardingRow = { ...onboardingRow, addOnTeam: true };

    const s = await caller().onboardingV2.updateAddons({
      token: "tok",
      addOns: {
        contactForm: false,
        gallery: false,
        menu: false,
        pricelist: false,
        aiChat: false,
        booking: false,
        team: false,
        subpages: false,
      },
    });

    expect(s.doc!.sections.some(x => x.type === "team")).toBe(false);
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: false })
    );
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({
          sections: expect.not.arrayContaining([
            expect.objectContaining({ type: "team" }),
          ]),
        }),
      })
    );
  });
});

describe("onboardingV2.updateTeam", () => {
  test("unbekannter Token → NOT_FOUND (Ownership wie die anderen update*-Prozeduren)", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue(undefined as any);

    await expect(
      caller().onboardingV2.updateTeam({
        token: "fremd",
        patch: { members: [{ name: "Anna" }] },
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
  });

  test("legt Team-Sektion mit Mitgliedern an und persistiert", async () => {
    const s = await caller().onboardingV2.updateTeam({
      token: "tok",
      patch: {
        headline: "Unser Team",
        members: [
          { name: "Anna Beispiel", role: "Meisterin" },
          { name: "Ben Beispiel" },
        ],
      },
    });

    const team = s.doc!.sections.find(x => x.type === "team") as any;
    expect(team.headline).toBe("Unser Team");
    expect(team.members).toEqual([
      { name: "Anna Beispiel", role: "Meisterin" },
      { name: "Ben Beispiel" },
    ]);
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        websiteData: expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({ type: "team" }),
          ]),
        }),
      })
    );
  });

  test("members: [] entfernt die Sektion wieder", async () => {
    const s = await caller().onboardingV2.updateTeam({
      token: "tok",
      patch: { members: [] },
    });
    expect(s.doc!.sections.some(x => x.type === "team")).toBe(false);
  });

  test("mit Mitgliedern → setzt addOnTeam=true (Flag folgt Inhalt, unabhängig vom Extras-Toggle)", async () => {
    const s = await caller().onboardingV2.updateTeam({
      token: "tok",
      patch: { members: [{ name: "Anna Beispiel" }] },
    });

    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: true })
    );
    expect(s.addOns.team).toBe(true);
  });

  test("members: [] → kein Flag-Write (Abschalten läuft ausschließlich über updateAddons)", async () => {
    await caller().onboardingV2.updateTeam({
      token: "tok",
      patch: { members: [] },
    });

    expect(mockedDb.updateOnboarding).not.toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: expect.anything() })
    );
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
    expect(mockedLifecycle.scheduleInitialLifecycleEmails).toHaveBeenCalledWith(
      42,
      "kunde@x.de"
    );
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

  test("zweiter Aufruf mit gleicher E-Mail → sendImmediateWelcomeEmail nicht aufgerufen (Finding I3)", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2,
      customerEmail: "kunde@x.de",
    } as any);

    const s = await caller().onboardingV2.setCustomerEmail({
      token: "tok",
      email: "kunde@x.de",
    });

    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ customerEmail: "kunde@x.de" })
    );
    expect(s.customerEmail).toBe("kunde@x.de");
    expect(mockedLifecycle.sendImmediateWelcomeEmail).not.toHaveBeenCalled();
    expect(
      mockedLifecycle.scheduleInitialLifecycleEmails
    ).not.toHaveBeenCalled();
  });

  test("gleiche E-Mail nur mit anderer Groß-/Kleinschreibung/Leerzeichen → ebenfalls kein erneuter Mailversand", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2,
      customerEmail: "kunde@x.de",
    } as any);

    await caller().onboardingV2.setCustomerEmail({
      token: "tok",
      email: "  Kunde@X.de  ".trim(),
    });

    expect(mockedLifecycle.sendImmediateWelcomeEmail).not.toHaveBeenCalled();
  });

  test("Finding I1: Website bereits verkauft (status !== 'preview') → BAD_REQUEST, kein Write", async () => {
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "active",
      businessId: 7,
      websiteData: v2,
      customerEmail: "alt@x.de",
    } as any);
    mockedDb.getSubscriptionByWebsiteId.mockResolvedValue({
      userId: 7,
    } as any);
    const ownerCaller = appRouter.createCaller({
      user: { id: 7, email: "alt@x.de" },
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    } as TrpcContext);

    await expect(
      ownerCaller.onboardingV2.setCustomerEmail({
        token: "tok",
        email: "neu@x.de",
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message:
        "Die E-Mail-Adresse kann nach dem Kauf nur im Konto geändert werden.",
    });
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(mockedLifecycle.sendImmediateWelcomeEmail).not.toHaveBeenCalled();
  });
});

describe("onboardingV2.createCheckout", () => {
  test("ohne vollständiges Rechtliches → BAD_REQUEST, kein Stripe-Aufruf", async () => {
    // beforeEach: onboardingRow.legal* ist null, website.customerEmail null
    // → checkoutReady bleibt false.
    await expect(
      caller().onboardingV2.createCheckout({
        token: "tok",
        billingInterval: "yearly",
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message:
        "Bitte zuerst Impressum-Angaben und E-Mail-Adresse vervollständigen.",
    });
    expect(mockedCheckout.createStudioCheckoutSession).not.toHaveBeenCalled();
    expect(mockedDb.updateWebsite).not.toHaveBeenCalled();
    expect(mockedDb.updateOnboarding).not.toHaveBeenCalled();
  });

  test("mit vollständigem Zustand → { url }, onboardingStatus + captureStatus completed", async () => {
    onboardingRow = {
      ...onboardingRow,
      legalOwner: "Max Brandt",
      legalStreet: "Weg 1",
      legalZip: "44135",
      legalCity: "Dortmund",
      legalEmail: "m@b.de",
      legalPhone: "0231 1",
    };
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2,
      customerEmail: "kunde@x.de",
    } as any);

    const result = await caller().onboardingV2.createCheckout({
      token: "tok",
      billingInterval: "yearly",
    });

    expect(result).toEqual({ url: "https://stripe/session" });
    expect(mockedCheckout.createStudioCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        websiteName: "Brandt",
        userId: null,
        customerEmail: "kunde@x.de",
        token: "tok",
        billingInterval: "yearly",
      })
    );
    expect(mockedDb.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        onboardingStatus: "completed",
        captureStatus: "onboarding_completed",
      })
    );
    expect(mockedDb.updateOnboarding).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        status: "completed",
        completedAt: expect.any(Number),
        updatedAt: expect.any(Number),
      })
    );
  });

  test("gespeichertes team=true → Stripe-Session mit team (seit Plan B5 buchbar)", async () => {
    onboardingRow = {
      ...onboardingRow,
      legalOwner: "Max Brandt",
      legalStreet: "Weg 1",
      legalZip: "44135",
      legalCity: "Dortmund",
      legalEmail: "m@b.de",
      legalPhone: "0231 1",
      // aiChat/booking sind seit Plan B3, team seit Plan B5 buchbar — alle
      // drei dürfen unverändert an Stripe durchgereicht werden
      // (sanitizeAddOns lässt nur noch tatsächlich gesperrte Extras aus,
      // aktuell keine).
      addOnAiChat: true,
      addOnBooking: true,
      addOnGallery: true,
      addOnTeam: true,
    };
    mockedDb.getWebsiteByToken.mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      status: "preview",
      businessId: 7,
      websiteData: v2,
      customerEmail: "kunde@x.de",
    } as any);

    await caller().onboardingV2.createCheckout({
      token: "tok",
      billingInterval: "yearly",
    });

    expect(mockedCheckout.createStudioCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        addOns: expect.objectContaining({
          gallery: true,
          aiChat: true,
          booking: true,
          team: true,
        }),
      })
    );
  });
});
