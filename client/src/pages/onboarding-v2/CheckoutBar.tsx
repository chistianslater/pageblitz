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

interface CheckoutSummaryProps {
  interval: BillingInterval;
  addOns: AddOnFlags;
  ready: boolean;
  hasEmail: boolean;
  missing: string[];
}

/**
 * Reine Darstellung: Preiszeile (Basis + Extras), ruhiger Jahres-Hinweis
 * (kein Badge) und fehlende Pflichtpunkte bzw. Bereit-Meldung.
 */
export function CheckoutSummary({
  interval,
  addOns,
  ready,
  hasEmail,
  missing,
}: CheckoutSummaryProps) {
  const total = calcTotalCents(interval, sanitizeAddOns(addOns));
  return (
    <div className="pb-studio-checkout-summary" data-ready={ready}>
      <p className="pb-studio-checkout-total">
        {formatEuro(PRICING.base[interval])}/Monat + Extras
        {" — "}
        <strong>{formatEuro(total)}/Monat</strong>
      </p>
      {interval === "yearly" && (
        <p className="pb-studio-checkout-hint">Jährlich: 2 Monate gratis</p>
      )}
      {missing.length > 0 ? (
        <ul className="pb-studio-checkout-missing" aria-label="Noch offen">
          {missing.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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
}

const ADDON_SETUP_NOTE =
  "Kontaktformular erscheint sofort in deiner Website; KI-Chat und Terminbuchung werden direkt nach dem Freischalten aktiv.";

/** Bewusst einfach gehalten — nur ein Client-seitiger Vorab-Check vor dem Request, die eigentliche Validierung übernimmt der Server (z.string().email()). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Ständig sichtbare Checkout-Leiste am Fuß der linken Spalte (nur wenn kein
 * Panel offen, siehe StudioPage). Abrechnungsart lokal gewählt (Default
 * jährlich) — der Server bekommt sie erst bei `createCheckout` mit.
 */
export function CheckoutBar({
  state,
  token,
  onStateChanged,
}: CheckoutBarProps) {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("yearly");
  const suggestedEmail =
    state.customerEmail ?? state.legal.legalEmail?.trim() ?? "";
  const [email, setEmail] = useState(suggestedEmail);
  const [emailTouched, setEmailTouched] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

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
  // F3) — deckt automatisch jeden künftigen Pflichtpunkt ab, ohne
  // CheckoutBar bei jeder Checklisten-Änderung anfassen zu müssen.
  const missing: string[] = [
    ...state.checklist
      .filter(i => i.required && i.status !== "done")
      .map(i => i.title),
    ...(!state.customerEmail ? ["E-Mail-Adresse"] : []),
  ];

  const trimmedEmail = email.trim();
  const emailValid = EMAIL_RE.test(trimmedEmail);
  const showEmailError = trimmedEmail.length > 0 && !emailValid;

  const handleSaveEmail = () => {
    if (!emailValid) return;
    saveEmail.mutate(
      { token, email: trimmedEmail, marketingConsent },
      { onSuccess: onStateChanged }
    );
  };

  // Der Button bleibt IMMER klickbar (User-Feedback 2026-08-29): ein toter
  // Button erklärt nichts. Bei offenen Pflichtpunkten zeigt der Klick die
  // Liste als Warnung und springt ins E-Mail-Feld, statt stumm zu bleiben.
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    if (missing.length === 0) setShowMissing(false);
  }, [missing.length]);

  const handleCheckout = () => {
    if (!state.checkoutReady) {
      setShowMissing(true);
      if (!state.customerEmail) {
        document.getElementById("pb-checkout-email")?.focus();
      }
      return;
    }
    checkout.mutate(
      { token, billingInterval },
      {
        onSuccess: ({ url }) => {
          window.location.assign(url);
        },
      }
    );
  };

  return (
    <div className="pb-studio-checkout" aria-label="Checkout">
      <div className="pb-studio-seg" role="group" aria-label="Abrechnung">
        <button
          type="button"
          aria-pressed={billingInterval === "monthly"}
          onClick={() => setBillingInterval("monthly")}
        >
          Monatlich
        </button>
        <button
          type="button"
          aria-pressed={billingInterval === "yearly"}
          onClick={() => setBillingInterval("yearly")}
        >
          Jährlich
        </button>
      </div>
      <CheckoutSummary
        interval={billingInterval}
        addOns={state.addOns}
        ready={state.checkoutReady}
        hasEmail={!!state.customerEmail}
        missing={missing}
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
              Aus dem Impressum vorgeschlagen — du kannst die Adresse ändern
              oder löschen.
            </span>
          )}
          <p className="pb-studio-field-hint">
            Ohne E-Mail wird deine Vorschau nach 24 Stunden automatisch
            gelöscht. Mit E-Mail bleibt sie sieben Tage und du kannst später
            weitermachen.
          </p>
          <label className="pb-studio-checkbox">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={e => setMarketingConsent(e.target.checked)}
            />
            Gelegentlich Tipps &amp; Angebote per E-Mail erhalten
          </label>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={saveEmail.isPending || !emailValid}
            onClick={handleSaveEmail}
          >
            {saveEmail.isPending ? "Bitte warten…" : "Speichern"}
          </button>
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
      <p style={{ color: "var(--st-muted)", fontSize: "0.8rem" }}>
        {ADDON_SETUP_NOTE}
      </p>
      {showMissing && missing.length > 0 && (
        <div className="pb-studio-checkout-blockers" role="alert">
          <p>Fast geschafft — dafür fehlt nur noch:</p>
          <ul>
            {missing.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        className="pb-studio-btn"
        disabled={checkout.isPending}
        onClick={handleCheckout}
      >
        {checkout.isPending ? "Bitte warten…" : "Website freischalten"}
      </button>
      {checkout.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {checkout.error.message}
        </p>
      )}
    </div>
  );
}
