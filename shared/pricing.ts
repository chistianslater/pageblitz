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
  | "team";

export const ADDON_KEYS: readonly AddOnKey[] = [
  "contactForm",
  "gallery",
  "menu",
  "pricelist",
  "aiChat",
  "booking",
  "team",
];

export const ADDON_NAMES: Record<AddOnKey, string> = {
  contactForm: "Kontaktformular",
  gallery: "Bildergalerie",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  aiChat: "KI-Chat",
  booking: "Terminbuchung",
  team: "Team",
};

export function addonPrice(key: AddOnKey): number {
  if (key === "aiChat") return PRICING.addonAiChat;
  if (key === "booking") return PRICING.addonBooking;
  return PRICING.addon;
}

export type AddOnFlags = Partial<Record<AddOnKey, boolean>>;

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
