import type { PackId } from "../siteContract/types";
import { getPackPool, STYLE_PACKS } from "./index";

const GROUP_SIZE = 2;

/**
 * v2-Variant-Picker-Kandidaten: Branchen-Primärmatch (getPackPool, shared
 * Registry) zuerst, danach alle übrigen registrierten Packs in stabiler
 * Reihenfolge. Die Gesamtliste wird in 2er-Gruppen zerlegt — `round` wählt
 * (rotierend, modulo Gruppenanzahl) die anzuzeigende Gruppe. Das entspricht
 * dem v1-Verhalten von "Andere zeigen" (Runde hochzählen), liefert aber
 * Pack-IDs statt Legacy-Layoutnamen.
 *
 * Reine Funktion: keine Zufälligkeit, kein I/O — dieselben Argumente liefern
 * immer dieselbe Rückgabe.
 */
export function getV2VariantCandidates(
  category: string,
  round: number
): PackId[] {
  const matches = getPackPool(category);
  const allIds = Object.keys(STYLE_PACKS) as PackId[];
  const rest = allIds.filter(id => !matches.includes(id));
  const ordered = [...matches, ...rest];

  const groups: PackId[][] = [];
  for (let i = 0; i < ordered.length; i += GROUP_SIZE) {
    groups.push(ordered.slice(i, i + GROUP_SIZE));
  }
  // Ungerade Gesamtzahl → letzte Gruppe mit dem ersten Pack auffüllen, damit
  // immer exakt 2 Kandidaten zurückkommen.
  const lastGroup = groups[groups.length - 1];
  if (lastGroup && lastGroup.length < GROUP_SIZE && ordered.length > 0) {
    lastGroup.push(ordered[0]);
  }

  if (groups.length === 0) return [];
  const safeRound = ((round % groups.length) + groups.length) % groups.length;
  return groups[safeRound];
}
