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
  /** Deckt sich mit TextsPatchSchema (shared/onboardingV2/patches.ts): min(1), wenn das Feld gesetzt ist. */
  required?: boolean;
}

const FIELDS: FieldConfig[] = [
  {
    key: "headline",
    label: "Überschrift",
    kind: "input",
    maxLength: 120,
    suggestField: "headline",
    required: true,
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
    required: true,
  },
  {
    key: "aboutBody",
    label: "Über-uns-Text",
    kind: "textarea",
    maxLength: 2000,
    suggestField: "aboutBody",
    required: true,
  },
  {
    key: "seoTitle",
    label: "SEO-Titel",
    kind: "input",
    maxLength: 70,
    suggestField: "seoTitle",
    required: true,
  },
  {
    key: "seoDescription",
    label: "SEO-Beschreibung",
    kind: "textarea",
    maxLength: 170,
    suggestField: "seoDescription",
    required: true,
  },
];

/**
 * Pflichtfeld-Prüfung vor dem Speichern (deckt sich mit TextsPatchSchema:
 * headline/aboutHeadline/aboutBody/seoTitle/seoDescription sind min(1), wenn
 * gesetzt). Prüft bewusst nur Felder, die als Schlüssel in `values` vorhanden
 * sind (`!== undefined`) — ein nie berührtes Feld (z. B. aboutHeadline ohne
 * Über-uns-Sektion) bleibt unvalidiert, damit ein unveränderter Aufruf mit
 * `{}` weiterhin speicherbar ist (Task-Vorgabe „gesichtet"-Semantik).
 */
export function validateTexts(values: TextsPatch): string[] {
  return FIELDS.filter(field => field.required)
    .filter(field => {
      const raw = values[field.key];
      return raw !== undefined && raw.trim() === "";
    })
    .map(field => `${field.label} darf nicht leer sein.`);
}

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
  const errors = validateTexts(values);
  return (
    <div className="pb-studio-rows">
      {errors.length > 0 && (
        <ul
          role="alert"
          style={{
            color: "var(--st-warn)",
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: "0.85rem",
          }}
        >
          {errors.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}
      {FIELDS.map(field => {
        const raw = values[field.key];
        const value = raw ?? "";
        const fieldId = `pb-texts-${field.key}`;
        const suggestField = field.suggestField;
        const fieldVariants = suggestField ? variants[suggestField] : undefined;
        // Nur die eigene, gerade laufende Anfrage sperrt den eigenen Button —
        // andere Felder bleiben klickbar. Da alle Felder dieselbe Mutation-
        // Instanz teilen (TextsPanel), zeigt `suggesting` immer nur das
        // zuletzt angestoßene Feld als "in Arbeit"; ein zweiter Klick auf ein
        // anderes Feld überschreibt diese Anzeige, obwohl die erste Anfrage
        // im Hintergrund noch läuft — die jeweiligen Varianten landen aber
        // dank feldspezifischer Closures trotzdem im richtigen Feld.
        const isSuggesting = suggestField ? suggesting === suggestField : false;
        const isInvalid =
          !!field.required && raw !== undefined && raw.trim() === "";
        return (
          <div className="pb-studio-field" key={field.key}>
            <label htmlFor={fieldId}>{field.label}</label>
            {field.kind === "textarea" ? (
              <textarea
                id={fieldId}
                className="pb-studio-textarea"
                maxLength={field.maxLength}
                value={value}
                aria-invalid={isInvalid ? "true" : undefined}
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
                aria-invalid={isInvalid ? "true" : undefined}
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
                disabled={isSuggesting}
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
                    onClick={() =>
                      onPickVariant(suggestField as TextField, variant)
                    }
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
