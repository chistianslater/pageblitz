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
  /** Fehler der letzten KI-Anfrage, feldgebunden (wird direkt am Feld gezeigt, nicht am Panel-Ende). */
  suggestError?: { field: TextField; message: string } | null;
  /** Feld, dessen gewählter Vorschlag gerade gespeichert wird. */
  applyingVariant?: TextField | null;
  onFieldFocus?: (field: keyof TextsPatch) => void;
  /** Layout-Varianten direkt an der Hero-Sektion (vor Überschrift). */
  heroLayoutSlot?: React.ReactNode;
  /** Layout-Varianten direkt an der Über-uns-Sektion. */
  aboutLayoutSlot?: React.ReactNode;
}

/** Reine Darstellung: alle Textfelder inkl. Zähler, KI-Vorschlag-Button und Varianten-Chips. */
export function TextsForm({
  values,
  onChange,
  onSuggest,
  suggesting,
  variants,
  onPickVariant,
  suggestError = null,
  applyingVariant = null,
  onFieldFocus,
  heroLayoutSlot,
  aboutLayoutSlot,
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
        const layoutSlot =
          field.key === "headline"
            ? heroLayoutSlot
            : field.key === "aboutHeadline"
              ? aboutLayoutSlot
              : null;
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
          <React.Fragment key={field.key}>
            {layoutSlot}
          <div className="pb-studio-field">
            <label htmlFor={fieldId}>{field.label}</label>
            {field.kind === "textarea" ? (
              <textarea
                id={fieldId}
                className="pb-studio-textarea"
                maxLength={field.maxLength}
                value={value}
                aria-invalid={isInvalid ? "true" : undefined}
                onFocus={() => onFieldFocus?.(field.key)}
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
                onFocus={() => onFieldFocus?.(field.key)}
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
            {/* Sichtbares Feedback direkt am Feld (2026-08-25): Der KI-
                Request braucht spürbar Zeit (Reasoning-Modell) — ohne
                Hinweis wirkte der Klick wirkungslos; Fehler landeten
                vorher unbemerkt am Panel-Ende. */}
            {isSuggesting && (
              <div
                className="pb-studio-suggest-status"
                role="status"
              >
                <span className="pb-studio-suggest-pencil" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  Die KI schreibt drei Vorschläge — meist dauert das nur wenige
                  Sekunden …
                </span>
              </div>
            )}
            {suggestField && suggestError?.field === suggestField && (
              <p role="alert" style={{ color: "var(--st-warn)" }}>
                {suggestError.message}
              </p>
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
                    aria-pressed={value === variant}
                    disabled={applyingVariant !== null}
                    onClick={() =>
                      onPickVariant(suggestField as TextField, variant)
                    }
                  >
                    {variant}
                  </button>
                ))}
              </div>
            )}
            {suggestField && applyingVariant === suggestField && (
              <p
                role="status"
                style={{ color: "var(--st-accent)", fontSize: "0.82rem" }}
              >
                Wird übernommen und in der Vorschau aktualisiert …
              </p>
            )}
          </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
