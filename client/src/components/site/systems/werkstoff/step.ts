import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/**
 * Vollständige Typo-Deklaration einer Stufe aus den System-Variablen.
 * Werkstoff führt zusätzlich `figure` (Ziffern) und `data` (DM Mono:
 * Zettel, Zeiten, Bildzeilen).
 */
export function step(s: TypeStep): string {
  const spec = WERKSTOFF.type[s];
  if (!spec) throw new Error(`Werkstoff: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/** Desktop-Raster laut Systemblatt (12 Spalten ab 900 px). */
export const GRID = "56.25rem";
/** Desktop-Navigation (lange Namen + vier, fünf Einträge). */
export const NAV = "64rem";
/** Handy-Leiste nur unterhalb dieser Breite. */
export const DOCK = "48rem";
/** Erhabene Fläche (Zettel, Zeiten-Karte): Papier aufgehellt (Systemblatt `--raise`). */
export const RAISED = "color-mix(in srgb,var(--sys-paper) 34%,white)";
/** Anteil `onDeep` in gedämpftem Text bzw. Haarlinie auf `deep` (Kontrasttest). */
export const DEEP_SHARE = { dim: 0.66, rule: 0.22 } as const;
const onDeepAt = (n: number) =>
  `color-mix(in srgb,var(--sys-on-deep) ${Math.round(n * 100)}%,var(--sys-deep))`;
/** Gedämpfter Text auf `deep` (Fuß). */
export const ON_DEEP_DIM = onDeepAt(DEEP_SHARE.dim);
/** Haarlinie auf `deep` (nur Gliederung, kein Bedienelement). */
export const DEEP_RULE = onDeepAt(DEEP_SHARE.rule);
