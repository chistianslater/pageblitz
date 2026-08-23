import type {
  Page,
  PageSection,
  PageSectionOf,
  SectionOf,
  WebsiteDataV2,
} from "@shared/siteContract/types";
import { PAGE_CONTACT_DEFAULT_HEADLINE } from "@/components/site/engine";
import { isReservedSlug } from "./pagesValidation";

export { validatePages } from "./pagesValidation";

/**
 * Reine Logik des "Unterseiten"-Unterbereichs im Extras-Panel
 * (PagesEditor.tsx, AddonsPanel.tsx). Grenzen decken sich mit
 * PageSchema/PagesPatchSchema (shared/siteContract/schema.ts,
 * shared/onboardingV2/patches.ts): max. 5 Seiten, 1–8 Sektionen je Seite,
 * Slug `^[a-z0-9-]{2,40}$` und nicht reserviert.
 */
export const MAX_PAGES = 5;
export const MAX_PAGE_SECTIONS = 8;
const SLUG_MAX_LENGTH = 40;
const SLUG_MIN_LENGTH = 2;

export type PagesResult =
  | { ok: true; pages: Page[] }
  | { ok: false; error: string };
export type PageResult =
  | { ok: true; page: Page }
  | { ok: false; error: string };

/** Vorlagen für "Sektion hinzufügen" (Spec §2.1: Leistungen-Detail, Über uns, Galerie, FAQ, Kontakt). */
export type SectionTemplate =
  | "services-detail"
  | "about"
  | "gallery"
  | "faq"
  | "contact";

export const SECTION_TEMPLATES: { id: SectionTemplate; label: string }[] = [
  { id: "services-detail", label: "Leistungen" },
  { id: "about", label: "Über uns" },
  { id: "gallery", label: "Galerie" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Kontakt" },
];

const TEMPLATE_SECTION_TYPE: Record<SectionTemplate, PageSection["type"]> = {
  "services-detail": "services",
  about: "about",
  gallery: "gallery",
  faq: "faq",
  contact: "contact",
};

const UMLAUT_MAP: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
};

/**
 * Reine Funktion: Seitentitel → Slug-Vorschlag. Umlaute/ß werden
 * transkribiert (ä→ae …), andere diakritische Zeichen über NFD entfernt,
 * alles außer a-z0-9 wird zum Bindestrich, Mehrfach-/Randbindestriche
 * bereinigt, auf 40 Zeichen gekürzt (ohne Bindestrich am Ende). Leerer
 * String, wenn aus dem Titel kein Pfad entsteht.
 */
export function slugFromTitle(title: string): string {
  const transliterated = title
    .toLowerCase()
    .replace(/[äöüß]/g, ch => UMLAUT_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const dashed = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return dashed.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, "");
}

/** Hängt -2, -3 … an, bis der Slug unter den vorhandenen Seiten eindeutig ist. */
function uniqueSlug(base: string, pages: Page[]): string {
  const taken = new Set(pages.map(p => p.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Reine Funktion: neue Seite aus einem Titel — Slug-Vorschlag aus dem Titel
 * (bei Kollision mit Suffix -2, -3 …), SEO-Titel = Titel, erste Sektion
 * `pageHeader`. Fehler bei leerem Titel, unbrauchbarem Pfad, reserviertem
 * Slug oder erreichtem Limit (max. 5).
 */
export function addPage(pages: Page[], title: string): PagesResult {
  const trimmed = title.trim();
  if (trimmed === "") {
    return {
      ok: false,
      error: "Bitte einen Titel für die neue Seite eingeben.",
    };
  }
  if (pages.length >= MAX_PAGES) {
    return { ok: false, error: "Es sind maximal 5 Unterseiten möglich." };
  }
  const base = slugFromTitle(trimmed);
  if (base.length < SLUG_MIN_LENGTH) {
    return {
      ok: false,
      error:
        "Aus diesem Titel lässt sich kein Pfad bilden — bitte Buchstaben oder Ziffern verwenden.",
    };
  }
  if (isReservedSlug(base)) {
    return {
      ok: false,
      error: `Der Pfad „${base}“ ist reserviert — bitte einen anderen Titel wählen.`,
    };
  }
  const page: Page = {
    slug: uniqueSlug(base, pages),
    title: trimmed,
    seo: { title: trimmed, description: "" },
    sections: [{ type: "pageHeader", title: trimmed }],
  };
  return { ok: true, pages: [...pages, page] };
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

function swap<T>(list: T[], index: number, direction: "up" | "down"): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}

/** Reine Funktion: ersetzt einzelne Felder der Seite an `index`. */
export function updatePage(
  pages: Page[],
  index: number,
  patch: Partial<Page>
): Page[] {
  return replaceAt(pages, index, { ...pages[index], ...patch });
}

export function removePage(pages: Page[], index: number): Page[] {
  return pages.filter((_, i) => i !== index);
}

/** Reine Funktion: vertauscht mit dem Nachbarn — No-op am Rand (gleiches Objekt zurück). */
export function movePage(
  pages: Page[],
  index: number,
  direction: "up" | "down"
): Page[] {
  return swap(pages, index, direction);
}

function findSection<T extends WebsiteDataV2["sections"][number]["type"]>(
  doc: WebsiteDataV2,
  type: T
): SectionOf<T> | undefined {
  return doc.sections.find((s): s is SectionOf<T> => s.type === type);
}

/**
 * Kontakt-Sektion für eine Unterseite: Fakten 1:1 von der Startseite,
 * Überschrift `PAGE_CONTACT_DEFAULT_HEADLINE` („Kontakt") als Standard —
 * dieselbe wie beim Live-Rendern in engine.ts `linkPageSections`, das die
 * Startseiten-Überschrift bewusst NICHT übernimmt.
 */
function contactFromDoc(doc: WebsiteDataV2): PageSectionOf<"contact"> {
  const contact = findSection(doc, "contact");
  return {
    ...(contact ?? { type: "contact" }),
    headline: PAGE_CONTACT_DEFAULT_HEADLINE,
  };
}

function buildTemplateSection(
  page: Page,
  template: SectionTemplate,
  doc: WebsiteDataV2
): PageSection | string {
  switch (template) {
    case "services-detail":
      return { type: "services", headline: page.title, items: [{ title: "" }] };
    case "about": {
      const about = findSection(doc, "about");
      return about
        ? { ...about }
        : { type: "about", headline: "Über uns", body: "" };
    }
    case "gallery": {
      const gallery = findSection(doc, "gallery");
      if (!gallery || gallery.images.length === 0) {
        return "Lege zuerst Galerie-Bilder im Fotos-Panel an — die Galerie einer Unterseite zeigt dieselben Bilder.";
      }
      return {
        type: "gallery",
        images: gallery.images.map(img => ({ ...img })),
      };
    }
    case "faq":
      return {
        type: "faq",
        headline: "Häufige Fragen",
        items: [{ question: "", answer: "" }],
      };
    case "contact":
      return contactFromDoc(doc);
  }
}

/**
 * Reine Funktion: hängt eine Sektion aus einer Vorlage an die Seite an.
 * Kontakt und Galerie übernehmen Inhalte der Startseite (und werden vor dem
 * Speichern per `syncLinkedSections` erneut aufgefrischt), Über uns nimmt
 * den Startseiten-Text als Startpunkt. Jeder Sektionstyp höchstens einmal je
 * Seite (hält Editor und KI-Diff — ein Eintrag je Typ — einfach), maximal
 * 8 Sektionen (PageSchema).
 */
export function addSectionFromTemplate(
  page: Page,
  template: SectionTemplate,
  doc: WebsiteDataV2
): PageResult {
  if (page.sections.length >= MAX_PAGE_SECTIONS) {
    return { ok: false, error: "Eine Seite kann maximal 8 Sektionen haben." };
  }
  const type = TEMPLATE_SECTION_TYPE[template];
  if (page.sections.some(s => s.type === type)) {
    return {
      ok: false,
      error:
        "Diese Sektion gibt es auf der Seite schon — bitte die vorhandene bearbeiten.",
    };
  }
  const built = buildTemplateSection(page, template, doc);
  if (typeof built === "string") return { ok: false, error: built };
  return { ok: true, page: { ...page, sections: [...page.sections, built] } };
}

export function updateSection(
  page: Page,
  index: number,
  section: PageSection
): Page {
  return { ...page, sections: replaceAt(page.sections, index, section) };
}

export function removeSection(page: Page, index: number): Page {
  return { ...page, sections: page.sections.filter((_, i) => i !== index) };
}

/** Reine Funktion: vertauscht Sektionen — No-op am Rand (gleiches Objekt zurück). */
export function moveSection(
  page: Page,
  index: number,
  direction: "up" | "down"
): Page {
  const next = swap(page.sections, index, direction);
  return next === page.sections ? page : { ...page, sections: next };
}

/**
 * Reine Funktion: frischt verknüpfte Sektionen aller Seiten aus der
 * Startseite auf — Kontakt (Fakten) und Galerie (Bilder) sollen auf
 * Unterseiten immer dem Stand der Startseite entsprechen ("übernimmt die
 * Kontaktdaten" / "nutzt die Galerie-Bilder" im Editor). Fehlt auf der
 * Startseite die Galerie, bleibt die Seiten-Galerie unverändert (die
 * Sektion braucht laut Schema mindestens ein Bild).
 *
 * Gegenstück zu engine.ts `linkPageSections`: das Rendering liest Kontakt/
 * Galerie ohnehin live aus der Startseite; die hier geschriebene Kopie
 * bleibt bewusst als Fallback im Dokument (Startseite ohne Pendant, ältere
 * Leser) und hält dieselbe Standard-Überschrift
 * (`PAGE_CONTACT_DEFAULT_HEADLINE`).
 */
export function syncLinkedSections(pages: Page[], doc: WebsiteDataV2): Page[] {
  const gallery = findSection(doc, "gallery");
  return pages.map(page => ({
    ...page,
    sections: page.sections.map(section => {
      if (section.type === "contact") {
        return {
          ...contactFromDoc(doc),
          ...(section.headline !== undefined
            ? { headline: section.headline }
            : {}),
        };
      }
      if (section.type === "gallery" && gallery && gallery.images.length > 0) {
        return { ...section, images: gallery.images.map(img => ({ ...img })) };
      }
      return section;
    }),
  }));
}
