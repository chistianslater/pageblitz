import React from "react";
import type {
  PageSection,
  SectionV2,
} from "../../../../../../shared/siteContract/types";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type JournalSection = SectionV2 | PageSection;
import { rich } from "../../richText";
import { JournalEntry } from "./Entry";

/**
 * Nummerierte Kapitel nach Systemblatt: Der Einstieg ist Kapitel 01 (ohne
 * sichtbare Ziffer), der erste Inhaltsabschnitt 02; Kontakt („Besuch")
 * zählt mit. Lückenlos über die übergebenen (sichtbaren) Abschnitte in
 * Renderreihenfolge.
 */
const NUMBERED: ReadonlySet<JournalSection["type"]> = new Set([
  "services",
  "process",
  "about",
  "gallery",
  "testimonials",
  "team",
  "pricelist",
  "menu",
  "faq",
  "contact",
]);

/** Der Einstieg belegt Kapitel 01. */
const FIRST_CHAPTER = 2;

/** Kapitelnummer eines Abschnitts (ab 02), 0 für nicht nummerierte. */
export function chapterIndex(
  sections: readonly JournalSection[],
  type: JournalSection["type"]
): number {
  const position = sections
    .filter(s => NUMBERED.has(s.type))
    .findIndex(s => s.type === type);
  return position === -1 ? 0 : position + FIRST_CHAPTER;
}

/**
 * Kapitelkopf nach Systemblatt: Label-Zeile „02 LEISTUNGEN" (kursive
 * Serifenziffer in Akzentfarbe + Versal-Kicker), darunter die Serifen-H2.
 */
export function JournalChapter({
  index,
  label,
  title,
  intro,
  id,
}: {
  index: number;
  label?: string;
  title: string;
  intro?: string;
  id: string;
}) {
  return (
    <header className="jr-chapter">
      <p className="jr-kicker jr-chapter-label">
        {index > 0 && (
          <span className="jr-chapter-no" aria-hidden="true">
            {String(index).padStart(2, "0")}
          </span>
        )}
        {label}
      </p>
      <h2 id={`${id}-titel`}>{rich(title)}</h2>
      {intro && <p className="jr-chapter-intro">{rich(intro)}</p>}
    </header>
  );
}

/** Abschnitts-Weiche; Task 8–11 füllen die Fälle. */
export function renderJournalSection(
  section: JournalSection,
  sections: readonly JournalSection[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <JournalEntry hero={section} sections={sections} />;
    default:
      return null;
  }
}
