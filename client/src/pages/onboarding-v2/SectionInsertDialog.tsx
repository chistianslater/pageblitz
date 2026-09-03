import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  token,
  doc,
  afterType,
  onInserted,
  onClose,
}: {
  token: string;
  doc: WebsiteDataV2;
  afterType: SectionType;
  /** Nach erfolgreichem Einfügen: Vorschau + State neu laden, Fokus auf die neue Sektion. */
  onInserted: (type: InsertableSectionType) => void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState<InsertableSectionType | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const insert = trpc.onboardingV2.insertSection.useMutation();

  const pick = (type: InsertableSectionType) => {
    setPending(type);
    setNotice(null);
    insert.mutate(
      { token, type, afterType },
      {
        onSuccess: result => {
          if (result.kind === "inserted") {
            onInserted(type);
          } else {
            setNotice(result.reason);
          }
        },
        onSettled: () => setPending(null),
      }
    );
  };

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
          disabled={pending !== null}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <SectionInsertChoices
        doc={doc}
        afterType={afterType}
        onPick={pick}
        pending={pending}
      />
      {notice && (
        <p className="pb-insert-notice" role="status">
          {notice}
        </p>
      )}
      {insert.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {insert.error.message}
        </p>
      )}
    </div>
  );
}
