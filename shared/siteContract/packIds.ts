/**
 * Die 14 Style-Pack-IDs — bewusst in einem eigenen, **zod-freien** Modul.
 *
 * `shared/siteContract/schema.ts` (und damit zod, ~57 kB unminifiziert)
 * re-exportiert die Liste für `PackIdSchema`; Module, die nur die IDs
 * brauchen (`shared/stylePacks/summary.ts` → Landingpage-Chunk), importieren
 * sie hier bzw. über `types.ts`, ohne zod in den Entry-Chunk von "/" zu
 * ziehen (B6 Task 8). Reihenfolge = Landing-Grid-Reihenfolge.
 */
export const PACK_IDS = [
  "werkbank",
  "patina",
  "kanzlei",
  "salon-noir",
  "morgenlicht",
  "marktplatz",
  "gusto",
  "landgut",
  "atelier",
  "klarwerk",
  "verve",
  "zunft",
  "schimmer",
  "fundament",
] as const;
