import React from "react";
import type { OfferPatch } from "@shared/onboardingV2/patches";

export type OfferMode = OfferPatch["mode"];

const MODE_LABELS: Record<OfferMode, string> = {
  services: "Leistungen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
};

const MODES: OfferMode[] = ["services", "menu", "pricelist"];

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

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}
function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

interface ModeSegmentProps {
  mode: OfferMode;
  onSelect: (mode: OfferMode) => void;
}

/** Reine Darstellung: Segmented Control Leistungen / Speisekarte / Preisliste. */
export function ModeSegment({ mode, onSelect }: ModeSegmentProps) {
  return (
    <div className="pb-studio-seg" role="group" aria-label="Angebotstyp">
      {MODES.map(m => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => onSelect(m)}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
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
        <label htmlFor="pb-offer-headline">Überschrift</label>
        <input
          id="pb-offer-headline"
          type="text"
          className="pb-studio-input"
          value={value.headline}
          onChange={e => onChange({ ...value, headline: e.target.value })}
        />
      </div>
      <div className="pb-studio-field">
        <label htmlFor="pb-offer-intro">Einleitung (optional)</label>
        <textarea
          id="pb-offer-intro"
          className="pb-studio-textarea"
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
            value={item.title}
            onChange={e => updateItem(i, { title: e.target.value })}
          />
          <input
            aria-label="Beschreibung"
            type="text"
            className="pb-studio-input"
            placeholder="Beschreibung (optional)"
            value={item.description ?? ""}
            onChange={e => updateItem(i, { description: e.target.value })}
          />
          <input
            aria-label="Preis"
            type="text"
            className="pb-studio-input"
            placeholder="Preis (optional)"
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
        <label htmlFor="pb-offer-headline">Überschrift (optional)</label>
        <input
          id="pb-offer-headline"
          type="text"
          className="pb-studio-input"
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
              value={category.name}
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
                value={item.name}
                onChange={e => updateItem(ci, ii, { name: e.target.value })}
              />
              <input
                aria-label="Beschreibung"
                type="text"
                className="pb-studio-input"
                placeholder="Beschreibung (optional)"
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
                value={item.price}
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
 * Reine Darstellung: Modus-Segment (Leistungen | Speisekarte | Preisliste) +
 * passender Listen-Editor. Ein Moduswechsel meldet nur die neue, leere Form
 * über onChange — das Elternpanel (OfferPanel) merkt sich pro Modus den
 * zuletzt bearbeiteten Entwurf und ersetzt den leeren Wert ggf. dadurch.
 */
export function OfferEditor({ value, onChange }: OfferEditorProps) {
  const handleModeSelect = (mode: OfferMode) => {
    if (mode === value.mode) return;
    onChange(blankOffer(mode));
  };
  return (
    <div className="pb-studio-rows">
      <ModeSegment mode={value.mode} onSelect={handleModeSelect} />
      {value.mode === "services" ? (
        <ServicesEditor value={value} onChange={onChange} />
      ) : (
        <CategoriesEditor value={value} onChange={onChange} />
      )}
    </div>
  );
}
