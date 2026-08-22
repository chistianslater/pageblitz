import React from "react";

const PHASES = [
  "Stil wird gewählt",
  "Texte entstehen",
  "Bilder werden gesetzt",
  "Vorschau wird gebaut",
] as const;

interface GenerationScreenProps {
  businessName: string;
  progress: number;
  status: "pending" | "processing" | "failed";
  error: string | null;
  onRetry: () => void;
}

export function GenerationScreen({
  businessName,
  progress,
  status,
  error,
  onRetry,
}: GenerationScreenProps) {
  const phase =
    PHASES[
      Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))
    ];
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
              style={{ marginTop: "1rem" }}
            >
              Erneut versuchen
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
              {phase} — etwa eine Minute.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
