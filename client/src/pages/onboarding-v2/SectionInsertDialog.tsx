import React from "react";
import type { SectionType, WebsiteDataV2 } from "@shared/siteContract/types";
import { SECTION_LABELS } from "@shared/onboardingV2/aiEdit";
import {
  insertAddonCandidates,
  insertCandidates,
  type InsertableSectionType,
} from "@shared/onboardingV2/sectionInsert";
import type { AddOnFlags } from "@shared/pricing";
import type { GatedSectionAddOn } from "@shared/onboardingV2/addonEditors";

/**
 * Plus-Zonen (2026-09-03): Dialog über der Vorschau, nachdem der Kunde
 * zwischen zwei Sektionen auf das Plus geklickt hat. Sechs faktenfreie
 * Sektionstypen zur Wahl; die KI schreibt den Inhalt, die Sektion erscheint
 * sofort — Rücknahme über den Rückgängig-Knopf.
 */

export function SectionInsertChoices({
  doc,
  afterType,
  onPick,
  pending,
  addOns,
  onPickAddon,
  addonPending = null,
}: {
  doc: WebsiteDataV2;
  afterType: SectionType;
  onPick: (type: InsertableSectionType) => void;
  pending: InsertableSectionType | null;
  /**
   * Kostenpflichtige Sektions-Extras (2026-09-04). Fehlt eines der beiden
   * Felder, bleibt der Dialog exakt wie zuvor — Design-Review und Tests
   * ohne Extras-Kontext sollen sich nicht ändern.
   */
  addOns?: AddOnFlags;
  onPickAddon?: (key: GatedSectionAddOn) => void;
  addonPending?: GatedSectionAddOn | null;
}) {
  const paid =
    addOns && onPickAddon
      ? insertAddonCandidates(addOns).filter(c => !c.active)
      : [];
  const busyAnywhere = pending !== null || addonPending !== null;
  return (
    <div className="pb-insert">
      <p className="pb-insert-lead">
        Neue Sektion nach „{SECTION_LABELS[afterType]}“ — die KI schreibt den
        Inhalt aus dem, was schon auf der Seite steht.
      </p>
      <div className="pb-insert-grid" role="group" aria-label="Sektionstyp">
        {insertCandidates(doc).map(candidate => {
          const busy = pending === candidate.type;
          return (
            <button
              key={candidate.type}
              type="button"
              className="pb-insert-choice"
              disabled={candidate.present || (busyAnywhere && !busy)}
              aria-busy={busy || undefined}
              onClick={() => onPick(candidate.type)}
            >
              <strong>{candidate.label}</strong>
              <span>
                {candidate.present
                  ? "schon vorhanden"
                  : busy
                    ? "Wird geschrieben …"
                    : candidate.hint}
              </span>
            </button>
          );
        })}
      </div>
      {paid.length > 0 && (
        <>
          <p className="pb-insert-lead pb-insert-paid-lead">
            Mehr Inhalt, kostenpflichtig — jederzeit wieder abbestellbar.
          </p>
          <div
            className="pb-insert-grid"
            role="group"
            aria-label="Kostenpflichtige Extras"
          >
            {paid.map(candidate => {
              const busy = addonPending === candidate.key;
              return (
                <button
                  key={candidate.key}
                  type="button"
                  className="pb-insert-choice pb-insert-paid"
                  disabled={busyAnywhere && !busy}
                  aria-busy={busy || undefined}
                  onClick={() => onPickAddon?.(candidate.key)}
                >
                  <strong>
                    {candidate.label}
                    <em className="pb-insert-price">
                      {candidate.priceLabel}
                      <span> pro Monat</span>
                    </em>
                  </strong>
                  <span>
                    {busy ? "Wird eingeschaltet …" : candidate.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function SectionInsertDialog({
  doc,
  afterType,
  onPick,
  onClose,
  addOns,
  onPickAddon,
  addonPending = null,
}: {
  doc: WebsiteDataV2;
  afterType: SectionType;
  /** Auswahl — der Aufrufer schließt den Dialog und zeigt das Skelett. */
  onPick: (type: InsertableSectionType) => void;
  onClose: () => void;
  addOns?: AddOnFlags;
  onPickAddon?: (key: GatedSectionAddOn) => void;
  addonPending?: GatedSectionAddOn | null;
}) {
  return (
    <div
      className="pb-insert-dialog"
      role="dialog"
      aria-label="Sektion einfügen"
    >
      <div className="pb-insert-dialog-head">
        <strong>Sektion einfügen</strong>
        <button
          type="button"
          className="pb-studio-assistant-close"
          aria-label="Schließen"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <SectionInsertChoices
        doc={doc}
        afterType={afterType}
        onPick={onPick}
        pending={null}
        addOns={addOns}
        onPickAddon={onPickAddon}
        addonPending={addonPending}
      />
    </div>
  );
}
