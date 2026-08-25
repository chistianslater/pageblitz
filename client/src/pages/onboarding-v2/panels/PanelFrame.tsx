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

/** Gemeinsame Chrome aller Studio-Panels: sticky Kopfleiste (Rückweg + Schritt), Kopf (Kicker + Titel + Intro), Body, sticky Fuß mit Buttons. */
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
      {/* Sticky Kopfleiste (Studio-UI-Feedback 2026-08-25): Der Rückweg
          bleibt beim Scrollen sichtbar und trägt den Schritt als
          Orientierung („wo bin ich") mit. */}
      <div className="pb-studio-panel-head">
        <button
          type="button"
          className="pb-studio-back"
          onClick={onClose}
          aria-label="Zurück zur Übersicht"
        >
          ‹ Übersicht
        </button>
        <span className="pb-studio-panel-head-meta">
          {step} · {title}
        </span>
      </div>
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
      {/* Sticky (P2): Die Hauptaktion bleibt auch bei langem Panel-Inhalt
          (z. B. Fotos-Grid) ohne Scrollen erreichbar. */}
      <div className="pb-studio-panel-foot">{footer}</div>
    </section>
  );
}
