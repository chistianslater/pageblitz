/**
 * Preis-Konstanten und -Berechnungen für Basispreis, Tarife und Add-ons —
 * EINZIGE Quelle der Wahrheit für jeden Preis in App, Landing, SEO-Seiten,
 * Postkarten und Stripe-Checkout. Anzeigetexte entstehen ausschließlich in
 * shared/pricingText.ts, Laufzeit-/Kündigungsdaten in shared/pricingTerm.ts.
 * server/pricingLiterals.test.ts schlägt an, wenn irgendwo sonst ein
 * Basispreis als Literal steht.
 *
 * Preismodell (Betreiber-Entscheidung 2026-10-13):
 * - Jahrestarif: 19,90 €/Monat, monatlich abgebucht, 12 Monate
 *   Mindestlaufzeit ab der ersten Zahlung nach den Testtagen; verlängert
 *   sich um je 12 Monate, wenn nicht mit 1 Monat Frist zum Laufzeitende
 *   gekündigt wird.
 * - Monatstarif: 24,90 €/Monat, monatlich zum Ende des Abrechnungsmonats
 *   kündbar.
 * - Alle Preise sind Bruttopreise inkl. 19 % MwSt. (Regelbesteuerung).
 * - Add-ons kosten in beiden Tarifen dasselbe, sind auch im Jahrestarif
 *   monatlich kündbar (keine eigene Laufzeit) und enden spätestens mit dem
 *   Basis-Abo.
 */

/** Tarif = Abrechnungsart. Der alte Name `BillingInterval` bleibt als Alias. */
export type Tariff = "monthly" | "yearly";
export type BillingInterval = Tariff;

export interface PlanSpec {
  tariff: Tariff;
  /** Bruttopreis je Monat in Cent. */
  centsPerMonth: number;
  /** Mindestlaufzeit in Monaten (0 = keine, monatlich kündbar). */
  termMonths: number;
  /** Kündigungsfrist in Monaten vor Laufzeitende (0 = zum Ende des Abrechnungsmonats). */
  noticeMonths: number;
  /** Automatische Verlängerung in Monaten nach Laufzeitende (0 = keine feste Laufzeit). */
  renewMonths: number;
  /** Kostenlose Testtage vor der ersten Zahlung. */
  trialDays: number;
}

export const TRIAL_DAYS = 7;

export const VAT = { ratePercent: 19, included: true } as const;
/** Kurzform für Schema.org/Stripe: alle Preise sind Bruttopreise. */
export const vatIncluded = VAT.included;

export const PLANS: Readonly<Record<Tariff, PlanSpec>> = {
  monthly: {
    tariff: "monthly",
    centsPerMonth: 2490,
    termMonths: 0,
    noticeMonths: 0,
    renewMonths: 0,
    trialDays: TRIAL_DAYS,
  },
  yearly: {
    tariff: "yearly",
    centsPerMonth: 1990,
    termMonths: 12,
    noticeMonths: 1,
    renewMonths: 12,
    trialDays: TRIAL_DAYS,
  },
};

export const PRICING = {
  base: {
    monthly: PLANS.monthly.centsPerMonth,
    yearly: PLANS.yearly.centsPerMonth,
  },
  addon: 390, // 3,90 € pro Standard-Add-on
  addonAiChat: 990, // 9,90 € KI-Chat
  addonBooking: 490, // 4,90 € Terminbuchung
} as const;

/** Ersparnis Jahrestarif gegenüber Monatstarif über 12 Monate (Cent). */
export const YEARLY_SAVINGS_CENTS =
  (PLANS.monthly.centsPerMonth - PLANS.yearly.centsPerMonth) * 12;

/** Ersparnis in Prozent des Monatstarifs, ganzzahlig gerundet. */
export const YEARLY_SAVINGS_PERCENT = Math.round(
  ((PLANS.monthly.centsPerMonth - PLANS.yearly.centsPerMonth) /
    PLANS.monthly.centsPerMonth) *
    100
);

export function isTariff(value: unknown): value is Tariff {
  return value === "monthly" || value === "yearly";
}

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
  return `${formatEuroNumber(cents)} €`;
}

/** „19,90" — Betrag ohne Währungszeichen (deutsches Format). */
export function formatEuroNumber(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** „19.90" — Betrag für Schema.org/JSON (Punkt als Dezimaltrenner). */
export function formatDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Ganze Euro ohne Nachkommastellen, wenn glatt: 6000 → „60 €". */
export function formatEuroShort(cents: number): string {
  return cents % 100 === 0 ? `${cents / 100} €` : formatEuro(cents);
}
