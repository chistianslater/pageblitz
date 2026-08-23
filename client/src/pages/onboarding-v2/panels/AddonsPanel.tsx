import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { AddonsPatch, TeamPatch } from "@shared/onboardingV2/patches";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
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
import { TeamEditor } from "./TeamEditor";
import { validateTeam, type TeamValue } from "./teamLogic";

/**
 * Bindbare Add-ons: Seit Plan B3 schaltet der Zahlungs-Webhook auch KI-Chat
 * und Terminbuchung frei, seit Plan B5 zusätzlich Team — alle sieben Extras
 * zählen damit in Preis und Summe. `BOOKABLE_ADDON_KEYS` und `sanitizeAddOns`
 * kommen aus @shared/pricing (Finding I1) — dieselbe Quelle der Wahrheit wie
 * der Server (routerCommerce.ts), damit UI-Sperre und serverseitige
 * Ablehnung nie auseinanderlaufen können. `COMING_SOON_KEYS` bleibt als
 * generischer Mechanismus stehen — seit Plan B5 Task 2 sind alle sieben
 * Extras buchbar, die Liste ist also aktuell leer (keine Zeile rendert).
 */
const TOGGLEABLE_KEYS: readonly AddOnKey[] = BOOKABLE_ADDON_KEYS;
const COMING_SOON_KEYS: AddOnKey[] = ADDON_KEYS.filter(
  k => !BOOKABLE_ADDON_KEYS.includes(k)
);

/** Reine Ableitung: bestehende Team-Sektion → Entwurf; ohne Sektion eine leere Mitgliederliste (analog offerFromDoc in OfferPanel.tsx). */
export function teamFromDoc(doc: WebsiteDataV2): TeamValue {
  const team = doc.sections.find(
    (s): s is SectionOf<"team"> => s.type === "team"
  );
  if (!team) return { members: [] };
  return {
    ...(team.headline !== undefined ? { headline: team.headline } : {}),
    members: team.members,
  };
}

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
  doc: WebsiteDataV2;
  addOns: AddOnFlags;
  onApplied: () => void;
  onClose: () => void;
}

export function AddonsPanel({
  token,
  doc,
  addOns,
  onApplied,
  onClose,
}: AddonsPanelProps) {
  const [value, setValue] = useState<AddOnFlags>(() => sanitizeAddOns(addOns));
  const [team, setTeam] = useState<TeamValue>(() => teamFromDoc(doc));

  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  const updateTeam = trpc.onboardingV2.updateTeam.useMutation();
  const busy = updateAddons.isPending;
  const teamBusy = updateTeam.isPending;
  const teamErrors = validateTeam(team.members);

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
      // Team ist seit Plan B5 buchbar (BOOKABLE_ADDON_KEYS, @shared/pricing)
      // — der Schalter setzt hier nur das Abrechnungs-Flag `addOnTeam`.
      // Die Mitglieder selbst pflegt der "Team pflegen"-Unterbereich unten
      // (eigene "Übernehmen"-Mutation onboardingV2.updateTeam), analog zum
      // getrennten Verwaltungsort von Galerie-Flag (hier) und
      // Galerie-Inhalt (Fotos-Panel).
      team: !!value.team,
    };
    updateAddons.mutate({ token, addOns: patch }, { onSuccess: onApplied });
  };

  const handleTeamSave = () => {
    const patch: TeamPatch = {
      members: team.members,
      ...(team.headline !== undefined ? { headline: team.headline } : {}),
    };
    updateTeam.mutate({ token, patch }, { onSuccess: onApplied });
  };

  return (
    <PanelFrame
      step="Schritt 6"
      title="Extras wählen"
      panelId="addons"
      onClose={onClose}
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
        schon jetzt die Buttons).
      </p>
      {updateAddons.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateAddons.error.message}
        </p>
      )}
      {value.team && (
        <div className="pb-studio-rows">
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Team pflegen
          </h3>
          <TeamEditor token={token} value={team} onChange={setTeam} />
          <button
            type="button"
            className="pb-studio-btn"
            disabled={teamBusy || teamErrors.length > 0}
            onClick={handleTeamSave}
          >
            {teamBusy ? "Bitte warten…" : "Übernehmen"}
          </button>
          {updateTeam.error && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              {updateTeam.error.message}
            </p>
          )}
        </div>
      )}
    </PanelFrame>
  );
}
