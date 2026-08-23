import React, { useState } from "react";
import type { Page, WebsiteDataV2 } from "@shared/siteContract/types";
import {
  MAX_PAGES,
  SECTION_TEMPLATES,
  addPage,
  addSectionFromTemplate,
  movePage,
  moveSection,
  removePage,
  removeSection,
  updatePage,
  updateSection,
  validatePages,
  type SectionTemplate,
} from "./pagesLogic";
import {
  PAGE_SECTION_LABELS,
  PageSectionEditor,
  sectionWhere,
} from "./pagesParts";

function pageLabel(page: Page, index: number): string {
  const trimmed = page.title.trim();
  return trimmed ? `Seite ‚${trimmed}‘` : `Seite ${index + 1}`;
}

interface PagesEditorProps {
  value: Page[];
  onChange: (next: Page[]) => void;
  /** Startseiten-Dokument — Quelle für Vorlagen (Kontakt, Galerie, Über uns). */
  doc: WebsiteDataV2;
}

interface PageCardProps {
  page: Page;
  index: number;
  count: number;
  doc: WebsiteDataV2;
  onChange: (next: Page) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}

/** Eine Seitenkarte: Metadaten (Titel/Pfad/Navigationsname/SEO), Sektionsliste mit Mini-Editoren, Vorlagen-Auswahl. */
function PageCard({
  page,
  index,
  count,
  doc,
  onChange,
  onMove,
  onRemove,
}: PageCardProps) {
  const [template, setTemplate] = useState<SectionTemplate>("services-detail");
  const [templateError, setTemplateError] = useState<string | null>(null);
  const where = `Seite ${index + 1}`;

  const handleAddSection = () => {
    const result = addSectionFromTemplate(page, template, doc);
    if (!result.ok) {
      setTemplateError(result.error);
      return;
    }
    setTemplateError(null);
    onChange(result.page);
  };

  return (
    <div className="pb-studio-cat">
      <div className="pb-studio-team-actions">
        <strong style={{ flex: 1 }}>{pageLabel(page, index)}</strong>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          aria-label={`${pageLabel(page, index)} nach oben verschieben`}
          disabled={index === 0}
          onClick={() => onMove("up")}
        >
          ↑
        </button>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          aria-label={`${pageLabel(page, index)} nach unten verschieben`}
          disabled={index === count - 1}
          onClick={() => onMove("down")}
        >
          ↓
        </button>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          aria-label={`${pageLabel(page, index)} entfernen`}
          onClick={onRemove}
        >
          Entfernen
        </button>
      </div>
      <input
        aria-label={`Seitentitel ${where}`}
        type="text"
        className="pb-studio-input"
        placeholder="Seitentitel"
        maxLength={60}
        value={page.title}
        aria-invalid={page.title.trim() === "" ? "true" : undefined}
        onChange={e => onChange({ ...page, title: e.target.value })}
      />
      <div className="pb-studio-row">
        <input
          aria-label={`Pfad ${where}`}
          type="text"
          className="pb-studio-input"
          placeholder="pfad-der-seite"
          maxLength={40}
          value={page.slug}
          onChange={e => onChange({ ...page, slug: e.target.value })}
        />
        <input
          aria-label={`Navigationsname ${where} (optional)`}
          type="text"
          className="pb-studio-input"
          placeholder="Navigationsname (optional)"
          maxLength={24}
          value={page.navLabel ?? ""}
          onChange={e => onChange({ ...page, navLabel: e.target.value })}
        />
      </div>
      <div className="pb-studio-row">
        <input
          aria-label={`SEO-Titel ${where}`}
          type="text"
          className="pb-studio-input"
          placeholder="SEO-Titel"
          maxLength={70}
          value={page.seo.title}
          onChange={e =>
            onChange({ ...page, seo: { ...page.seo, title: e.target.value } })
          }
        />
        <input
          aria-label={`SEO-Beschreibung ${where}`}
          type="text"
          className="pb-studio-input"
          placeholder="SEO-Beschreibung"
          maxLength={160}
          value={page.seo.description}
          onChange={e =>
            onChange({
              ...page,
              seo: { ...page.seo, description: e.target.value },
            })
          }
        />
      </div>
      {page.sections.map((section, si) => {
        const sectionLabel = sectionWhere(index, si);
        // Key = Sektionstyp: je Seite eindeutig (addSectionFromTemplate lehnt
        // Doppelte ab), bleibt beim Verschieben an der Sektion — anders als
        // der Index, der den Mini-Editor an der Position festhalten würde.
        return (
          <div className="pb-studio-cat" key={section.type}>
            <div className="pb-studio-team-actions">
              <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>
                {PAGE_SECTION_LABELS[section.type]}
              </span>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                aria-label={`${sectionLabel} nach oben verschieben`}
                disabled={si === 0}
                onClick={() => onChange(moveSection(page, si, "up"))}
              >
                ↑
              </button>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                aria-label={`${sectionLabel} nach unten verschieben`}
                disabled={si === page.sections.length - 1}
                onClick={() => onChange(moveSection(page, si, "down"))}
              >
                ↓
              </button>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                aria-label={`${sectionLabel} entfernen`}
                onClick={() => onChange(removeSection(page, si))}
              >
                Entfernen
              </button>
            </div>
            <PageSectionEditor
              value={section}
              where={sectionLabel}
              onChange={next => onChange(updateSection(page, si, next))}
            />
          </div>
        );
      })}
      <div className="pb-studio-row">
        <select
          aria-label={`Vorlage ${where}`}
          className="pb-studio-input"
          value={template}
          onChange={e => setTemplate(e.target.value as SectionTemplate)}
        >
          {SECTION_TEMPLATES.map(t => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          onClick={handleAddSection}
        >
          Sektion hinzufügen
        </button>
      </div>
      {templateError && (
        <p role="alert" style={{ color: "var(--st-warn)", margin: 0 }}>
          {templateError}
        </p>
      )}
    </div>
  );
}

/**
 * Unterseiten-Editor für den Unterbereich "Unterseiten" des Extras-Panels
 * (AddonsPanel.tsx, Spec §2.1). Reine Darstellung über `value`/`onChange`
 * (Entwurf liegt im Elternpanel, gespeichert wird erst mit "Übernehmen" →
 * onboardingV2.updatePages) — keine tRPC-Aufrufe hier, damit der Editor
 * statisch testbar bleibt (PagesEditor.test.tsx).
 */
export function PagesEditor({ value, onChange, doc }: PagesEditorProps) {
  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const errors = validatePages(value);

  const handleAdd = () => {
    const result = addPage(value, newTitle);
    if (!result.ok) {
      setAddError(result.error);
      return;
    }
    setAddError(null);
    setNewTitle("");
    onChange(result.pages);
  };

  return (
    <div className="pb-studio-rows">
      <p style={{ color: "var(--st-muted)", fontSize: "0.85rem", margin: 0 }}>
        Bis zu {MAX_PAGES} Unterseiten mit eigener Adresse — sie erscheinen in
        der Navigation deiner Website.
      </p>
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
      {value.length === 0 && (
        <p style={{ color: "var(--st-muted)" }}>
          Noch keine Unterseite — lege die erste Seite an, z. B. „Leistungen im
          Detail“.
        </p>
      )}
      {value.map((page, i) => (
        // Bewusst Index als Key: der Slug wird in der Karte selbst editiert
        // (Remount bei jedem Tastendruck → Fokusverlust) und kann beim Tippen
        // vorübergehend doppelt sein; Pages haben keine stabile ID. Die
        // Eingaben sind controlled — beim Verschieben bleibt nur die lokale
        // Vorlagen-Auswahl der Karte an der Position hängen.
        <PageCard
          key={i}
          page={page}
          index={i}
          count={value.length}
          doc={doc}
          onChange={next => onChange(updatePage(value, i, next))}
          onMove={direction => onChange(movePage(value, i, direction))}
          onRemove={() => onChange(removePage(value, i))}
        />
      ))}
      <div className="pb-studio-row">
        <input
          aria-label="Titel der neuen Seite"
          type="text"
          className="pb-studio-input"
          placeholder="Titel der neuen Seite"
          maxLength={60}
          value={newTitle}
          disabled={value.length >= MAX_PAGES}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          disabled={value.length >= MAX_PAGES}
          onClick={handleAdd}
        >
          Seite anlegen
        </button>
      </div>
      {addError && (
        <p role="alert" style={{ color: "var(--st-warn)", margin: 0 }}>
          {addError}
        </p>
      )}
    </div>
  );
}
