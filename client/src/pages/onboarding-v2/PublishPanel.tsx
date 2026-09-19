import React from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { StudioState } from "../../../../server/onboardingV2/state";
import { PRICING, formatEuro } from "@shared/pricing";
import { PanelFrame } from "./panels/PanelFrame";
import { CheckoutBar } from "./CheckoutBar";

interface PublishTeaserProps {
  onOpen: () => void;
}

/**
 * Ruhiger letzter Eintrag unter der Checkliste (Test-Feedback 2026-09-18:
 * „im Studio ist man direkt schon beim Zahlen"). Zeigt nur Preis ab und
 * dass der Kauf der letzte Schritt ist — Abrechnung, E-Mail und Button
 * liegen erst im Panel dahinter.
 */
export function PublishTeaser({ onOpen }: PublishTeaserProps) {
  return (
    <button
      type="button"
      id="pb-checklist-publish"
      className="pb-studio-publish-teaser"
      onClick={onOpen}
    >
      <span className="pb-studio-check-num" aria-hidden="true">
        ★
      </span>
      <span>
        <span className="pb-studio-check-title">Website freischalten</span>
        <span className="pb-studio-check-hint">
          Zum Schluss, wenn alles passt. Ab{" "}
          {formatEuro(PRICING.base.yearly)}/Monat — bis dahin ist nichts
          verbindlich.
        </span>
      </span>
      <span className="pb-studio-check-flag">Zum Schluss</span>
    </button>
  );
}

interface PublishPanelProps {
  state: StudioState;
  token: string;
  onStateChanged: () => void;
  onOpenPanel: (id: ChecklistItemId) => void;
  onClose: () => void;
}

/** Freischalten als eigenes Panel mit Rückweg — die bisherige CheckoutBar bleibt der Inhalt. */
export function PublishPanel({
  state,
  token,
  onStateChanged,
  onOpenPanel,
  onClose,
}: PublishPanelProps) {
  return (
    <PanelFrame
      step="Letzter Schritt"
      title="Website freischalten"
      intro="Ändern kannst du danach weiterhin alles."
      panelId="publish"
      onClose={onClose}
      // Kein Fuß mit „Zurück zur Übersicht" (Audit 2026-09-19): Den Rückweg
      // trägt die Kopfleiste; unten klebt stattdessen der Kaufknopf.
    >
      <CheckoutBar
        state={state}
        token={token}
        onStateChanged={onStateChanged}
        onOpenPanel={onOpenPanel}
      />
    </PanelFrame>
  );
}
