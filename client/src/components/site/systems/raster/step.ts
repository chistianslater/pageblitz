import { RASTER } from "../../../../../../shared/designSystems/raster";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/**
 * Vollständige Typo-Deklaration einer Stufe aus den System-Variablen.
 * Raster führt zusätzlich `figure` (große Ziffern, Bandnamen).
 */
export function step(s: TypeStep): string {
  const spec = RASTER.type[s];
  if (!spec) throw new Error(`Raster: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/** Raster-Breakpoints laut Systemblatt (Kapitel-Raster ab 900 px). */
export const GRID = "56.25rem";
/** Haarlinie auf `deep` (Systemblatt: weiß 14–18 %). */
export const DEEP_RULE =
  "color-mix(in srgb,var(--sys-on-deep) 18%,transparent)";
