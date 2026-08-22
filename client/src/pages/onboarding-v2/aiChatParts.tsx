import React from "react";
import type { AiDiffEntry } from "@shared/onboardingV2/aiEdit";

/** Deckt sich mit dem Server-Schema (`z.string().min(3)`, server/onboardingV2/router.ts aiEdit-Input). */
export const MIN_AI_MESSAGE_LENGTH = 3;

export interface SendGuardState {
  text: string;
  aiEditPending: boolean;
  applyPending: boolean;
  discardPending: boolean;
}

/**
 * Reine Sende-Sperre für den KI-Chat: Text muss die Mindestlänge erreichen
 * UND es darf weder eine `aiEdit`-Anfrage noch ein laufendes
 * Übernehmen/Verwerfen des aktuellen Vorschlags offen sein. Letzteres
 * verhindert, dass eine neue Anfrage während eines laufenden
 * `applyAiEdit`/`discardAiEdit` gesendet wird — sonst würde `AiChat` beim
 * Eintreffen der neuen Antwort deren Fehlerzustand zurücksetzen
 * (`.reset()`), während die alte Mutation noch auf ihre Antwort wartet.
 */
export function canSendMessage({
  text,
  aiEditPending,
  applyPending,
  discardPending,
}: SendGuardState): boolean {
  return (
    text.trim().length >= MIN_AI_MESSAGE_LENGTH &&
    !aiEditPending &&
    !applyPending &&
    !discardPending
  );
}

interface AiDiffListProps {
  diff: AiDiffEntry[];
}

/**
 * Reine Darstellung eines Inhalts-Vorschlags aus dem KI-Chat: je Diff-
 * Eintrag Label + vorher → nachher. Leere Liste (KI hat nichts geändert,
 * das Dokument aber gültig zurückgegeben) → Hinweistext statt leerer <ul>.
 */
export function AiDiffList({ diff }: AiDiffListProps) {
  if (diff.length === 0) {
    return <p className="pb-studio-ai-empty">Keine Änderungen erkannt.</p>;
  }
  return (
    <ul className="pb-studio-ai-diff">
      {diff.map(entry => (
        <li key={entry.path} className="pb-studio-ai-diff-item">
          <span className="pb-studio-ai-diff-label">{entry.label}</span>
          <span className="pb-studio-ai-diff-values">
            <span className="pb-studio-ai-diff-before">
              {entry.before || "—"}
            </span>
            <span aria-hidden="true"> → </span>
            <span className="pb-studio-ai-diff-after">
              {entry.after || "—"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

interface AiStyleCardProps {
  name: string;
  reason: string;
  onView: () => void;
}

/** Reine Darstellung eines Stil-Vorschlags aus dem KI-Chat (Design-Wünsche → Pack-Vorschlag, nie Farb-/Font-Patch). */
export function AiStyleCard({ name, reason, onView }: AiStyleCardProps) {
  return (
    <div className="pb-studio-ai-style-card">
      <p>
        Stil-Vorschlag: <strong>{name}</strong> — {reason}
      </p>
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        onClick={onView}
      >
        Ansehen
      </button>
    </div>
  );
}
