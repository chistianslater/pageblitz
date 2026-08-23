import { PagesPatchSchema } from "@shared/onboardingV2/patches";
import { RESERVED_PAGE_SLUGS } from "@shared/siteContract/schema";
import type { Page, PageSection } from "@shared/siteContract/types";

/**
 * Validierung des Unterseiten-Entwurfs (PagesEditor.tsx / AddonsPanel.tsx
 * „Übernehmen“) — ausgelagert aus pagesLogic.ts (Dateigröße), gleiche
 * Grenzen wie PageSchema/PagesPatchSchema.
 */

/** Deckt sich mit PageSchema.slug (shared/siteContract/schema.ts). */
export const SLUG_PATTERN = /^[a-z0-9-]{2,40}$/;

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_PAGE_SLUGS as readonly string[]).includes(slug);
}

function isBlank(value: string | undefined): boolean {
  return (value ?? "").trim() === "";
}

/** Pflichtfeld-Prüfung je Sektion — Schema lässt leere Strings zu, der Editor soll sie aber nicht speichern. */
function requiredFieldErrors(section: PageSection, where: string): string[] {
  const messages: string[] = [];
  switch (section.type) {
    case "pageHeader":
      if (isBlank(section.title)) messages.push(`Titel fehlt bei ${where}.`);
      break;
    case "services":
      if (isBlank(section.headline))
        messages.push(`Überschrift fehlt bei ${where}.`);
      section.items.forEach((item, i) => {
        if (isBlank(item.title))
          messages.push(`Titel fehlt in Zeile ${i + 1} bei ${where}.`);
      });
      break;
    case "about":
      if (isBlank(section.headline))
        messages.push(`Überschrift fehlt bei ${where}.`);
      if (isBlank(section.body)) messages.push(`Text fehlt bei ${where}.`);
      break;
    case "faq":
      section.items.forEach((item, i) => {
        if (isBlank(item.question))
          messages.push(`Frage fehlt in Zeile ${i + 1} bei ${where}.`);
        if (isBlank(item.answer))
          messages.push(`Antwort fehlt in Zeile ${i + 1} bei ${where}.`);
      });
      break;
    default:
      break;
  }
  return messages;
}

/**
 * Übersetzt einen Zod-Issue der PagesPatchSchema-Validierung in eine
 * lesbare deutsche Meldung — `null` für Fälle, die bereits über die
 * Pflichtfeld-/Slug-/Eindeutigkeitsprüfung abgedeckt sind.
 */
function describePagesIssue(issue: {
  code: string;
  path: PropertyKey[];
}): string | null {
  const [root, pageIndex, field, ...rest] = issue.path;
  if (root !== "pages") return null;
  if (typeof pageIndex !== "number") {
    return "Es sind maximal 5 Unterseiten möglich.";
  }
  const where = `Seite ${pageIndex + 1}`;
  if (field === "slug") return null; // eigene Slug-Prüfung unten
  if (field === "title") {
    return issue.code === "too_small"
      ? null
      : `Titel bei ${where} ist zu lang (max. 60 Zeichen).`;
  }
  if (field === "navLabel") {
    return `Navigationsname bei ${where} ist zu lang (max. 24 Zeichen).`;
  }
  if (field === "seo") {
    const seoField = rest[0];
    return seoField === "description"
      ? `SEO-Beschreibung bei ${where} ist zu lang (max. 160 Zeichen).`
      : `SEO-Titel bei ${where} ist zu lang (max. 70 Zeichen).`;
  }
  if (field === "sections") {
    const sectionIndex = rest[0];
    if (typeof sectionIndex !== "number") {
      return issue.code === "too_small"
        ? null
        : `${where} kann maximal 8 Sektionen haben.`;
    }
    if (issue.code === "too_small") return null; // Pflichtfelder oben
    return `Ein Feld in Sektion ${sectionIndex + 1} auf ${where} ist zu lang oder ungültig.`;
  }
  return null;
}

/**
 * Reine Funktion: Fehlerliste für den Editor (deutsche Meldungen, je mit
 * Seiten-/Sektionsnummer). Deckt sich mit PagesPatchSchema (Slug-Format,
 * reserviert, Längen, 1–8 Sektionen, max. 5 Seiten) plus Eindeutigkeit der
 * Slugs und Pflichtfelder, die das Schema nicht erzwingt (leere Titel/
 * Fragen/Texte). Leer = speicherbar.
 */
export function validatePages(pages: Page[]): string[] {
  const messages: string[] = [];
  const seen = new Map<string, number>();

  pages.forEach((page, pi) => {
    const where = `Seite ${pi + 1}`;
    if (isBlank(page.title)) messages.push(`Titel fehlt bei ${where}.`);
    const slug = page.slug;
    if (!SLUG_PATTERN.test(slug)) {
      messages.push(
        `Pfad bei ${where} ist ungültig — erlaubt sind 2–40 Kleinbuchstaben, Ziffern und Bindestriche.`
      );
    } else if (isReservedSlug(slug)) {
      messages.push(
        `Pfad bei ${where} ist reserviert — bitte einen anderen wählen.`
      );
    }
    const first = seen.get(slug);
    if (first !== undefined) {
      messages.push(
        `Pfad „${slug}“ ist mehrfach vergeben (Seite ${first + 1} und ${where}).`
      );
    } else {
      seen.set(slug, pi);
    }
    if (page.sections.length === 0) {
      messages.push(`${where} braucht mindestens eine Sektion.`);
    }
    page.sections.forEach((section, si) => {
      messages.push(
        ...requiredFieldErrors(section, `Sektion ${si + 1} auf ${where}`)
      );
    });
  });

  const result = PagesPatchSchema.safeParse({ pages });
  if (!result.success) {
    for (const issue of result.error.issues) {
      const message = describePagesIssue(issue);
      if (message && !messages.includes(message)) messages.push(message);
    }
  }
  return messages;
}
