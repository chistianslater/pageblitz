import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface SplashIntroProps {
  businessName: string;
  /** Ausblend-Phase läuft (DesignSplash hält das Overlay so lange im Baum). */
  leaving: boolean;
  onDismiss: () => void;
}

/**
 * Dunkles Intro-Overlay über der Design-Auswahl (Betreiber-Wunsch
 * 2026-09-18): „Deine Website ist fertig." → „Welche Richtung passt zu dir?"
 * → „Jetzt auswählen". Die Staffelung liegt in studio.css (`data-step`),
 * bei prefers-reduced-motion steht alles sofort. Klick irgendwohin oder
 * Esc schließt ebenfalls — niemand soll warten müssen.
 */
export function SplashIntro({
  businessName,
  leaving,
  onDismiss,
}: SplashIntroProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className="pb-splash-intro"
      data-leaving={leaving}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pb-splash-intro-title"
      onClick={onDismiss}
    >
      <div className="pb-splash-intro-glow" aria-hidden="true" />
      <div className="pb-splash-intro-inner">
        <p className="pb-splash-intro-line" data-step="1">
          Deine Website ist fertig.
        </p>
        <h1
          id="pb-splash-intro-title"
          className="pb-splash-intro-line pb-splash-intro-title"
          data-step="2"
        >
          {businessName}, welche Richtung passt zu dir?
        </h1>
        <button
          ref={buttonRef}
          type="button"
          className="pb-studio-btn pb-splash-intro-cta"
          data-step="3"
          onClick={event => {
            event.stopPropagation();
            onDismiss();
          }}
        >
          Jetzt auswählen <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
