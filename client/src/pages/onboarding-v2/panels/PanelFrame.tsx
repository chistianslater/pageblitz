import React from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import { usePanelFocus } from "./usePanelFocus";

interface PanelFrameProps {
  /** Kicker-Text über der Überschrift, z. B. "Schritt 2". */
  step: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  /** Buttons am Fuß des Panels (z. B. "Fertig" / "Übernehmen"). */
  footer: React.ReactNode;
  /** Checklisten-Eintrag, den dieses Panel bearbeitet — für Fokus-Management (siehe usePanelFocus). */
  panelId: ChecklistItemId;
  onClose: () => void;
}

/** Gemeinsame Chrome aller Studio-Panels: Kopf (Kicker + Titel + Intro), Body, Fuß mit Buttons. */
export function PanelFrame({
  step,
  title,
  intro,
  children,
  footer,
  panelId,
  onClose,
}: PanelFrameProps) {
  const headingRef = usePanelFocus(panelId, onClose);
  return (
    <section className="pb-studio-panel" aria-label={title}>
      <div>
        <p className="pb-studio-kicker">{step}</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="pb-studio-title"
          style={{ fontSize: "1.4rem" }}
        >
          {title}
        </h2>
        {intro && <p style={{ color: "var(--st-muted)" }}>{intro}</p>}
      </div>
      {children}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {footer}
      </div>
    </section>
  );
}
