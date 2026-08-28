import React from "react";
import type { OfferPatch } from "@shared/onboardingV2/patches";

export type OfferMode = OfferPatch["mode"];

/** Deckt sich mit den Grenzen in shared/onboardingV2/patches.ts (OfferPatchSchema). */
const MAX_LIST_ITEMS = 12;
const MAX_CATEGORY_ITEMS = 40;

/** Leerer Startzustand für einen Angebots-Modus — für "services" identisch mit offerFromDoc()s Fallback ohne bestehende Sektion. */
export function blankOffer(mode: OfferMode): OfferPatch {
  if (mode === "services") {
    return { mode: "services", headline: "Leistungen", items: [{ title: "" }] };
  }
  return { mode, categories: [{ name: "", items: [{ name: "", price: "" }] }] };
}

/** Deutscher Bezug auf eine Zeile: Name in Anführungszeichen, wenn vorhanden, sonst der Positions-Fallback. */
function rowLabel(name: string, fallback: string): string {
  const trimmed = name.trim();
  return trimmed ? `‚${trimmed}‘` : fallback;
}

/**
 * Pflichtfeld-Prüfung vor dem Speichern (deckt sich mit OfferPatchSchema):
 * services benötigt headline + je Zeile einen Titel; menu/pricelist benötigt
 * je Kategorie einen Namen und je Position Name UND Preis (min(1), anders
 * als description). Anders als bei Texts wird hier immer der komplette
 * aktuelle Editor-Wert geprüft — updateOffer sendet stets das volle Objekt,
 * kein Diff.
 */
export function validateOffer(value: OfferPatch): string[] {
  if (value.mode === "services") {
    const messages: string[] = [];
    if (value.headline.trim() === "") {
      messages.push("Überschrift darf nicht leer sein.");
    }
    value.items.forEach((item, i) => {
      if (item.title.trim() === "") {
        messages.push(`Titel fehlt in Zeile ${i + 1}.`);
      }
    });
    return messages;
  }

  const messages: string[] = [];
  value.categories.forEach((category, ci) => {
    if (category.name.trim() === "") {
      messages.push(`Kategoriename fehlt bei Kategorie ${ci + 1}.`);
    }
    const categoryLabel = rowLabel(category.name, `Kategorie ${ci + 1}`);
    category.items.forEach((item, ii) => {
      const itemLabel = rowLabel(
        item.name,
        `Zeile ${ii + 1} in ${categoryLabel}`
      );
      if (item.name.trim() === "") {
        messages.push(`Name fehlt bei ${itemLabel}.`);
      }
      if (item.price.trim() === "") {
        messages.push(`Preis fehlt bei ${itemLabel}.`);
      }
    });
  });
  return messages;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}
function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

type ServicesPatch = Extract<OfferPatch, { mode: "services" }>;

interface ServicesEditorProps {
  value: ServicesPatch;
  onChange: (v: OfferPatch) => void;
}

/** Reine Darstellung: Überschrift/Einleitung + Zeilen-Editor für Leistungen (Titel, Beschreibung, Preis). */
function ServicesEditor({ value, onChange }: ServicesEditorProps) {
  const updateItem = (
    i: number,
    patch: Partial<ServicesPatch["items"][number]>
  ) => {
    onChange({
      ...value,
      items: replaceAt(value.items, i, { ...value.items[i], ...patch }),
    });
  };
  const addItem = () => {
    if (value.items.length >= MAX_LIST_ITEMS) return;
    onChange({ ...value, items: [...value.items, { title: "" }] });
  };
  const removeItem = (i: number) => {
    onChange({ ...value, items: removeAt(value.items, i) });
  };

  return (
    <>
      <div className="pb-studio-field">
        <label htmlFor="pb-offer-services-headline">Überschrift</label>
        <input
          id="pb-offer-services-headline"
          type="text"
          className="pb-studio-input"
          maxLength={80}
          value={value.headline}
          aria-invalid={value.headline.trim() === "" ? "true" : undefined}
          onChange={e => onChange({ ...value, headline: e.target.value })}
        />
      </div>
      <div className="pb-studio-field">
        <label htmlFor="pb-offer-intro">Einleitung (optional)</label>
        <textarea
          id="pb-offer-intro"
          className="pb-studio-textarea"
          maxLength={300}
          value={value.intro ?? ""}
          onChange={e => onChange({ ...value, intro: e.target.value })}
        />
      </div>
      {value.items.map((item, i) => (
        <div className="pb-studio-row" key={i}>
          <input
            aria-label="Titel"
            type="text"
            className="pb-studio-input"
            placeholder="Titel"
            maxLength={80}
            value={item.title}
            aria-invalid={item.title.trim() === "" ? "true" : undefined}
            onChange={e => updateItem(i, { title: e.target.value })}
          />
          <input
            aria-label="Beschreibung"
            type="text"
            className="pb-studio-input"
            placeholder="Beschreibung (optional)"
            maxLength={240}
            value={item.description ?? ""}
            onChange={e => updateItem(i, { description: e.target.value })}
          />
          <input
            aria-label="Preis"
            type="text"
            className="pb-studio-input"
            placeholder="Preis (optional)"
            maxLength={40}
            value={item.price ?? ""}
            onChange={e => updateItem(i, { price: e.target.value })}
          />
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={value.items.length <= 1}
            onClick={() => removeItem(i)}
          >
            Entfernen
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        disabled={value.items.length >= MAX_LIST_ITEMS}
        onClick={addItem}
      >
        Zeile hinzufügen
      </button>
    </>
  );
}

type CategoriesPatch = Extract<OfferPatch, { mode: "menu" | "pricelist" }>;

interface CategoriesEditorProps {
  value: CategoriesPatch;
  onChange: (v: OfferPatch) => void;
}

/** Reine Darstellung: Überschrift (optional) + Kategorien mit je einem Zeilen-Editor (Name, Beschreibung, Preis). */
function CategoriesEditor({ value, onChange }: CategoriesEditorProps) {
  const updateCategoryName = (ci: number, name: string) => {
    onChange({
      ...value,
      categories: replaceAt(value.categories, ci, {
        ...value.categories[ci],
        name,
      }),
    });
  };
  const addCategory = () => {
    if (value.categories.length >= MAX_LIST_ITEMS) return;
    onChange({
      ...value,
      categories: [
        ...value.categories,
        { name: "", items: [{ name: "", price: "" }] },
      ],
    });
  };
  const removeCategory = (ci: number) => {
    onChange({ ...value, categories: removeAt(value.categories, ci) });
  };
  const updateItem = (
    ci: number,
    ii: number,
    patch: Partial<CategoriesPatch["categories"][number]["items"][number]>
  ) => {
    const category = value.categories[ci];
    const items = replaceAt(category.items, ii, {
      ...category.items[ii],
      ...patch,
    });
    onChange({
      ...value,
      categories: replaceAt(value.categories, ci, { ...category, items }),
    });
  };
  const addItem = (ci: number) => {
    const category = value.categories[ci];
    if (category.items.length >= MAX_CATEGORY_ITEMS) return;
    onChange({
      ...value,
      categories: replaceAt(value.categories, ci, {
        ...category,
        items: [...category.items, { name: "", price: "" }],
      }),
    });
  };
  const removeItem = (ci: number, ii: number) => {
    const category = value.categories[ci];
    onChange({
      ...value,
      categories: replaceAt(value.categories, ci, {
        ...category,
        items: removeAt(category.items, ii),
      }),
    });
  };

  return (
    <>
      <div className="pb-studio-field">
        <label htmlFor="pb-offer-categories-headline">
          Überschrift (optional)
        </label>
        <input
          id="pb-offer-categories-headline"
          type="text"
          className="pb-studio-input"
          maxLength={80}
          value={value.headline ?? ""}
          onChange={e => onChange({ ...value, headline: e.target.value })}
        />
      </div>
      {value.categories.map((category, ci) => (
        <div className="pb-studio-cat" key={ci}>
          <div className="pb-studio-row">
            <input
              aria-label="Kategoriename"
              type="text"
              className="pb-studio-input"
              placeholder="Kategoriename"
              maxLength={60}
              value={category.name}
              aria-invalid={category.name.trim() === "" ? "true" : undefined}
              onChange={e => updateCategoryName(ci, e.target.value)}
            />
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              disabled={value.categories.length <= 1}
              onClick={() => removeCategory(ci)}
            >
              Kategorie entfernen
            </button>
          </div>
          {category.items.map((item, ii) => (
            <div className="pb-studio-row" key={ii}>
              <input
                aria-label="Name"
                type="text"
                className="pb-studio-input"
                placeholder="Name"
                maxLength={80}
                value={item.name}
                aria-invalid={item.name.trim() === "" ? "true" : undefined}
                onChange={e => updateItem(ci, ii, { name: e.target.value })}
              />
              <input
                aria-label="Beschreibung"
                type="text"
                className="pb-studio-input"
                placeholder="Beschreibung (optional)"
                maxLength={200}
                value={item.description ?? ""}
                onChange={e =>
                  updateItem(ci, ii, { description: e.target.value })
                }
              />
              <input
                aria-label="Preis"
                type="text"
                className="pb-studio-input"
                placeholder="Preis"
                maxLength={40}
                value={item.price}
                aria-invalid={item.price.trim() === "" ? "true" : undefined}
                onChange={e => updateItem(ci, ii, { price: e.target.value })}
              />
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={category.items.length <= 1}
                onClick={() => removeItem(ci, ii)}
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={category.items.length >= MAX_CATEGORY_ITEMS}
            onClick={() => addItem(ci)}
          >
            Position hinzufügen
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        disabled={value.categories.length >= MAX_LIST_ITEMS}
        onClick={addCategory}
      >
        Kategorie hinzufügen
      </button>
    </>
  );
}

interface OfferEditorProps {
  value: OfferPatch;
  onChange: (v: OfferPatch) => void;
}

/**
 * Listen-Editor für genau einen Angebotstyp. Kein Tab-Wechsel: Leistungen
 * gehören zum Basispaket (Checkliste „Angebot"), Speisekarte und Preisliste
 * sind eigene Extras — vermischte Tabs wirkten, als wären das derselbe
 * Inhalt.
 */
export function OfferEditor({ value, onChange }: OfferEditorProps) {
  const errors = validateOffer(value);
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
      {value.mode === "services" ? (
        <ServicesEditor value={value} onChange={onChange} />
      ) : (
        <CategoriesEditor value={value} onChange={onChange} />
      )}
    </div>
  );
}
