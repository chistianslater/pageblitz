import type {
  Page,
  PageSection,
  PageSectionOf,
  SectionType,
  SectionV2,
  SiteAddOns,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import { displayOpeningHours } from "../../../../shared/onboardingV2/openingHours";

export const SECTION_ANCHORS: Record<SectionType, string> = {
  hero: "start",
  services: "leistungen",
  about: "ueber-uns",
  gallery: "galerie",
  testimonials: "bewertungen",
  contact: "kontakt",
  faq: "faq",
  menu: "speisekarte",
  pricelist: "preise",
  team: "team",
  cta: "anfrage",
  story: "geschichte",
  // pageHeader existiert nur innerhalb Page.sections (siehe schema.ts,
  // PageSectionSchema), niemals in der Startseiten-`sections`-Liste, die
  // dieser Anker-Karte zugrunde liegt — Wert wird praktisch nie gelesen.
  // Platzhalter für die Exhaustivität von Record<SectionType, string>;
  // echte Unterseiten-Navigation baut Task 3 in buildNavItems.
  pageHeader: "seite",
};

// ─── Plan B6, Task 6: Add-on-Gating (eine Quelle der Wahrheit) ──────────────

/**
 * Sektionstypen, die nur gerendert werden, wenn das zugehörige Add-on im
 * Dokument gebucht ist (`doc.addOns.<key> === true`, siehe
 * `SiteAddOnsSchema` in shared/siteContract/schema.ts). Nicht gebuchter
 * Inhalt bleibt im Dokument (kein Datenverlust — Spec B6 §2.2/§5.4
 * „ausblenden statt löschen"), wird aber weder von SSR noch CSR noch in der
 * Navigation ausgegeben. Alle anderen Typen (hero/services/about/contact/
 * faq/testimonials/cta) sind frei. Feature-Inseln (Kontaktformular,
 * KI-Chat, Buchung) gaten unverändert über `features` (SiteIslands.tsx).
 */
export const ADDON_GATED_SECTION_TYPES: Partial<
  Record<SectionType, keyof SiteAddOns>
> = {
  gallery: "gallery",
  menu: "menu",
  pricelist: "pricelist",
  team: "team",
};

/** true, wenn der Sektionstyp frei ist oder sein Add-on im Dokument gebucht wurde. */
export function isSectionBooked(
  doc: WebsiteDataV2,
  type: SectionType
): boolean {
  const addOn = ADDON_GATED_SECTION_TYPES[type];
  if (!addOn) return true;
  return doc.addOns?.[addOn] === true;
}

/**
 * Startseiten-Sektionen in Dokument-Reihenfolge ohne `hiddenSections` und
 * ohne nicht gebuchte Add-on-Sektionen. Gemeinsame Basis für
 * `orderedSections` (Pack-Renderer, SSR + CSR) und `buildNavItems`, damit
 * Navigation und Inhalt nie auseinanderlaufen.
 */
export function visibleSections(doc: WebsiteDataV2): SectionV2[] {
  const hidden = new Set(doc.hiddenSections ?? []);
  return doc.sections.filter(
    s => !hidden.has(s.type) && isSectionBooked(doc, s.type)
  );
}

/**
 * Unterseiten sind Add-on-Inhalt (`subpages`): ohne `doc.addOns.subpages`
 * liefert das eine leere Liste — `pages[]` bleibt trotzdem im Dokument.
 * Einzige Quelle für SSR-Route (server/ssr/routes.ts), Navigation und
 * Studio-Vorschau-Leiste.
 */
export function visiblePages(doc: WebsiteDataV2): Page[] {
  if (doc.addOns?.subpages !== true) return [];
  return doc.pages ?? [];
}

/**
 * Sektionen einer Unterseite nach demselben Gating wie die Startseite
 * (`pageHeader` ist immer frei). `hiddenSections` gilt nur für die
 * Startseite und wird hier bewusst nicht angewendet.
 */
export function visiblePageSections(
  doc: WebsiteDataV2,
  page: Page
): PageSection[] {
  return page.sections.filter(s => isSectionBooked(doc, s.type));
}

function withDisplayOpeningHours<S extends SectionV2 | PageSection>(
  section: S
): S {
  if (section.type !== "contact") return section;
  const openingHours = displayOpeningHours(section.openingHours);
  if (openingHours === section.openingHours) return section;
  return { ...section, openingHours };
}

/**
 * Standard-Überschrift der Kontakt-Sektion auf Unterseiten — gemeinsam mit
 * pagesLogic.ts `contactFromDoc` (Studio-Kopie beim Speichern), damit Kopie
 * und Live-Verknüpfung dieselbe Überschrift zeigen.
 */
export const PAGE_CONTACT_DEFAULT_HEADLINE = "Kontakt";

/**
 * Verknüpfte Sektionen auf Unterseiten (Plan B6 Task 5/6): Kontakt und
 * Galerie „übernehmen" laut Studio-Editor die Startseite — statt die beim
 * Speichern erzeugte Kopie (pagesLogic.ts `syncLinkedSections`) altern zu
 * lassen, liest das Rendering hier die aktuellen Startseiten-Fakten/-Bilder;
 * nur die Seiten-Überschrift bleibt aus der Page (ohne eigene Überschrift
 * `PAGE_CONTACT_DEFAULT_HEADLINE`, wie die Studio-Kopie — nicht die
 * Startseiten-Überschrift). Ohne Startseiten-Pendant bleibt die gespeicherte
 * Kopie (Fallback). Pure, mutiert nichts.
 *
 * Gegenstück zu pagesLogic.ts `syncLinkedSections`/`contactFromDoc`: die
 * Kopie im Dokument ist bewusst erhalten (Fallback für Dokumente ohne
 * Startseiten-Pendant), das Rendering überschreibt sie hier live.
 */
export function linkPageSections(
  doc: WebsiteDataV2,
  sections: PageSection[]
): PageSection[] {
  const homeContact = doc.sections.find(
    (s): s is Extract<SectionV2, { type: "contact" }> => s.type === "contact"
  );
  const homeGallery = doc.sections.find(
    (s): s is Extract<SectionV2, { type: "gallery" }> => s.type === "gallery"
  );
  return sections.map(section => {
    if (section.type === "contact" && homeContact) {
      const hours = displayOpeningHours(homeContact.openingHours);
      return {
        ...homeContact,
        headline: section.headline ?? PAGE_CONTACT_DEFAULT_HEADLINE,
        openingHours: hours,
      } as PageSection;
    }
    if (
      section.type === "gallery" &&
      homeGallery &&
      homeGallery.images.length > 0
    ) {
      return {
        ...section,
        images: homeGallery.images.map(img => ({ ...img })),
      } as PageSection;
    }
    return section;
  });
}

export function orderedSections(data: WebsiteDataV2): SectionV2[] {
  const visible = visibleSections(data);
  const order = data.sectionOrder;
  const rank = (t: SectionType): number => {
    if (t === "hero") return -1; // Hero immer zuerst
    if (!order) return 0; // stabil: Dokument-Reihenfolge
    const i = order.indexOf(t);
    return i === -1 ? order.length : i;
  };
  return [...visible]
    .sort((a, b) => rank(a.type) - rank(b.type))
    .map(withDisplayOpeningHours);
}

// ─── Plan B6, Task 3: Unterseiten-Navigation + Page-Auflösung ───────────────

export type NavItem = {
  key: string;
  href: string;
  label: string;
  current?: boolean;
  /** Nur bei Sektions-Ankern gesetzt — erlaubt Packs, ihre eigene Beschriftung zu verwenden (`applyNavLabels`). */
  sectionType?: SectionType;
};

/**
 * Generische Nav-Beschriftungen für Sektions-Anker — nur Default. Die 14
 * Pack-Module nutzen branchenneutrale Namen (`GENERIC_TITLES` / lokale
 * Synonyme wie gusto „Impressionen") und ersetzen die Default-Labels der
 * Anker-Items über `applyNavLabels`. Keine Branchen-Stimme in der Nav.
 */
const SECTION_NAV_LABELS: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Bewertungen",
  contact: "Kontakt",
  faq: "FAQ",
  menu: "Speisekarte",
  pricelist: "Preise",
  team: "Team",
  cta: "Anfrage",
  story: "Unsere Geschichte",
};

/**
 * Löst einen Pfad ("/leistungen-im-detail" oder "leistungen-im-detail") auf
 * die passende Unterseite im Dokument auf. `null` für die Startseite ("/",
 * "") oder einen Pfad, der zu keiner `pages[]`-Page passt (inkl. Legal-Pfade
 * — die haben keine eigene `Page`, siehe server/ssr/routes.ts). Seit Plan
 * B6 Task 6 zählt nur, was `visiblePages` liefert: ohne gebuchtes
 * `addOns.subpages` ist jede Page-URL unbekannt (SSR → 404, CSR → Fallback).
 */
export function pageForPathname(
  doc: WebsiteDataV2,
  pathname: string
): Page | null {
  const slug = pathname.split("?")[0]?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!slug) return null;
  return visiblePages(doc).find(p => p.slug === slug) ?? null;
}

/**
 * Baut die gemeinsame Navigation für Start- und Unterseiten: Sektions-Anker
 * (Startseite: `#anker`; Unterseite: `<basePath || "/">#anker` — führt zurück
 * zur Startseite) gefolgt von den Unterseiten-Links (`<basePath>/<slug>`,
 * Label `navLabel ?? title`). Auf einer Unterseite bekommt deren eigener
 * Page-Link `current: true`. Ohne `pages[]` bleiben nur die Anker übrig.
 */
export function buildNavItems(
  doc: WebsiteDataV2,
  opts: { pathname: string; basePath: string }
): NavItem[] {
  const currentPage = pageForPathname(doc, opts.pathname);
  const anchorPrefix = currentPage ? opts.basePath || "/" : "";
  const anchorItems: NavItem[] = orderedSections(doc)
    .filter(s => s.type !== "hero")
    .map(s => ({
      key: `anchor-${s.type}`,
      href: `${anchorPrefix}#${SECTION_ANCHORS[s.type]}`,
      label: SECTION_NAV_LABELS[s.type] ?? s.type,
      sectionType: s.type,
    }));
  const pageItems: NavItem[] = visiblePages(doc).map(p => ({
    key: `page-${p.slug}`,
    href: `${opts.basePath}/${p.slug}`,
    label: p.navLabel ?? p.title,
    current: currentPage?.slug === p.slug,
  }));
  return [...anchorItems, ...pageItems];
}

/**
 * Ersetzt die Default-Labels der Sektions-Anker durch die Pack-eigene
 * Wortwahl (`FALLBACK_TITLES` des Moduls); Page-Links bleiben unverändert.
 * Liefert neue Objekte, mutiert nichts.
 */
export function applyNavLabels(
  items: NavItem[],
  labels: Partial<Record<SectionType, string>>
): NavItem[] {
  return items.map(item =>
    item.sectionType && labels[item.sectionType]
      ? { ...item, label: labels[item.sectionType] as string }
      : item
  );
}

/**
 * Die `pageHeader`-Sektion einer Unterseite (Titel + Einleitung), falls
 * vorhanden — `pageHeader` ist bewusst NICHT Teil von `SectionV2` (siehe
 * shared/siteContract/schema.ts), deshalb ein eigener Zugriff statt über
 * `orderedSections`.
 */
export function pageHeaderSection(
  page: Page
): PageSectionOf<"pageHeader"> | null {
  return (
    page.sections.find(
      (s): s is PageSectionOf<"pageHeader"> => s.type === "pageHeader"
    ) ?? null
  );
}

/**
 * `Page.sections` ohne `pageHeader`, als `SectionV2[]` — die verbleibenden
 * Typen (services/about/gallery/faq/contact/testimonials/pricelist/menu)
 * nutzen exakt dieselben Zod-Schemas wie `SectionV2Schema` (siehe
 * `PageSectionSchema` in schema.ts), der Cast ist daher strukturell sicher.
 * Damit können die bestehenden Pack-Renderer (die `SectionV2` erwarten) eine
 * Unterseite rendern, ohne dass Task 3 die 14 Pack-Module anfassen muss —
 * die eigentliche Umstellung auf `pageTitle`/`navItems`/`sections` folgt in
 * Task 4.
 */
export function pageContentSections(page: Page): SectionV2[] {
  return page.sections.filter(
    (s): s is Exclude<PageSection, PageSectionOf<"pageHeader">> =>
      s.type !== "pageHeader"
  ) as unknown as SectionV2[];
}
