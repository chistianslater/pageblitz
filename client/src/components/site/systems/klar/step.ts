import { KLAR } from "../../../../../../shared/designSystems/klar";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/** Vollständige Typo-Deklaration einer Stufe aus den System-Variablen. */
export function step(s: TypeStep): string {
  const spec = KLAR.type[s];
  if (!spec) throw new Error(`Klar: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
  ].join(";");
}

/** Desktop-Raster des Einstiegs (zwei Spalten). */
export const GRID = "56.25rem";
/** Desktop-Navigation. */
export const NAV = "64rem";
/** Handy-Leiste nur unterhalb dieser Breite. */
export const DOCK = "48rem";
/** Pillen-Radius ohne Pixelmaß. */
export const PILL = "100vmax";
/** Ecken laut Systemblatt (14/20/26/28/36 px) als Vielfache der Abstände. */
export const R_BTN = "calc(var(--sys-space-s) * .875)";
export const R_CARD = "calc(var(--sys-space-l) * .5)";
export const R_FRAME = "calc(var(--sys-space-l) * .65)";
export const R_PANEL = "calc(var(--sys-space-l) * .7)";
export const R_PANEL_WIDE = "calc(var(--sys-space-l) * .9)";
/** Knopfhöhe 56 px, Mindesthöhe 48 px, Icon-Kachel 40 px, Ziel 44 px. */
export const H_BTN = "calc(var(--sys-space-l) * 1.4)";
export const H_MIN = "calc(var(--sys-space-xl) * .75)";
export const TILE = "var(--sys-space-l)";
export const TAP = "calc(var(--sys-space-l) * 1.1)";
/** Weicher Schatten aus der Tinte (keine festen Farben). */
export const SHADOW =
  "0 calc(var(--sys-space-s) * .75) calc(var(--sys-space-l) * .8) calc(var(--sys-space-s) * -.875) color-mix(in srgb,var(--sys-ink) 45%,transparent)";
