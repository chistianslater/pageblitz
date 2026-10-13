import React from "react";
import { NUMBERED, chapterIndex, type SystemSection } from "../shared";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type JournalSection = SystemSection;
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { rich, stripMarks } from "../../richText";
import { JournalEntry } from "./Entry";
import {
  JournalMenu,
  JournalPricelist,
  JournalProcess,
  JournalServices,
  JournalTeam,
} from "./Offer";
import { JournalAbout, JournalGallery, JournalReviews } from "./Story";
import { JournalContact, JournalFaq } from "./Visit";
import {
  JournalCta,
  JournalPageHead,
  JournalPartners,
  JournalQuote,
  JournalStats,
  JournalStory,
  JournalUsp,
} from "./Extras";

/*
 * Kapitelnummern (chapterIndex/NUMBERED) kommen aus ../shared: Der Einstieg
 * ist Kapitel 01 (ohne sichtbare Ziffer), der erste Inhaltsabschnitt 02;
 * Kontakt („Besuch") zählt mit.
 */

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
  story: "Geschichte",
  usp: "Grundsätze",
  stats: "In Zahlen",
  partners: "Partner",
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

/**
 * Zwischentöne ohne Nummer (Zahlen, Zitat, Partner) liegen auf dem Band
 * des vorangehenden Kapitels und lesen sich als dessen Ausklang.
 */
export function interludeClass(
  name: string,
  section: JournalSection,
  sections: readonly JournalSection[]
): string {
  const before = sections.slice(0, Math.max(0, sections.indexOf(section)));
  const previous = [...before].reverse().find(s => NUMBERED.has(s.type));
  const index = previous ? chapterIndex(sections, previous.type) : 0;
  return sectionClass(name, index);
}

/** Ergänzt das Euro-Zeichen, wenn der Preis nackt ist („ab 45" → „ab 45 €"). */
export function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (/€|eur/i.test(trimmed) || !/\d/.test(trimmed)) return trimmed;
  return `${trimmed} €`;
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

/** Abschnitts-Weiche. */
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
      return <JournalAbout section={section} sections={sections} />;
    case "gallery":
      return <JournalGallery section={section} sections={sections} />;
    case "testimonials":
      return <JournalReviews section={section} sections={sections} />;
    case "faq":
      return <JournalFaq section={section} sections={sections} />;
    case "contact":
      return <JournalContact section={section} sections={sections} />;
    case "story":
      return <JournalStory section={section} sections={sections} />;
    case "usp":
      return <JournalUsp section={section} sections={sections} />;
    case "stats":
      return <JournalStats section={section} sections={sections} />;
    case "quote":
      return <JournalQuote section={section} sections={sections} />;
    case "partners":
      return <JournalPartners section={section} sections={sections} />;
    case "cta":
      return <JournalCta section={section} sections={sections} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <JournalPageHead
          title={section.title}
          intro={section.intro}
          secondary={sections.find(s => s.type === "pageHeader") !== section}
        />
      );
    case "notice":
      // Banner über dem Kopf, zentral in SiteRenderer (noticeBanner.tsx).
      return null;
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}
