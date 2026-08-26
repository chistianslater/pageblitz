import React from "react";
import { filterCategorySuggestions } from "./categoryLogic";

interface CategoryStepProps {
  businessName: string;
  /** Von Google/GMB erkannte Kategorie — wird immer vor Generierung bestätigt. */
  initialCategory?: string;
  /** Trimmt der Aufrufer nicht — die Komponente übergibt bereits getrimmt. */
  onSubmit: (category: string) => void;
  /** setCategory-Mutation läuft — Button sperren, Doppel-Submit vermeiden. */
  pending: boolean;
  error: string | null;
}

/**
 * Kategorie-Rückfrage vor der Generierung (Plan B7 Task 5, Spec §2.1):
 * schlanker Schritt „Was macht dein Betrieb?" im Studio-Look — Suchfeld als
 * ARIA-Combobox mit Vorschlagsliste (Pfeiltasten + Enter, Escape schließt),
 * Freitext erlaubt, ein Primär-Button „Weiter". Erscheint nur, wenn GMB
 * keine belastbare Branche geliefert hat (state.needsCategory).
 */
export function CategoryStep({
  businessName,
  initialCategory = "",
  onSubmit,
  pending,
  error,
}: CategoryStepProps) {
  const [value, setValue] = React.useState(initialCategory);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const suggestions = open ? filterCategorySuggestions(value) : [];
  const listVisible = suggestions.length > 0;
  const canSubmit = value.trim().length >= 2 && !pending;

  const choose = (category: string) => {
    setValue(category);
    setOpen(false);
    setActiveIndex(-1);
  };
  const submit = () => {
    if (canSubmit) onSubmit(value.trim());
  };

  // Fokusverlust schließt die Vorschlagsliste (Task-5-Review, Minor):
  // Blur auf dem Combobox-Container mit relatedTarget-Check — wandert der
  // Fokus INNERHALB des Containers (theoretisch), bleibt die Liste offen;
  // der Klick auf eine Option läuft ohnehin über onMouseDown/preventDefault
  // und löst gar keinen Blur aus.
  const onFieldBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!listVisible) return;
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        index => (index + delta + suggestions.length) % suggestions.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (listVisible && activeIndex >= 0 && suggestions[activeIndex]) {
        choose(suggestions[activeIndex]);
      } else {
        submit();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <section className="pb-studio-gen">
      <div className="pb-studio-gen-inner pb-studio-cat">
        <p className="pb-studio-kicker">Bevor es losgeht</p>
        <h1 className="pb-studio-title">Was macht dein Betrieb?</h1>
        <p className="pb-studio-cat-hint">
          {initialCategory ? (
            <>
              Wir haben <strong>{initialCategory}</strong> erkannt. Passt das zu{" "}
              {businessName}? Bestätige die Branche oder korrigiere sie — erst
              danach entsteht deine Website.
            </>
          ) : (
            <>
              Für {businessName} konnten wir die Branche nicht sicher erkennen.
              Wähle sie aus oder tippe sie frei ein — daraus entsteht deine
              Website.
            </>
          )}
        </p>
        <div className="pb-studio-cat-field" onBlur={onFieldBlur}>
          <label htmlFor="pb-cat-input">Branche</label>
          <input
            id="pb-cat-input"
            type="text"
            role="combobox"
            aria-expanded={listVisible}
            aria-controls="pb-cat-list"
            aria-autocomplete="list"
            aria-activedescendant={
              listVisible && activeIndex >= 0
                ? `pb-cat-option-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            placeholder="z. B. Friseursalon, Werbeagentur, Tischlerei …"
            value={value}
            onChange={event => {
              setValue(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
          />
          {listVisible && (
            <ul
              id="pb-cat-list"
              role="listbox"
              aria-label="Branchen-Vorschläge"
              className="pb-studio-cat-list"
            >
              {suggestions.map((category, index) => (
                <li
                  key={category}
                  id={`pb-cat-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  data-active={index === activeIndex || undefined}
                  // mouseDown verhindert den Blur des Inputs vor dem Klick;
                  // Tastatur läuft über aria-activedescendant + Enter im
                  // Input (ARIA-Combobox-Muster — Options sind keine
                  // eigenen Tab-Stopps).
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => choose(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && (
          <p role="alert" className="pb-studio-cat-error">
            {error}
          </p>
        )}
        <button
          type="button"
          className="pb-studio-btn pb-studio-cat-submit"
          onClick={submit}
          disabled={!canSubmit}
        >
          {pending
            ? "Wird gespeichert …"
            : initialCategory
              ? "Branche bestätigen & Website erstellen"
              : "Weiter"}
        </button>
      </div>
    </section>
  );
}
