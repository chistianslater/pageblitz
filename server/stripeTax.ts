/**
 * Fester USt.-Satz für Pageblitz-Rechnungen (2026-10-13): Stripe-Tax-Rate
 * „Pageblitz – USt. 19 % (inklusive)“, in der Env als `STRIPE_TAX_RATE_ID`.
 * Der Satz ist INKLUSIVE — alle Preise in shared/pricing.ts sind Brutto
 * (`tax_behavior: "inclusive"`); Stripe weist die 19 % nur auf der Rechnung
 * aus, der Bruttobetrag aus shared/pricing.ts bleibt unverändert.
 *
 * Angehängt wird er
 * - im Checkout als `subscription_data.default_tax_rates` (gilt für Basis,
 *   Add-ons und jedes spätere Item ohne eigenen Satz),
 * - an neu angelegten Add-on-Items (server/stripeAddons.ts) und beim
 *   Tarifwechsel (server/subscriptionTerm.ts) explizit, damit auch Abos aus
 *   der Zeit vor dem Steuersatz korrekt abrechnen.
 *
 * Fehlt die Env, läuft der Verkauf weiter (ohne ausgewiesene Steuer) — mit
 * genau einer deutlichen Warnung pro Prozess. Der Stripe-Account wird mit
 * anderen Produkten geteilt: der Satz wird NUR in Pageblitz-Pfaden gesetzt,
 * nie als Account-Default.
 */
export const TAX_RATE_ENV_KEY = "STRIPE_TAX_RATE_ID";

let warned = false;

export function resolveTaxRateId(
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const value = env[TAX_RATE_ENV_KEY]?.trim();
  if (value) return value;
  if (!warned) {
    warned = true;
    console.warn(
      `[steuer] ${TAX_RATE_ENV_KEY} ist nicht gesetzt — Stripe-Rechnungen weisen KEINE USt. aus. Env setzen (Tax-Rate „Pageblitz – USt. 19 % (inklusive)“) und pm2 neu starten.`
    );
  }
  return null;
}

/** `[id]` oder `[]` — direkt für `tax_rates`/`default_tax_rates`. */
export function taxRateIds(env: NodeJS.ProcessEnv = process.env): string[] {
  const id = resolveTaxRateId(env);
  return id ? [id] : [];
}

/** Nur für Tests: Warnung wieder scharf schalten. */
export function resetTaxRateWarningForTests(): void {
  warned = false;
}
