import React from "react";
import { getConstitution, toCssVars } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import {
  PHASES,
  PHASE_BOUNDS,
  PHASE_EXPECTED_MS,
  approach,
  phaseIndexFor,
  progressAt,
} from "./generationProgress";

const LONG_WAIT_MS = 60_000;
/** Update-Intervall des Fortschrittsbalkens bei `prefers-reduced-motion: reduce` — grobe Schritte statt rAF-Animation. */
const REDUCED_MOTION_TICK_MS = 1_000;

/**
 * `prefers-reduced-motion: reduce` beobachten (Muster wie
 * client/src/components/landing/StudioFrame.tsx) — der Fortschrittsbalken
 * ersetzt dann den rAF-Loop durch grobe 1-Sekunden-Updates, konsistent zum
 * Skeleton/Reveal, die per CSS-Media-Query ebenfalls statisch werden.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

interface GenerationScreenProps {
  businessName: string;
  /** previewToken — Basis der Vorschau-URL `/preview-ssr/<token>`. */
  token: string;
  /**
   * Pack des (Zwischen-)Dokuments (state.stylePackId) — färbt den Skeleton
   * in den Pack-Farben; `null`, solange der Job das Pack noch nicht in einem
   * persistierten Stand verraten hat (dann neutrale Studio-Farben).
   */
  packId: PackId | null;
  /**
   * true, sobald der Job den Zeitmaschinen-Zwischenstand geschrieben hat
   * (state.doc vorhanden) — dann lädt das iframe die echte Vorschau und die
   * Sektionen faden ein (?reveal=1, siehe server/ssr/renderSite.tsx).
   */
  hasDoc: boolean;
  progress: number;
  status: "pending" | "processing" | "failed";
  error: string | null;
  onRetry: () => void;
  /** ensureGeneration läuft gerade (erneut) — Retry-Button während dieser Zeit sperren (Findings #1/#4). */
  retrying?: boolean;
}

/**
 * Skelett der entstehenden Website: Canvas-Hintergrund + schimmernde
 * Platzhalterblöcke in den Pack-Farben (CSS-only, `prefers-reduced-motion`
 * → statisch, siehe studio.css). Liegt unter dem iframe und bleibt sichtbar,
 * bis die echte Vorschau geladen ist.
 */
function PackSkeleton({ packId }: { packId: PackId | null }) {
  const style = React.useMemo(
    () =>
      packId
        ? (toCssVars(getConstitution(packId)) as React.CSSProperties)
        : undefined,
    [packId]
  );
  return (
    <div className="pb-studio-skeleton" aria-hidden="true" style={style}>
      <span className="pb-sk-block pb-sk-nav" />
      <span className="pb-sk-block pb-sk-headline" />
      <span className="pb-sk-block pb-sk-line" />
      <span className="pb-sk-block pb-sk-cta" />
      <div className="pb-sk-grid">
        <span className="pb-sk-block" />
        <span className="pb-sk-block" />
        <span className="pb-sk-block" />
      </div>
    </div>
  );
}

export function GenerationScreen({
  businessName,
  token,
  packId,
  hasDoc,
  progress,
  status,
  error,
  onRetry,
  retrying = false,
}: GenerationScreenProps) {
  const phase = PHASES[phaseIndexFor(progress)];
  const [elapsedMs, setElapsedMs] = React.useState(0);
  React.useEffect(() => {
    if (status === "failed") return;
    const start = Date.now();
    const id = window.setInterval(() => setElapsedMs(Date.now() - start), 1000);
    return () => window.clearInterval(id);
  }, [status]);
  const longWait = status !== "failed" && elapsedMs >= LONG_WAIT_MS;

  // Kontinuierlicher Fortschrittsbalken (Zeitmaschine, Task 4): Der Server
  // meldet nur grobe Stufen; zwischen zwei Stufen läuft der Balken per
  // requestAnimationFrame asymptotisch gegen die Phasen-Obergrenze
  // (progressAt) und gleitet bei Phasenwechseln weich nach (approach) —
  // er steht nie. Breite direkt am DOM (kein Re-Render pro Frame);
  // aria-valuenow nur bei ganzzahliger Änderung.
  const barRef = React.useRef<HTMLSpanElement>(null);
  const shownRef = React.useRef(Math.max(0, progress));
  const anchorRef = React.useRef({ from: progress, startedAt: 0 });
  const [ariaNow, setAriaNow] = React.useState(Math.round(progress));
  React.useEffect(() => {
    anchorRef.current = {
      from: Math.max(progress, shownRef.current),
      startedAt: performance.now(),
    };
  }, [progress]);
  const reducedMotion = usePrefersReducedMotion();
  React.useEffect(() => {
    if (status === "failed") return;
    let lastAria = -1;
    const applyProgress = (value: number) => {
      if (barRef.current) {
        barRef.current.style.width = `${Math.max(4, value)}%`;
      }
      const rounded = Math.round(value);
      if (rounded !== lastAria) {
        lastAria = rounded;
        setAriaNow(rounded);
      }
    };
    const targetAt = (now: number) => {
      const { from, startedAt } = anchorRef.current;
      const idx = phaseIndexFor(from);
      return progressAt(
        now,
        startedAt,
        from,
        PHASE_BOUNDS[idx + 1],
        PHASE_EXPECTED_MS[idx]
      );
    };
    if (reducedMotion) {
      // Reduzierte Bewegung: grobe 1-Sekunden-Schritte direkt auf den
      // Zielwert (kein Easing, keine Dauer-Animation) — der Balken bleibt
      // informativ, ohne zu „laufen".
      const update = () => {
        shownRef.current = Math.max(
          shownRef.current,
          targetAt(performance.now())
        );
        applyProgress(shownRef.current);
      };
      update();
      const id = window.setInterval(update, REDUCED_MOTION_TICK_MS);
      return () => window.clearInterval(id);
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      shownRef.current = approach(shownRef.current, targetAt(now), now - last);
      last = now;
      applyProgress(shownRef.current);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [status, reducedMotion]);

  const [frameLoaded, setFrameLoaded] = React.useState(false);
  // `?reveal=1` schaltet die Sektions-Einblendung im SSR-HTML frei (nur
  // Preview-Modus, siehe handlePreviewSsr); `v=interim` bustet etwaige
  // Browser-Caches — das iframe mountet genau einmal, sobald der
  // Zwischenstand da ist (der Finalstand lädt nach Jobende im normalen
  // Studio-PreviewFrame, ebenfalls mit Einblendung).
  const frameSrc = `/preview-ssr/${token}?reveal=1&v=interim`;

  return (
    <section className="pb-studio-gen" aria-live="polite">
      <div className="pb-studio-gen-inner">
        <p className="pb-studio-kicker">Deine Website entsteht</p>
        <h1 className="pb-studio-title">{businessName}</h1>
        {status === "failed" ? (
          <>
            <p
              role="alert"
              style={{ color: "var(--st-warn)", marginTop: "1rem" }}
            >
              {error ?? "Die Generierung ist fehlgeschlagen."}
            </p>
            <button
              type="button"
              className="pb-studio-btn"
              onClick={onRetry}
              disabled={retrying}
              style={{ marginTop: "1rem" }}
            >
              {retrying ? "Wird erneut versucht…" : "Erneut versuchen"}
            </button>
          </>
        ) : (
          <>
            <div
              className="pb-studio-gen-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={ariaNow}
            >
              <span
                ref={barRef}
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
            <p style={{ color: "var(--st-muted)" }}>
              {phase} — meist unter einer Minute.
              {longWait
                ? " Dauert gerade etwas länger, wir sind noch dran …"
                : ""}
            </p>
            <div
              className="pb-studio-gen-preview"
              data-frame-loaded={frameLoaded || undefined}
            >
              <PackSkeleton packId={packId} />
              {hasDoc ? (
                <iframe
                  src={frameSrc}
                  title="Vorschau deiner entstehenden Website"
                  loading="eager"
                  onLoad={() => setFrameLoaded(true)}
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
