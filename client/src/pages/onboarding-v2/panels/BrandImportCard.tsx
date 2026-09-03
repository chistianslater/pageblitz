import React, { useState } from "react";
import { Check, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getFontPair } from "@shared/stylePacks";
import type { BrandSuggestion } from "@shared/onboardingV2/brandImport";

/**
 * Marken-Import (2026-09-03, Punkt 3 Scheibe 1): Karte oben im Stil-Panel.
 * Zeigt, was auf der bestehenden Betriebs-Website erkannt wurde — Logo,
 * Markenfarbe, Schriften — und übernimmt nur die angehakten Teile. Ohne
 * Website im Google-Profil oder ohne Treffer erscheint die Karte nicht.
 */

export interface BrandPicks {
  logo: boolean;
  accent: boolean;
  fontPair: boolean;
}

export function BrandImportChoices({
  suggestion,
  picked,
  onToggle,
  busy,
}: {
  suggestion: BrandSuggestion;
  picked: BrandPicks;
  onToggle: (key: keyof BrandPicks) => void;
  busy: boolean;
}) {
  const pair = suggestion.fontPairId
    ? getFontPair(suggestion.fontPairId)
    : null;
  const row = (
    key: keyof BrandPicks,
    label: string,
    detail: React.ReactNode,
    preview: React.ReactNode
  ) => (
    <button
      type="button"
      className="pb-brand-row"
      aria-pressed={picked[key]}
      disabled={busy}
      onClick={() => onToggle(key)}
    >
      <span className="pb-brand-check" aria-hidden="true">
        {picked[key] ? <Check /> : null}
      </span>
      {preview}
      <span className="pb-brand-text">
        <strong>{label}</strong>
        <span>{detail}</span>
      </span>
    </button>
  );
  return (
    <div className="pb-brand">
      <p className="pb-brand-lead">
        Auf <strong>{suggestion.domain}</strong> haben wir das gefunden. Wähle,
        was übernommen werden soll.
      </p>
      <div className="pb-brand-rows">
        {suggestion.logoUrl &&
          row(
            "logo",
            "Logo",
            "Wird als Wortmarke in Navigation und Fuß gezeigt.",
            <span className="pb-brand-logo">
              <img src={suggestion.logoUrl} alt="Erkanntes Logo" />
            </span>
          )}
        {suggestion.accent &&
          row(
            "accent",
            `Markenfarbe ${suggestion.accent}`,
            `Nächste kuratierte Farbe: ${suggestion.accentName}.`,
            <span
              className="pb-brand-swatch"
              style={{ background: suggestion.accent }}
              aria-hidden="true"
            />
          )}
        {pair &&
          row(
            "fontPair",
            `Schriften: ${pair.label}`,
            `Erkannt: ${suggestion.fonts.join(" und ")}.`,
            <span className="pb-brand-fonts" aria-hidden="true">
              Aa
            </span>
          )}
      </div>
    </div>
  );
}

export function BrandImportCard({
  token,
  onApplied,
}: {
  token: string;
  onApplied: () => void;
}) {
  const preview = trpc.onboardingV2.brandImportPreview.useQuery(
    { token },
    { staleTime: Infinity, retry: false }
  );
  const apply = trpc.onboardingV2.applyBrandImport.useMutation();
  const [picked, setPicked] = useState<BrandPicks>({
    logo: true,
    accent: true,
    fontPair: true,
  });
  const [done, setDone] = useState(false);

  if (preview.isLoading) {
    return (
      <p className="pb-brand-loading" role="status">
        Wir sehen uns die Website deines Betriebs an …
      </p>
    );
  }
  const data = preview.data;
  if (!data?.available || !data.suggestion.hasAnything || done) return null;

  const suggestion = data.suggestion;
  const nothingPicked =
    !(picked.logo && suggestion.logoUrl) &&
    !(picked.accent && suggestion.accent) &&
    !(picked.fontPair && suggestion.fontPairId);

  return (
    <section className="pb-brand-block" aria-label="Marke übernehmen">
      <h3 className="pb-studio-group-kicker">Deine Marke</h3>
      <BrandImportChoices
        suggestion={suggestion}
        picked={picked}
        onToggle={key => setPicked(prev => ({ ...prev, [key]: !prev[key] }))}
        busy={apply.isPending}
      />
      <div className="pb-brand-actions">
        <button
          type="button"
          className="pb-studio-btn"
          disabled={apply.isPending || nothingPicked}
          onClick={() =>
            apply.mutate(
              { token, ...picked },
              {
                onSuccess: () => {
                  setDone(true);
                  onApplied();
                },
              }
            )
          }
        >
          <Download aria-hidden="true" />
          {apply.isPending ? "Wird übernommen …" : "Übernehmen"}
        </button>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          disabled={apply.isPending}
          onClick={() => setDone(true)}
        >
          Nicht übernehmen
        </button>
      </div>
      {apply.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {apply.error.message}
        </p>
      )}
    </section>
  );
}
