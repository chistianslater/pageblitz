import React from "react";

// Reihenfolge entspricht den Fortschrittsstufen des Jobs (runJob.ts):
// 0–24 Stil, 25–54 Bilder, 55–89 Texte (LLM, längster Schritt), 90+ Vorschau.
const PHASES = [
  "Stil wird gewählt",
  "Bilder werden gesetzt",
  "Texte entstehen",
  "Vorschau wird gebaut",
] as const;
const PHASE_BOUNDS = [0, 25, 55, 90, 101] as const;
const LONG_WAIT_MS = 60_000;

interface GenerationScreenProps {
  businessName: string;
  progress: number;
  status: "pending" | "processing" | "failed";
  error: string | null;
  onRetry: () => void;
  /** ensureGeneration läuft gerade (erneut) — Retry-Button während dieser Zeit sperren (Findings #1/#4). */
  retrying?: boolean;
}

export function GenerationScreen({
  businessName,
  progress,
  status,
  error,
  onRetry,
  retrying = false,
}: GenerationScreenProps) {
  const phaseIndex = Math.max(
    0,
    PHASE_BOUNDS.findIndex((b, i) => progress >= b && progress < PHASE_BOUNDS[i + 1])
  );
  const phase = PHASES[Math.min(PHASES.length - 1, phaseIndex)];
  const [elapsedMs, setElapsedMs] = React.useState(0);
  React.useEffect(() => {
    if (status === "failed") return;
    const start = Date.now();
    const id = window.setInterval(() => setElapsedMs(Date.now() - start), 1000);
    return () => window.clearInterval(id);
  }, [status]);
  const longWait = status !== "failed" && elapsedMs >= LONG_WAIT_MS;
  return (
    <section className="pb-studio-gen" aria-live="polite">
      <div>
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
              aria-valuenow={progress}
            >
              <span style={{ width: `${Math.max(4, progress)}%` }} />
            </div>
            <p style={{ color: "var(--st-muted)" }}>
              {phase} — meist unter einer Minute.
              {longWait
                ? " Dauert gerade etwas länger, wir sind noch dran …"
                : ""}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
