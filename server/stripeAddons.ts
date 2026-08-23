import Stripe from "stripe";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  ADDON_PRICE_ENV_KEYS,
  type AddOnFlags,
  type AddOnKey,
} from "../shared/pricing";

/**
 * Stripe-Sync der Add-ons NACH dem Checkout (Plan B6 Task 6, Spec §2.2/§5.3):
 * Ein Studio-Toggle (onboardingV2.updateAddons/updateTeam/updatePages) oder
 * ein Dashboard-Kauf (customer.purchaseAddon) passt die Subscription-Items
 * der laufenden Stripe-Subscription an — je Add-on genau ein Item mit der
 * Price-ID aus der Env (`STRIPE_PRICE_ADDON_<KEY>`, siehe
 * shared/pricing.ts ADDON_PRICE_ENV_KEYS und .env.example). Umgekehrt
 * leitet der Webhook `customer.subscription.updated`
 * (server/stripeWebhookHandlers.ts) den Add-on-Stand aus den Items ab.
 *
 * Das Modell setzt voraus, dass die Checkout-Session je Add-on eine eigene
 * Position anlegt (server/onboardingV2/checkout.ts) — die Basis-Position
 * (Ad-hoc-`price_data`) wird hier nie angefasst, weil nur Items mit einer
 * konfigurierten Add-on-Price-ID identifiziert werden.
 */

/** Minimaler Ausschnitt des Stripe-Clients, den der Sync braucht (mockbar in Tests). */
export interface StripeAddOnsClient {
  subscriptionItems: {
    list(params: {
      subscription: string;
      limit?: number;
    }): Promise<{ data: Array<{ id: string; price: { id: string } }> }>;
    create(params: {
      subscription: string;
      price: string;
      quantity: number;
      proration_behavior: "create_prorations";
    }): Promise<unknown>;
    del(
      id: string,
      params: { proration_behavior: "create_prorations" }
    ): Promise<unknown>;
  };
}

let defaultClient: StripeAddOnsClient | null = null;
function getDefaultClient(): StripeAddOnsClient {
  if (!defaultClient) {
    defaultClient = new Stripe(
      process.env.STRIPE_SECRET_KEY || ""
    ) as unknown as StripeAddOnsClient;
  }
  return defaultClient;
}

/** Ein gebuchtes Add-on hat keine Price-ID in der Env — Betriebsfehler, kein Kundenfehler. */
export class AddOnPriceConfigError extends Error {
  readonly key: AddOnKey;
  readonly envKey: string;
  constructor(key: AddOnKey) {
    const envKey = ADDON_PRICE_ENV_KEYS[key];
    super(
      `Stripe-Preis für das Add-on „${ADDON_NAMES[key]}" fehlt (Env ${envKey} nicht gesetzt).`
    );
    this.name = "AddOnPriceConfigError";
    this.key = key;
    this.envKey = envKey;
  }
}

/** Liest je Add-on die Price-ID aus der Env; leere/fehlende Werte fallen weg. */
export function resolveAddOnPriceIds(
  env: NodeJS.ProcessEnv = process.env
): Partial<Record<AddOnKey, string>> {
  const result: Partial<Record<AddOnKey, string>> = {};
  for (const key of ADDON_KEYS) {
    const value = env[ADDON_PRICE_ENV_KEYS[key]]?.trim();
    if (value) result[key] = value;
  }
  return result;
}

/**
 * Leitet aus den Subscription-Items den Add-on-Stand ab — NUR für Add-ons
 * mit konfigurierter Price-ID (true = Item vorhanden, false = fehlt).
 * Unkonfigurierte Keys fehlen im Ergebnis, damit der Aufrufer (Webhook)
 * deren gespeicherten Stand unverändert lässt statt ihn fälschlich auf
 * false zu setzen.
 */
export function addOnsFromSubscriptionItems(
  items: ReadonlyArray<{ price: { id: string } }>,
  env: NodeJS.ProcessEnv = process.env
): AddOnFlags {
  const priceIds = resolveAddOnPriceIds(env);
  const present = new Set(items.map(item => item.price.id));
  const result: AddOnFlags = {};
  for (const key of ADDON_KEYS) {
    const priceId = priceIds[key];
    if (priceId) result[key] = present.has(priceId);
  }
  return result;
}

export interface SyncSubscriptionAddOnsResult {
  added: AddOnKey[];
  removed: AddOnKey[];
}

/**
 * Bringt die Subscription-Items einer Stripe-Subscription auf den
 * gewünschten Add-on-Stand: je übergebenem Key wird das Item mit der
 * Env-Price-ID angelegt (`true`, fehlt noch) bzw. entfernt (`false`,
 * vorhanden) — jeweils mit `proration_behavior: "create_prorations"`, damit
 * der Kunde anteilig zahlt bzw. gutgeschrieben bekommt. Nicht übergebene
 * Keys und fremde Items (Basis-Position) bleiben unangetastet.
 *
 * Konfigurationsfehler (gebuchtes Add-on ohne Price-ID) werden VOR dem
 * ersten Stripe-Write erkannt (`AddOnPriceConfigError`) — sonst stünde die
 * Subscription halb aktualisiert da. Stripe-Fehler werden durchgereicht;
 * der Aufrufer entscheidet (Studio: BAD_REQUEST, Flags unverändert).
 */
export async function syncSubscriptionAddOns(
  stripeSubscriptionId: string,
  addOns: AddOnFlags,
  deps: { stripe?: StripeAddOnsClient; env?: NodeJS.ProcessEnv } = {}
): Promise<SyncSubscriptionAddOnsResult> {
  const env = deps.env ?? process.env;
  const priceIds = resolveAddOnPriceIds(env);
  const wanted = ADDON_KEYS.filter(key => addOns[key] !== undefined);
  for (const key of wanted) {
    if (addOns[key] === true && !priceIds[key]) {
      throw new AddOnPriceConfigError(key);
    }
  }

  const stripe = deps.stripe ?? getDefaultClient();
  const { data: items } = await stripe.subscriptionItems.list({
    subscription: stripeSubscriptionId,
    limit: 100,
  });
  const itemByPrice = new Map(items.map(item => [item.price.id, item]));

  const added: AddOnKey[] = [];
  const removed: AddOnKey[] = [];
  for (const key of wanted) {
    const priceId = priceIds[key];
    if (!priceId) continue; // false ohne Price-ID: nichts identifizierbar
    const existing = itemByPrice.get(priceId);
    if (addOns[key] === true && !existing) {
      await stripe.subscriptionItems.create({
        subscription: stripeSubscriptionId,
        price: priceId,
        quantity: 1,
        proration_behavior: "create_prorations",
      });
      added.push(key);
    } else if (addOns[key] === false && existing) {
      await stripe.subscriptionItems.del(existing.id, {
        proration_behavior: "create_prorations",
      });
      removed.push(key);
    }
  }
  return { added, removed };
}
