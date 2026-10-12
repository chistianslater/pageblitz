import { PLAKAT } from "../../../../../../shared/designSystems/plakat";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/**
 * Vollständige Typo-Deklaration einer Stufe aus den System-Variablen,
 * inkl. Breite (`font-stretch`, wdth-Achse der League Gothic).
 */
export function step(s: TypeStep): string {
  const spec = PLAKAT.type[s];
  if (!spec) throw new Error(`Plakat: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
    ...(spec.stretch ? [`font-stretch:var(--sys-${s}-stretch)`] : []),
  ].join(";");
}

/** Desktop-Raster (12 Spalten ab 900 px), wie Werkstoff. */
export const GRID = "56.25rem";
/** Desktop-Navigation. */
export const NAV = "64rem";
/** Dock nur unterhalb dieser Breite. */
export const DOCK = "48rem";
/** Pillen-Radius ohne Pixelmaß. */
export const PILL = "100vmax";
