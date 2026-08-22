import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { AddonsPatch } from "@shared/onboardingV2/patches";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  addonPrice,
  BOOKABLE_ADDON_KEYS,
  calcTotalCents,
  formatEuro,
  sanitizeAddOns,
  type AddOnFlags,
  type AddOnKey,
  type BillingInterval,
} from "@shared/pricing";
import { PanelFrame } from "./PanelFrame";

/**
 * Bindbare Add-ons: Seit Plan B3 schaltet der Zahlungs-Webhook auch KI-Chat
 * und Terminbuchung frei, sie zählen also mit in Preis und Summe. Team
 * bleibt gesperrt ("bald verfügbar") — das Team-Panel fehlt noch.
 * `BOOKABLE_ADDON_KEYS` und `sanitizeAddOns` kommen aus @shared/pricing
 * (Finding I1) — dieselbe Quelle der Wahrheit wie der Server
 * (routerCommerce.ts), damit UI-Sperre und serverseitige Ablehnung nie
 * auseinanderlaufen können.
 */
const TOGGLEABLE_KEYS: readonly AddOnKey[] = BOOKABLE_ADDON_KEYS;
const COMING_SOON_KEYS: AddOnKey[] = ADDON_KEYS.filter(
  k => !BOOKABLE_ADDON_KEYS.includes(k)
);

interface AddonsListProps {
  value: AddOnFlags;
  onToggle: (k: AddOnKey) => void;
  interval: BillingInterval;
}

/** Reine Darstellung: Schalter je bindbarem Add-on mit Preis, gesperrte "bald verfügbar"-Zeilen, Gesamtsumme inkl. Basispreis. */
export function AddonsList({ value, onToggle, interval }: AddonsListProps) {
  const total = calcTotalCents(interval, sanitizeAddOns(value));
  return (
    <div className="pb-studio-rows">
      <ul className="pb-studio-addon-list" aria-label="Extras">
        {TOGGLEABLE_KEYS.map(key => (
          <li className="pb-studio-row" key={key}>
            <span className="pb-studio-addon-name">{ADDON_NAMES[key]}</span>
            <span className="pb-studio-addon-price">
              {formatEuro(addonPrice(key))}
            </span>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-pressed={!!value[key]}
              onClick={() => onToggle(key)}
            >
              {value[key] ? "Aktiv" : "Hinzufügen"}
            </button>
          </li>
        ))}
        {COMING_SOON_KEYS.map(key => (
          <li className="pb-studio-row" key={key} data-locked="true">
            <span className="pb-studio-addon-name">{ADDON_NAMES[key]}</span>
            <span className="pb-studio-addon-price" data-muted="true">
              {formatEuro(addonPrice(key))}
            </span>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              disabled
            >
              bald verfügbar
            </button>
          </li>
        ))}
      </ul>
      <p className="pb-studio-addon-total">
        Gesamt: <strong>{formatEuro(total)}</strong>/Monat
      </p>
    </div>
  );
}

interface AddonsPanelProps {
  token: string;
  addOns: AddOnFlags;
  onApplied: () => void;
  onClose: () => void;
}

export function AddonsPanel({
  token,
  addOns,
  onApplied,
  onClose,
}: AddonsPanelProps) {
  const [value, setValue] = useState<AddOnFlags>(() => sanitizeAddOns(addOns));

  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  const busy = updateAddons.isPending;

  const handleToggle = (key: AddOnKey) => {
    setValue(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    const patch: AddonsPatch = {
      contactForm: !!value.contactForm,
      gallery: !!value.gallery,
      menu: !!value.menu,
      pricelist: !!value.pricelist,
      aiChat: !!value.aiChat,
      booking: !!value.booking,
      // Nie true senden — Team bleibt vorerst nicht buchbar (Team-Panel fehlt).
      team: false,
    };
    updateAddons.mutate({ token, addOns: patch }, { onSuccess: onApplied });
  };

  return (
    <PanelFrame
      step="Schritt 6"
      title="Extras wählen"
      intro="Zusätzliche Bausteine für deine Website — jederzeit änderbar."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Fertig
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy}
            onClick={handleSave}
          >
            {busy ? "Bitte warten…" : "Speichern"}
          </button>
        </>
      }
    >
      <AddonsList value={value} onToggle={handleToggle} interval="yearly" />
      <p style={{ color: "var(--st-muted)", fontSize: "0.85rem" }}>
        Kontaktformular erscheint sofort in der Vorschau; KI-Chat &amp;
        Terminbuchung werden nach der Freischaltung aktiv (die Vorschau zeigt
        schon jetzt die Buttons). Team folgt.
      </p>
      {updateAddons.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateAddons.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
