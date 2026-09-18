import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  STUDIO_TOUR_STEPS,
  clampTourCard,
  shouldStartTour,
  spotlightRect,
  tourStorageKey,
  type Rect,
} from "./studioTourLogic";

interface StudioTourProps {
  token: string;
  status: string;
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string): void {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Privater Modus o. ä.: dann erscheint die Tour beim nächsten Besuch
    // eben noch einmal — kein Grund, den Nutzer zu stören.
  }
}

/** Sichtbares Ziel eines Ankers — `display:none` (Mobil-Tabs) liefert 0×0 und zählt als nicht vorhanden. */
function anchorRect(anchor: string | null): Rect | null {
  if (!anchor) return null;
  const element = document.querySelector<HTMLElement>(
    `[data-tour="${anchor}"]`
  );
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Einmalige Tour beim ersten Studio-Besuch pro Vorschau (Test-Feedback
 * 2026-09-18). Vier Karten: Schritte links, Vorschau mit Layout-Varianten,
 * KI-Assistent, Kauf erst zum Schluss.
 *
 * Seit dem Betreiber-Feedback am selben Tag dunkelt ein Spotlight alles
 * außer dem jeweiligen Ziel ab; der Volt-Rahmen gleitet von Schritt zu
 * Schritt. Ist das Ziel nicht sichtbar (Mobil zeigt Rail ODER Vorschau) oder
 * gibt es keins, wird das ganze Fenster abgedunkelt und die Karte steht
 * mittig.
 */
export function StudioTour({ token, status }: StudioTourProps) {
  const key = tourStorageKey(token);
  const [open, setOpen] = useState(() =>
    shouldStartTour(status, readStored(key))
  );
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: 16,
    top: 16,
  });
  const [spot, setSpot] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const step = STUDIO_TOUR_STEPS[index] ?? null;

  // Spotlight und Karte gemeinsam platzieren: Die Karte legt sich neben den
  // (etwas größeren) Spotlight-Rahmen, nicht neben das nackte Ziel.
  useLayoutEffect(() => {
    if (!open || !step) return;
    const place = () => {
      const card = cardRef.current;
      if (!card) return;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const nextSpot = spotlightRect(anchorRect(step.anchor), viewport);
      setSpot(nextSpot);
      setPosition(
        clampTourCard(
          nextSpot,
          { width: card.offsetWidth, height: card.offsetHeight },
          viewport
        )
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();
  }, [open, index]);

  if (!open || !step) return null;

  const finish = () => {
    writeStored(key);
    setOpen(false);
  };
  const last = index === STUDIO_TOUR_STEPS.length - 1;
  const spotStyle = spot
    ? { left: spot.left, top: spot.top, width: spot.width, height: spot.height }
    : undefined;

  return (
    <>
      {/* Abdunkelung mit Aussparung: ein Rahmen, dessen großer Schatten den
          Rest des Fensters deckt. Klicks in den dunklen Bereich beenden die
          Tour nicht versehentlich — sie gehen ins Leere. */}
      <div
        className="pb-studio-tour-dim"
        data-full={spot === null}
        aria-hidden="true"
        style={spotStyle}
      />
      <div
        ref={cardRef}
        className="pb-studio-tour"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pb-studio-tour-title"
        tabIndex={-1}
        style={{ left: position.left, top: position.top }}
        onKeyDown={event => {
          if (event.key === "Escape") finish();
        }}
      >
        <p className="pb-studio-kicker">
          Kurze Einführung · {index + 1} von {STUDIO_TOUR_STEPS.length}
        </p>
        <h2 id="pb-studio-tour-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="pb-studio-tour-actions">
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={finish}
          >
            Überspringen
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            onClick={() => (last ? finish() : setIndex(index + 1))}
          >
            {last ? "Los geht's" : "Weiter"}
          </button>
        </div>
      </div>
    </>
  );
}
