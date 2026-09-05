import React from "react";
import {
  CalendarCheck,
  Landmark,
  MessageSquare,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { GOAL_KEYS, GOALS, type GoalKey } from "@shared/onboardingV2/goal";

/**
 * Ziel der Website (2026-09-03, Übernahme aus vite-deploy-studio „GoalsStep"):
 * einmalige Karte nach dem Design-Gate. Fünf Kacheln, ein Klick, oder
 * „Später entscheiden". Der GoalPicker wird auch im Extras-Panel zum
 * Ändern des Ziels wiederverwendet.
 */

const GOAL_ICONS: Record<GoalKey, React.ReactNode> = {
  anrufe: <Phone />,
  anfragen: <MessageSquare />,
  termine: <CalendarCheck />,
  verkauf: <ShoppingBag />,
  praesenz: <Landmark />,
};

export function GoalPicker({
  value,
  onPick,
  disabled,
}: {
  value: GoalKey | null;
  onPick: (goal: GoalKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="pb-goal-grid" role="group" aria-label="Ziel der Website">
      {GOAL_KEYS.map(key => (
        <button
          key={key}
          type="button"
          className="pb-goal-tile"
          aria-pressed={value === key}
          disabled={disabled}
          onClick={() => onPick(key)}
        >
          <span className="pb-goal-icon" aria-hidden="true">
            {GOAL_ICONS[key]}
          </span>
          <strong>{GOALS[key].label}</strong>
          <span className="pb-goal-hint">{GOALS[key].hint}</span>
        </button>
      ))}
    </div>
  );
}

export function GoalStep({
  businessName,
  onPick,
  onSkip,
  pending,
  error,
}: {
  businessName: string;
  onPick: (goal: GoalKey) => void;
  onSkip: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <section className="pb-studio-gen pb-studio-gen--dark pb-studio-gen--startlike">
      <div className="pb-studio-gen-inner pb-goal-step">
        <p className="pb-studio-kicker">Eine Frage noch</p>
        <h1 className="pb-studio-title">
          Was soll die Website für {businessName} bringen?
        </h1>
        <p className="pb-goal-lead">
          Danach richten wir den wichtigsten Button aus und schlagen dir das
          passende Extra vor. Du kannst das jederzeit im Extras-Panel ändern.
        </p>
        <GoalPicker value={null} onPick={onPick} disabled={pending} />
        {error && (
          <p role="alert" className="pb-goal-error">
            {error}
          </p>
        )}
        <div className="pb-goal-actions">
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={pending}
            onClick={onSkip}
          >
            {pending ? "Bitte warten …" : "Später entscheiden"}
          </button>
        </div>
      </div>
    </section>
  );
}
