import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import { usePreviewViewport } from "./usePreviewViewport";
import { PreviewFrame, buildPreviewSrc } from "./PreviewFrame";
import { DesignQuickControls } from "./DesignQuickControls";
import {
  introStorageKey,
  neighbourOf,
  orderDirections,
  shouldShowIntro,
} from "./designSplashLogic";
import { SplashIntro } from "./SplashIntro";

/** Dauer der Overlay-Ausblendung — muss zur CSS-Animation pb-splash-intro-out passen. */
const INTRO_EXIT_MS = 700;

function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string): void {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Ohne Storage erscheint das Intro beim Reload eben nochmal.
  }
}

interface Candidate {
  id: PackId;
  name: string;
  essence: string;
}

interface DesignSplashProps {
  token: string;
  businessName: string;
  currentPackId: PackId;
  accent?: string | null;
  colorOverrides?: Record<string, string>;
  fontPairId?: string | null;
  previewVersion: number;
  onApplied: () => void;
  onSelectionApplied?: () => void;
  onConfirmed: () => void;
}

function AlternativePreview({
  token,
  packId,
  version,
}: {
  token: string;
  packId: PackId;
  version: number;
}) {
  const ref = usePreviewViewport("desktop");
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="pb-design-side-frame"
      aria-hidden="true"
    >
      <iframe
        src={buildPreviewSrc({ token, packOverride: packId, version })}
        title="Alternative mit deinen Inhalten"
        loading="lazy"
        tabIndex={-1}
      />
    </span>
  );
}

/**
 * Vollbild-Design-Splash direkt nach der Generierung (und seit 2026-09-18
 * auch das Ziel des Postkarten-Kurzlinks): Alternative links ← aktive
 * Live-Vorschau → Alternative rechts, darunter Farbe/Schrift.
 *
 * Test-Feedback 2026-09-18: Die Alternativen wurden übersehen und die
 * Bestätigung klang endgültig. Deshalb: Richtungs-Leiste über der Bühne,
 * sichtbar beschriftete Seitenkarten, „weiter" statt „verwenden" und ein
 * Satz, dass sich alles noch ändern lässt.
 */
export function DesignSplash({
  token,
  businessName,
  currentPackId,
  accent = null,
  colorOverrides,
  fontPairId = null,
  previewVersion,
  onApplied,
  onSelectionApplied = onApplied,
  onConfirmed,
}: DesignSplashProps) {
  const [round, setRound] = useState(0);
  const [activePackId, setActivePackId] = useState(currentPackId);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busyId, setBusyId] = useState<PackId | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const introKey = introStorageKey(token);
  const [introOpen, setIntroOpen] = useState(() =>
    shouldShowIntro(readSession(introKey))
  );
  // Ausblenden in zwei Schritten: erst die Exit-Animation (CSS,
  // data-leaving), dann aus dem Baum — sonst würde das Overlay hart
  // verschwinden. Bei reduced-motion sofort weg.
  const [introLeaving, setIntroLeaving] = useState(false);
  const dismissIntro = useCallback(() => {
    writeSession(introKey);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setIntroOpen(false);
      return;
    }
    setIntroLeaving(true);
    window.setTimeout(() => setIntroOpen(false), INTRO_EXIT_MS);
  }, [introKey]);
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
    count: 3,
  });
  const select = trpc.onboardingV2.selectStylePack.useMutation();

  useEffect(() => setActivePackId(currentPackId), [currentPackId]);

  const directions = orderDirections<Candidate>(
    candidates.data?.candidates ?? [],
    activePackId,
    id => {
      const constitution = getConstitution(id as PackId);
      return {
        id: id as PackId,
        name: constitution.name,
        essence: constitution.essence,
      };
    }
  );
  const activeIndex = directions.findIndex(d => d.id === activePackId);
  const previous = neighbourOf(directions, activePackId, -1);
  const next = neighbourOf(directions, activePackId, 1);

  const pick = (packId: PackId, direction: "left" | "right" = "right") => {
    if (busyId || packId === activePackId) return;
    setSlideDirection(direction);
    setBusyId(packId);
    select.mutate(
      { token, packId, confirm: false },
      {
        onSuccess: () => {
          setActivePackId(packId);
          onSelectionApplied();
        },
        onSettled: () => setBusyId(null),
      }
    );
  };

  const confirm = () => {
    setBusyId(activePackId);
    select.mutate(
      { token, packId: activePackId, confirm: true },
      {
        onSuccess: () => {
          onApplied();
          onConfirmed();
        },
        onSettled: () => setBusyId(null),
      }
    );
  };

  const sideCard = (candidate: Candidate | null, side: "left" | "right") =>
    candidate ? (
      <button
        type="button"
        className="pb-design-side"
        data-side={side}
        onClick={() => pick(candidate.id, side)}
        disabled={busyId !== null}
        aria-label={`${candidate.name} als Designrichtung ansehen`}
      >
        <AlternativePreview
          token={token}
          packId={candidate.id}
          version={previewVersion}
        />
        <span className="pb-design-side-pill" aria-hidden="true">
          Alternative ansehen
        </span>
      </button>
    ) : (
      <span />
    );

  return (
    <section
      className="pb-studio pb-studio-gen pb-studio-gen--dark pb-design-splash"
      data-intro={introOpen}
    >
      {introOpen && (
        <SplashIntro
          businessName={businessName}
          leaving={introLeaving}
          onDismiss={dismissIntro}
        />
      )}
      <div className="pb-design-splash-inner" aria-hidden={introOpen}>
        <header className="pb-design-splash-head">
          <div>
            <p className="pb-studio-kicker">Deine Website ist fertig</p>
            {/* Die große Frage stellt das Intro-Overlay; hier bleibt der
                Kopf bewusst flach, damit die drei Vorschauen höher rücken. */}
            <h1 className="pb-studio-title pb-design-splash-title">
              Welche Richtung passt zu {businessName}?
            </h1>
            <p>
              Links und rechts: Alternativen mit deinen Inhalten. Farbe, Schrift
              und Texte passt du gleich im Studio an — nichts ist endgültig.
            </p>
          </div>
          <div className="pb-studio-seg pb-studio-seg--even" aria-label="Gerät">
            <button
              type="button"
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              Mobil
            </button>
          </div>
        </header>

        {directions.length > 1 && (
          <div
            className="pb-studio-seg pb-design-tabs"
            role="group"
            aria-label="Designrichtungen"
          >
            {directions.map((direction, index) => (
              <button
                key={direction.id}
                type="button"
                aria-pressed={direction.id === activePackId}
                disabled={busyId !== null}
                onClick={() =>
                  pick(direction.id, index < activeIndex ? "left" : "right")
                }
              >
                <span className="pb-design-tabs-num" aria-hidden="true">
                  {index + 1}
                </span>
                {direction.name}
              </button>
            ))}
          </div>
        )}

        <div className="pb-design-stage">
          {sideCard(previous, "left")}
          <div className="pb-design-center" data-enter={slideDirection}>
            {/* Zeile „‹ Name · Aktive Richtung ›" entfernt (Betreiber-Wunsch
                2026-09-19): Der dunkle Tab zeigt die aktive Richtung,
                gewechselt wird über Tabs oder Seitenkarten. Der Ladezustand
                bleibt für Screenreader hörbar. */}
            <span className="sr-only" role="status">
              {busyId ? "Design wird geladen …" : ""}
            </span>
            <div className="pb-design-preview-shell">
              <PreviewFrame
                token={token}
                version={previewVersion}
                device={device}
                packOverride={activePackId}
              />
              <DesignQuickControls
                token={token}
                packId={activePackId}
                accent={accent}
                colorOverrides={colorOverrides}
                fontPairId={fontPairId}
                onApplied={onApplied}
              />
            </div>
            <button
              type="button"
              className="pb-studio-btn pb-design-confirm"
              onClick={confirm}
              disabled={busyId !== null}
            >
              {busyId ? "Einen Moment …" : "Mit diesem Design weiter"}
            </button>
            <p className="pb-design-confirm-note">
              Im nächsten Schritt passt du Fotos, Texte und Farben an — das
              Design lässt sich dort jederzeit wechseln.
            </p>
          </div>
          {sideCard(next, "right")}
        </div>

        <button
          type="button"
          className="pb-design-more"
          onClick={() => setRound(value => value + 1)}
          disabled={busyId !== null || candidates.isFetching}
        >
          Andere Richtungen zeigen
        </button>

        {(select.error || candidates.error) && (
          <p role="alert" className="pb-design-error">
            {select.error?.message ?? candidates.error?.message}
          </p>
        )}
      </div>
    </section>
  );
}
