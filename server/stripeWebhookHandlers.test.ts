import { beforeEach, describe, expect, test, vi } from "vitest";
import type Stripe from "stripe";
import {
  handleCheckoutCompleted,
  handleSubscriptionAddOnsUpdated,
  handleWebsiteActivation,
  type CheckoutCompletedDeps,
  type SubscriptionUpdatedDeps,
  type WebsiteActivationDeps,
} from "./stripeWebhookHandlers";

vi.mock("./ssr/routes", () => ({ invalidateSsrCache: vi.fn() }));
vi.mock("./_core/lifecycleScheduler", () => ({
  cancelLifecycleEmails: vi.fn(),
}));

import { invalidateSsrCache } from "./ssr/routes";
import { cancelLifecycleEmails } from "./_core/lifecycleScheduler";
const mockedInvalidateSsrCache = vi.mocked(invalidateSsrCache);
const mockedCancelLifecycleEmails = vi.mocked(cancelLifecycleEmails);

const v2Doc = {
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

const v1Doc = { headline: "Altes Dokument", version: 1 };

function fakeSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session {
  return {
    id: "cs_1",
    subscription: "sub_1",
    customer: "cus_1",
    customer_email: "kunde@x.de",
    metadata: {
      websiteId: "42",
      userId: "7",
      billingInterval: "yearly",
      addOns: JSON.stringify({ aiChat: true, gallery: true }),
    },
    ...overrides,
  } as Stripe.Checkout.Session;
}

function makeDeps(
  overrides: Partial<CheckoutCompletedDeps> = {}
): CheckoutCompletedDeps {
  return {
    createOnboarding: vi.fn().mockResolvedValue(999),
    getOnboardingByWebsiteId: vi.fn().mockResolvedValue(undefined),
    getWebsiteById: vi.fn().mockResolvedValue({
      id: 42,
      slug: "preview-brandt",
      websiteData: v2Doc,
    }),
    updateWebsite: vi.fn().mockResolvedValue(undefined),
    createSubscription: vi.fn().mockResolvedValue(1),
    getUserByEmail: vi.fn().mockResolvedValue(undefined),
    stripeCompat: {
      subscriptions: {
        retrieve: vi
          .fn()
          .mockResolvedValue({ status: "active", current_period_end: 123 }),
      },
    } as any,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleCheckoutCompleted", () => {
  test("normalisiert alle 8 Add-on-Keys, legt Subscription an, setzt Website-Status", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(fakeSession(), deps);

    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 42,
        addOns: {
          contactForm: false,
          gallery: true,
          menu: false,
          pricelist: false,
          aiChat: true,
          booking: false,
          team: false,
          subpages: false,
        },
      })
    );
    expect(deps.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        status: "sold",
        onboardingStatus: "pending",
        captureStatus: "converted",
        addOnAiChat: true,
        addOnBooking: false,
        addOnTeam: false,
        addOnSubpages: false,
      })
    );
  });

  test("Checkout mit subpages: true → features.subpages + addOnSubpages-Spalte gesetzt (Plan B6)", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({
        metadata: {
          websiteId: "42",
          userId: "7",
          billingInterval: "yearly",
          addOns: JSON.stringify({ subpages: true }),
        },
      }),
      deps
    );

    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        addOns: expect.objectContaining({ subpages: true }),
      })
    );
    expect(deps.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnSubpages: true })
    );
    const websiteDataCall = (deps.updateWebsite as any).mock.calls.find(
      (call: any[]) => "websiteData" in call[1]
    );
    expect(websiteDataCall![1].websiteData.features).toEqual({
      subpages: true,
    });
  });

  test("Checkout mit team: true → addOnTeam: true auf generatedWebsites (Plan B5)", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({
        metadata: {
          websiteId: "42",
          userId: "7",
          billingInterval: "yearly",
          addOns: JSON.stringify({ team: true }),
        },
      }),
      deps
    );

    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        addOns: expect.objectContaining({ team: true }),
      })
    );
    expect(deps.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnTeam: true })
    );
  });

  test("Checkout mit gallery: true → addOns.gallery im Dokument (Gating-Quelle, Plan B6 Task 6), aiChat als feature — ein websiteData-Write", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(fakeSession(), deps); // addOns: aiChat + gallery

    const websiteDataCalls = (deps.updateWebsite as any).mock.calls.filter(
      (call: any[]) => "websiteData" in call[1]
    );
    expect(websiteDataCalls).toHaveLength(1);
    expect(websiteDataCalls[0][1].websiteData.addOns).toEqual({
      gallery: true,
    });
    expect(websiteDataCalls[0][1].websiteData.features).toEqual({
      aiChat: true,
    });
  });

  test("v2-Dokument: features.aiChat wird gesetzt, Cache invalidiert", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(fakeSession(), deps);

    const websiteDataCall = (deps.updateWebsite as any).mock.calls.find(
      (call: any[]) => "websiteData" in call[1]
    );
    expect(websiteDataCall).toBeDefined();
    expect(websiteDataCall![1].websiteData.features).toEqual({
      aiChat: true,
    });
    expect(mockedInvalidateSsrCache).toHaveBeenCalledWith("preview-brandt");
  });

  test("features-Write schlägt fehl → Handler wirft trotzdem nicht, Subscription bleibt einmalig, Warnung geloggt", async () => {
    const updateWebsite = vi
      .fn()
      .mockResolvedValueOnce(undefined) // 1. Aufruf: status "sold" + Add-on-Flags
      .mockRejectedValueOnce(new Error("DB down")); // 2. Aufruf: websiteData (features)
    const deps = makeDeps({ updateWebsite });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      handleCheckoutCompleted(fakeSession(), deps)
    ).resolves.toBeUndefined();

    // createSubscription darf nur EINMAL laufen — ein 500er hier würde
    // Stripe zum Retry des gesamten Events verleiten und damit zu einer
    // zweiten Subscription-Zeile führen (Non-Idempotenz).
    expect(deps.createSubscription).toHaveBeenCalledTimes(1);
    expect(updateWebsite).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("features-Write fehlgeschlagen (Website 42)"),
      expect.any(Error)
    );
    // Cache darf nicht invalidiert werden, wenn der Write scheiterte.
    expect(mockedInvalidateSsrCache).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("v1-Dokument bleibt unangetastet — kein websiteData-Write, kein Cache-Invalidieren", async () => {
    const deps = makeDeps({
      getWebsiteById: vi.fn().mockResolvedValue({
        id: 42,
        slug: "preview-brandt",
        websiteData: v1Doc,
      }),
    });
    await handleCheckoutCompleted(fakeSession(), deps);

    const calls = (deps.updateWebsite as any).mock.calls;
    expect(calls.every((call: any[]) => !("websiteData" in call[1]))).toBe(
      true
    );
    expect(mockedInvalidateSsrCache).not.toHaveBeenCalled();
  });

  test("altes Metadaten-Format ({ features: {…} }) wird weiterhin unterstützt", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({
        metadata: {
          websiteId: "42",
          billingInterval: "yearly",
          addOns: JSON.stringify({ features: { booking: true } }),
        },
      }),
      deps
    );

    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        addOns: expect.objectContaining({ booking: true }),
      })
    );
    expect(deps.updateWebsite).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ addOnBooking: true })
    );
  });

  test("ohne websiteId in Metadaten: kein Write", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({ metadata: { billingInterval: "yearly" } }),
      deps
    );
    expect(deps.createSubscription).not.toHaveBeenCalled();
    expect(deps.updateWebsite).not.toHaveBeenCalled();
  });

  test("legt Onboarding-Zeile an, wenn noch keine existiert", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(fakeSession(), deps);
    expect(deps.createOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 42, status: "in_progress" })
    );
  });

  test("überspringt Onboarding-Anlage, wenn bereits vorhanden", async () => {
    const deps = makeDeps({
      getOnboardingByWebsiteId: vi.fn().mockResolvedValue({ id: 5 }),
    });
    await handleCheckoutCompleted(fakeSession(), deps);
    expect(deps.createOnboarding).not.toHaveBeenCalled();
  });

  test("cancelt Lifecycle-Mails nach erfolgreichem Checkout", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(fakeSession(), deps);
    expect(mockedCancelLifecycleEmails).toHaveBeenCalledWith(42, "converted");
  });

  // ── Finding I1: unveränderliche checkoutEmail am Abo ─────────────────────

  test("speichert checkoutEmail aus customer_details.email (lowercase/getrimmt), bevorzugt vor customer_email", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({
        customer_email: "anders@x.de",
        customer_details: { email: "  Kunde@X.de  " } as any,
      }),
      deps
    );
    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ checkoutEmail: "kunde@x.de" })
    );
  });

  test("Fallback auf customer_email, wenn customer_details.email fehlt", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({ customer_email: "Kunde@X.de", customer_details: null }),
      deps
    );
    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ checkoutEmail: "kunde@x.de" })
    );
  });

  test("weder customer_details.email noch customer_email → checkoutEmail null", async () => {
    const deps = makeDeps();
    await handleCheckoutCompleted(
      fakeSession({ customer_email: null, customer_details: null }),
      deps
    );
    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ checkoutEmail: null })
    );
  });

  // ── Finding M5: addOns-Metadaten-Parse abgesichert ───────────────────────

  test("kaputtes JSON in addOns-Metadaten → Fallback {}, kein Crash, Warnung geloggt", async () => {
    const deps = makeDeps();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      handleCheckoutCompleted(
        fakeSession({
          metadata: {
            websiteId: "42",
            billingInterval: "yearly",
            addOns: "{nicht valides json",
          },
        }),
        deps
      )
    ).resolves.toBeUndefined();

    expect(deps.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
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
      })
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("addOns-Metadaten nicht parsebar"),
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });
});

describe("handleSubscriptionAddOnsUpdated (customer.subscription.updated, Plan B6 Task 6)", () => {
  const env: NodeJS.ProcessEnv = {
    STRIPE_PRICE_ADDON_GALLERY: "price_gallery",
    STRIPE_PRICE_ADDON_TEAM: "price_team",
  };
  function fakeSubscription(priceIds: string[]): Stripe.Subscription {
    return {
      id: "sub_1",
      items: {
        data: priceIds.map((id, i) => ({ id: `si_${i}`, price: { id } })),
      },
    } as unknown as Stripe.Subscription;
  }
  function makeSubDeps(
    overrides: Partial<SubscriptionUpdatedDeps> = {}
  ): SubscriptionUpdatedDeps {
    return {
      getSubscriptionByStripeId: vi.fn().mockResolvedValue({
        id: 9,
        websiteId: 42,
        addOns: { contactForm: true, gallery: false, team: true },
      }),
      updateSubscription: vi.fn().mockResolvedValue(undefined),
      applyFeatureFlags: vi.fn().mockResolvedValue(undefined),
      env,
      ...overrides,
    };
  }

  test("leitet den Add-on-Stand aus den Items ab (nur konfigurierte Keys), schreibt subscriptions.addOns gemergt + Dokument/Spalten", async () => {
    const deps = makeSubDeps();
    await handleSubscriptionAddOnsUpdated(
      fakeSubscription(["price_base", "price_gallery"]),
      deps
    );
    expect(deps.updateSubscription).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        addOns: { contactForm: true, gallery: true, team: false },
      })
    );
    expect(deps.applyFeatureFlags).toHaveBeenCalledWith(42, {
      gallery: true,
      team: false,
    });
  });

  test("unverändert → kein Write", async () => {
    const deps = makeSubDeps();
    await handleSubscriptionAddOnsUpdated(
      fakeSubscription(["price_base", "price_team"]),
      deps
    );
    expect(deps.updateSubscription).not.toHaveBeenCalled();
    expect(deps.applyFeatureFlags).not.toHaveBeenCalled();
  });

  test("unbekannte Subscription → kein Write", async () => {
    const deps = makeSubDeps({
      getSubscriptionByStripeId: vi.fn().mockResolvedValue(undefined),
    });
    await handleSubscriptionAddOnsUpdated(
      fakeSubscription(["price_gallery"]),
      deps
    );
    expect(deps.updateSubscription).not.toHaveBeenCalled();
  });

  test("keine Price-IDs konfiguriert → nichts ableitbar, kein Write (keine falschen false-Flags)", async () => {
    const deps = makeSubDeps({ env: {} });
    await handleSubscriptionAddOnsUpdated(
      fakeSubscription(["price_base"]),
      deps
    );
    expect(deps.updateSubscription).not.toHaveBeenCalled();
    expect(deps.applyFeatureFlags).not.toHaveBeenCalled();
  });

  test("Dokument-Write-Fehler bricht den Handler nicht ab (Subscription-Stand steht bereits)", async () => {
    const deps = makeSubDeps({
      applyFeatureFlags: vi.fn().mockRejectedValue(new Error("db down")),
    });
    await expect(
      handleSubscriptionAddOnsUpdated(fakeSubscription(["price_gallery"]), deps)
    ).resolves.toBeUndefined();
    expect(deps.updateSubscription).toHaveBeenCalled();
  });
});

describe("handleWebsiteActivation (customer.subscription.updated → Website aktiv, Plan B6 Task 7)", () => {
  function makeActivationDeps(
    website: Record<string, unknown> | undefined,
    overrides: Partial<WebsiteActivationDeps> = {}
  ): WebsiteActivationDeps {
    return {
      getWebsiteById: vi.fn().mockResolvedValue(website) as any,
      updateWebsite: vi.fn().mockResolvedValue(undefined) as any,
      provisionUmami: vi.fn().mockResolvedValue("umami-1"),
      ...overrides,
    };
  }

  test("Website mit customerEmail → status active + captureStatus converted, danach Umami-Provisionierung", async () => {
    const deps = makeActivationDeps({
      id: 42,
      slug: "brandt",
      customerEmail: "kunde@x.de",
    });

    const result = await handleWebsiteActivation(42, deps);

    expect(result).toBe("activated");
    expect(deps.updateWebsite).toHaveBeenCalledWith(42, {
      status: "active",
      captureStatus: "converted",
    });
    expect(deps.provisionUmami).toHaveBeenCalledWith(42);
    // Reihenfolge: erst aktiv schalten, dann registrieren
    const updateOrder = (deps.updateWebsite as any).mock.invocationCallOrder[0];
    const provisionOrder = (deps.provisionUmami as any).mock
      .invocationCallOrder[0];
    expect(updateOrder).toBeLessThan(provisionOrder);
  });

  test("ohne customerEmail → skipped, kein Write, keine Provisionierung", async () => {
    const deps = makeActivationDeps({ id: 42, slug: "brandt" });

    const result = await handleWebsiteActivation(42, deps);

    expect(result).toBe("skipped");
    expect(deps.updateWebsite).not.toHaveBeenCalled();
    expect(deps.provisionUmami).not.toHaveBeenCalled();
  });

  test("Provisionierung wirft → Aktivierung bleibt bestehen, Handler wirft nicht", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const deps = makeActivationDeps(
      { id: 42, slug: "brandt", customerEmail: "kunde@x.de" },
      { provisionUmami: vi.fn().mockRejectedValue(new Error("umami down")) }
    );

    await expect(handleWebsiteActivation(42, deps)).resolves.toBe("activated");
    expect(deps.updateWebsite).toHaveBeenCalledWith(42, {
      status: "active",
      captureStatus: "converted",
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test("unbekannte Website → skipped", async () => {
    const deps = makeActivationDeps(undefined);
    await expect(handleWebsiteActivation(99, deps)).resolves.toBe("skipped");
    expect(deps.updateWebsite).not.toHaveBeenCalled();
  });
});
