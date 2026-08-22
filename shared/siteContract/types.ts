import type { z } from "zod";
import {
  FeaturesSchema,
  PACK_IDS,
  SECTION_TYPES,
  SectionV2Schema,
  WebsiteDataV2Schema,
} from "./schema";

export { PACK_IDS, SECTION_TYPES };
export type PackId = (typeof PACK_IDS)[number];
export type SectionType = (typeof SECTION_TYPES)[number];
export type SectionV2 = z.infer<typeof SectionV2Schema>;
export type WebsiteDataV2 = z.infer<typeof WebsiteDataV2Schema>;
export type SectionOf<T extends SectionType> = Extract<SectionV2, { type: T }>;
export type SiteFeatures = z.infer<typeof FeaturesSchema>;
