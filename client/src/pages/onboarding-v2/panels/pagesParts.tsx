import React from "react";
import type { PageSection, PageSectionOf } from "@shared/siteContract/types";

/**
 * Mini-Editoren für die Sektionen einer Unterseite (PagesEditor.tsx).
 * Bewusst schlanker als die Angebot-/Texte-Panels: pro Sektionstyp nur
 * die Inhaltsfelder, die auf einer Unterseite gepflegt werden sollen.
 * Kontakt und Galerie sind reine Hinweise — ihr Inhalt kommt von der
 * Startseite (syncLinkedSections in pagesLogic.ts). Alle aria-labels sind
 * nach Seite/Sektion/Zeile nummeriert, damit Screenreader gleichnamige
 * Felder unterscheiden (wie TeamEditor.tsx).
 */

/** Deckt sich mit OfferPatchSchema.items.max(12) — gleiche Obergrenze wie das Angebot-Panel. */
const MAX_SERVICE_ITEMS = 12;
const MAX_FAQ_ITEMS = 12;

/** Deutsche Bezeichnung je Sektionstyp für die Kopfzeile einer Sektionskarte. */
export const PAGE_SECTION_LABELS: Record<PageSection["type"], string> = {
  pageHeader: "Kopfzeile",
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  faq: "FAQ",
  contact: "Kontakt",
  testimonials: "Bewertungen",
  pricelist: "Preisliste",
  menu: "Speisekarte",
};

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

/** Ortsangabe für aria-labels: "Sektion 2 Seite 1". */
export function sectionWhere(pageIndex: number, sectionIndex: number): string {
  return `Sektion ${sectionIndex + 1} Seite ${pageIndex + 1}`;
}

interface SectionEditorProps<T extends PageSection> {
  value: T;
  where: string;
  onChange: (next: PageSection) => void;
}

function PageHeaderEditor({
  value,
  where,
  onChange,
}: SectionEditorProps<PageSectionOf<"pageHeader">>) {
  return (
    <>
      <input
        aria-label={`Titel ${where}`}
        type="text"
        className="pb-studio-input"
        placeholder="Titel"
        maxLength={60}
        value={value.title}
        aria-invalid={value.title.trim() === "" ? "true" : undefined}
        onChange={e => onChange({ ...value, title: e.target.value })}
      />
      <textarea
        aria-label={`Einleitung ${where} (optional)`}
        className="pb-studio-textarea"
        placeholder="Einleitung (optional)"
        maxLength={300}
        value={value.intro ?? ""}
        onChange={e => onChange({ ...value, intro: e.target.value })}
      />
    </>
  );
}

function ServicesEditor({
  value,
  where,
  onChange,
}: SectionEditorProps<PageSectionOf<"services">>) {
  const updateItem = (
    i: number,
    patch: Partial<PageSectionOf<"services">["items"][number]>
  ) =>
    onChange({
      ...value,
      items: replaceAt(value.items, i, { ...value.items[i], ...patch }),
    });
  return (
    <>
      <input
        aria-label={`Überschrift ${where}`}
        type="text"
        className="pb-studio-input"
        placeholder="Überschrift"
        maxLength={80}
        value={value.headline}
        aria-invalid={value.headline.trim() === "" ? "true" : undefined}
        onChange={e => onChange({ ...value, headline: e.target.value })}
      />
      <textarea
        aria-label={`Einleitung ${where} (optional)`}
        className="pb-studio-textarea"
        placeholder="Einleitung (optional)"
        maxLength={300}
        value={value.intro ?? ""}
        onChange={e => onChange({ ...value, intro: e.target.value })}
      />
      {value.items.map((item, i) => (
        <div className="pb-studio-row" key={i}>
          <input
            aria-label={`Titel Zeile ${i + 1} ${where}`}
            type="text"
            className="pb-studio-input"
            placeholder="Titel"
            maxLength={80}
            value={item.title}
            aria-invalid={item.title.trim() === "" ? "true" : undefined}
            onChange={e => updateItem(i, { title: e.target.value })}
          />
          <input
            aria-label={`Beschreibung Zeile ${i + 1} ${where} (optional)`}
            type="text"
            className="pb-studio-input"
            placeholder="Beschreibung (optional)"
            maxLength={240}
            value={item.description ?? ""}
            onChange={e => updateItem(i, { description: e.target.value })}
          />
          <input
            aria-label={`Preis Zeile ${i + 1} ${where} (optional)`}
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
            aria-label={`Zeile ${i + 1} ${where} entfernen`}
            disabled={value.items.length <= 1}
            onClick={() =>
              onChange({
                ...value,
                items: value.items.filter((_, j) => j !== i),
              })
            }
          >
            Entfernen
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        aria-label={`Zeile hinzufügen ${where}`}
        disabled={value.items.length >= MAX_SERVICE_ITEMS}
        onClick={() =>
          onChange({ ...value, items: [...value.items, { title: "" }] })
        }
      >
        Zeile hinzufügen
      </button>
    </>
  );
}

function AboutEditor({
  value,
  where,
  onChange,
}: SectionEditorProps<PageSectionOf<"about">>) {
  return (
    <>
      <input
        aria-label={`Überschrift ${where}`}
        type="text"
        className="pb-studio-input"
        placeholder="Überschrift"
        maxLength={120}
        value={value.headline}
        aria-invalid={value.headline.trim() === "" ? "true" : undefined}
        onChange={e => onChange({ ...value, headline: e.target.value })}
      />
      <textarea
        aria-label={`Text ${where}`}
        className="pb-studio-textarea"
        placeholder="Text"
        maxLength={2000}
        value={value.body}
        aria-invalid={value.body.trim() === "" ? "true" : undefined}
        onChange={e => onChange({ ...value, body: e.target.value })}
      />
    </>
  );
}

function FaqEditor({
  value,
  where,
  onChange,
}: SectionEditorProps<PageSectionOf<"faq">>) {
  const updateItem = (
    i: number,
    patch: Partial<PageSectionOf<"faq">["items"][number]>
  ) =>
    onChange({
      ...value,
      items: replaceAt(value.items, i, { ...value.items[i], ...patch }),
    });
  return (
    <>
      <input
        aria-label={`Überschrift ${where} (optional)`}
        type="text"
        className="pb-studio-input"
        placeholder="Überschrift (optional)"
        maxLength={80}
        value={value.headline ?? ""}
        onChange={e => onChange({ ...value, headline: e.target.value })}
      />
      {value.items.map((item, i) => (
        <div className="pb-studio-cat" key={i}>
          <input
            aria-label={`Frage Zeile ${i + 1} ${where}`}
            type="text"
            className="pb-studio-input"
            placeholder="Frage"
            maxLength={160}
            value={item.question}
            aria-invalid={item.question.trim() === "" ? "true" : undefined}
            onChange={e => updateItem(i, { question: e.target.value })}
          />
          <textarea
            aria-label={`Antwort Zeile ${i + 1} ${where}`}
            className="pb-studio-textarea"
            placeholder="Antwort"
            maxLength={600}
            value={item.answer}
            aria-invalid={item.answer.trim() === "" ? "true" : undefined}
            onChange={e => updateItem(i, { answer: e.target.value })}
          />
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            aria-label={`Zeile ${i + 1} ${where} entfernen`}
            disabled={value.items.length <= 1}
            onClick={() =>
              onChange({
                ...value,
                items: value.items.filter((_, j) => j !== i),
              })
            }
          >
            Entfernen
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        aria-label={`Frage hinzufügen ${where}`}
        disabled={value.items.length >= MAX_FAQ_ITEMS}
        onClick={() =>
          onChange({
            ...value,
            items: [...value.items, { question: "", answer: "" }],
          })
        }
      >
        Frage hinzufügen
      </button>
    </>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--st-muted)", fontSize: "0.85rem", margin: 0 }}>
      {children}
    </p>
  );
}

interface PageSectionEditorProps {
  value: PageSection;
  where: string;
  onChange: (next: PageSection) => void;
}

/** Wählt den passenden Mini-Editor je Sektionstyp; nicht editierbare Typen zeigen einen Hinweis. */
export function PageSectionEditor({
  value,
  where,
  onChange,
}: PageSectionEditorProps) {
  switch (value.type) {
    case "pageHeader":
      return (
        <PageHeaderEditor value={value} where={where} onChange={onChange} />
      );
    case "services":
      return <ServicesEditor value={value} where={where} onChange={onChange} />;
    case "about":
      return <AboutEditor value={value} where={where} onChange={onChange} />;
    case "faq":
      return <FaqEditor value={value} where={where} onChange={onChange} />;
    case "contact":
      return (
        <Hint>
          Kontakt übernimmt die Kontaktdaten deiner Startseite (Telefon, E-Mail,
          Adresse, Öffnungszeiten) — zu ändern im Panel „Rechtliches“. Die
          Unterseite zeigt sie auch dann, wenn die Kontakt-Sektion auf der
          Startseite ausgeblendet ist.
        </Hint>
      );
    case "gallery":
      return (
        <Hint>
          Galerie nutzt die Galerie-Bilder deiner Startseite — zu ändern im
          Panel „Fotos“. Die Unterseite zeigt sie auch dann, wenn die Galerie
          auf der Startseite ausgeblendet ist.
        </Hint>
      );
    case "testimonials":
      return (
        <Hint>
          Echte Google-Bewertungen werden unverändert übernommen — Text und
          Name lassen sich nicht bearbeiten. Die Überschrift kannst du in der
          Vorschau ändern.
        </Hint>
      );
    case "pricelist":
    case "menu":
      return (
        <Hint>
          Diese Sektion wird in der Vorschau angezeigt, lässt sich hier aber
          nicht bearbeiten.
        </Hint>
      );
    default: {
      const exhaustive: never = value;
      return exhaustive;
    }
  }
}
