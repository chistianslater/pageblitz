import React from "react";
import type { AiDiffEntry } from "@shared/onboardingV2/aiEdit";

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
