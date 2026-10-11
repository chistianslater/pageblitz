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
/** Gedämpfter Text auf `deep` (Fuß). */
export const ON_DEEP_DIM =
  "color-mix(in srgb,var(--sys-on-deep) 66%,var(--sys-deep))";
/** Haarlinie auf `deep`. */
export const DEEP_RULE =
  "color-mix(in srgb,var(--sys-on-deep) 22%,var(--sys-deep))";
