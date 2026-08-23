import Stripe from "stripe";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  PRICING,
  addonPrice,
  calcTotalCents,
  type AddOnFlags,
  type AddOnKey,
  type BillingInterval,
} from "@shared/pricing";
import { resolveAddOnPriceIds } from "../stripeAddons";

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
 * Beschreibung der Basis-Position: Basispreis inkl. Abrechnungsart. Die
 * Add-ons stehen seit Plan B6 Task 6 als eigene Positionen daneben
 * (`buildAddOnLineItems`) und werden hier nicht mehr aufgezählt.
 */
function buildDescription(billingInterval: BillingInterval): string {
  const basePriceStr = (PRICING.base[billingInterval] / 100)
    .toFixed(2)
    .replace(".", ",");
  const intervalLabel =
    billingInterval === "yearly" ? "Jahresabo" : "monatlich";
  return `${basePriceStr} €/Mo Basis (${intervalLabel})`;
}

/**
 * Eine Checkout-Position je aktivem Add-on (Plan B6 Task 6): mit
 * konfigurierter Price-ID (`STRIPE_PRICE_ADDON_<KEY>`, shared/pricing.ts)
 * als `price`-Position — nur so kann der Stripe-Sync nach dem Checkout
 * (server/stripeAddons.ts) und der Webhook `customer.subscription.updated`
 * das Item später identifizieren; ohne Env Fallback auf Ad-hoc-`price_data`
 * (gleicher Brutto-Betrag), damit der Checkout nie an fehlender
 * Konfiguration scheitert. Betrag/Metadaten bleiben identisch zur früheren
 * Einzelposition (calcTotalCents).
 */
function buildAddOnLineItems(
  addOns: AddOnFlags,
  priceIds: Partial<Record<AddOnKey, string>>
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return ADDON_KEYS.filter(key => addOns[key]).map(key => {
    const priceId = priceIds[key];
    if (priceId) return { price: priceId, quantity: 1 };
    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: `Pageblitz Add-on: ${ADDON_NAMES[key]}`,
          metadata: { pageblitzAddOn: key },
        },
        unit_amount: addonPrice(key),
        recurring: { interval: "month" },
        tax_behavior: "inclusive" as const,
      },
      quantity: 1,
    };
  });
}

export async function createStudioCheckoutSession(
  args: CheckoutArgs,
  stripeClient: Stripe = defaultStripe,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ url: string; sessionId: string; totalCents: number }> {
  const totalCents = calcTotalCents(args.billingInterval, args.addOns);
  const description = buildDescription(args.billingInterval);
  const addOns = ADDON_KEYS.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = !!args.addOns[key];
    return acc;
  }, {});
  const priceIds = resolveAddOnPriceIds(env);
  const missing = ADDON_KEYS.filter(key => addOns[key] && !priceIds[key]);
  if (missing.length > 0) {
    console.warn(
      `[checkout] Keine Stripe-Price-ID für Add-on(s) ${missing.join(", ")} — Ad-hoc-Positionen; Studio-Sync/Webhook können diese Items später nicht identifizieren (Env STRIPE_PRICE_ADDON_* setzen).`
    );
  }

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
          // Seit Plan B6 Task 6 nur noch der Basispreis — Add-ons sind
          // eigene Positionen (buildAddOnLineItems), damit sie nach dem
          // Checkout einzeln zu-/abbuchbar sind.
          unit_amount: PRICING.base[args.billingInterval],
          recurring: { interval: "month" },
          // Alle Preise sind Bruttopreise inkl. MwSt. – Stripe rechnet KEINE Steuer drauf
          tax_behavior: "inclusive" as const,
        },
        quantity: 1,
      },
      ...buildAddOnLineItems(args.addOns, priceIds),
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
