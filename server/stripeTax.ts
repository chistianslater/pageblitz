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

let rejectionLogged = false;

/**
 * Lehnt Stripe den Steuersatz ab? (falsche ID, Test-/Live-Modus vertauscht,
 * archiviert) — `resource_missing` an einem `*tax_rates*`-Parameter oder
 * eine Meldung, die den Steuersatz nennt.
 */
export function isTaxRateError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; param?: unknown; message?: unknown };
  const param = typeof e.param === "string" ? e.param : "";
  const message = typeof e.message === "string" ? e.message.toLowerCase() : "";
  if (param.includes("tax_rate")) return true;
  return message.includes("tax_rate") || message.includes("tax rate");
}

/**
 * Führt einen Stripe-Aufruf mit Steuersatz aus; lehnt Stripe den Satz ab,
 * wird derselbe Aufruf OHNE Steuersatz wiederholt — ein falscher Satz darf
 * nie einen Verkauf blockieren. Der Fehler geht einmal pro Prozess als
 * `console.error` ins Log. Andere Fehler werden unverändert geworfen.
 */
export async function withTaxRateFallback<T>(
  taxRates: string[],
  call: (taxRates: string[]) => Promise<T>
): Promise<T> {
  try {
    return await call(taxRates);
  } catch (err) {
    if (taxRates.length === 0 || !isTaxRateError(err)) throw err;
    if (!rejectionLogged) {
      rejectionLogged = true;
      console.error(
        `[steuer] Stripe lehnt ${TAX_RATE_ENV_KEY}=${taxRates.join(",")} ab (falsche ID oder Test-/Live-Modus vertauscht?) — verkaufe ohne ausgewiesene USt. weiter. Env prüfen.`,
        err
      );
    }
    return call([]);
  }
}

/** Nur für Tests: Warnungen wieder scharf schalten. */
export function resetTaxRateWarningForTests(): void {
  warned = false;
  rejectionLogged = false;
}
