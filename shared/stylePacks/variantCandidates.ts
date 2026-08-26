import type { PackId } from "../siteContract/types";
import { getPackPool, STYLE_PACKS } from "./index";

const DEFAULT_GROUP_SIZE = 2;

/**
 * v2-Variant-Picker-Kandidaten: Branchen-Primärmatch (getPackPool, shared
 * Registry) zuerst, danach alle übrigen registrierten Packs in stabiler
 * Reihenfolge. Die Gesamtliste wird in Gruppen zerlegt — `round` wählt
 * (rotierend, modulo Gruppenanzahl) die anzuzeigende Gruppe. Das entspricht
 * dem v1-Verhalten von "Andere zeigen" (Runde hochzählen), liefert aber
 * Pack-IDs statt Legacy-Layoutnamen.
 *
 * Reine Funktion: keine Zufälligkeit, kein I/O — dieselben Argumente liefern
 * immer dieselbe Rückgabe.
 */
export function getV2VariantCandidates(
  category: string,
  round: number,
  groupSize: 2 | 3 = DEFAULT_GROUP_SIZE
): PackId[] {
  const matches = getPackPool(category);
  const allIds = Object.keys(STYLE_PACKS) as PackId[];
  const rest = allIds.filter(id => !matches.includes(id));
  const ordered = [...matches, ...rest];

  const groups: PackId[][] = [];
  for (let i = 0; i < ordered.length; i += groupSize) {
    groups.push(ordered.slice(i, i + groupSize));
  }
  // Ungerade Gesamtzahl → letzte Gruppe mit dem ersten Pack auffüllen, damit
  // immer exakt `groupSize` Kandidaten zurückkommen.
  const lastGroup = groups[groups.length - 1];
  if (lastGroup && lastGroup.length < groupSize && ordered.length > 0) {
    let fillIndex = 0;
    while (lastGroup.length < groupSize) {
      lastGroup.push(ordered[fillIndex % ordered.length]);
      fillIndex += 1;
    }
  }

  if (groups.length === 0) return [];
  const safeRound = ((round % groups.length) + groups.length) % groups.length;
  return groups[safeRound];
}
