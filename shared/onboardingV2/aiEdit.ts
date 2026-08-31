import { z } from "zod";
import {
  PACK_IDS,
  PageSectionSchema,
  SECTION_TYPES,
  SectionV2Schema,
} from "../siteContract/schema";
import {
  ABOUT_LAYOUTS,
  CONTACT_LAYOUTS,
  DECORATION_GROUPS,
  DECORATION_MODES,
  DESIGN_DENSITIES,
  GALLERY_LAYOUTS,
  HERO_LAYOUTS,
  HIDEABLE_ELEMENTS,
  IMAGE_TREATMENTS,
  SERVICES_LAYOUTS,
  TESTIMONIALS_LAYOUTS,
} from "../siteContract/designProfile";
import type {
  Page,
  PageSection,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../siteContract/types";

/**
 * Sektionstypen, die der Assistent ausblenden darf — hero und contact nie
 * (Identität bzw. Pflicht-Fakten), pageHeader existiert nur auf Unterseiten.
 */
export const HIDEABLE_SECTION_TYPES = [
  "services",
  "about",
  "gallery",
  "testimonials",
  "faq",
  "menu",
  "pricelist",
  "team",
  "cta",
  "story",
  "usp",
  "notice",
  "stats",
  "process",
  "quote",
] as const;

/**
 * Design-Patch des KI-Assistenten (2026-08-30): jede Stellschraube, die
 * auch der Theme-Editor kennt — Akzent, Farbwelt (kuratiert oder eigene
 * Grundfarbe), Schriftpaar, Abstände, Bildwirkung, Sektionslayouts, seit
 * heute auch Sichtbarkeit (hiddenSections) und Reihenfolge (sectionOrder)
 * der Sektionen. `null` = auf Richtungs-Standard zurück; fehlende Felder
 * bleiben unangetastet. Server-seitig zusätzlich gegen FONT_PAIRS/
 * getColorWorld/den Sektionsbestand validiert (routerAi.ts) und SOFORT
 * angewandt (leicht revidierbar).
 */
export const AiThemePatchSchema = z
  .object({
    accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .nullable()
      .optional(),
    colorWorldId: z
      .string()
      .regex(/^[a-z-]+$/)
      .max(24)
      .nullable()
      .optional(),
    colorWorldBase: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    fontPairId: z.string().max(40).nullable().optional(),
    density: z.enum(DESIGN_DENSITIES).optional(),
    imageTreatment: z.enum(IMAGE_TREATMENTS).optional(),
    heroLayout: z.enum(HERO_LAYOUTS).optional(),
    servicesLayout: z.enum(SERVICES_LAYOUTS).optional(),
    aboutLayout: z.enum(ABOUT_LAYOUTS).optional(),
    galleryLayout: z.enum(GALLERY_LAYOUTS).optional(),
    testimonialsLayout: z.enum(TESTIMONIALS_LAYOUTS).optional(),
    contactLayout: z.enum(CONTACT_LAYOUTS).optional(),
    decorations: z.enum(DECORATION_MODES).optional(),
    // VOLLSTÄNDIGE Ersatz-Listen (kein Merge): [] blendet alles wieder ein
    // bzw. setzt die Reihenfolge auf die Dokument-Ordnung zurück.
    hiddenSections: z.array(z.enum(HIDEABLE_SECTION_TYPES)).max(14).optional(),
    sectionOrder: z.array(z.enum(SECTION_TYPES)).max(16).optional(),
    // Einzeln ausblendbare Sektions-Elemente („Bild weg, Text breiter").
    hiddenElements: z.array(z.enum(HIDEABLE_ELEMENTS)).max(4).optional(),
    // Deko granular (Backlog 13d): ebenfalls VOLLSTÄNDIGE Ersatzliste.
    hiddenDecorations: z.array(z.enum(DECORATION_GROUPS)).max(4).optional(),
  })
  .strict();

export type AiThemePatch = z.infer<typeof AiThemePatchSchema>;

const AiThemeResponseSchema = z
  .object({
    kind: z.literal("theme"),
    theme: AiThemePatchSchema,
    reason: z.string().max(200),
  })
  .strict();

/**
 * Rückfrage des Assistenten (2026-08-30, „bei Bedarf rückfragen"): bei einem
 * mehrdeutigen Wunsch stellt die KI GENAU EINE kurze Rückfrage statt zu
 * raten. Der Client schickt Frage + Antwort als `history` mit der nächsten
 * Nachricht zurück — mehr Dialog-Gedächtnis gibt es bewusst nicht.
 */
const AiQuestionResponseSchema = z
  .object({
    kind: z.literal("question"),
    question: z.string().min(5).max(300),
  })
  .strict();

/**
 * Antwortschema der KI-Chat-Bearbeitung (server/onboardingV2/aiEdit.ts). Vier
 * sich gegenseitig ausschließende Ergebnisse:
 * - "content": ein validierter Inhalts-Vorschlag (seo + sections).
 * - "theme": ein Design-Patch (Farben/Schrift/Layout) — wird sofort
 *   angewandt, weil im Stil-Panel jederzeit revidierbar.
 * - "style": ein Pack-Vorschlag für grundlegend anderen Look.
 * - "reject": eine Ablehnung, z. B. bei Fakten-/Kontaktwünschen, die nur
 *   über die Panels geändert werden dürfen.
 * - "question": eine Rückfrage bei mehrdeutigem Wunsch (als fünfte Option
 *   ans Ende angehängt — die Index-Referenzen unten bleiben stabil).
 */
export const AiEditResponseSchema = z.discriminatedUnion("kind", [
  AiThemeResponseSchema,
  z
    .object({
      kind: z.literal("content"),
      seo: z.object({ title: z.string(), description: z.string() }).strict(),
      sections: z.array(SectionV2Schema).min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("style"),
      packId: z.enum(PACK_IDS),
      reason: z.string().max(200),
    })
    .strict(),
  z
    .object({
      kind: z.literal("reject"),
      reason: z.string().max(200),
    })
    .strict(),
  AiQuestionResponseSchema,
]);

type AiEditResponse = z.infer<typeof AiEditResponseSchema>;

/**
 * Kurzer Dialog-Kontext für Rückfragen: der Client schickt die letzten
 * Wortwechsel (Wunsch → Rückfrage → Antwort) mit, damit die KI die Antwort
 * dem ursprünglichen Wunsch zuordnen kann. Bewusst klein gehalten — kein
 * persistenter Chat-Verlauf.
 */
export const AiChatHistorySchema = z
  .array(
    z
      .object({
        role: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(500),
      })
      .strict()
  )
  .max(8);

export type AiChatHistoryEntry = z.infer<typeof AiChatHistorySchema>[number];

/**
 * Dasselbe Antwortschema für den Unterseiten-Scope (Plan B6 Task 5,
 * `pageSlug` im KI-Chat): "content" trägt dann `Page.seo` + `Page.sections`
 * (PageSectionSchema — pageHeader erlaubt, hero/team/cta nicht), style/reject
 * unverändert.
 */
export const AiPageEditResponseSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("content"),
      seo: z.object({ title: z.string(), description: z.string() }).strict(),
      sections: z.array(PageSectionSchema).min(1),
    })
    .strict(),
  // theme/style/reject/question gelten seitenunabhängig (Design ist global,
  // eine Rückfrage bezieht sich auf den Wunsch, nicht auf die Seite).
  AiEditResponseSchema.options[0],
  AiEditResponseSchema.options[2],
  AiEditResponseSchema.options[3],
  AiQuestionResponseSchema,
]);

/** Ein einzelner Vorher/Nachher-Eintrag für die Diff-Vorschau im KI-Chat. */
export interface AiDiffEntry {
  path: string;
  label: string;
  before: string;
  after: string;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Bewertungen",
  contact: "Kontakt",
  faq: "FAQ",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "CTA",
  story: "Geschichte",
  usp: "Vorteile",
  notice: "Hinweis-Banner",
  stats: "Zahlen",
  process: "Ablauf",
  quote: "Zitat",
  // pageHeader existiert nur in Page.sections (Unterseiten) — diffPages
  // vergleicht sie mit demselben Feld-Mechanismus wie diffDocuments.
  pageHeader: "Kopfzeile",
};

/**
 * Inhaltliche Skalarfelder je Sektionstyp. Fakten (imageUrl, ctaHref,
 * Telefon/E-Mail/Adresse/Öffnungszeiten) sind bewusst ausgeschlossen — sie
 * werden von der KI ohnehin nie verändert (Fakten-Garantie in
 * server/onboardingV2/aiEdit.ts), ein Diff dafür wäre irreführend.
 */
const SCALAR_FIELDS: Partial<Record<SectionType, Record<string, string>>> = {
  hero: {
    headline: "Überschrift",
    subheadline: "Unterzeile",
    ctaText: "Button-Text",
  },
  services: { headline: "Überschrift", intro: "Einleitung" },
  about: { headline: "Überschrift", body: "Text" },
  gallery: { headline: "Überschrift" },
  testimonials: { headline: "Überschrift" },
  contact: { headline: "Überschrift" },
  faq: { headline: "Überschrift" },
  menu: { headline: "Überschrift" },
  pricelist: { headline: "Überschrift" },
  team: { headline: "Überschrift" },
  cta: { headline: "Überschrift", ctaText: "Button-Text" },
  story: { headline: "Überschrift", body: "Text" },
  usp: { headline: "Überschrift" },
  notice: { text: "Text" },
  stats: { headline: "Überschrift" },
  process: { headline: "Überschrift" },
  quote: { text: "Zitat", author: "Urheber" },
  pageHeader: { title: "Titel", intro: "Einleitung" },
};

interface ArrayFieldSpec {
  field: string;
  singular: string;
  subfields: Record<string, string>;
}

/** Item-Arrays, deren Einträge einzeln (Index + Feld) verglichen werden. */
const ARRAY_FIELDS: Partial<Record<SectionType, ArrayFieldSpec>> = {
  services: {
    field: "items",
    singular: "Leistung",
    subfields: { title: "Titel", description: "Beschreibung", price: "Preis" },
  },
  testimonials: {
    field: "items",
    singular: "Bewertung",
    subfields: { author: "Name", text: "Text", rating: "Sterne" },
  },
  faq: {
    field: "items",
    singular: "Frage",
    subfields: { question: "Frage", answer: "Antwort" },
  },
  team: {
    field: "members",
    singular: "Teammitglied",
    subfields: { name: "Name", role: "Rolle" },
  },
  gallery: {
    field: "images",
    singular: "Bild",
    subfields: { alt: "Alt-Text" },
  },
  usp: {
    field: "items",
    singular: "Vorteil",
    subfields: { title: "Titel", text: "Text" },
  },
  stats: {
    field: "items",
    singular: "Kennzahl",
    subfields: { value: "Wert", label: "Beschriftung" },
  },
  process: {
    field: "steps",
    singular: "Schritt",
    subfields: { title: "Titel", text: "Text" },
  },
};

/** Zu tief verschachtelte Listen (Kategorien mit eigenen Positionen) → ganze Liste als JSON-String. */
const LIST_ONLY_ARRAY_FIELDS: Partial<Record<SectionType, string>> = {
  menu: "categories",
  pricelist: "categories",
};

function toDiffString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Lesbare Kurzfassung einer ganzen Sektion für „Neu"/„Entfernt"-Einträge —
 * rohes JSON wäre in der Chat-Bubble Kundenschreck (praktisch betrifft das
 * nur die story-Sektion, die einzige, die hinzukommen/verschwinden kann).
 */
function sectionSummary(section: SectionV2 | PageSection): string {
  const record = section as unknown as Record<string, unknown>;
  const headline = record.headline ?? record.title;
  const bodyValue = record.body ?? record.text;
  const body = typeof bodyValue === "string" ? bodyValue : "";
  const parts = [
    typeof headline === "string" ? `„${headline}“` : "",
    body.length > 160 ? `${body.slice(0, 160)}…` : body,
  ].filter(Boolean);
  return parts.join(" — ") || JSON.stringify(section);
}

function pushIfChanged(
  entries: AiDiffEntry[],
  path: string,
  label: string,
  before: unknown,
  after: unknown
): void {
  const b = toDiffString(before);
  const a = toDiffString(after);
  if (b !== a) entries.push({ path, label, before: b, after: a });
}

/** Gemeinsame Form von Startseite (WebsiteDataV2) und Unterseite (Page) für den Diff: SEO + Sektionsliste. */
interface DiffableContent {
  seo: { title: string; description: string };
  sections: (SectionV2 | PageSection)[];
}

function diffSeo(
  before: DiffableContent,
  after: DiffableContent,
  entries: AiDiffEntry[],
  prefix: string
): void {
  pushIfChanged(
    entries,
    `${prefix}seo.title`,
    "SEO – Titel",
    before.seo.title,
    after.seo.title
  );
  pushIfChanged(
    entries,
    `${prefix}seo.description`,
    "SEO – Beschreibung",
    before.seo.description,
    after.seo.description
  );
}

function diffScalarFields(
  type: SectionType,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  entries: AiDiffEntry[],
  prefix: string
): void {
  const fields = SCALAR_FIELDS[type];
  if (!fields) return;
  for (const [field, label] of Object.entries(fields)) {
    pushIfChanged(
      entries,
      `${prefix}sections.${type}.${field}`,
      `${SECTION_LABELS[type]} – ${label}`,
      before[field],
      after[field]
    );
  }
}

function diffArrayField(
  type: SectionType,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  entries: AiDiffEntry[],
  prefix: string
): void {
  const spec = ARRAY_FIELDS[type];
  if (spec) {
    const beforeItems =
      (before[spec.field] as Record<string, unknown>[] | undefined) ?? [];
    const afterItems =
      (after[spec.field] as Record<string, unknown>[] | undefined) ?? [];
    const count = Math.max(beforeItems.length, afterItems.length);
    for (let i = 0; i < count; i++) {
      const b = beforeItems[i];
      const a = afterItems[i];
      const itemLabel = `${spec.singular} ${i + 1}`;
      if (!b || !a) {
        pushIfChanged(
          entries,
          `${prefix}sections.${type}.${spec.field}[${i}]`,
          itemLabel,
          b,
          a
        );
        continue;
      }
      for (const [field, label] of Object.entries(spec.subfields)) {
        pushIfChanged(
          entries,
          `${prefix}sections.${type}.${spec.field}[${i}].${field}`,
          `${itemLabel} – ${label}`,
          b[field],
          a[field]
        );
      }
    }
    return;
  }

  const listField = LIST_ONLY_ARRAY_FIELDS[type];
  if (listField) {
    pushIfChanged(
      entries,
      `${prefix}sections.${type}.${listField}`,
      `${SECTION_LABELS[type]} – Liste`,
      before[listField],
      after[listField]
    );
  }
}

/**
 * Pure: vergleicht zwei v2-Dokumente feldweise (seo + Sektionen je Typ) und
 * liefert eine flache Liste von Diff-Einträgen für die Vorschau im KI-Chat.
 * Skalarfelder werden einzeln verglichen, Item-Arrays (z. B. Leistungen)
 * feld- und indexweise, tief verschachtelte Listen (Speisekarte/Preisliste)
 * als kompletter JSON-String. Sektionen, die nur vorher oder nur nachher
 * existieren, ergeben je einen Eintrag ("… – Neu"/"… – Entfernt").
 */
export function diffDocuments(
  before: WebsiteDataV2,
  after: WebsiteDataV2
): AiDiffEntry[] {
  return diffContent(before, after, "");
}

/**
 * Pure: Diff einer Unterseite (Plan B6 Task 5, KI-Chat mit `pageSlug`) —
 * derselbe feldweise Vergleich wie diffDocuments, nur mit Pfad-Präfix
 * `pages.<slug>.` und der zusätzlichen Kopfzeilen-Sektion (pageHeader).
 */
export function diffPages(before: Page, after: Page): AiDiffEntry[] {
  return diffContent(before, after, `pages.${before.slug}.`);
}

function diffContent(
  before: DiffableContent,
  after: DiffableContent,
  prefix: string
): AiDiffEntry[] {
  const entries: AiDiffEntry[] = [];
  diffSeo(before, after, entries, prefix);

  const beforeByType = new Map<SectionType, SectionV2 | PageSection>(
    before.sections.map(s => [s.type, s])
  );
  const afterByType = new Map<SectionType, SectionV2 | PageSection>(
    after.sections.map(s => [s.type, s])
  );
  // Array.from statt for-of/Spread über Map/Set — vermeidet
  // downlevelIteration-Anforderungen bei diesem tsconfig-Target.
  const types = Array.from(
    new Set<SectionType>(
      Array.from(beforeByType.keys()).concat(Array.from(afterByType.keys()))
    )
  );

  for (const type of types) {
    const b = beforeByType.get(type);
    const a = afterByType.get(type);
    const label = SECTION_LABELS[type];
    if (b && !a) {
      entries.push({
        path: `${prefix}sections.${type}`,
        label: `${label} – Entfernt`,
        before: sectionSummary(b),
        after: "",
      });
      continue;
    }
    if (!b && a) {
      entries.push({
        path: `${prefix}sections.${type}`,
        label: `${label} – Neu`,
        before: "",
        after: sectionSummary(a),
      });
      continue;
    }
    if (!b || !a) continue;
    const bRecord = b as unknown as Record<string, unknown>;
    const aRecord = a as unknown as Record<string, unknown>;
    diffScalarFields(type, bRecord, aRecord, entries, prefix);
    diffArrayField(type, bRecord, aRecord, entries, prefix);
  }

  return entries;
}
