import React from "react";

interface PanelFrameProps {
  /** Kicker-Text über der Überschrift, z. B. "Schritt 2". */
  step: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  /** Buttons am Fuß des Panels (z. B. "Fertig" / "Übernehmen"). */
  footer: React.ReactNode;
}

/** Gemeinsame Chrome aller Studio-Panels: Kopf (Kicker + Titel + Intro), Body, Fuß mit Buttons. */
export function PanelFrame({
  step,
  title,
  intro,
  children,
  footer,
}: PanelFrameProps) {
  return (
    <section className="pb-studio-panel" aria-label={title}>
      <div>
        <p className="pb-studio-kicker">{step}</p>
        <h2 className="pb-studio-title" style={{ fontSize: "1.4rem" }}>
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
