import React from "react";

interface LegacyCardProps {
  onRegenerate: () => void;
  pending: boolean;
  error: string | null;
}

/**
 * Ersetzt die frühere statische Meldung für v1-Vorschauen (Spec §1): statt
 * nur zu erklären, dass das Studio das alte Format nicht bearbeiten kann,
 * bietet die Karte einen Button, der die Website per
 * `ensureGeneration({ force: true })` neu (v2) erstellen lässt. Nur für
 * Vorschauen relevant — verkaufte Websites weist der Server serverseitig ab
 * (BAD_REQUEST), die Fehlermeldung landet dann in `error`.
 */
export function LegacyCard({ onRegenerate, pending, error }: LegacyCardProps) {
  return (
    <div className="pb-studio-checkout" aria-label="Altes Format">
      <p role="alert">Diese Website wurde mit dem alten System erstellt.</p>
      <button
        type="button"
        className="pb-studio-btn"
        disabled={pending}
        onClick={onRegenerate}
      >
        {pending ? "Wird erstellt…" : "Website neu erstellen"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
