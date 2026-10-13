/**
 * Die 20 IDs der Textstimmen (historischer Feldname `stylePackId`, Typ
 * `PackId` — Entscheidung E8: bleibt für Rollback und Verlauf; Stimmen in
 * shared/textVoices/). Auch Schlüssel der Beispiel-Fixtures. Bewusst in
 * einem eigenen, **zod-freien** Modul: `shared/siteContract/schema.ts`
 * re-exportiert die Liste für `PackIdSchema`; Module, die nur die IDs
 * brauchen, importieren sie hier bzw. über `types.ts`, ohne zod mitzuladen.
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
  "karat",
  "plakat",
  "raster",
  "strom",
  "riviera",
  "ernte",
] as const;
