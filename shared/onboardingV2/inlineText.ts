import type { SectionV2, WebsiteDataV2 } from "../siteContract/types";

export interface InlineTextTarget {
  path: string;
  value: string;
  maxLength: number;
  multiline: boolean;
  /** Stabiler Sektionsanker aus engine.SECTION_ANCHORS. */
  scope: string;
  /**
   * Fett/Kursiv/Akzent-Toolbar bei Textauswahl (richText-Marker) — nur
   * Felder, die die Packs über rich() rendern (Hero-Überschrift/-Unterzeile,
   * Über-uns-Text). Überall sonst würden Marker als Sternchen sichtbar.
   */
  formattable?: boolean;
}

const ANCHORS: Partial<Record<SectionV2["type"], string>> = {
  hero: "#start",
  services: "#leistungen",
  about: "#ueber-uns",
  gallery: "#galerie",
  testimonials: "#bewertungen",
  contact: "#kontakt",
  faq: "#faq",
  menu: "#speisekarte",
  pricelist: "#preisliste",
  team: "#team",
  cta: "#cta",
  story: "#geschichte",
  usp: "#vorteile",
  notice: "#hinweis",
  stats: "#zahlen",
  process: "#ablauf",
  quote: "#zitat",
};

/**
 * Baut die Whitelist aller direkt editierbaren, sichtbaren Startseitentexte.
 * SEO/Legal/URLs bleiben bewusst außen vor; jede Server-Schreibung muss einen
 * hier erzeugten Pfad treffen.
 */
export function collectInlineTextTargets(
  doc: WebsiteDataV2
): InlineTextTarget[] {
  const targets: InlineTextTarget[] = [];
  const add = (
    sectionIndex: number,
    scope: string,
    suffix: string,
    value: string | undefined,
    maxLength: number,
    multiline = false,
    formattable = false
  ) => {
    if (!value?.trim()) return;
    targets.push({
      path: `sections.${sectionIndex}.${suffix}`,
      value,
      maxLength,
      multiline,
      scope,
      ...(formattable ? { formattable } : {}),
    });
  };

  doc.sections.forEach((section, sectionIndex) => {
    const scope = ANCHORS[section.type];
    if (!scope) return;
    switch (section.type) {
      case "hero":
        add(
          sectionIndex,
          scope,
          "headline",
          section.headline,
          120,
          false,
          true
        );
        add(
          sectionIndex,
          scope,
          "subheadline",
          section.subheadline,
          240,
          false,
          true
        );
        add(sectionIndex, scope, "ctaText", section.ctaText, 40);
        break;
      case "services":
        add(sectionIndex, scope, "headline", section.headline, 120);
        add(sectionIndex, scope, "intro", section.intro, 500, true);
        section.items.forEach((item, itemIndex) => {
          add(sectionIndex, scope, `items.${itemIndex}.title`, item.title, 120);
          add(
            sectionIndex,
            scope,
            `items.${itemIndex}.description`,
            item.description,
            500,
            true
          );
          add(sectionIndex, scope, `items.${itemIndex}.price`, item.price, 60);
        });
        break;
      case "about":
        add(sectionIndex, scope, "headline", section.headline, 120);
        add(sectionIndex, scope, "body", section.body, 2000, true, true);
        break;
      case "gallery":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.images.forEach((image, imageIndex) =>
          add(sectionIndex, scope, `images.${imageIndex}.alt`, image.alt, 240)
        );
        break;
      case "testimonials":
        // Nur die Überschrift ist editierbar. Item-Text/Autor sind echte
        // Google-Bewertungen und dürfen im Studio nicht umgeschrieben werden.
        add(sectionIndex, scope, "headline", section.headline, 120);
        break;
      case "contact":
        add(sectionIndex, scope, "headline", section.headline, 120);
        add(sectionIndex, scope, "phone", section.phone, 50);
        add(sectionIndex, scope, "email", section.email, 320);
        add(sectionIndex, scope, "street", section.street, 180);
        add(sectionIndex, scope, "zip", section.zip, 12);
        add(sectionIndex, scope, "city", section.city, 120);
        section.openingHours?.forEach((row, rowIndex) => {
          add(sectionIndex, scope, `openingHours.${rowIndex}.day`, row.day, 40);
          add(
            sectionIndex,
            scope,
            `openingHours.${rowIndex}.hours`,
            row.hours,
            80
          );
        });
        break;
      case "faq":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.items.forEach((item, itemIndex) => {
          add(
            sectionIndex,
            scope,
            `items.${itemIndex}.question`,
            item.question,
            240
          );
          add(
            sectionIndex,
            scope,
            `items.${itemIndex}.answer`,
            item.answer,
            1200,
            true
          );
        });
        break;
      case "menu":
      case "pricelist":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.categories.forEach((category, categoryIndex) => {
          add(
            sectionIndex,
            scope,
            `categories.${categoryIndex}.name`,
            category.name,
            120
          );
          category.items.forEach((item, itemIndex) => {
            const base = `categories.${categoryIndex}.items.${itemIndex}`;
            add(sectionIndex, scope, `${base}.name`, item.name, 120);
            add(
              sectionIndex,
              scope,
              `${base}.description`,
              item.description,
              500,
              true
            );
            add(sectionIndex, scope, `${base}.price`, item.price, 60);
          });
        });
        break;
      case "team":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.members.forEach((member, memberIndex) => {
          add(
            sectionIndex,
            scope,
            `members.${memberIndex}.name`,
            member.name,
            120
          );
          add(
            sectionIndex,
            scope,
            `members.${memberIndex}.role`,
            member.role,
            120
          );
        });
        break;
      case "cta":
        add(sectionIndex, scope, "headline", section.headline, 120);
        add(sectionIndex, scope, "ctaText", section.ctaText, 40);
        break;
      case "story":
        add(sectionIndex, scope, "headline", section.headline, 120);
        add(sectionIndex, scope, "body", section.body, 2500, true, true);
        break;
      case "usp":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.items.forEach((item, itemIndex) => {
          add(sectionIndex, scope, `items.${itemIndex}.title`, item.title, 80);
          add(
            sectionIndex,
            scope,
            `items.${itemIndex}.text`,
            item.text,
            240,
            true
          );
        });
        break;
      case "notice":
        add(sectionIndex, scope, "text", section.text, 240);
        break;
      case "stats":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.items.forEach((item, itemIndex) => {
          add(sectionIndex, scope, `items.${itemIndex}.value`, item.value, 20);
          add(sectionIndex, scope, `items.${itemIndex}.label`, item.label, 80);
        });
        break;
      case "process":
        add(sectionIndex, scope, "headline", section.headline, 120);
        section.steps.forEach((step, stepIndex) => {
          add(sectionIndex, scope, `steps.${stepIndex}.title`, step.title, 80);
          add(
            sectionIndex,
            scope,
            `steps.${stepIndex}.text`,
            step.text,
            240,
            true
          );
        });
        break;
      case "quote":
        add(sectionIndex, scope, "text", section.text, 300, true);
        add(sectionIndex, scope, "author", section.author, 80);
        break;
    }
  });

  return targets;
}
