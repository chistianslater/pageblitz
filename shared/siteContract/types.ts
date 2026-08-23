import type { z } from "zod";
// Nur Typ-Importe aus schema.ts: dieses Modul bleibt zur Laufzeit zod-frei,
// damit `PACK_IDS`-Konsumenten (shared/stylePacks/summary.ts → Landing-
// Chunk) zod nicht mitladen (B6 Task 8). SECTION_TYPES wird unten per
// `typeof` verwendet, daher reicht der Typ-Import.
import type {
  FeaturesSchema,
  PageSchema,
  PageSectionSchema,
  SECTION_TYPES,
  SectionV2Schema,
  SiteAddOnsSchema,
  WebsiteDataV2Schema,
} from "./schema";
import { PACK_IDS } from "./packIds";

export { PACK_IDS };
export type PackId = (typeof PACK_IDS)[number];
export type SectionType = (typeof SECTION_TYPES)[number];
export type SectionV2 = z.infer<typeof SectionV2Schema>;
export type WebsiteDataV2 = z.infer<typeof WebsiteDataV2Schema>;
export type SectionOf<T extends SectionType> = Extract<SectionV2, { type: T }>;
export type SiteFeatures = z.infer<typeof FeaturesSchema>;
export type SiteAddOns = z.infer<typeof SiteAddOnsSchema>;
/** Sektion innerhalb einer Unterseite (Page.sections) — siehe PageSectionSchema. */
export type PageSection = z.infer<typeof PageSectionSchema>;
export type PageSectionOf<T extends PageSection["type"]> = Extract<
  PageSection,
  { type: T }
>;
export type Page = z.infer<typeof PageSchema>;
