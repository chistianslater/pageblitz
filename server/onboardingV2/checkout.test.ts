import { describe, expect, test, vi } from "vitest";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

import { createStudioCheckoutSession } from "./checkout";
import { addonPrice, calcTotalCents, PRICING } from "@shared/pricing";

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

  test("Metadaten exakt wie checkout.createSession (Webhook-kompatibel)", async () => {
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
    expect(call.subscription_data).toEqual({ trial_period_days: 7 });
    expect(call.line_items[0].price_data.tax_behavior).toBe("inclusive");
    expect(call.customer_email).toBe("kunde@x.de");
  });

  test("wirft Fehler, wenn Stripe keine URL zurückgibt", async () => {
    const { stripe } = fakeStripe({ url: null });
    await expect(
      createStudioCheckoutSession(baseArgs, stripe)
    ).rejects.toThrow();
  });
});
