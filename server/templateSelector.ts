/**
 * Template selector: picks the best matching uicore.pro templates
 * for a given business industry/niche to use as visual reference for the KI.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TemplateEntry {
  name: string;
  slug: string;
  categories: string[];
  tags: string[];
  style_hints: string;
  preview_url: string;
  local_image: string | null;
  cdn_url: string | null;
}

let _templates: TemplateEntry[] | null = null;

function getTemplates(): TemplateEntry[] {
  if (_templates) return _templates;
  try {
    const path = join(__dirname, "template-library", "templates.json");
    const raw = readFileSync(path, "utf-8");
    _templates = JSON.parse(raw) as TemplateEntry[];
    return _templates;
  } catch (e) {
    console.warn("[TemplateSelector] Could not load templates.json:", e);
    return [];
  }
}

// Map industry/niche keywords to uicore.pro categories
const INDUSTRY_TO_CATEGORY: Record<string, string[]> = {
  // Local Services
  friseur: ["Beauty & Wellness", "Local Services"],
  hair: ["Beauty & Wellness", "Local Services"],
  salon: ["Beauty & Wellness", "Local Services"],
  kosmetik: ["Beauty & Wellness", "Local Services"],
  beauty: ["Beauty & Wellness", "Local Services"],
  spa: ["Beauty & Wellness", "Local Services"],
  wellness: ["Beauty & Wellness", "Local Services"],
  massage: ["Beauty & Wellness", "Local Services"],
  nagel: ["Beauty & Wellness", "Local Services"],
  tattoo: ["Beauty & Wellness", "Creative & Artistic"],

  // Handwerk & Bau
  handwerker: ["Local Services"],
  elektriker: ["Local Services"],
  klempner: ["Local Services"],
  sanitär: ["Local Services"],
  heizung: ["Local Services"],
  dachdecker: ["Local Services"],
  maler: ["Local Services", "Creative & Artistic"],
  zimmerer: ["Local Services"],
  tischler: ["Local Services"],
  schreiner: ["Local Services"],
  schlosser: ["Local Services"],
  schweißer: ["Local Services"],
  bauunternehmen: ["Local Services"],
  bau: ["Local Services", "Architecture & Design"],
  renovierung: ["Local Services"],
  reinigung: ["Local Services"],
  hausmeister: ["Local Services"],
  garten: ["Local Services"],
  landschaftsbau: ["Local Services"],
  umzug: ["Local Services"],
  transport: ["Local Services"],
  schädlingsbekämpfung: ["Local Services"],
  pest: ["Local Services"],
  sicherheit: ["Local Services"],
  schlüsseldienst: ["Local Services"],

  // Restaurant & Food
  restaurant: ["Restaurant & Food", "Local Services"],
  café: ["Restaurant & Food", "Local Services"],
  cafe: ["Restaurant & Food", "Local Services"],
  bäckerei: ["Restaurant & Food", "Local Services"],
  konditorei: ["Restaurant & Food", "Local Services"],
  metzger: ["Restaurant & Food", "Local Services"],
  catering: ["Restaurant & Food"],
  lieferservice: ["Restaurant & Food", "Local Services"],
  pizza: ["Restaurant & Food"],
  pizzeria: ["Restaurant & Food", "Local Services"],
  sushi: ["Restaurant & Food"],
  imbiss: ["Restaurant & Food", "Local Services"],
  bar: ["Restaurant & Food", "Events & Entertainment"],
  kneipe: ["Restaurant & Food", "Events & Entertainment"],

  // Automotive
  autowerkstatt: ["Automotive", "Local Services"],
  kfz: ["Automotive", "Local Services"],
  autohaus: ["Automotive"],
  reifenservice: ["Automotive", "Local Services"],
  fahrzeug: ["Automotive"],
  auto: ["Automotive"],
  motorrad: ["Automotive"],

  // Health & Medical
  arzt: ["Local Services"],
  zahnarzt: ["Local Services"],
  physiotherapie: ["Beauty & Wellness", "Local Services"],
  chiropraktik: ["Beauty & Wellness", "Local Services"],
  optiker: ["Local Services"],
  apotheke: ["Local Services"],
  tierarzt: ["Local Services"],
  krankenhaus: ["Local Services"],
  klinik: ["Local Services"],

  // Education
  schule: ["Education & Nonprofit"],
  nachhilfe: ["Education & Nonprofit"],
  kita: ["Education & Nonprofit"],
  kindergarten: ["Education & Nonprofit"],
  sprachschule: ["Education & Nonprofit"],
  fahrschule: ["Education & Nonprofit", "Automotive"],
  musik: ["Events & Entertainment", "Education & Nonprofit"],
  tanzschule: ["Events & Entertainment", "Education & Nonprofit"],

  // Business & Consulting
  steuerberater: ["Finance & Fintech", "Business & Consulting"],
  rechtsanwalt: ["Business & Consulting"],
  unternehmensberatung: ["Business & Consulting"],
  marketing: ["Marketing & Social Media", "Business & Consulting"],
  agentur: ["Agencies & Corporate"],
  werbeagentur: ["Marketing & Social Media", "Agencies & Corporate"],
  webdesign: ["Technology & SaaS", "Agencies & Corporate"],
  it: ["Technology & SaaS"],
  software: ["Technology & SaaS"],
  versicherung: ["Finance & Fintech"],
  finanz: ["Finance & Fintech"],
  immobilien: ["Real Estate"],
  makler: ["Real Estate"],

  // Fitness & Sport
  fitnessstudio: ["Beauty & Wellness"],
  gym: ["Beauty & Wellness"],
  personal: ["Beauty & Wellness"],
  yoga: ["Beauty & Wellness"],
  pilates: ["Beauty & Wellness"],
  sport: ["Beauty & Wellness", "Events & Entertainment"],

  // Events & Entertainment
  fotograf: ["Creative & Artistic", "Events & Entertainment"],
  videograf: ["Creative & Artistic", "Events & Entertainment"],
  event: ["Events & Entertainment"],
  hochzeit: ["Events & Entertainment", "Creative & Artistic"],
  veranstaltung: ["Events & Entertainment"],
  dj: ["Events & Entertainment", "Creative & Artistic"],

  // Architecture & Design
  architekt: ["Architecture & Design"],
  innenarchitekt: ["Architecture & Design"],
  design: ["Creative & Artistic", "Architecture & Design"],
  fotostudio: ["Creative & Artistic"],

  // Energy & Environment
  solar: ["Energy & Renewables"],
  photovoltaik: ["Energy & Renewables"],
  energie: ["Energy & Renewables"],
  umwelt: ["Energy & Renewables"],
};

/**
 * Find the best matching templates for a given industry/niche
 */
export function selectTemplatesForIndustry(
  industry: string,
  niche: string,
  count = 3
): TemplateEntry[] {
  const templates = getTemplates();
  if (templates.length === 0) return [];

  const searchText = `${industry} ${niche}`.toLowerCase();

  // Find matching categories
  const matchedCategories = new Set<string>();
  for (const [keyword, categories] of Object.entries(INDUSTRY_TO_CATEGORY)) {
    if (searchText.includes(keyword)) {
      categories.forEach((c) => matchedCategories.add(c));
    }
  }

  // Default to Local Services if no match found
  if (matchedCategories.size === 0) {
    matchedCategories.add("Local Services");
    matchedCategories.add("Business & Consulting");
  }

  // Score templates by category match
  const scored = templates
    .filter((t) => t.cdn_url) // Only templates with CDN URLs
    .map((t) => {
      let score = 0;
      for (const cat of t.categories) {
        if (matchedCategories.has(cat)) score += 2;
      }
      // Bonus for Local Services (most common for SMBs)
      if (t.categories.includes("Local Services")) score += 1;
      return { template: t, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // If not enough matches, add some general business templates
  if (scored.length < count) {
    const generalTemplates = templates
      .filter(
        (t) =>
          t.cdn_url &&
          !scored.find((s) => s.template.slug === t.slug) &&
          (t.categories.includes("Business & Consulting") ||
            t.categories.includes("Agencies & Corporate"))
      )
      .map((t) => ({ template: t, score: 0.5 }));
    scored.push(...generalTemplates);
  }

  // Return top N unique templates
  const seen = new Set<string>();
  const result: TemplateEntry[] = [];
  for (const { template } of scored) {
    if (!seen.has(template.slug) && result.length < count) {
      seen.add(template.slug);
      result.push(template);
    }
  }

  return result;
}

/**
 * Get style description for a set of templates
 */
export function getTemplateStyleDescription(templates: TemplateEntry[]): string {
  if (templates.length === 0) return "";

  const styleHints = templates
    .map((t) => `"${t.name}" (${t.categories.join(", ")}): ${t.style_hints}`)
    .join("\n");

  return `
VISUAL REFERENCE TEMPLATES (use these as inspiration for design style, layout, and color palette):
${styleHints}

These templates represent the design quality and aesthetic you should aim for. 
Adapt the visual style to fit the specific business while maintaining professional quality.
`;
}

/**
 * Get template image URLs for multimodal LLM input
 */
export function getTemplateImageUrls(templates: TemplateEntry[]): string[] {
  return templates
    .filter((t) => t.cdn_url)
    .map((t) => t.cdn_url as string);
}
