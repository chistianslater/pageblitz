import Stripe from "stripe";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  PRICING,
  calcTotalCents,
  type AddOnFlags,
  type BillingInterval,
} from "@shared/pricing";

/**
 * Stripe-Checkout für das Studio (Spec B2 Task 7). Die Metadaten müssen
 * exakt zum Format passen, das `stripeWebhook.ts` beim Abschluss der
 * Checkout-Session liest (websiteId, userId, billingInterval, addOns als
 * JSON, totalAmount) — sonst aktiviert der Webhook die Website nicht oder
 * mit falschen Extras.
 */
export const defaultStripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CheckoutArgs {
  websiteId: number;
  websiteName: string;
  userId: number | null;
  customerEmail: string;
  origin: string;
  token: string;
  billingInterval: BillingInterval;
  addOns: AddOnFlags;
}

/**
 * Baut die Produktbeschreibung wie im bestehenden `checkout.createSession`
 * (server/routers.ts): Basispreis inkl. Abrechnungsart, gefolgt von den
 * Namen der aktiven Add-ons.
 */
function buildDescription(
  billingInterval: BillingInterval,
  addOns: AddOnFlags
): string {
  const basePriceStr = (PRICING.base[billingInterval] / 100)
    .toFixed(2)
    .replace(".", ",");
  const intervalLabel =
    billingInterval === "yearly" ? "Jahresabo" : "monatlich";
  const activeAddOnNames = ADDON_KEYS.filter(k => addOns[k]).map(
    k => ADDON_NAMES[k]
  );
  return [
    `${basePriceStr} €/Mo Basis (${intervalLabel})`,
    ...activeAddOnNames,
  ].join(" + ");
}

export async function createStudioCheckoutSession(
  args: CheckoutArgs,
  stripeClient: Stripe = defaultStripe
): Promise<{ url: string; sessionId: string; totalCents: number }> {
  const totalCents = calcTotalCents(args.billingInterval, args.addOns);
  const description = buildDescription(args.billingInterval, args.addOns);
  const addOns = ADDON_KEYS.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = !!args.addOns[key];
    return acc;
  }, {});

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: args.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Pageblitz – ${args.websiteName}`,
            description,
          },
          unit_amount: totalCents,
          recurring: { interval: "month" },
          // Alle Preise sind Bruttopreise inkl. MwSt. – Stripe rechnet KEINE Steuer drauf
          tax_behavior: "inclusive" as const,
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${args.origin}/my-website?checkout=success`,
    cancel_url: `${args.origin}/onboarding/${args.token}`,
    metadata: {
      websiteId: args.websiteId.toString(),
      userId: args.userId?.toString() || "0",
      billingInterval: args.billingInterval,
      addOns: JSON.stringify(addOns),
      totalAmount: totalCents.toString(),
    },
  });

  if (!session.url) {
    throw new Error("Stripe session URL not generated");
  }
  return { url: session.url, sessionId: session.id, totalCents };
}
