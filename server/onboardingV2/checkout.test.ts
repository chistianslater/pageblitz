import { describe, expect, test, vi } from "vitest";

vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_unit_tests";
});

import { createStudioCheckoutSession } from "./checkout";
import { calcTotalCents } from "@shared/pricing";

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
  test("erzeugt Session mit korrektem unit_amount (calcTotalCents)", async () => {
    const { stripe, create } = fakeStripe();
    const result = await createStudioCheckoutSession(baseArgs, stripe);

    const expectedTotal = calcTotalCents("yearly", baseArgs.addOns);
    const call = create.mock.calls[0][0];
    expect(call.line_items[0].price_data.unit_amount).toBe(expectedTotal);
    expect(result.totalCents).toBe(expectedTotal);
    expect(result.url).toBe("https://stripe/s");
    expect(result.sessionId).toBe("cs_1");
  });

  test("Metadaten exakt wie checkout.createSession (Webhook-kompatibel)", async () => {
    const { stripe, create } = fakeStripe();
    await createStudioCheckoutSession(baseArgs, stripe);

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
    await createStudioCheckoutSession(baseArgs, stripe);

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
