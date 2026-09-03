import React from "react";
import type { SectionType, WebsiteDataV2 } from "@shared/siteContract/types";
import { SECTION_LABELS } from "@shared/onboardingV2/aiEdit";
import {
  insertCandidates,
  type InsertableSectionType,
} from "@shared/onboardingV2/sectionInsert";

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
}: {
  doc: WebsiteDataV2;
  afterType: SectionType;
  onPick: (type: InsertableSectionType) => void;
  pending: InsertableSectionType | null;
}) {
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
              disabled={candidate.present || (pending !== null && !busy)}
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
    </div>
  );
}

export function SectionInsertDialog({
  doc,
  afterType,
  onPick,
  onClose,
}: {
  doc: WebsiteDataV2;
  afterType: SectionType;
  /** Auswahl — der Aufrufer schließt den Dialog und zeigt das Skelett. */
  onPick: (type: InsertableSectionType) => void;
  onClose: () => void;
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
      />
    </div>
  );
}
