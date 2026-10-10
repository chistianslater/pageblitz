import React from "react";
import type {
  PageSection,
  SectionV2,
} from "../../../../../../shared/siteContract/types";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type JournalSection = SectionV2 | PageSection;
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { rich, stripMarks } from "../../richText";
import { pickReviewQuote } from "../../artDirection/heroFacts";
import { JournalEntry } from "./Entry";
import {
  JournalMenu,
  JournalPricelist,
  JournalProcess,
  JournalServices,
  JournalTeam,
  JournalTeamSlot,
  teamSlotAfter,
} from "./Offer";

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

/** Journal-Wortwahl der Kapitel-Labels (Systemblatt); Bauplan-Labels gewinnen. */
const CHAPTER_LABELS: Partial<Record<JournalSection["type"], string>> = {
  services: "Leistungen",
  process: "Ablauf",
  pricelist: "Preise",
  menu: "Speisekarte",
  team: "Team",
  about: "Über uns",
  gallery: "Einblicke",
  testimonials: "Stimmen",
  faq: "Gut zu wissen",
  contact: "Besuch",
};

export function chapterLabel(
  type: JournalSection["type"],
  blueprint: Blueprint
): string {
  const own = blueprint.navLabels?.[type as keyof typeof blueprint.navLabels];
  return own ?? CHAPTER_LABELS[type] ?? "";
}

/**
 * Abschnittsklasse mit hellem Band nach Systemblatt: Kapitel 03, 05, 07 …
 * liegen auf `--jr-raised`, 02, 04, 06 auf Papier — der Wechsel ergibt sich
 * aus der lückenlosen Nummer, nicht aus dem Typ.
 */
export function sectionClass(name: string, index: number): string {
  return `jr-section jr-${name}${index % 2 === 1 ? " jr-section--raised" : ""}`;
}

/** Ergänzt das Euro-Zeichen, wenn der Preis nackt ist („ab 45" → „ab 45 €"). */
export function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (/€|eur/i.test(trimmed) || !/\d/.test(trimmed)) return trimmed;
  return `${trimmed} €`;
}

/**
 * Zeigt Journal den Abschnitt überhaupt? Stimmen ohne zitierfähige
 * Bewertung entfallen ganz — vor der Nummerierung, damit die Kapitel
 * lückenlos bleiben.
 */
export function journalShows(section: JournalSection): boolean {
  if (section.type === "testimonials")
    return Boolean(pickReviewQuote(section.items));
  return true;
}

const same = (a: string, b: string) =>
  stripMarks(a).trim().toLocaleLowerCase("de") ===
  stripMarks(b).trim().toLocaleLowerCase("de");

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
        {label && !same(label, title) ? label : null}
      </p>
      <h2 id={`${id}-titel`}>{rich(title)}</h2>
      {intro && <p className="jr-chapter-intro">{rich(intro)}</p>}
    </header>
  );
}

/** Abschnitts-Weiche; Task 11 ergänzt Gut zu wissen und Besuch. */
export function renderJournalSection(
  section: JournalSection,
  sections: readonly JournalSection[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <JournalEntry hero={section} sections={sections} />;
    case "services":
      return <JournalServices section={section} sections={sections} />;
    case "process":
      return <JournalProcess section={section} sections={sections} />;
    case "pricelist":
      return <JournalPricelist section={section} sections={sections} />;
    case "menu":
      return <JournalMenu section={section} sections={sections} />;
    case "team":
      return <JournalTeam section={section} sections={sections} />;
    case "about":
      return teamSlotAfter(sections) === "about" ? (
        <JournalTeamSlot sections={sections} />
      ) : null;
    case "gallery":
      return teamSlotAfter(sections) === "gallery" ? (
        <JournalTeamSlot sections={sections} />
      ) : null;
    default:
      return null;
  }
}
