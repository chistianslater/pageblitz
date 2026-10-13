import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { DesignSystemId } from "@shared/designSystems/types";
import { usePreviewViewport } from "./usePreviewViewport";
import { PreviewFrame, buildPreviewSrc } from "./PreviewFrame";
import { PaletteChooser } from "./PaletteChooser";
import {
  introStorageKey,
  neighbourOf,
  orderDirections,
  shouldShowIntro,
} from "./designSplashLogic";
import {
  initialChoice,
  systemCandidateFor,
  type DesignChoice,
  type SystemCandidate,
} from "./designChoice";
import { SplashIntro } from "./SplashIntro";
import { tagStudioSession, trackStudioEvent } from "@/lib/studioEvents";

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

/** Eine Richtung der Bühne = ein Designsystem. */
interface Direction {
  id: string;
  name: string;
  essence: string;
  candidate: SystemCandidate;
}

function toDirection(candidate: SystemCandidate): Direction {
  return {
    id: candidate.id,
    name: candidate.name,
    essence: candidate.essence,
    candidate,
  };
}

interface DesignSplashProps {
  token: string;
  businessName: string;
  /** Designsystem der Seite und seine Farbstimmung. */
  currentSystem?: DesignSystemId | null;
  currentPalette?: string | null;
  previewVersion: number;
  onApplied: () => void;
  onSelectionApplied?: () => void;
  onConfirmed: () => void;
}

function AlternativePreview({
  token,
  version,
  system,
  palette,
}: {
  token: string;
  version: number;
  system: DesignSystemId;
  palette?: string;
}) {
  const ref = usePreviewViewport("desktop");
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="pb-design-side-frame"
      aria-hidden="true"
    >
      <iframe
        src={buildPreviewSrc({ token, version, system, palette })}
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
 * Live-Vorschau → Alternative rechts, darunter die Farbstimmungen.
 *
 * Test-Feedback 2026-09-18: Die Alternativen wurden übersehen und die
 * Bestätigung klang endgültig. Deshalb: Richtungs-Leiste über der Bühne,
 * sichtbar beschriftete Seitenkarten, „weiter" statt „verwenden" und ein
 * Satz, dass sich alles noch ändern lässt.
 */
export function DesignSplash({
  token,
  businessName,
  currentSystem = null,
  currentPalette = null,
  previewVersion,
  onApplied,
  onSelectionApplied = onApplied,
  onConfirmed,
}: DesignSplashProps) {
  const [round, setRound] = useState(0);
  const startChoice = (): DesignChoice | null =>
    initialChoice({ system: currentSystem, palette: currentPalette });
  const [active, setActive] = useState<DesignChoice | null>(startChoice);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  /** Farbstimmung, die auf einer Systemkarte am Rand gerade angesehen wird. */
  const [sidePalettes, setSidePalettes] = useState<Record<string, string>>({});
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
    trackStudioEvent("intro_geschlossen");
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
  });
  const utils = trpc.useUtils();
  // Nach jedem Wechsel bietet der Server andere Kandidaten an (das aktuelle
  // System fällt heraus) — die zwischengespeicherte Antwort wäre veraltet.
  const selectSystem = trpc.onboardingV2.selectDesignSystem.useMutation({
    onSuccess: () => utils.onboardingV2.getStyleCandidates.invalidate({ token }),
  });

  useEffect(
    () => setActive(startChoice()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSystem, currentPalette]
  );

  const activeKey = active?.id ?? "";
  const directions = orderDirections<Direction>(
    (candidates.data?.candidates ?? []).map(toDirection),
    activeKey,
    id => {
      const system = systemCandidateFor(id as DesignSystemId);
      return system ? toDirection(system) : null;
    }
  );
  const activeIndex = directions.findIndex(d => d.id === activeKey);
  const previous = neighbourOf(directions, activeKey, -1);
  const next = neighbourOf(directions, activeKey, 1);
  const activeSystem = active ? systemCandidateFor(active.id) : null;

  const sidePaletteOf = (candidate: SystemCandidate): string | undefined =>
    sidePalettes[candidate.id] ?? candidate.palettes[0]?.id;

  const pick = (direction: Direction, side: "left" | "right" = "right") => {
    if (busyKey || direction.id === activeKey) return;
    setSlideDirection(side);
    setBusyKey(direction.id);
    const candidate = direction.candidate;
    const palette = sidePaletteOf(candidate);
    selectSystem.mutate(
      { token, system: candidate.id, palette, confirm: false },
      {
        onSuccess: () => {
          trackStudioEvent("design_angesehen");
          setActive({
            id: candidate.id,
            palette: palette ?? candidate.palettes[0]?.id ?? "",
          });
          onSelectionApplied();
        },
        onSettled: () => setBusyKey(null),
      }
    );
  };

  /** Farbstimmung der aktiven Richtung wechseln — sofort sichtbar, sofort gespeichert. */
  const changePalette = (palette: string) => {
    if (!active || busyKey) return;
    const before = active;
    setActive({ ...active, palette });
    setBusyKey(activeKey);
    selectSystem.mutate(
      { token, system: active.id, palette, confirm: false },
      {
        onSuccess: () => onSelectionApplied(),
        onError: () => setActive(before),
        onSettled: () => setBusyKey(null),
      }
    );
  };

  const confirm = () => {
    if (!active) return;
    setBusyKey(activeKey);
    selectSystem.mutate(
      { token, system: active.id, palette: active.palette, confirm: true },
      {
        onSuccess: () => {
          // Gewählte Richtung statt Start-Design als Tag für alles Weitere.
          tagStudioSession({ design: active.id });
          trackStudioEvent("design_bestaetigt");
          onApplied();
          onConfirmed();
        },
        onSettled: () => setBusyKey(null),
      }
    );
  };

  const sideCard = (direction: Direction | null, side: "left" | "right") => {
    if (!direction) return <span />;
    const candidate = direction.candidate;
    const button = (
      <button
        type="button"
        className="pb-design-side"
        data-side={side}
        onClick={() => pick(direction, side)}
        disabled={busyKey !== null}
        aria-label={`${candidate.name} als Designrichtung ansehen`}
      >
        <AlternativePreview
          token={token}
          version={previewVersion}
          system={candidate.id}
          palette={sidePaletteOf(candidate)}
        />
        <span className="pb-design-side-pill" aria-hidden="true">
          Alternative ansehen
        </span>
      </button>
    );
    // Farbfelder neben (nicht in) dem Kartenknopf — eine Radiogruppe darf
    // nicht in einem <button> liegen.
    return (
      <div className="pb-design-side-wrap" data-side={side}>
        {button}
        <PaletteChooser
          size="compact"
          label={`Farbstimmung ${candidate.name} ansehen`}
          palettes={candidate.palettes}
          value={sidePaletteOf(candidate) ?? null}
          disabled={busyKey !== null}
          onChange={palette =>
            setSidePalettes(current => ({
              ...current,
              [candidate.id]: palette,
            }))
          }
        />
      </div>
    );
  };

  const error = selectSystem.error?.message ?? candidates.error?.message;

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
              Links und rechts: andere Designs mit deinen Inhalten. Darunter
              wählst du die Farbstimmung — Fotos und Texte passt du gleich im
              Studio an, nichts ist endgültig.
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
                aria-pressed={direction.id === activeKey}
                disabled={busyKey !== null}
                onClick={() =>
                  pick(direction, index < activeIndex ? "left" : "right")
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
              {busyKey ? "Design wird geladen …" : ""}
            </span>
            <div className="pb-design-preview-shell">
              {/* Ein iframe für alle Richtungen — ein Wechsel tauscht nur
                  die URL (?system=&palette=). */}
              <PreviewFrame
                token={token}
                version={previewVersion}
                device={device}
                systemOverride={active?.id}
                paletteOverride={active?.palette}
              />
              {active && activeSystem && (
                <div className="pb-harmony">
                  <PaletteChooser
                    size="compact"
                    label={`Farbstimmung ${activeSystem.name}`}
                    palettes={activeSystem.palettes}
                    value={active.palette}
                    disabled={busyKey !== null}
                    onChange={changePalette}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              className="pb-studio-btn pb-design-confirm"
              onClick={confirm}
              disabled={busyKey !== null || !active}
            >
              {busyKey ? "Einen Moment …" : "Mit diesem Design weiter"}
            </button>
            <p className="pb-design-confirm-note">
              Im nächsten Schritt passt du Fotos und Texte an — Design und
              Farbstimmung lassen sich dort jederzeit wechseln.
            </p>
          </div>
          {sideCard(next, "right")}
        </div>

        <button
          type="button"
          className="pb-design-more"
          onClick={() => setRound(value => value + 1)}
          disabled={busyKey !== null || candidates.isFetching}
        >
          Andere Designs zeigen
        </button>

        {error && (
          <p role="alert" className="pb-design-error">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
