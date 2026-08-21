import type { PackConstitution } from "../../shared/stylePacks";
import type { SectionType } from "../../shared/siteContract/types";

export interface ContentPromptArgs {
  constitution: PackConstitution;
  business: { name: string; category: string; city?: string };
  sections: SectionType[];
}

/**
 * Feldliste pro Sektion für den Content-Prompt — Feldnamen identisch zum
 * zod-Schema (shared/siteContract/schema.ts), aber bewusst OHNE URL-Felder
 * (ctaHref, imageUrl, images[].url, members[].imageUrl): der Content-Prompt
 * darf keine URLs vom LLM verlangen, sonst riskiert SafeUrlSchema
 * Fantasie-URLs. Bilder/Links werden systemseitig gesetzt, nicht vom LLM.
 */
export const SECTION_FIELD_DOC: Record<SectionType, string> = {
  hero: `"headline" (Pflicht), "subheadline" (optional), "ctaText" (optional, z. B. "Jetzt anfragen") — KEINE "ctaHref", KEINE "imageUrl"`,
  services: `"headline" (Pflicht), "intro" (optional), "items": [{ "title" (Pflicht), "description" (optional), "price" (optional) }] (mind. 1 Eintrag)`,
  about: `"headline" (Pflicht), "body" (Pflicht, 2–4 Sätze) — KEINE "imageUrl"`,
  gallery: `"headline" (optional) — KEINE "images" (werden systemseitig gesetzt)`,
  testimonials: `"headline" (optional), "items": [{ "author" (Pflicht), "text" (Pflicht), "rating" (optional, 1–5) }] (mind. 1 Eintrag)`,
  contact: `"headline" (optional), "phone" (optional), "email" (optional), "street" (optional), "zip" (optional), "city" (optional), "openingHours": [{ "day", "hours" }] (optional)`,
  faq: `"headline" (optional), "items": [{ "question" (Pflicht), "answer" (Pflicht) }] (mind. 1 Eintrag)`,
  menu: `"headline" (optional), "categories": [{ "name" (Pflicht), "items": [{ "name" (Pflicht), "description" (optional), "price" (Pflicht) }] (mind. 1) }] (mind. 1 Kategorie)`,
  pricelist: `"headline" (optional), "categories": [{ "name" (Pflicht), "items": [{ "name" (Pflicht), "description" (optional), "price" (Pflicht) }] (mind. 1) }] (mind. 1 Kategorie)`,
  team: `"headline" (optional), "members": [{ "name" (Pflicht), "role" (optional) }] (mind. 1 Eintrag) — KEINE "imageUrl"`,
  cta: `"headline" (Pflicht), "ctaText" (Pflicht) — KEINE "ctaHref"`,
};

/**
 * Baut den deutschen Content-Prompt für die v2-Generierung: Rolle,
 * Business-Fakten, Tonalitäts-Anker (essence) und Regeln/Verbote
 * (llmHints) aus der Style-Pack-Verfassung, dann das JSON-Format für
 * genau die angefragten Sektionen. Enthält bewusst KEINE Design-Infos
 * (Farben, Fonts) — die kommen ausschließlich aus der Verfassung, nie vom LLM.
 */
export function buildContentPrompt(args: ContentPromptArgs): string {
  const { constitution, business, sections } = args;

  const factLines = [
    `Name: ${business.name}`,
    `Kategorie: ${business.category}`,
    business.city ? `Stadt: ${business.city}` : null,
  ].filter((line): line is string => Boolean(line));

  const sectionDocs = sections
    .map(type => `- "${type}": { "type": "${type}", ${SECTION_FIELD_DOC[type]} }`)
    .join("\n");

  return [
    `Du schreibst Website-Inhalte für deutsche Kleinunternehmen.`,
    ``,
    `## Geschäft`,
    factLines.join("\n"),
    ``,
    `## Tonalität`,
    constitution.essence,
    ``,
    `## Regeln`,
    ...constitution.llmHints.do.map(rule => `- ${rule}`),
    ``,
    `## Verbote`,
    ...constitution.llmHints.dont.map(rule => `- ${rule}`),
    `- keine Bild-URLs, keine Links — ctaHref weglassen`,
    ``,
    `## Antwortformat`,
    `Antworte mit einem JSON-Objekt mit dem Feld "sections" (Array). Erzeuge genau diese Sektionen, in dieser Reihenfolge:`,
    sectionDocs,
    ``,
    `Antworte NUR mit JSON. Keine Farben, keine Schriftnamen, keine Design-Anweisungen.`,
  ].join("\n");
}
