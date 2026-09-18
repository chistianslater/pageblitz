import React from "react";
import type { StepperItem, WizardStep } from "./studioLogic";

interface StudioStepperProps {
  items: StepperItem[];
  onSelect: (id: WizardStep) => void;
}

/**
 * Schritt-Leiste oben in der Rail (Betreiber-Wunsch 2026-09-18): alle sieben
 * Schritte auf einen Blick, statt einer Überschrift mit Erklärtext. Häkchen =
 * erledigt, Volt-Ring = gerade offen. Jeder Punkt ist anklickbar und öffnet
 * den Schritt direkt.
 */
export function StudioStepper({ items, onSelect }: StudioStepperProps) {
  return (
    <nav className="pb-studio-stepper" aria-label="Deine Schritte">
      <ol>
        {items.map(item => (
          <li key={item.id} data-status={item.status}>
            <button
              type="button"
              aria-current={item.status === "current" ? "step" : undefined}
              aria-label={`Schritt ${item.number}: ${item.label}${
                item.status === "done" ? " (erledigt)" : ""
              }`}
              onClick={() => onSelect(item.id)}
            >
              <span className="pb-studio-stepper-dot" aria-hidden="true">
                {item.status === "done" ? "✓" : item.number}
              </span>
              <span className="pb-studio-stepper-label" aria-hidden="true">
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
