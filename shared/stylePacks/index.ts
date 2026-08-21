import type { PackId } from "../siteContract/types";
import type { PackConstitution } from "./types";
import { WERKBANK } from "./werkbank";
import { KANZLEI } from "./kanzlei";
import { MORGENLICHT } from "./morgenlicht";
import { GUSTO } from "./gusto";

export type { PackConstitution, PaletteColor, FontSpec } from "./types";
export { toCssVars } from "./toCssVars";

export const STYLE_PACKS: Partial<Record<PackId, PackConstitution>> = {
  werkbank: WERKBANK,
  kanzlei: KANZLEI,
  morgenlicht: MORGENLICHT,
  gusto: GUSTO,
};

export const FALLBACK_PACK: PackId = "werkbank";

export function getConstitution(id: PackId): PackConstitution {
  const c = STYLE_PACKS[id];
  if (!c) throw new Error(`Style Pack nicht registriert: ${id}`);
  return c;
}

/** Primär-Pack zuerst; unbekannte Branchen → [FALLBACK_PACK]. */
export function getPackPool(categoryKey: string): PackId[] {
  const key = categoryKey.toLowerCase();
  const pool = (Object.values(STYLE_PACKS) as PackConstitution[])
    .filter(c => c.industries.some(i => key.includes(i)))
    .map(c => c.id);
  return pool.length > 0 ? pool : [FALLBACK_PACK];
}
