import { describe, expect, test, vi } from "vitest";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

import { createStudioCheckoutSession } from "./checkout";
import {
  addonPrice,
  calcTotalCents,
  PLANS,
  PRICING,
  TRIAL_DAYS,
} from "@shared/pricing";
import { checkoutTermLine, stripeBaseDescription } from "@shared/pricingText";

function fakeStripe(
  overrides: Partial<{ url: string | null; id: string }> = {}
) {
  const create = vi.fn().mockResolvedValue({
    url: "url" in overrides ? overrides.url : "https://stripe/s",
    id: overrides.id ?? "cs_1",
  });
  return { stripe: { checkout: { sessions: { create } } } as any, create };
}

const baseArgs = {
  websiteId: 42,
  websiteName: "Brandt Tischlerei",
  userId: 7,
  customerEmail: "kunde@x.de",
  origin: "https://pageblitz.de",
  token: "tok-abc",
  billingInterval: "yearly" as const,
  addOns: { contactForm: false, gallery: true, menu: false, pricelist: false },
  b2bConfirmedAt: 1_790_000_000,
};

describe("createStudioCheckoutSession", () => {
  test("Basis-Position + je aktivem Add-on eine eigene Position; Summe der Positionen = calcTotalCents (Plan B6 Task 6: Items je Add-on für den Stripe-Sync)", async () => {
    const { stripe, create } = fakeStripe();
    const result = await createStudioCheckoutSession(baseArgs, stripe, {});

    const expectedTotal = calcTotalCents("yearly", baseArgs.addOns);
    const call = create.mock.calls[0][0];
    expect(call.line_items).toHaveLength(2);
    expect(call.line_items[0].price_data.unit_amount).toBe(PRICING.base.yearly);
    expect(call.line_items[0].price_data.product_data.name).toBe(
      "Pageblitz – Brandt Tischlerei"
    );
    // Ohne Env-Price-ID: Ad-hoc-price_data je Add-on (Brutto, monatlich).
    expect(call.line_items[1].price_data.unit_amount).toBe(
      addonPrice("gallery")
    );
    expect(call.line_items[1].price_data.product_data.name).toBe(
      "Pageblitz Add-on: Bildergalerie"
    );
    expect(call.line_items[1].price_data.recurring).toEqual({
      interval: "month",
    });
    expect(call.line_items[1].price_data.tax_behavior).toBe("inclusive");
    expect(call.line_items[1].quantity).toBe(1);
    const sum = call.line_items.reduce(
      (acc: number, item: any) => acc + item.price_data.unit_amount,
      0
    );
    expect(sum).toBe(expectedTotal);
    expect(result.totalCents).toBe(expectedTotal);
    expect(result.url).toBe("https://stripe/s");
    expect(result.sessionId).toBe("cs_1");
  });

  test("mit Env-Price-ID (STRIPE_PRICE_ADDON_<KEY>) wird das Add-on als `price`-Position angelegt — identifizierbar für Sync und Webhook", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(
      { ...baseArgs, addOns: { gallery: true, team: true } },
      stripe,
      { STRIPE_PRICE_ADDON_GALLERY: "price_gallery_live" }
    );
    const call = create.mock.calls[0][0];
    expect(call.line_items).toHaveLength(3);
    expect(call.line_items[1]).toEqual({
      price: "price_gallery_live",
      quantity: 1,
    });
    // Team ohne Env → Fallback auf price_data (Checkout darf nie an
    // fehlender Env scheitern).
    expect(call.line_items[2].price_data.unit_amount).toBe(addonPrice("team"));
  });

  test("ohne aktive Add-ons nur die Basis-Position", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(
      { ...baseArgs, addOns: {}, billingInterval: "monthly" },
      stripe,
      {}
    );
    const call = create.mock.calls[0][0];
    expect(call.line_items).toHaveLength(1);
    expect(call.line_items[0].price_data.unit_amount).toBe(
      PRICING.base.monthly
    );
  });

  test("Session-Metadaten im Format, das stripeWebhookHandlers.handleCheckoutCompleted liest", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(baseArgs, stripe, {});

    const call = create.mock.calls[0][0];
    expect(call.metadata.websiteId).toBe("42");
    expect(call.metadata.userId).toBe("7");
    expect(call.metadata.billingInterval).toBe("yearly");
    expect(call.metadata.totalAmount).toBe(
      calcTotalCents("yearly", baseArgs.addOns).toString()
    );
    const addOns = JSON.parse(call.metadata.addOns);
    expect(addOns).toEqual({
      contactForm: false,
      gallery: true,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
      subpages: false,
    });
  });

  test("userId null → Metadaten-userId '0'", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession({ ...baseArgs, userId: null }, stripe);

    const call = create.mock.calls[0][0];
    expect(call.metadata.userId).toBe("0");
  });

  test("success_url, cancel_url, mode, trial, tax_behavior, customer_email", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(baseArgs, stripe, {});

    const call = create.mock.calls[0][0];
    expect(call.success_url).toBe(
      "https://pageblitz.de/my-website?checkout=success"
    );
    expect(call.cancel_url).toBe("https://pageblitz.de/onboarding/tok-abc");
    expect(call.mode).toBe("subscription");
    expect(call.subscription_data).toEqual({
      trial_period_days: 7,
      metadata: {
        tariff: "yearly",
        termMonths: "12",
        websiteId: "42",
        b2b_bestaetigt_at: "1790000000",
      },
    });
    expect(call.line_items[0].price_data.tax_behavior).toBe("inclusive");
    expect(call.customer_email).toBe("kunde@x.de");
  });

  test("Steuersatz (STRIPE_TAX_RATE_ID) als default_tax_rates der Subscription — gilt für Basis, Add-ons und spätere Items; Beträge bleiben brutto", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(
      { ...baseArgs, addOns: { gallery: true, team: true } },
      stripe,
      {
        STRIPE_TAX_RATE_ID: "txr_ust19",
        STRIPE_PRICE_ADDON_GALLERY: "price_gallery_live",
      }
    );
    const call = create.mock.calls[0][0];
    expect(call.subscription_data.default_tax_rates).toEqual(["txr_ust19"]);
    // Bruttopreise unverändert: 19,90 € Basis inkl. USt., nicht 19,90 + 19 %.
    expect(call.line_items[0].price_data.unit_amount).toBe(
      PLANS.yearly.centsPerMonth
    );
    expect(call.line_items[0].price_data.tax_behavior).toBe("inclusive");
    expect(call.line_items[2].price_data.unit_amount).toBe(addonPrice("team"));
    expect(call.line_items[2].price_data.tax_behavior).toBe("inclusive");
    expect(call.metadata.totalAmount).toBe(
      calcTotalCents("yearly", { gallery: true, team: true }).toString()
    );
  });

  test("ohne STRIPE_TAX_RATE_ID läuft der Checkout trotzdem (kein default_tax_rates)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { stripe, create } = fakeStripe();
    const result = await createStudioCheckoutSession(baseArgs, stripe, {});
    expect(result.url).toBe("https://stripe/s");
    expect(create.mock.calls[0][0].subscription_data).not.toHaveProperty(
      "default_tax_rates"
    );
    warn.mockRestore();
  });

  test("falsche/fremde STRIPE_TAX_RATE_ID blockiert keinen Verkauf: Stripe lehnt ab → derselbe Checkout ohne Steuersatz", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { stripe, create } = fakeStripe();
    create.mockRejectedValueOnce(
      Object.assign(new Error("No such tax rate: 'txr_ust19'"), {
        code: "resource_missing",
        param: "tax_rates",
      })
    );
    const result = await createStudioCheckoutSession(baseArgs, stripe, {
      STRIPE_TAX_RATE_ID: "txr_ust19",
    });
    expect(result.url).toBe("https://stripe/s");
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0][0].subscription_data.default_tax_rates).toEqual(
      ["txr_ust19"]
    );
    expect(create.mock.calls[1][0].subscription_data).not.toHaveProperty(
      "default_tax_rates"
    );
    expect(create.mock.calls[1][0].line_items).toEqual(
      create.mock.calls[0][0].line_items
    );
    err.mockRestore();
  });

  test("wirft Fehler, wenn Stripe keine URL zurückgibt", async () => {
    const { stripe } = fakeStripe({ url: null });
    await expect(
      createStudioCheckoutSession(baseArgs, stripe)
    ).rejects.toThrow();
  });

  test("Jahrestarif: Basis 19,90 €/Monat, Metadaten tariff/termMonths, Laufzeit am Bezahl-Knopf", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession({ ...baseArgs, addOns: {} }, stripe, {});
    const call = create.mock.calls[0][0];
    const base = call.line_items[0].price_data;
    expect(base.unit_amount).toBe(PLANS.yearly.centsPerMonth);
    expect(base.recurring).toEqual({ interval: "month" });
    expect(base.tax_behavior).toBe("inclusive");
    expect(base.product_data.description).toBe(stripeBaseDescription("yearly"));
    expect(base.product_data.metadata).toEqual({ pageblitzBase: "yearly" });
    expect(call.subscription_data.metadata).toMatchObject({
      tariff: "yearly",
      termMonths: "12",
    });
    expect(call.custom_text.submit.message).toBe(checkoutTermLine("yearly"));
  });

  test("Monatstarif: 24,90 €/Monat, termMonths 0, monatlich kündbar am Knopf", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(
      { ...baseArgs, addOns: {}, billingInterval: "monthly" },
      stripe,
      {}
    );
    const call = create.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(
      PLANS.monthly.centsPerMonth
    );
    expect(call.subscription_data.metadata).toMatchObject({
      tariff: "monthly",
      termMonths: "0",
    });
    expect(call.subscription_data.trial_period_days).toBe(TRIAL_DAYS);
    expect(call.custom_text.submit.message).toBe(checkoutTermLine("monthly"));
  });

  test("B2B-Bestätigung landet in Session- und Subscription-Metadaten", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(baseArgs, stripe, {});
    const call = create.mock.calls[0][0];
    expect(call.metadata.b2b_bestaetigt_at).toBe("1790000000");
    expect(call.subscription_data.metadata.b2b_bestaetigt_at).toBe(
      "1790000000"
    );
  });

  test("AGB-Zustimmung nur mit STRIPE_TERMS_URL", async () => {
    const without = fakeStripe();
    await createStudioCheckoutSession(baseArgs, without.stripe, {});
    expect(without.create.mock.calls[0][0].consent_collection).toBeUndefined();
    expect(
      without.create.mock.calls[0][0].custom_text.terms_of_service_acceptance
    ).toBeUndefined();

    const withTerms = fakeStripe();
    await createStudioCheckoutSession(baseArgs, withTerms.stripe, {
      STRIPE_TERMS_URL: "https://pageblitz.de/agb",
    });
    const call = withTerms.create.mock.calls[0][0];
    expect(call.consent_collection).toEqual({ terms_of_service: "required" });
    expect(call.custom_text.terms_of_service_acceptance.message).toBe(
      "Ich stimme den [AGB](https://pageblitz.de/agb) zu."
    );
  });
});
