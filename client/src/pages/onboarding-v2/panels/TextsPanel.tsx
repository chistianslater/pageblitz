import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import type { TextsPatch } from "@shared/onboardingV2/patches";
import { PanelFrame } from "./PanelFrame";
import { TextsForm, validateTexts, type TextField } from "./textsParts";

export { TextsForm, validateTexts };
export type { TextField };

/** Reine Ableitung: Hero-/Über-uns-Texte + SEO-Metadaten aus dem Dokument — Startwerte des Formulars und Basis für den Diff beim Speichern. */
export function textsFromDoc(doc: WebsiteDataV2): TextsPatch {
  const hero = doc.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const about = doc.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  return {
    ...(hero?.headline !== undefined ? { headline: hero.headline } : {}),
    ...(hero?.subheadline !== undefined
      ? { subheadline: hero.subheadline }
      : {}),
    ...(hero?.ctaText !== undefined ? { ctaText: hero.ctaText } : {}),
    ...(about?.headline !== undefined ? { aboutHeadline: about.headline } : {}),
    ...(about?.body !== undefined ? { aboutBody: about.body } : {}),
    seoTitle: doc.seo.title,
    seoDescription: doc.seo.description,
  };
}

/** Nur Felder, die sich ggü. `base` tatsächlich geändert haben — vermeidet unnötige Server-Validierung unveränderter Werte. */
function diffTexts(base: TextsPatch, next: TextsPatch): TextsPatch {
  const changed = Object.entries(next).filter(
    ([key, val]) => val !== base[key as keyof TextsPatch]
  );
  return Object.fromEntries(changed) as TextsPatch;
}

interface TextsPanelProps {
  token: string;
  doc: WebsiteDataV2;
  onApplied: () => void;
  onClose: () => void;
  /** Geführter Modus (Studio-Wizard): Primary-Button wird zu „Speichern & weiter". */
  onNext?: () => void;
  onPreviewFocus?: (anchor: string) => void;
  /**
   * Live-Spiegel (2026-08-30): feuert bei jeder Eingabe die sichtbaren
   * Feldwerte als Inline-Pfad→Wert-Map — die Vorschau zeigt Tipparbeit
   * sofort, gespeichert wird weiterhin erst per Button.
   */
  onDraft?: (draft: Record<string, string>) => void;
}

/** Panel-Felder → Inline-Pfade der sichtbaren Vorschau-Texte. */
export function draftTargetsFromValues(
  doc: WebsiteDataV2,
  values: TextsPatch
): Record<string, string> {
  const heroIdx = doc.sections.findIndex(s => s.type === "hero");
  const aboutIdx = doc.sections.findIndex(s => s.type === "about");
  const draft: Record<string, string> = {};
  const put = (idx: number, suffix: string, value: string | undefined) => {
    if (idx >= 0 && value !== undefined) {
      draft[`sections.${idx}.${suffix}`] = value;
    }
  };
  put(heroIdx, "headline", values.headline);
  put(heroIdx, "subheadline", values.subheadline);
  put(heroIdx, "ctaText", values.ctaText);
  put(aboutIdx, "headline", values.aboutHeadline);
  put(aboutIdx, "body", values.aboutBody);
  return draft;
}

export function TextsPanel({
  token,
  doc,
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
  onDraft,
}: TextsPanelProps) {
  const base = textsFromDoc(doc);
  const [values, setValues] = useState<TextsPatch>(base);
  // Live-Spiegel als Effekt (nicht im Setter): Varianten-Klicks nutzen die
  // Updater-Form von setValues; der Effekt fängt jede Wertänderung ab.
  useEffect(() => {
    onDraft?.(draftTargetsFromValues(doc, values));
    // doc/onDraft ändern sich nur mit dem Server-Refetch — values genügt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);
  const [suggesting, setSuggesting] = useState<TextField | null>(null);
  const [applyingVariant, setApplyingVariant] = useState<TextField | null>(
    null
  );
  const [variants, setVariants] = useState<
    Partial<Record<TextField, string[]>>
  >({});
  // Fehler der KI-Vorschläge feldgebunden statt am Panel-Ende (User-
  // Feedback 2026-08-25: „Klick, und ich sehe nichts" — die Fehlermeldung
  // renderte weit unterhalb des geklickten Felds außerhalb des sichtbaren
  // Bereichs).
  const [suggestError, setSuggestError] = useState<{
    field: TextField;
    message: string;
  } | null>(null);

  const updateTexts = trpc.onboardingV2.updateTexts.useMutation();
  const suggestTexts = trpc.onboardingV2.suggestTexts.useMutation();

  const handleSuggest = (field: TextField) => {
    setSuggesting(field);
    setSuggestError(null);
    suggestTexts.mutate(
      { token, field },
      {
        onSuccess: result => {
          setVariants(prev => ({ ...prev, [field]: result.variants }));
        },
        onError: err => {
          setSuggestError({ field, message: err.message });
        },
        onSettled: () => setSuggesting(null),
      }
    );
  };

  const handlePickVariant = (field: TextField, value: string) => {
    if (updateTexts.isPending) return;
    const previous = values[field];
    setValues(prev => ({ ...prev, [field]: value }));
    setApplyingVariant(field);
    // Vorschlag-Klick ist eine bewusste Auswahl: sofort persistieren und
    // Preview remounten, statt einen zweiten „Speichern"-Klick zu verlangen.
    updateTexts.mutate(
      { token, patch: { [field]: value } },
      {
        onSuccess: onApplied,
        onError: () => setValues(prev => ({ ...prev, [field]: previous })),
        onSettled: () => setApplyingVariant(null),
      }
    );
  };

  const handleSave = () => {
    updateTexts.mutate(
      { token, patch: diffTexts(base, values) },
      {
        onSuccess: () => {
          onApplied();
          onNext?.();
        },
      }
    );
  };

  const busy = updateTexts.isPending;
  const errors = validateTexts(values);

  return (
    <PanelFrame
      step="Schritt 3"
      title="Texte prüfen"
      panelId="texts"
      onClose={onClose}
      intro="Überschriften, Über-uns-Text und SEO-Angaben — bei Bedarf mit KI-Vorschlägen."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Schließen
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy || errors.length > 0}
            onClick={handleSave}
          >
            {busy
              ? "Bitte warten…"
              : onNext
                ? "Speichern & weiter"
                : "Speichern"}
          </button>
        </>
      }
    >
      <TextsForm
        values={values}
        onChange={setValues}
        onSuggest={handleSuggest}
        suggesting={suggesting}
        variants={variants}
        onPickVariant={handlePickVariant}
        suggestError={suggestError}
        applyingVariant={applyingVariant}
        onFieldFocus={field => {
          if (
            field === "headline" ||
            field === "subheadline" ||
            field === "ctaText"
          )
            onPreviewFocus?.("start");
          if (field === "aboutHeadline" || field === "aboutBody")
            onPreviewFocus?.("ueber-uns");
        }}
      />
      {updateTexts.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateTexts.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
