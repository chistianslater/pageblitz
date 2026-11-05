import React from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { StudioState } from "../../../../server/onboardingV2/state";
import { PRICE_FROM_INLINE } from "@shared/pricingText";
import { PanelFrame } from "./panels/PanelFrame";
import { CheckoutBar } from "./CheckoutBar";
import type { StudioFunnelEvent } from "@shared/onboardingV2/funnel";

interface PublishTeaserProps {
  onOpen: () => void;
  hasEmail: boolean;
}

/**
 * Ruhiger Einstieg in den Abschluss: Vor der E-Mail-Sicherung kostenlos und
 * unverbindlich, danach als letzter Eintrag unter der Checkliste mit Preis.
 * Abrechnung, E-Mail und Kaufknopf liegen erst im Panel dahinter.
 */
export function PublishTeaser({ onOpen, hasEmail }: PublishTeaserProps) {
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
        <span className="pb-studio-check-title">
          {hasEmail ? "Website freischalten" : "Entwurf per E-Mail sichern"}
        </span>
        <span className="pb-studio-check-hint">
          {hasEmail
            ? `Zum Schluss, wenn alles passt. Live ${PRICE_FROM_INLINE} — bis dahin ist nichts verbindlich.`
            : "Schick dir deinen persönlichen Link und mach später genau hier weiter. Kostenlos und unverbindlich."}
        </span>
      </span>
      <span className="pb-studio-check-flag">
        {hasEmail ? "Zum Schluss" : "Kostenlos"}
      </span>
    </button>
  );
}

interface PublishPanelProps {
  state: StudioState;
  token: string;
  onStateChanged: () => void;
  onOpenPanel: (id: ChecklistItemId) => void;
  onClose: () => void;
  onFunnelEvent?: (event: StudioFunnelEvent) => void;
}

/** Freischalten als eigenes Panel mit Rückweg — die bisherige CheckoutBar bleibt der Inhalt. */
export function PublishPanel({
  state,
  token,
  onStateChanged,
  onOpenPanel,
  onClose,
  onFunnelEvent,
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
        onFunnelEvent={onFunnelEvent}
      />
    </PanelFrame>
  );
}
