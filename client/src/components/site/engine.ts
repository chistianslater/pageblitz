import type {
  Page,
  PageSection,
  PageSectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";

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
  // pageHeader existiert nur innerhalb Page.sections (siehe schema.ts,
  // PageSectionSchema), niemals in der Startseiten-`sections`-Liste, die
  // dieser Anker-Karte zugrunde liegt — Wert wird praktisch nie gelesen.
  // Platzhalter für die Exhaustivität von Record<SectionType, string>;
  // echte Unterseiten-Navigation baut Task 3 in buildNavItems.
  pageHeader: "seite",
};

export function orderedSections(data: WebsiteDataV2): SectionV2[] {
  const hidden = new Set(data.hiddenSections ?? []);
  const visible = data.sections.filter(s => !hidden.has(s.type));
  const order = data.sectionOrder;
  const rank = (t: SectionType): number => {
    if (t === "hero") return -1; // Hero immer zuerst
    if (!order) return 0; // stabil: Dokument-Reihenfolge
    const i = order.indexOf(t);
    return i === -1 ? order.length : i;
  };
  return [...visible].sort((a, b) => rank(a.type) - rank(b.type));
}

// ─── Plan B6, Task 3: Unterseiten-Navigation + Page-Auflösung ───────────────

export type NavItem = {
  key: string;
  href: string;
  label: string;
  current?: boolean;
};

/**
 * Generische Nav-Beschriftungen für Sektions-Anker — dieselben Wörter, die
 * bislang in jedem der 14 Pack-Module als eigenes `FALLBACK_TITLES` dupliziert
 * waren (dort: `FALLBACK_TITLES[s.type] ?? s.type`, NICHT `section.headline`
 * — die Nav-Beschriftung ignoriert Headline-Overrides bewusst, nur die
 * Sektions-Überschrift (h2) nutzt sie). `buildNavItems` übernimmt exakt
 * dasselbe Verhalten, damit Task 4 (Umstellung der Packs auf `buildNavItems`)
 * keine sichtbare Änderung an der Startseiten-Navigation verursacht.
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
};

/**
 * Löst einen Pfad ("/leistungen-im-detail" oder "leistungen-im-detail") auf
 * die passende Unterseite im Dokument auf. `null` für die Startseite ("/",
 * "") oder einen Pfad, der zu keiner `pages[]`-Page passt (inkl. Legal-Pfade
 * — die haben keine eigene `Page`, siehe server/ssr/routes.ts).
 */
export function pageForPathname(
  doc: WebsiteDataV2,
  pathname: string
): Page | null {
  const slug = pathname.split("?")[0]?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!slug) return null;
  return doc.pages?.find(p => p.slug === slug) ?? null;
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
    }));
  const pageItems: NavItem[] = (doc.pages ?? []).map(p => ({
    key: `page-${p.slug}`,
    href: `${opts.basePath}/${p.slug}`,
    label: p.navLabel ?? p.title,
    current: currentPage?.slug === p.slug,
  }));
  return [...anchorItems, ...pageItems];
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
