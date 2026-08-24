import type { PackId } from "../siteContract/types";
import type { PackConstitution } from "./types";
import { WERKBANK } from "./werkbank";
import { KANZLEI } from "./kanzlei";
import { MORGENLICHT } from "./morgenlicht";
import { GUSTO } from "./gusto";
import { PATINA } from "./patina";
import { SALON_NOIR } from "./salon-noir";
import { MARKTPLATZ } from "./marktplatz";
import { LANDGUT } from "./landgut";
import { ATELIER } from "./atelier";
import { KLARWERK } from "./klarwerk";
import { VERVE } from "./verve";
import { ZUNFT } from "./zunft";
import { SCHIMMER } from "./schimmer";
import { FUNDAMENT } from "./fundament";

export type { PackConstitution, FontSpec } from "./types";
export { toCssVars } from "./toCssVars";
export { FONT_PAIRS, getFontPair } from "./fontPairs";
export type { FontPair } from "./fontPairs";

export const STYLE_PACKS: Partial<Record<PackId, PackConstitution>> = {
  werkbank: WERKBANK,
  kanzlei: KANZLEI,
  morgenlicht: MORGENLICHT,
  gusto: GUSTO,
  patina: PATINA,
  "salon-noir": SALON_NOIR,
  marktplatz: MARKTPLATZ,
  landgut: LANDGUT,
  atelier: ATELIER,
  klarwerk: KLARWERK,
  verve: VERVE,
  zunft: ZUNFT,
  schimmer: SCHIMMER,
  fundament: FUNDAMENT,
};

export const FALLBACK_PACK: PackId = "klarwerk";

export function getConstitution(id: PackId): PackConstitution {
  const c = STYLE_PACKS[id];
  if (!c) throw new Error(`Style Pack nicht registriert: ${id}`);
  return c;
}

/**
 * Minimale Präfix-Länge für "beginnt mit"-Matches (siehe {@link matchesWord}).
 * Verhindert, dass sehr kurze Industry-Keys (z. B. "bar", 3 Zeichen) als
 * Präfix eines unrelated längeren Wortes zählen ("Barbershop" darf NICHT
 * über "bar" auf das Gastro-Pack "gusto" matchen). Exakte Treffer sind davon
 * ausgenommen — "bar" als eigenständiges Wort matcht weiterhin.
 */
const MIN_PREFIX_MATCH_LENGTH = 4;

/**
 * Deutsche Umlaute/ß → ASCII-Transliteration + lowercase. Wird sowohl auf
 * den Branchen-Key (Nutzereingabe) als auch auf die industries-Einträge der
 * Style-Pack-Verfassungen angewandt, damit "Logopädie" (Umlaut) gegen
 * "logopaedie" (ASCII, so wie es in den Verfassungen steht) matcht.
 */
function transliterate(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

/** Zerlegt einen transliterierten String in Wort-Tokens (nur a-z-Läufe). */
function tokenize(value: string): string[] {
  return value.split(/[^a-z]+/i).filter(Boolean);
}

/**
 * Wortgrenzen-Match zwischen einem Kategorie-Token und einem Industry-Key:
 * exakte Übereinstimmung matcht immer; ein reines Präfix-Verhältnis
 * (Token beginnt mit Industry ODER Industry beginnt mit Token) matcht nur,
 * wenn der jeweils kürzere String mindestens MIN_PREFIX_MATCH_LENGTH Zeichen
 * hat — das verhindert Substring-Treffer mitten im Wort bei kurzen Keys wie
 * "bar" oder "kfz".
 */
function matchesWord(token: string, industry: string): boolean {
  if (token === industry) return true;
  if (token.startsWith(industry) && industry.length >= MIN_PREFIX_MATCH_LENGTH)
    return true;
  if (industry.startsWith(token) && token.length >= MIN_PREFIX_MATCH_LENGTH)
    return true;
  return false;
}

/** Primär-Pack zuerst; unbekannte Branchen → [FALLBACK_PACK]. */
export function getPackPool(categoryKey: string): PackId[] {
  const tokens = tokenize(transliterate(categoryKey));
  const pool = (Object.values(STYLE_PACKS) as PackConstitution[])
    .filter(c =>
      c.industries.some(industry => {
        const industryKey = transliterate(industry);
        return tokens.some(token => matchesWord(token, industryKey));
      })
    )
    .map(c => c.id);
  return pool.length > 0 ? pool : [FALLBACK_PACK];
}
