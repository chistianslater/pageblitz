import Stripe from "stripe";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  PLANS,
  TRIAL_DAYS,
  addonPrice,
  calcTotalCents,
  type AddOnFlags,
  type AddOnKey,
  type BillingInterval,
} from "@shared/pricing";
import { checkoutTermLine, stripeBaseDescription } from "@shared/pricingText";
import { resolveAddOnPriceIds } from "../stripeAddons";
import { B2B_META_KEY, subscriptionMetadataFor } from "../subscriptionTerm";
import { taxRateIds } from "../stripeTax";

/**
 * Stripe-Checkout für das Studio (Spec B2 Task 7) — seit 2026-10-13 der
 * EINZIGE Checkout-Pfad (der alte `checkout.createSession` in routers.ts ist
 * entfernt). Tarif: Basis-Position monatlich wiederkehrend zum Tarifpreis
 * (Jahrestarif 12 Monate Laufzeit, durchgesetzt über `cancel_at`, siehe
 * server/subscriptionTerm.ts), Subscription-Metadaten `tariff`/`termMonths`.
 * Die Metadaten der Session müssen
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
  /** Zeitpunkt der B2B-Bestätigung (§ 14 BGB) im Studio, Unix-Sekunden. */
  b2bConfirmedAt: number;
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
  const description = stripeBaseDescription(args.billingInterval);
  const addOns = ADDON_KEYS.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = !!args.addOns[key];
    return acc;
  }, {});
  const priceIds = resolveAddOnPriceIds(env);
  const termsUrl = env.STRIPE_TERMS_URL?.trim() || null;
  // USt. 19 % inklusive (server/stripeTax.ts) — fehlt die Env, wird
  // trotzdem verkauft (einmalige Warnung im Log).
  const taxRates = taxRateIds(env);
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
            metadata: { pageblitzBase: args.billingInterval },
          },
          // Seit Plan B6 Task 6 nur noch der Basispreis — Add-ons sind
          // eigene Positionen (buildAddOnLineItems), damit sie nach dem
          // Checkout einzeln zu-/abbuchbar sind.
          unit_amount: PLANS[args.billingInterval].centsPerMonth,
          recurring: { interval: "month" },
          // Alle Preise sind Bruttopreise inkl. MwSt. – Stripe rechnet KEINE Steuer drauf
          tax_behavior: "inclusive" as const,
        },
        quantity: 1,
      },
      ...buildAddOnLineItems(args.addOns, priceIds),
    ],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      // Subscription-weit: gilt für Basis, Add-ons und spätere Items.
      ...(taxRates.length > 0 ? { default_tax_rates: taxRates } : {}),
      metadata: {
        ...subscriptionMetadataFor(args.billingInterval),
        websiteId: args.websiteId.toString(),
        [B2B_META_KEY]: String(args.b2bConfirmedAt),
      },
    },
    // Laufzeit-/Kündigungsbedingungen direkt am Bezahl-Knopf.
    custom_text: {
      submit: { message: checkoutTermLine(args.billingInterval) },
      ...(termsUrl
        ? {
            terms_of_service_acceptance: {
              message: `Ich stimme den [AGB](${termsUrl}) zu.`,
            },
          }
        : {}),
    },
    // AGB-Zustimmung erst, wenn es AGB gibt: STRIPE_TERMS_URL setzen UND
    // dieselbe URL in Stripe (Settings → Public details) hinterlegen.
    ...(termsUrl
      ? { consent_collection: { terms_of_service: "required" as const } }
      : {}),
    success_url: `${args.origin}/my-website?checkout=success`,
    cancel_url: `${args.origin}/onboarding/${args.token}`,
    metadata: {
      websiteId: args.websiteId.toString(),
      userId: args.userId?.toString() || "0",
      billingInterval: args.billingInterval,
      addOns: JSON.stringify(addOns),
      totalAmount: totalCents.toString(),
      [B2B_META_KEY]: String(args.b2bConfirmedAt),
    },
  });

  if (!session.url) {
    throw new Error("Stripe session URL not generated");
  }
  return { url: session.url, sessionId: session.id, totalCents };
}
