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
