import type {
  PageSection,
  SectionV2,
} from "../../../../../../shared/siteContract/types";
import { pickReviewQuote } from "./heroFacts";
import type { NavItem } from "../../engine";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type SystemSection = SectionV2 | PageSection;

/**
 * Nummerierte Kapitel: Der Einstieg ist Kapitel 01 (ohne sichtbare
 * Ziffer), der erste Inhaltsabschnitt 02; Kontakt zählt mit. Lückenlos
 * über die übergebenen (sichtbaren) Abschnitte in Renderreihenfolge.
 */
export const NUMBERED: ReadonlySet<SystemSection["type"]> = new Set([
  "services",
  "process",
  "about",
  "gallery",
  "testimonials",
  "team",
  "pricelist",
  "menu",
  "faq",
  "story",
  "usp",
  "contact",
]);

/** Der Einstieg belegt Kapitel 01. */
const FIRST_CHAPTER = 2;

/** Kapitelnummer eines Abschnitts (ab 02), 0 für nicht nummerierte. */
export function chapterIndex(
  sections: readonly SystemSection[],
  type: SystemSection["type"]
): number {
  const position = sections
    .filter(s => NUMBERED.has(s.type))
    .findIndex(s => s.type === type);
  return position === -1 ? 0 : position + FIRST_CHAPTER;
}

/**
 * Zeigt das System den Abschnitt überhaupt? Stimmen ohne zitierfähige
 * Bewertung und leere Karten/Preislisten entfallen ganz — vor der
 * Nummerierung, damit die Kapitel lückenlos bleiben.
 */
export function systemShows(section: SystemSection): boolean {
  if (section.type === "testimonials")
    return Boolean(pickReviewQuote(section.items));
  if (section.type === "menu" || section.type === "pricelist")
    return section.categories.some(c => c.items.length > 0);
  return true;
}

/**
 * Navigation ohne Anker auf Abschnitte, die das System nicht zeigt (z. B.
 * Stimmen ohne zitierfähige Bewertung). Geprüft wird an der Startseite,
 * weil die Anker auch von Unterseiten dorthin zeigen.
 */
export function shownNavItems(
  items: NavItem[],
  home: readonly SystemSection[]
): NavItem[] {
  const dropped = new Set(
    home.filter(s => !systemShows(s)).map(s => s.type as string)
  );
  return items.filter(
    item => !item.sectionType || !dropped.has(item.sectionType)
  );
}

/** Nummerierte Abbildungen („Abb. n"). */
export type FigureNumbers = {
  hero?: number;
  about?: number;
  /** Erste Nummer der Galerie; die Bilder zählen fortlaufend weiter. */
  gallery?: number;
  /** Letzte Nummer der Galerie (für „Abb. 3 bis 7"). */
  galleryLast?: number;
};

/**
 * Abbildungsnummern fortlaufend über die Seite, in Renderreihenfolge:
 * Einstiegsfoto (falls gezeigt), Über-uns-Foto, dann die Galerie. Rein aus
 * der Abschnittsliste berechnet — kein Zähler, der beim Rendern mitläuft.
 * `hidden` sind die im Studio aussortierten Bilder (designProfile).
 */
export function figureNumbers(
  sections: readonly SystemSection[],
  hidden: readonly string[] = []
): FigureNumbers {
  const numbers: FigureNumbers = {};
  let next = 1;
  for (const s of sections) {
    if (s.type === "hero" && s.imageUrl && !hidden.includes("hero-media"))
      numbers.hero = next++;
    else if (
      s.type === "about" &&
      s.imageUrl &&
      !hidden.includes("about-media")
    )
      numbers.about = next++;
    else if (s.type === "gallery" && s.images.length > 0) {
      numbers.gallery = next;
      next += s.images.length;
      numbers.galleryLast = next - 1;
    }
  }
  return numbers;
}
