/**
 * Preis-Konstanten und -Berechnungen für Basispreis und Add-ons.
 * Ausgelagert aus server/routers.ts (Findings B2/Task 1), damit Client
 * (Checkout-Panel) und Server dieselbe Quelle der Wahrheit nutzen.
 */

export const PRICING = {
  base: {
    monthly: 2490, // 24,90 €/Monat (monatliche Abrechnung)
    yearly: 1990, // 19,90 €/Monat (jährliche Abrechnung, monatlich abgebucht)
  },
  addon: 390, // 3,90 € pro Standard-Add-on
  addonAiChat: 990, // 9,90 € KI-Chat
  addonBooking: 490, // 4,90 € Terminbuchung
} as const;

export type BillingInterval = "monthly" | "yearly";

export type AddOnKey =
  | "contactForm"
  | "gallery"
  | "menu"
  | "pricelist"
  | "aiChat"
  | "booking"
  | "team"
  | "subpages";

export const ADDON_KEYS: readonly AddOnKey[] = [
  "contactForm",
  "gallery",
  "menu",
  "pricelist",
  "aiChat",
  "booking",
  "team",
  "subpages",
];

export const ADDON_NAMES: Record<AddOnKey, string> = {
  contactForm: "Kontaktformular",
  gallery: "Bildergalerie",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  aiChat: "KI-Chat",
  booking: "Terminbuchung",
  team: "Team",
  subpages: "Unterseiten",
};

export function addonPrice(key: AddOnKey): number {
  if (key === "aiChat") return PRICING.addonAiChat;
  if (key === "booking") return PRICING.addonBooking;
  return PRICING.addon;
}

export type AddOnFlags = Partial<Record<AddOnKey, boolean>>;

/**
 * Add-ons, die im v2-Dokument als `addOns.<key>` gespiegelt werden und das
 * Rendering von Sektionen/Unterseiten gaten (Plan B6 Task 6; Gating in
 * client/src/components/site/engine.ts, Schema `SiteAddOnsSchema`).
 */
export const SECTION_ADDON_KEYS = [
  "gallery",
  "menu",
  "pricelist",
  "team",
  "subpages",
] as const satisfies readonly AddOnKey[];
export type SectionAddOnKey = (typeof SECTION_ADDON_KEYS)[number];

/**
 * Add-ons, die im v2-Dokument als `features.<key>` gespiegelt werden
 * (Inseln/Verhaltens-Flags, `FeaturesSchema`). `subpages` steht bewusst in
 * beiden Listen: `features.subpages` ist das Flag seit Task 2,
 * `addOns.subpages` die Gating-Quelle seit Task 6 — beide werden immer
 * zusammen geschrieben (server/onboardingV2/applyFeatures.ts).
 */
export const FEATURE_ADDON_KEYS = [
  "contactForm",
  "aiChat",
  "booking",
  "subpages",
] as const satisfies readonly AddOnKey[];
export type FeatureAddOnKey = (typeof FEATURE_ADDON_KEYS)[number];

/**
 * Env-Variablen mit den Stripe-Price-IDs je Add-on (monatlich wiederkehrend,
 * EUR, Brutto/`tax_behavior: inclusive`) — Quelle für den Stripe-Sync nach
 * dem Checkout (server/stripeAddons.ts) und für die Add-on-Positionen der
 * Checkout-Session (server/onboardingV2/checkout.ts). Fehlt eine Variable,
 * bricht der Sync mit einer klaren Meldung ab; der Checkout fällt auf
 * Ad-hoc-`price_data` zurück. Siehe `.env.example`.
 */
export const ADDON_PRICE_ENV_KEYS: Record<AddOnKey, string> = {
  contactForm: "STRIPE_PRICE_ADDON_CONTACT_FORM",
  gallery: "STRIPE_PRICE_ADDON_GALLERY",
  menu: "STRIPE_PRICE_ADDON_MENU",
  pricelist: "STRIPE_PRICE_ADDON_PRICELIST",
  aiChat: "STRIPE_PRICE_ADDON_AI_CHAT",
  booking: "STRIPE_PRICE_ADDON_BOOKING",
  team: "STRIPE_PRICE_ADDON_TEAM",
  subpages: "STRIPE_PRICE_ADDON_SUBPAGES",
};

/**
 * Add-ons, die tatsächlich buchbar sind. Seit Plan B3 aktiviert der
 * Zahlungs-Webhook (`stripeWebhook.ts`/`stripeWebhookHandlers.ts`) auch
 * KI-Chat und Terminbuchung, seit Plan B5 zusätzlich Team (Team-Panel im
 * Studio-Extras-Bereich, siehe `server/onboardingV2/routerCommerce.ts`
 * `updateTeam`), seit Plan B6 zusätzlich Unterseiten (`subpages`,
 * `onboardingV2.updatePages`). Aktuell sind damit alle acht Add-ons buchbar
 * — diese Liste bleibt trotzdem die einzige Quelle der Wahrheit, falls
 * künftig wieder ein Extra gesperrt werden muss. Weder Client noch Server
 * dürfen gesperrte Add-ons in Preis oder Persistenz einfließen lassen
 * (Finding I1).
 */
export const BOOKABLE_ADDON_KEYS: readonly AddOnKey[] = [
  "contactForm",
  "gallery",
  "menu",
  "pricelist",
  "aiChat",
  "booking",
  "team",
  "subpages",
];

/**
 * Setzt alle nicht buchbaren Add-on-Flags (aktuell keine — alle acht Keys
 * sind buchbar, siehe BOOKABLE_ADDON_KEYS) auf false — einzige Quelle der
 * Wahrheit für Client (AddonsPanel/CheckoutBar) und Server (routerCommerce),
 * damit weder eine veraltete DB-Zeile noch ein manipulierter Request
 * gesperrte Extras in Preis oder Stripe-Metadaten einfließen lassen kann
 * (Finding I1).
 */
export function sanitizeAddOns(flags: AddOnFlags): AddOnFlags {
  const result: AddOnFlags = {};
  for (const key of ADDON_KEYS) {
    result[key] = BOOKABLE_ADDON_KEYS.includes(key) ? !!flags[key] : false;
  }
  return result;
}

export function calcTotalCents(
  interval: BillingInterval,
  addOns: AddOnFlags
): number {
  return ADDON_KEYS.reduce<number>(
    (sum, k) => sum + (addOns[k] ? addonPrice(k) : 0),
    PRICING.base[interval]
  );
}

export function formatEuro(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
