import { z } from "zod";
import { PACK_IDS, SectionV2Schema } from "../siteContract/schema";
import type { SectionType, SectionV2, WebsiteDataV2 } from "../siteContract/types";

/**
 * Antwortschema der KI-Chat-Bearbeitung (server/onboardingV2/aiEdit.ts). Drei
 * sich gegenseitig ausschließende Ergebnisse:
 * - "content": ein validierter Inhalts-Vorschlag (seo + sections).
 * - "style": ein Pack-Vorschlag für Design-Wünsche (kein Farb-/Font-Patch).
 * - "reject": eine Ablehnung, z. B. bei Fakten-/Kontaktwünschen, die nur
 *   über die Panels geändert werden dürfen.
 */
export const AiEditResponseSchema = z.discriminatedUnion("kind", [
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
]);

export type AiEditResponse = z.infer<typeof AiEditResponseSchema>;

/** Ein einzelner Vorher/Nachher-Eintrag für die Diff-Vorschau im KI-Chat. */
export interface AiDiffEntry {
  path: string;
  label: string;
  before: string;
  after: string;
}

const SECTION_LABELS: Record<SectionType, string> = {
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

function diffSeo(
  before: WebsiteDataV2,
  after: WebsiteDataV2,
  entries: AiDiffEntry[]
): void {
  pushIfChanged(
    entries,
    "seo.title",
    "SEO – Titel",
    before.seo.title,
    after.seo.title
  );
  pushIfChanged(
    entries,
    "seo.description",
    "SEO – Beschreibung",
    before.seo.description,
    after.seo.description
  );
}

function diffScalarFields(
  type: SectionType,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  entries: AiDiffEntry[]
): void {
  const fields = SCALAR_FIELDS[type];
  if (!fields) return;
  for (const [field, label] of Object.entries(fields)) {
    pushIfChanged(
      entries,
      `sections.${type}.${field}`,
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
  entries: AiDiffEntry[]
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
          `sections.${type}.${spec.field}[${i}]`,
          itemLabel,
          b,
          a
        );
        continue;
      }
      for (const [field, label] of Object.entries(spec.subfields)) {
        pushIfChanged(
          entries,
          `sections.${type}.${spec.field}[${i}].${field}`,
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
      `sections.${type}.${listField}`,
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
  const entries: AiDiffEntry[] = [];
  diffSeo(before, after, entries);

  const beforeByType = new Map<SectionType, SectionV2>(
    before.sections.map(s => [s.type, s])
  );
  const afterByType = new Map<SectionType, SectionV2>(
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
        path: `sections.${type}`,
        label: `${label} – Entfernt`,
        before: JSON.stringify(b),
        after: "",
      });
      continue;
    }
    if (!b && a) {
      entries.push({
        path: `sections.${type}`,
        label: `${label} – Neu`,
        before: "",
        after: JSON.stringify(a),
      });
      continue;
    }
    if (!b || !a) continue;
    const bRecord = b as unknown as Record<string, unknown>;
    const aRecord = a as unknown as Record<string, unknown>;
    diffScalarFields(type, bRecord, aRecord, entries);
    diffArrayField(type, bRecord, aRecord, entries);
  }

  return entries;
}
