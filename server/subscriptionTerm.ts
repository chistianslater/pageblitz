/**
 * Laufzeit, Kündigung und Tarifwechsel gegen Stripe (Preismodell
 * 2026-10-13). Die Datumsregeln stehen rein in shared/pricingTerm.ts; hier
 * nur das Zusammenspiel mit Stripe und unserer `subscriptions`-Zeile — alle
 * Abhängigkeiten als Deps, damit Webhook- und Konto-Pfade ohne Netz/DB
 * testbar sind (server/subscriptionTerm.test.ts).
 *
 * Durchsetzung der Mindestlaufzeit:
 * - Die Kündigung läuft über UNSEREN Endpunkt (Konto). Er rechnet das
 *   Ende nach den Regeln aus und setzt in Stripe `cancel_at` (Jahrestarif)
 *   bzw. `cancel_at_period_end` (Monatstarif, Testtage).
 * - Im Stripe-Kundenportal ist Kündigen abgeschaltet (eigene
 *   Portal-Konfiguration, `ensurePortalConfiguration`). Kündigt jemand
 *   trotzdem außerhalb (Stripe-Dashboard, alte Portal-Konfiguration), setzt
 *   `syncCancellationFromStripe` das Ende auf das Laufzeitende zurück —
 *   außer die Subscription trägt `metadata.cancelOverride = "1"` (bewusste
 *   Kulanz des Betreibers).
 * - `invoice.paid` startet die Laufzeit mit der ersten echten Zahlung und
 *   rollt sie danach je 12 Monate weiter.
 */
import type Stripe from "stripe";
import type * as Db from "./db";
import { PLANS, isTariff, type Tariff } from "../shared/pricing";
import {
  addMonthsUtc,
  computeCancellation,
  termEndAt,
  TermUnknownError,
  type CancellationResult,
} from "../shared/pricingTerm";
import { resolveAddOnPriceIds } from "./stripeAddons";
import type { Subscription } from "../drizzle/schema";

/** Metadaten-Schlüssel an der Stripe-Subscription. */
export const SUB_META = {
  tariff: "tariff",
  termMonths: "termMonths",
  termStartedAt: "termStartedAt",
  tariffSwitchedAt: "tariffSwitchedAt",
  cancelOverride: "cancelOverride",
} as const;

/** Metadaten für eine neue Subscription (Checkout). */
export function subscriptionMetadataFor(tariff: Tariff): Record<string, string> {
  return {
    [SUB_META.tariff]: tariff,
    [SUB_META.termMonths]: String(PLANS[tariff].termMonths),
  };
}

const nowSec = () => Math.floor(Date.now() / 1000);

// ── Lesehilfen für Stripe-Objekte (alte und neue API-Version) ───────────

/** Subscription-ID einer Rechnung — `invoice.subscription` (bis 2025) oder `parent.subscription_details` (clover). */
export function invoiceSubscriptionId(invoice: any): string | null {
  const direct = invoice?.subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct.id === "string") return direct.id;
  const parent = invoice?.parent?.subscription_details?.subscription;
  if (typeof parent === "string") return parent;
  if (parent && typeof parent.id === "string") return parent.id;
  for (const line of invoice?.lines?.data ?? []) {
    const viaLine =
      line?.subscription ??
      line?.parent?.subscription_item_details?.subscription;
    if (typeof viaLine === "string") return viaLine;
  }
  return null;
}

/**
 * Abrechnungszeitraum, den eine Rechnung bezahlt: aus den Positionen (nicht
 * aus `invoice.period_*` — das ist bei Abo-Rechnungen der VORIGE Zeitraum).
 * Prorations zählen nicht.
 */
export function invoicePaidPeriod(
  invoice: any
): { start: number; end: number } | null {
  let start: number | null = null;
  let end: number | null = null;
  for (const line of invoice?.lines?.data ?? []) {
    const proration =
      line?.proration === true ||
      line?.parent?.subscription_item_details?.proration === true;
    if (proration || !line?.period) continue;
    start = Math.max(start ?? 0, line.period.start);
    end = Math.max(end ?? 0, line.period.end);
  }
  return start != null && end != null ? { start, end } : null;
}

/** Ende des laufenden Abrechnungszeitraums (alt: Subscription, neu: Items). */
export function subscriptionPeriodEnd(sub: any): number | null {
  if (typeof sub?.current_period_end === "number") return sub.current_period_end;
  const ends = (sub?.items?.data ?? [])
    .map((item: any) => item?.current_period_end)
    .filter((v: unknown): v is number => typeof v === "number");
  return ends.length ? Math.max(...ends) : null;
}

/** Zeitpunkt, zu dem Stripe die Subscription beenden wird (null = keiner). */
export function stripeScheduledEnd(sub: any): number | null {
  if (typeof sub?.cancel_at === "number") return sub.cancel_at;
  if (sub?.cancel_at_period_end === true) return subscriptionPeriodEnd(sub);
  return null;
}

function tariffOf(record: Pick<Subscription, "billingInterval">): Tariff {
  return isTariff(record.billingInterval) ? record.billingInterval : "monthly";
}

/**
 * Stripe-Status → unser Status. Eine geplante Beendigung (`cancel_at` oder
 * `cancel_at_period_end`) macht aus active/trialing „canceling" — das Abo
 * läuft bis zum Ende weiter.
 */
export function mapStripeStatus(
  stripeSub: any
):
  | "active"
  | "canceling"
  | "trialing"
  | "past_due"
  | "canceled" {
  const scheduled = stripeScheduledEnd(stripeSub) != null;
  switch (stripeSub?.status) {
    case "active":
      return scheduled ? "canceling" : "active";
    case "trialing":
      return scheduled ? "canceling" : "trialing";
    case "past_due":
      return "past_due";
    default:
      return "canceled";
  }
}

// ── invoice.paid: Laufzeit starten und rollen ───────────────────────────

export interface InvoicePaidDeps {
  getSubscriptionByStripeId: typeof Db.getSubscriptionByStripeId;
  updateSubscription: typeof Db.updateSubscription;
  stripe: { subscriptions: { update: (id: string, params: any) => Promise<unknown> } };
}

export type InvoicePaidOutcome =
  | "ignored"
  | "period_only"
  | "term_started"
  | "term_rolled"
  | "term_unchanged"
  | "roll_blocked_by_cancel";

/**
 * `invoice.paid`: erste Zahlung > 0 € im Jahrestarif startet die Laufzeit
 * (Anker = Beginn des bezahlten Zeitraums, also das Testende), jede
 * Zahlung für einen Zeitraum ab Laufzeitende rollt sie um 12 Monate —
 * außer eine Kündigung endet genau zu diesem Laufzeitende (dann hätte
 * Stripe gar nicht mehr abbuchen dürfen; wir loggen und rollen nicht).
 */
export async function handleInvoicePaid(
  invoice: any,
  deps: InvoicePaidDeps
): Promise<InvoicePaidOutcome> {
  if (!(Number(invoice?.amount_paid) > 0)) return "ignored"; // Test-Rechnung 0 €
  const stripeSubId = invoiceSubscriptionId(invoice);
  if (!stripeSubId) return "ignored";
  const record = await deps.getSubscriptionByStripeId(stripeSubId);
  if (!record) return "ignored";
  const period = invoicePaidPeriod(invoice);
  if (!period) return "ignored";

  const patch: Partial<Subscription> = {
    currentPeriodEnd: period.end,
    updatedAt: Date.now(),
  };
  let outcome: InvoicePaidOutcome = "period_only";

  if (tariffOf(record) === "yearly") {
    if (record.termStartedAt == null) {
      patch.termStartedAt = period.start;
      patch.currentTermEnd = addMonthsUtc(
        period.start,
        PLANS.yearly.termMonths
      );
      outcome = "term_started";
      try {
        // Stripe als zweite Quelle — falls unsere Zeile je verloren geht.
        await deps.stripe.subscriptions.update(stripeSubId, {
          metadata: { [SUB_META.termStartedAt]: String(period.start) },
        });
      } catch (err) {
        console.warn(
          `[Laufzeit] termStartedAt-Metadaten für ${stripeSubId} nicht gesetzt:`,
          err
        );
      }
    } else {
      const termEnd =
        record.currentTermEnd ?? termEndAt(record.termStartedAt, period.start);
      if (period.start >= termEnd) {
        if (record.cancelEffectiveAt != null && record.cancelEffectiveAt <= termEnd) {
          console.warn(
            `[Laufzeit] ${stripeSubId}: Zahlung nach Laufzeitende trotz Kündigung zum ${termEnd} — Laufzeit nicht verlängert, bitte in Stripe prüfen.`
          );
          outcome = "roll_blocked_by_cancel";
        } else {
          patch.currentTermEnd = termEndAt(record.termStartedAt, period.start);
          outcome = "term_rolled";
        }
      } else {
        if (record.currentTermEnd == null) patch.currentTermEnd = termEnd;
        outcome = "term_unchanged";
      }
    }
  }

  await deps.updateSubscription(record.id, patch);
  return outcome;
}

// ── Laufzeitbeginn ermitteln ────────────────────────────────────────────

/**
 * Laufzeitbeginn für die Kündigungsrechnung: unsere Zeile, sonst die
 * Stripe-Metadaten, sonst — wenn das Abo als Jahrestarif begonnen hat —
 * der Abrechnungsanker (= Testende = erste Zahlung). Ein noch nicht
 * wirksamer Wechsel Monat→Jahr (`tariffSwitchedAt`, noch keine Zahlung zum
 * Jahrespreis) hat KEINE Laufzeit: null.
 */
export function resolveTermStart(
  record: Pick<Subscription, "termStartedAt">,
  stripeSub: any
): number | null {
  if (record.termStartedAt != null) return record.termStartedAt;
  const meta = stripeSub?.metadata ?? {};
  const fromMeta = Number(meta[SUB_META.termStartedAt]);
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta;
  if (meta[SUB_META.tariffSwitchedAt]) return null;
  const anchor = stripeSub?.billing_cycle_anchor;
  return typeof anchor === "number" ? anchor : null;
}

// ── Kündigung über unser Konto ──────────────────────────────────────────

export interface CancellationDeps {
  updateSubscription: typeof Db.updateSubscription;
  stripe: {
    subscriptions: {
      retrieve: (id: string) => Promise<any>;
      update: (id: string, params: any) => Promise<any>;
    };
  };
  now?: () => number;
}

export class SubscriptionActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionActionError";
  }
}

const CANCELLABLE = new Set(["active", "trialing", "past_due"]);

/**
 * Kündigung aus dem Konto: rechnet das Ende nach den Regeln, schreibt es
 * ZUERST in unsere Zeile (damit der folgende `customer.subscription.updated`
 * es als eigene Kündigung erkennt) und setzt es dann in Stripe. Schlägt
 * Stripe fehl, wird die Zeile zurückgesetzt.
 */
export async function requestCancellation(
  record: Subscription,
  deps: CancellationDeps
): Promise<CancellationResult> {
  if (!record.stripeSubscriptionId) {
    throw new SubscriptionActionError(
      "Für dieses Abo gibt es keine Stripe-Verknüpfung — bitte melde dich beim Support."
    );
  }
  if (record.cancelEffectiveAt != null || record.status === "canceling") {
    throw new SubscriptionActionError("Dein Abo ist bereits gekündigt.");
  }
  if (!CANCELLABLE.has(record.status)) {
    throw new SubscriptionActionError("Dieses Abo ist nicht mehr aktiv.");
  }
  const now = (deps.now ?? nowSec)();
  const stripeSub = await deps.stripe.subscriptions.retrieve(
    record.stripeSubscriptionId
  );
  const inTrial = stripeSub?.status === "trialing";
  const tariff = tariffOf(record);
  const termStartedAt =
    tariff === "yearly" && !inTrial ? resolveTermStart(record, stripeSub) : null;
  const currentPeriodEnd = subscriptionPeriodEnd(stripeSub);

  let result: CancellationResult;
  if (tariff === "yearly" && !inTrial && termStartedAt == null) {
    // Wechsel in den Jahrestarif noch nicht wirksam (keine Zahlung zum
    // Jahrespreis) — es läuft keine Laufzeit, Ende zum Abrechnungsmonat.
    if (!currentPeriodEnd) throw new TermUnknownError();
    result = { mode: "period_end", endsAt: currentPeriodEnd, reason: "monthly" };
  } else {
    result = computeCancellation({
      tariff,
      requestedAt: now,
      inTrial,
      currentPeriodEnd,
      termStartedAt,
    });
  }

  await deps.updateSubscription(record.id, {
    status: "canceling",
    cancelRequestedAt: now,
    cancelEffectiveAt: result.endsAt,
    ...(termStartedAt != null && record.termStartedAt == null
      ? { termStartedAt }
      : {}),
    updatedAt: Date.now(),
  });
  try {
    await deps.stripe.subscriptions.update(
      record.stripeSubscriptionId,
      result.mode === "period_end"
        ? { cancel_at_period_end: true }
        : { cancel_at: result.endsAt, proration_behavior: "none" }
    );
  } catch (err) {
    await deps.updateSubscription(record.id, {
      status: record.status,
      cancelRequestedAt: record.cancelRequestedAt ?? null,
      cancelEffectiveAt: record.cancelEffectiveAt ?? null,
      updatedAt: Date.now(),
    });
    throw err;
  }
  return result;
}

/** Kündigung zurücknehmen, solange das Abo noch läuft. */
export async function withdrawCancellation(
  record: Subscription,
  deps: CancellationDeps
): Promise<void> {
  if (!record.stripeSubscriptionId) {
    throw new SubscriptionActionError("Keine Stripe-Verknüpfung.");
  }
  const now = (deps.now ?? nowSec)();
  if (record.cancelEffectiveAt == null && record.status !== "canceling") {
    throw new SubscriptionActionError("Dein Abo ist nicht gekündigt.");
  }
  if (record.cancelEffectiveAt != null && record.cancelEffectiveAt <= now) {
    throw new SubscriptionActionError("Dein Abo ist bereits beendet.");
  }
  const stripeSub = await deps.stripe.subscriptions.retrieve(
    record.stripeSubscriptionId
  );
  await deps.stripe.subscriptions.update(
    record.stripeSubscriptionId,
    stripeSub?.cancel_at_period_end === true
      ? { cancel_at_period_end: false }
      : { cancel_at: "" }
  );
  await deps.updateSubscription(record.id, {
    status: stripeSub?.status === "trialing" ? "trialing" : "active",
    cancelRequestedAt: null,
    cancelEffectiveAt: null,
    updatedAt: Date.now(),
  });
}

// ── Tarifwechsel Monat → Jahr ───────────────────────────────────────────

/**
 * Basis-Position finden: das Item, das kein Add-on ist (keine Add-on-
 * Price-ID, kein Add-on-Betrag als Ad-hoc-Preis) und den Basispreis trägt.
 */
export function findBaseItem(items: any[], env: NodeJS.ProcessEnv): any | null {
  const addOnPriceIds = new Set(Object.values(resolveAddOnPriceIds(env)));
  const basePrices = new Set([
    PLANS.monthly.centsPerMonth,
    PLANS.yearly.centsPerMonth,
  ]);
  const candidates = items.filter(
    item =>
      !addOnPriceIds.has(item?.price?.id) &&
      basePrices.has(item?.price?.unit_amount)
  );
  return candidates.length === 1 ? candidates[0] : null;
}

/**
 * Wechsel in den Jahrestarif: Basis-Position ab der nächsten Abbuchung auf
 * den Jahrestarif-Monatspreis (keine anteilige Verrechnung), Metadaten
 * `tariff=yearly`. Die 12 Monate beginnen mit der nächsten bezahlten
 * Rechnung (invoice.paid). Jahr → Monat bietet die App nicht an (nur zum
 * Laufzeitende über den Support).
 */
export async function switchToYearly(
  record: Subscription,
  deps: CancellationDeps & { env?: NodeJS.ProcessEnv }
): Promise<void> {
  if (!record.stripeSubscriptionId) {
    throw new SubscriptionActionError("Keine Stripe-Verknüpfung.");
  }
  if (tariffOf(record) === "yearly") {
    throw new SubscriptionActionError("Du bist bereits im Jahrestarif.");
  }
  if (record.cancelEffectiveAt != null || record.status === "canceling") {
    throw new SubscriptionActionError(
      "Dein Abo ist gekündigt — nimm die Kündigung zuerst zurück."
    );
  }
  if (record.status !== "active" && record.status !== "trialing") {
    throw new SubscriptionActionError("Dieses Abo ist nicht aktiv.");
  }
  const now = (deps.now ?? nowSec)();
  const stripeSub = await deps.stripe.subscriptions.retrieve(
    record.stripeSubscriptionId
  );
  const base = findBaseItem(stripeSub?.items?.data ?? [], deps.env ?? process.env);
  if (!base) {
    throw new SubscriptionActionError(
      "Die Basis-Position des Abos ist nicht eindeutig — bitte melde dich beim Support."
    );
  }
  const product =
    typeof base.price.product === "string"
      ? base.price.product
      : base.price.product?.id;
  await deps.stripe.subscriptions.update(record.stripeSubscriptionId, {
    items: [
      {
        id: base.id,
        price_data: {
          currency: "eur",
          product,
          unit_amount: PLANS.yearly.centsPerMonth,
          recurring: { interval: "month" },
          tax_behavior: "inclusive",
        },
      },
    ],
    proration_behavior: "none",
    metadata: {
      ...subscriptionMetadataFor("yearly"),
      [SUB_META.tariffSwitchedAt]: String(now),
    },
  });
  await deps.updateSubscription(record.id, {
    billingInterval: "yearly",
    termStartedAt: null,
    currentTermEnd: null,
    updatedAt: Date.now(),
  });
}

// ── customer.subscription.updated: Kündigung spiegeln/korrigieren ───────

export interface CancellationSyncDeps {
  getSubscriptionByStripeId: typeof Db.getSubscriptionByStripeId;
  updateSubscription: typeof Db.updateSubscription;
  stripe: { subscriptions: { update: (id: string, params: any) => Promise<unknown> } };
  now?: () => number;
}

export type CancellationSyncOutcome =
  | "ignored"
  | "none"
  | "cleared"
  | "accepted"
  | "reapplied";

/**
 * Hält `cancelRequestedAt`/`cancelEffectiveAt` mit Stripe synchron und setzt
 * eine Kündigung von außen (Portal/Dashboard), die das Abo VOR dem
 * Laufzeitende beenden würde, auf das regelgerechte Ende zurück.
 */
export async function syncCancellationFromStripe(
  subscription: any,
  deps: CancellationSyncDeps
): Promise<CancellationSyncOutcome> {
  const record = await deps.getSubscriptionByStripeId(subscription?.id);
  if (!record) return "ignored";
  const scheduledEnd = stripeScheduledEnd(subscription);

  if (scheduledEnd == null) {
    if (record.cancelEffectiveAt == null && record.cancelRequestedAt == null) {
      return "none";
    }
    await deps.updateSubscription(record.id, {
      cancelRequestedAt: null,
      cancelEffectiveAt: null,
      updatedAt: Date.now(),
    });
    return "cleared";
  }

  const ownRequest =
    record.cancelRequestedAt != null && record.cancelEffectiveAt != null;
  let expected = scheduledEnd;
  let requestedAt = record.cancelRequestedAt;
  const override = subscription?.metadata?.[SUB_META.cancelOverride] === "1";

  if (ownRequest) {
    expected = record.cancelEffectiveAt!;
  } else if (!override) {
    const externalRequestAt: number =
      typeof subscription?.canceled_at === "number"
        ? subscription.canceled_at
        : (deps.now ?? nowSec)();
    requestedAt = externalRequestAt;
    const inTrial = subscription?.status === "trialing";
    const tariff = tariffOf(record);
    const termStartedAt =
      tariff === "yearly" && !inTrial
        ? resolveTermStart(record, subscription)
        : null;
    if (tariff === "yearly" && !inTrial && termStartedAt != null) {
      expected = computeCancellation({
        tariff,
        requestedAt: externalRequestAt,
        inTrial,
        currentPeriodEnd: subscriptionPeriodEnd(subscription),
        termStartedAt,
      }).endsAt;
    }
  }

  let outcome: CancellationSyncOutcome = "accepted";
  if (!override && expected !== scheduledEnd) {
    await deps.stripe.subscriptions.update(subscription.id, {
      cancel_at: expected,
      proration_behavior: "none",
    });
    console.warn(
      `[Laufzeit] Kündigung von außen für ${subscription.id} auf Laufzeitende ${expected} gesetzt (war ${scheduledEnd}).`
    );
    outcome = "reapplied";
  }

  if (
    record.cancelEffectiveAt !== expected ||
    record.cancelRequestedAt !== requestedAt
  ) {
    await deps.updateSubscription(record.id, {
      cancelRequestedAt: requestedAt ?? (deps.now ?? nowSec)(),
      cancelEffectiveAt: expected,
      updatedAt: Date.now(),
    });
  }
  return outcome;
}

// ── Stripe-Kundenportal ohne Kündigen ───────────────────────────────────

export const PORTAL_CONFIG_MARKER = "pageblitz-laufzeit-v1";

export interface PortalConfigClient {
  billingPortal: {
    configurations: {
      list: (params: any) => Promise<{ data: Array<{ id: string; active?: boolean; metadata?: Record<string, string> | null }> }>;
      create: (params: any) => Promise<{ id: string }>;
    };
  };
}

let cachedPortalConfig: Promise<string> | null = null;

/** Nur für Tests: Cache leeren. */
export function resetPortalConfigCache(): void {
  cachedPortalConfig = null;
}

/** Parameter der Portal-Konfiguration: Zahlungsdaten/Rechnungen ja, Kündigen/Tarifwechsel nein. */
export function portalConfigurationParams() {
  return {
    business_profile: {
      headline: "Pageblitz – Zahlungsdaten und Rechnungen",
      privacy_policy_url: "https://pageblitz.de/datenschutz",
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "name", "tax_id"],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: false },
      subscription_update: { enabled: false },
    },
    metadata: { pageblitz: PORTAL_CONFIG_MARKER },
  };
}

/**
 * ID der Portal-Konfiguration ohne Kündigen: Env `STRIPE_PORTAL_CONFIGURATION_ID`,
 * sonst die per Metadaten markierte bestehende, sonst neu angelegt (einmal
 * je Prozess gecacht).
 */
export function ensurePortalConfiguration(
  stripe: PortalConfigClient,
  env: NodeJS.ProcessEnv = process.env
): Promise<string> {
  const fromEnv = env.STRIPE_PORTAL_CONFIGURATION_ID?.trim();
  if (fromEnv) return Promise.resolve(fromEnv);
  if (!cachedPortalConfig) {
    cachedPortalConfig = (async () => {
      const { data } = await stripe.billingPortal.configurations.list({
        active: true,
        limit: 100,
      });
      const existing = data.find(
        c => c.metadata?.pageblitz === PORTAL_CONFIG_MARKER
      );
      if (existing) return existing.id;
      const created = await stripe.billingPortal.configurations.create(
        portalConfigurationParams()
      );
      return created.id;
    })().catch(err => {
      cachedPortalConfig = null;
      throw err;
    });
  }
  return cachedPortalConfig;
}
