import React from "react";
import type { TextsPatch } from "@shared/onboardingV2/patches";

/** Deckt sich mit server/onboardingV2/suggest.ts (TextField) — bewusst lokal dupliziert statt importiert, damit das Client-Bundle nicht vom Server-Modul abhängt. */
export type TextField =
  | "headline"
  | "subheadline"
  | "aboutBody"
  | "seoTitle"
  | "seoDescription";

interface FieldConfig {
  key: keyof TextsPatch;
  label: string;
  kind: "input" | "textarea";
  maxLength: number;
  /** Nur gesetzt, wenn der Server für dieses Feld KI-Vorschläge unterstützt (suggestTexts). */
  suggestField?: TextField;
}

const FIELDS: FieldConfig[] = [
  {
    key: "headline",
    label: "Überschrift",
    kind: "input",
    maxLength: 120,
    suggestField: "headline",
  },
  {
    key: "subheadline",
    label: "Unterzeile",
    kind: "input",
    maxLength: 240,
    suggestField: "subheadline",
  },
  { key: "ctaText", label: "Button-Text (CTA)", kind: "input", maxLength: 40 },
  {
    key: "aboutHeadline",
    label: "Über-uns-Überschrift",
    kind: "input",
    maxLength: 120,
  },
  {
    key: "aboutBody",
    label: "Über-uns-Text",
    kind: "textarea",
    maxLength: 2000,
    suggestField: "aboutBody",
  },
  {
    key: "seoTitle",
    label: "SEO-Titel",
    kind: "input",
    maxLength: 70,
    suggestField: "seoTitle",
  },
  {
    key: "seoDescription",
    label: "SEO-Beschreibung",
    kind: "textarea",
    maxLength: 170,
    suggestField: "seoDescription",
  },
];

interface TextsFormProps {
  values: TextsPatch;
  onChange: (v: TextsPatch) => void;
  onSuggest: (field: TextField) => void;
  suggesting: TextField | null;
  variants: Partial<Record<TextField, string[]>>;
  onPickVariant: (field: TextField, value: string) => void;
}

/** Reine Darstellung: alle Textfelder inkl. Zähler, KI-Vorschlag-Button und Varianten-Chips. */
export function TextsForm({
  values,
  onChange,
  onSuggest,
  suggesting,
  variants,
  onPickVariant,
}: TextsFormProps) {
  return (
    <div className="pb-studio-rows">
      {FIELDS.map(field => {
        const value = values[field.key] ?? "";
        const fieldId = `pb-texts-${field.key}`;
        const suggestField = field.suggestField;
        const fieldVariants = suggestField ? variants[suggestField] : undefined;
        const isSuggesting = suggestField ? suggesting === suggestField : false;
        return (
          <div className="pb-studio-field" key={field.key}>
            <label htmlFor={fieldId}>{field.label}</label>
            {field.kind === "textarea" ? (
              <textarea
                id={fieldId}
                className="pb-studio-textarea"
                maxLength={field.maxLength}
                value={value}
                onChange={e =>
                  onChange({ ...values, [field.key]: e.target.value })
                }
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                className="pb-studio-input"
                maxLength={field.maxLength}
                value={value}
                onChange={e =>
                  onChange({ ...values, [field.key]: e.target.value })
                }
              />
            )}
            <span className="pb-studio-counter">
              {value.length}/{field.maxLength}
            </span>
            {suggestField && (
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={suggesting !== null}
                onClick={() => onSuggest(suggestField)}
              >
                {isSuggesting ? "Wird vorgeschlagen…" : "KI-Vorschlag"}
              </button>
            )}
            {fieldVariants && fieldVariants.length > 0 && (
              <div
                className="pb-studio-chips"
                role="group"
                aria-label={`Vorschläge für ${field.label}`}
              >
                {fieldVariants.map((variant, i) => (
                  <button
                    key={i}
                    type="button"
                    className="pb-studio-chip"
                    onClick={() => onPickVariant(suggestField as TextField, variant)}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
