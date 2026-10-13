import React, { useState } from "react";
import { Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  PLANS,
  addonPrice,
  formatEuro,
  isTariff,
  type AddOnKey,
  type Tariff,
} from "@shared/pricing";
import {
  ADDON_TERM_NOTE,
  TARIFF_LABEL,
  TARIFF_SWITCH_NOTE,
  VAT_NOTE_ALL,
  accountPlanLine,
  accountTermLines,
  cancelButtonHint,
  type AccountSubscriptionView,
} from "@shared/pricingText";

/**
 * Abo-Übersicht im Konto (Preismodell 2026-10-13): Tarif, Monatspreis,
 * Laufzeitende, Verlängerung, Kündigungsfrist und was der Kündigen-Knopf
 * tatsächlich bewirkt — alles aus der Abo-Zeile (subscriptions) und
 * shared/pricing*. Keine eigenen Preise oder Add-on-Tabellen mehr hier.
 */

/** Die Felder der Abo-Zeile, die die Übersicht braucht. */
export interface SubscriptionRow {
  status: string;
  billingInterval: string | null;
  addOns: unknown;
  currentPeriodEnd: number | null;
  termStartedAt: number | null;
  cancelEffectiveAt: number | null;
}

export function toAccountView(row: SubscriptionRow): AccountSubscriptionView {
  return {
    tariff: isTariff(row.billingInterval) ? row.billingInterval : "monthly",
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd,
    termStartedAt: row.termStartedAt,
    cancelEffectiveAt: row.cancelEffectiveAt,
  };
}

/** Gebuchte Extras aus `subscriptions.addOns` (flaches und altes `features`-Format). */
export function activeAddOnKeys(addOns: unknown): AddOnKey[] {
  const flags = (addOns ?? {}) as Record<string, any>;
  return ADDON_KEYS.filter(
    key => flags[key] === true || flags.features?.[key] === true
  );
}

export interface SubscriptionSummaryProps {
  subscription: SubscriptionRow;
  websiteSlug?: string | null;
  nowSec: number;
  onCancel: () => void;
  onWithdraw: () => void;
  onSwitchToYearly: () => void;
  onOpenPortal: () => void;
  pending?: "cancel" | "withdraw" | "switch" | "portal" | null;
}

const RUNNING = new Set(["active", "trialing", "canceling", "past_due"]);

export function SubscriptionSummary({
  subscription,
  websiteSlug,
  nowSec,
  onCancel,
  onWithdraw,
  onSwitchToYearly,
  onOpenPortal,
  pending = null,
}: SubscriptionSummaryProps) {
  const [confirming, setConfirming] = useState(false);
  const view = toAccountView(subscription);
  const tariff: Tariff = view.tariff;
  const addOns = activeAddOnKeys(subscription.addOns);
  const totalCents =
    PLANS[tariff].centsPerMonth +
    addOns.reduce((sum, key) => sum + addonPrice(key), 0);
  const running = RUNNING.has(subscription.status);
  const canceled = view.cancelEffectiveAt != null || subscription.status === "canceling";
  const hint = running && !canceled ? cancelButtonHint(view, nowSec) : null;

  return (
    <div className="space-y-6" data-testid="subscription-summary">
      <div className="bg-lp-accent/10 border border-lp-accent/30 rounded-xl p-6">
        <h3 className="text-lp-ink font-semibold text-lg">
          {accountPlanLine(tariff)}
        </h3>
        <p className="text-lp-muted text-sm">{VAT_NOTE_ALL}</p>

        <div className="space-y-2 my-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-lp-ink/80">
              Website ({TARIFF_LABEL[tariff]})
            </span>
            <span className="text-lp-ink font-semibold">
              {formatEuro(PLANS[tariff].centsPerMonth)}/Monat
            </span>
          </div>
          {addOns.map(key => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-lp-ink/80">{ADDON_NAMES[key]}</span>
              <span className="text-lp-accent font-semibold">
                + {formatEuro(addonPrice(key))}/Monat
              </span>
            </div>
          ))}
          {addOns.length > 0 && (
            <div className="flex items-center justify-between text-sm border-t border-lp-line/60 pt-2 mt-2">
              <span className="text-lp-ink font-bold">Gesamt</span>
              <span className="text-lp-ink font-bold">
                {formatEuro(totalCents)}/Monat
              </span>
            </div>
          )}
        </div>

        {running && (
          <div className="space-y-2 text-sm border-t border-lp-line pt-3">
            {websiteSlug && (
              <div className="flex items-center gap-2 text-lp-accent">
                <CheckCircle className="w-4 h-4" />
                <span>Website aktiv: {websiteSlug}.pageblitz.de</span>
              </div>
            )}
            {accountTermLines(view, nowSec).map(line => (
              <div key={line} className="flex items-start gap-2 text-lp-muted">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{line}</span>
              </div>
            ))}
            {addOns.length > 0 && (
              <p className="text-xs text-lp-muted">{ADDON_TERM_NOTE}</p>
            )}
          </div>
        )}

        {canceled && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-lp-ink">
              Deine Website bleibt bis zum Ende online und wird danach
              automatisch deaktiviert. Du kannst die Kündigung bis dahin
              zurücknehmen.
            </p>
          </div>
        )}
      </div>

      {running && tariff === "monthly" && !canceled && (
        <div className="rounded-xl border border-lp-line p-4 text-sm">
          <p className="text-lp-ink/80 mb-3">{TARIFF_SWITCH_NOTE.monthly}</p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-lp-line text-lp-ink hover:bg-lp-canvas disabled:opacity-60"
            disabled={pending != null}
            onClick={onSwitchToYearly}
          >
            {pending === "switch" && <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />}
            In den {TARIFF_LABEL.yearly} wechseln
          </button>
        </div>
      )}
      {running && tariff === "yearly" && !canceled && (
        <p className="text-xs text-lp-muted">{TARIFF_SWITCH_NOTE.yearly}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {subscription.status !== "canceled" && (
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-lp-line text-lp-ink/80 hover:bg-lp-canvas disabled:opacity-60"
            disabled={pending != null}
            onClick={onOpenPortal}
          >
            {pending === "portal" && <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />}
            Zahlungsdaten &amp; Rechnungen
          </button>
        )}
        {running && canceled && (
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-lp-accent/50 text-lp-accent hover:bg-lp-accent/10 disabled:opacity-60"
            disabled={pending != null}
            onClick={onWithdraw}
          >
            {pending === "withdraw" && <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />}
            Kündigung zurücknehmen
          </button>
        )}
        {running && !canceled && !confirming && (
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 disabled:opacity-60"
            disabled={pending != null}
            onClick={() => setConfirming(true)}
          >
            Kündigen
          </button>
        )}
      </div>

      {running && !canceled && (
        <p className="text-xs text-lp-muted" data-testid="cancel-hint">
          {hint ??
            "Das Kündigungsdatum lässt sich gerade nicht berechnen — bitte melde dich beim Support."}
        </p>
      )}

      {confirming && running && !canceled && (
        <div
          role="alertdialog"
          aria-label="Kündigung bestätigen"
          className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm space-y-3"
        >
          <p className="text-lp-ink">{hint}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={pending != null || hint == null}
              onClick={() => {
                setConfirming(false);
                onCancel();
              }}
            >
              {pending === "cancel" && <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />}
              Ja, kündigen
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-lp-line text-lp-ink/80"
              onClick={() => setConfirming(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
