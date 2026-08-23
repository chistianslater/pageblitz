import React, { useState } from "react";
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
}

export function TextsPanel({
  token,
  doc,
  onApplied,
  onClose,
}: TextsPanelProps) {
  const base = textsFromDoc(doc);
  const [values, setValues] = useState<TextsPatch>(base);
  const [suggesting, setSuggesting] = useState<TextField | null>(null);
  const [variants, setVariants] = useState<
    Partial<Record<TextField, string[]>>
  >({});

  const updateTexts = trpc.onboardingV2.updateTexts.useMutation();
  const suggestTexts = trpc.onboardingV2.suggestTexts.useMutation();

  const handleSuggest = (field: TextField) => {
    setSuggesting(field);
    suggestTexts.mutate(
      { token, field },
      {
        onSuccess: result => {
          setVariants(prev => ({ ...prev, [field]: result.variants }));
        },
        onSettled: () => setSuggesting(null),
      }
    );
  };

  const handlePickVariant = (field: TextField, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateTexts.mutate(
      { token, patch: diffTexts(base, values) },
      { onSuccess: onApplied }
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
            Fertig
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy || errors.length > 0}
            onClick={handleSave}
          >
            {busy ? "Bitte warten…" : "Speichern"}
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
      />
      {suggestTexts.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {suggestTexts.error.message}
        </p>
      )}
      {updateTexts.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateTexts.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
