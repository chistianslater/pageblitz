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
import {
  AGB_ACCEPTED_META_KEY,
  AGB_VERSION_META_KEY,
  B2B_META_KEY,
  subscriptionMetadataFor,
} from "../subscriptionTerm";
import { taxRateIds, withTaxRateFallback } from "../stripeTax";

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
  /**
   * Zeitpunkt des Pflicht-Häkchens im Studio (B2B nach § 14 BGB + AGB),
   * Unix-Sekunden.
   */
  b2bConfirmedAt: number;
  /** Akzeptierte AGB-Fassung (shared/agb.ts AGB_VERSION). */
  agbVersion: string;
}

/** B2B- und AGB-Nachweis — identisch an Session und Subscription. */
function consentMetadata(args: CheckoutArgs): Record<string, string> {
  return {
    [B2B_META_KEY]: String(args.b2bConfirmedAt),
    [AGB_VERSION_META_KEY]: args.agbVersion,
    [AGB_ACCEPTED_META_KEY]: String(args.b2bConfirmedAt),
  };
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
  // USt. 19 % inklusive (server/stripeTax.ts) — fehlt die Env, wird
  // trotzdem verkauft (einmalige Warnung im Log).
  const taxRates = taxRateIds(env);
  const missing = ADDON_KEYS.filter(key => addOns[key] && !priceIds[key]);
  if (missing.length > 0) {
    console.warn(
      `[checkout] Keine Stripe-Price-ID für Add-on(s) ${missing.join(", ")} — Ad-hoc-Positionen; Studio-Sync/Webhook können diese Items später nicht identifizieren (Env STRIPE_PRICE_ADDON_* setzen).`
    );
  }

  // Lehnt Stripe den Steuersatz ab, derselbe Checkout ohne (stripeTax.ts).
  const session = await withTaxRateFallback(taxRates, rates =>
    stripeClient.checkout.sessions.create({
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
        ...(rates.length > 0 ? { default_tax_rates: rates } : {}),
        metadata: {
          ...subscriptionMetadataFor(args.billingInterval),
          websiteId: args.websiteId.toString(),
          ...consentMetadata(args),
        },
      },
      // Laufzeit-/Kündigungsbedingungen direkt am Bezahl-Knopf.
      // KEIN `consent_collection.terms_of_service`: Stripe nimmt dafür die
      // Terms-URL aus den Account-Einstellungen (Public details), und der
      // Account ist mit anderen Produkten geteilt — die Pageblitz-AGB würden
      // dort fremde Checkouts treffen (oder umgekehrt). Die AGB-Zustimmung
      // holt das Studio-Häkchen vor der Weiterleitung ein (server-geprüft,
      // Fassung + Zeitpunkt in den Metadaten, siehe consentMetadata).
      custom_text: {
        submit: { message: checkoutTermLine(args.billingInterval) },
      },
      success_url: `${args.origin}/my-website?checkout=success`,
      cancel_url: `${args.origin}/onboarding/${args.token}`,
      metadata: {
        websiteId: args.websiteId.toString(),
        userId: args.userId?.toString() || "0",
        billingInterval: args.billingInterval,
        addOns: JSON.stringify(addOns),
        totalAmount: totalCents.toString(),
        ...consentMetadata(args),
      },
    })
  );

  if (!session.url) {
    throw new Error("Stripe session URL not generated");
  }
  return { url: session.url, sessionId: session.id, totalCents };
}
