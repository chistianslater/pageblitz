import type {
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
