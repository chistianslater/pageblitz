import React from "react";
import {
  WIZARD_STEP_TITLES,
  WIZARD_TOTAL_STEPS,
  wizardStepNumber,
  type WizardStep,
} from "./studioLogic";

interface WizardBarProps {
  /** Aktiver Schritt des geführten Modus. */
  step: WizardStep;
  /** Erledigte Panel-Schritte (0..5) — treibt den Fortschrittsbalken. */
  doneCount: number;
  /** Verlässt den geführten Modus in die freie Übersicht (Checkliste). */
  onExit: () => void;
}

/**
 * Kopfleiste des geführten Modus (Studio-Wizard): zeigt „Schritt X von 6",
 * den Schritttitel und einen Fortschrittsbalken, damit jederzeit klar ist,
 * wo man ist und was noch kommt. „Übersicht" wechselt jederzeit in den
 * freien Modus — der Fortschritt lebt in der Checkliste, nichts geht
 * verloren.
 */
export function WizardBar({ step, doneCount, onExit }: WizardBarProps) {
  const current = wizardStepNumber(step);
  const progress = Math.min(
    100,
    Math.round((doneCount / (WIZARD_TOTAL_STEPS - 1)) * 100)
  );
  return (
    <div className="pb-studio-wizard" data-step={step}>
      <div className="pb-studio-wizard-top">
        <p className="pb-studio-kicker">
          Geführt · Schritt {current} von {WIZARD_TOTAL_STEPS}
        </p>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          onClick={onExit}
        >
          Übersicht
        </button>
      </div>
      <h2 className="pb-studio-wizard-title">{WIZARD_STEP_TITLES[step]}</h2>
      <div
        className="pb-studio-wizard-progress"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={WIZARD_TOTAL_STEPS}
        aria-label={`Schritt ${current} von ${WIZARD_TOTAL_STEPS}: ${WIZARD_STEP_TITLES[step]}`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
