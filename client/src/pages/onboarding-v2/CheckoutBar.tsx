import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  PRICING,
  calcTotalCents,
  formatEuro,
  sanitizeAddOns,
  type AddOnFlags,
  type BillingInterval,
} from "@shared/pricing";
import type { StudioState } from "../../../../server/onboardingV2/state";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import { trackStudioEvent } from "@/lib/studioEvents";
import { trackConversion } from "@/lib/tracking";

/** Offener Pflichtpunkt — klickbar: Checklisten-Panel bzw. E-Mail-Feld. */
export interface MissingItem {
  id: ChecklistItemId | "email";
  title: string;
}

/**
 * Kostenlose Testwoche — muss zu `trial_period_days` in
 * server/onboardingV2/checkout.ts passen, sonst verspricht der Knopf etwas,
 * das Stripe nicht einhält.
 */
const TRIAL_DAYS = 7;

interface CheckoutSummaryProps {
  interval: BillingInterval;
  addOns: AddOnFlags;
  ready: boolean;
  hasEmail: boolean;
  missing: MissingItem[];
  onSelectMissing?: (item: MissingItem) => void;
}

/**
 * Preis, Testwoche und offene Punkte (Audit 2026-09-19): Der Preis steht
 * einmal und groß — vorher „19,90 €/Monat + Extras — 19,90 €/Monat", auch
 * ganz ohne Extras. Extras erscheinen nur, wenn welche gebucht sind.
 */
export function CheckoutSummary({
  interval,
  addOns,
  ready,
  hasEmail,
  missing,
  onSelectMissing,
}: CheckoutSummaryProps) {
  const total = calcTotalCents(interval, sanitizeAddOns(addOns));
  const extras = total - PRICING.base[interval];
  return (
    <div className="pb-studio-checkout-summary" data-ready={ready}>
      <p className="pb-studio-checkout-total">
        <strong>{formatEuro(total)}</strong> / Monat
      </p>
      {extras > 0 && (
        <p className="pb-studio-checkout-hint">
          Website {formatEuro(PRICING.base[interval])} + gebuchte Extras{" "}
          {formatEuro(extras)}
        </p>
      )}
      <p className="pb-studio-checkout-hint">
        Die ersten {TRIAL_DAYS} Tage kostenlos
        {interval === "yearly" ? " · jährlich: 2 Monate gratis" : ""}
      </p>
      {missing.length > 0 ? (
        <div className="pb-studio-checkout-missing">
          <span>Noch offen:</span>
          <ul aria-label="Noch offen">
            {missing.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectMissing?.(item)}
                  title={`${item.title} jetzt ergänzen`}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="pb-studio-checkout-ready">
          {hasEmail
            ? "Alles bereit zum Freischalten."
            : "Fast bereit — bitte E-Mail-Adresse ergänzen."}
        </p>
      )}
    </div>
  );
}

interface CheckoutBarProps {
  state: StudioState;
  token: string;
  onStateChanged: () => void;
  /** Öffnet das Panel eines offenen Pflichtpunkts (Klick in der Fehlliste). */
  onOpenPanel?: (id: ChecklistItemId) => void;
}

/** Bewusst einfach gehalten — nur ein Client-seitiger Vorab-Check vor dem Request, die eigentliche Validierung übernimmt der Server (z.string().email()). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extras, deren Aktivierung man erklären muss — sonst kein Hinweis (Audit 2026-09-19). */
function addonSetupNote(addOns: AddOnFlags): string | null {
  const sofort = addOns.contactForm ? ["Kontaktformular"] : [];
  const spaeter = [
    ...(addOns.aiChat ? ["KI-Chat"] : []),
    ...(addOns.booking ? ["Terminbuchung"] : []),
  ];
  const teile = [
    ...(sofort.length
      ? [`${sofort.join(" und ")} erscheint sofort in deiner Website`]
      : []),
    ...(spaeter.length
      ? [
          `${spaeter.join(" und ")} ${spaeter.length > 1 ? "werden" : "wird"} direkt nach dem Freischalten aktiv`,
        ]
      : []),
  ];
  return teile.length ? `${teile.join("; ")}.` : null;
}

/**
 * Der letzte Schritt vor dem Geld (Freischalten-Panel und Wizard-Abschluss).
 *
 * Audit 2026-09-19 nach der uxpeak-Methode („jeden Fehler einzeln finden
 * und begründen"): Preis einmal statt doppelt, Preise im Umschalter,
 * Testwoche und Preis im Knopf, Vertrauenszeile direkt darunter, der Knopf
 * sagt ehrlich was fehlt, die E-Mail wird beim Freischalten mitgespeichert
 * statt über einen eigenen Speichern-Knopf, Extras-Hinweis nur bei Bedarf.
 * Der Knopfbereich klebt unten (studio.css `.pb-studio-checkout-cta-area`).
 */
export function CheckoutBar({
  state,
  token,
  onStateChanged,
  onOpenPanel,
}: CheckoutBarProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("billing") === "monthly"
      ? "monthly"
      : "yearly"
  );
  const suggestedEmail =
    state.customerEmail ?? state.legal.legalEmail?.trim() ?? "";
  const [email, setEmail] = useState(suggestedEmail);
  const [emailTouched, setEmailTouched] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showEmailHint, setShowEmailHint] = useState(false);

  const saveEmail = trpc.onboardingV2.setCustomerEmail.useMutation();
  const checkout = trpc.onboardingV2.createCheckout.useMutation();

  // LegalPanel und CheckoutBar wechseln im Wizard nacheinander. Der Checkout
  // kann einen Render vor dem Parent-Refetch erscheinen; sobald der neue
  // Studio-State eintrifft, den Impressumswert nachziehen — aber nur, solange
  // der Nutzer das Account-Feld noch nicht selbst bearbeitet/geleert hat.
  useEffect(() => {
    if (!emailTouched && !state.customerEmail) {
      setEmail(state.legal.legalEmail?.trim() ?? "");
    }
  }, [emailTouched, state.customerEmail, state.legal.legalEmail]);

  // Aus der Checkliste abgeleitet statt hartkodiert auf "legal" (Finding
  // F3) — deckt automatisch jeden künftigen Pflichtpunkt ab.
  const missingSteps: MissingItem[] = state.checklist
    .filter(i => i.required && i.status !== "done")
    .map(i => ({ id: i.id, title: i.title }));
  const missing: MissingItem[] = [
    ...missingSteps,
    ...(!state.customerEmail
      ? [{ id: "email" as const, title: "E-Mail-Adresse" }]
      : []),
  ];

  const trimmedEmail = email.trim();
  const emailValid = EMAIL_RE.test(trimmedEmail);
  const showEmailError = showEmailHint && !state.customerEmail && !emailValid;

  const selectMissing = (item: MissingItem) => {
    if (item.id === "email") {
      document.getElementById("pb-checkout-email")?.focus();
      return;
    }
    onOpenPanel?.(item.id);
  };

  const pending = saveEmail.isPending || checkout.isPending;
  const total = calcTotalCents(billingInterval, sanitizeAddOns(state.addOns));
  const firstMissingStep = missingSteps[0] ?? null;
  const addonNote = addonSetupNote(sanitizeAddOns(state.addOns));

  const startCheckout = () =>
    checkout.mutate(
      { token, billingInterval },
      {
        onSuccess: ({ url }) => {
          trackStudioEvent("kauf_gestartet");
          trackConversion("close_convert_lead");
          window.location.assign(url);
        },
      }
    );

  const handleCta = async () => {
    // Fehlt ein Pflicht-Schritt, führt der Knopf direkt dorthin — vorher hieß
    // er „Website freischalten" und zeigte beim Klick nur eine Liste.
    if (firstMissingStep) {
      trackStudioEvent("kauf_blockiert");
      selectMissing(firstMissingStep);
      return;
    }
    if (!state.customerEmail) {
      if (!emailValid) {
        trackStudioEvent("kauf_blockiert");
        setShowEmailHint(true);
        document.getElementById("pb-checkout-email")?.focus();
        return;
      }
      // E-Mail beim Freischalten mitspeichern statt über einen eigenen
      // Speichern-Knopf (Audit 2026-09-19). Der Server verlangt sie vor dem
      // Checkout (checkoutReady), deshalb zuerst speichern.
      try {
        await saveEmail.mutateAsync({
          token,
          email: trimmedEmail,
          marketingConsent,
        });
      } catch {
        return; // Fehler steht unter dem Feld (saveEmail.error)
      }
      trackStudioEvent("email_gespeichert");
      trackConversion("qualify_lead");
      onStateChanged();
    }
    startCheckout();
  };

  return (
    <div className="pb-studio-checkout" aria-label="Checkout">
      <div
        className="pb-studio-seg pb-studio-seg--fill pb-studio-billing"
        role="group"
        aria-label="Abrechnung"
      >
        <button
          type="button"
          aria-pressed={billingInterval === "monthly"}
          onClick={() => setBillingInterval("monthly")}
        >
          Monatlich <span>{formatEuro(PRICING.base.monthly)}</span>
        </button>
        <button
          type="button"
          aria-pressed={billingInterval === "yearly"}
          onClick={() => setBillingInterval("yearly")}
        >
          Jährlich <span>{formatEuro(PRICING.base.yearly)}</span>
        </button>
      </div>
      <CheckoutSummary
        interval={billingInterval}
        addOns={state.addOns}
        ready={state.checkoutReady}
        hasEmail={!!state.customerEmail}
        missing={missing}
        onSelectMissing={selectMissing}
      />
      {!state.customerEmail && (
        <div className="pb-studio-field">
          <label htmlFor="pb-checkout-email">
            E-Mail-Adresse für deinen Account
          </label>
          <input
            id="pb-checkout-email"
            type="email"
            className="pb-studio-input"
            value={email}
            autoComplete="email"
            onChange={e => {
              setEmailTouched(true);
              setEmail(e.target.value);
            }}
          />
          {state.legal.legalEmail && (
            <span className="pb-studio-field-hint">
              Aus dem Impressum vorgeschlagen — du kannst die Adresse ändern.
            </span>
          )}
          <label className="pb-studio-checkbox">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={e => setMarketingConsent(e.target.checked)}
            />
            Gelegentlich Tipps &amp; Angebote per E-Mail erhalten
          </label>
          {showEmailError && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              Bitte eine gültige E-Mail-Adresse eingeben.
            </p>
          )}
          {saveEmail.error && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              {saveEmail.error.message}
            </p>
          )}
        </div>
      )}
      {addonNote && (
        <p style={{ color: "var(--st-muted)", fontSize: "0.8rem" }}>
          {addonNote}
        </p>
      )}
      <div className="pb-studio-checkout-cta-area">
        <button
          type="button"
          className="pb-studio-btn pb-studio-checkout-cta"
          disabled={pending}
          onClick={() => void handleCta()}
        >
          {pending ? (
            "Bitte warten…"
          ) : firstMissingStep ? (
            `${firstMissingStep.title} ergänzen`
          ) : (
            <>
              Website freischalten
              <small>
                {TRIAL_DAYS} Tage gratis, dann {formatEuro(total)} / Monat
              </small>
            </>
          )}
        </button>
        <p className="pb-studio-checkout-trust">
          Jederzeit kündbar · inkl. MwSt. · sichere Zahlung über Stripe
        </p>
        {checkout.error && (
          <p role="alert" style={{ color: "var(--st-warn)" }}>
            {checkout.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
