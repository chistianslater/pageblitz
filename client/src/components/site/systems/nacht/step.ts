import { NACHT } from "../../../../../../shared/designSystems/nacht";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/** Vollständige Typo-Deklaration einer Stufe aus den System-Variablen. */
export function step(s: TypeStep): string {
  const spec = NACHT.type[s];
  if (!spec) throw new Error(`Nacht: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/** Desktop-Navigation. */
export const NAV = "64rem";
/** Handy-Leiste nur unterhalb dieser Breite (Systemblatt: unter 768 px). */
export const DOCK = "48rem";
/** Zwei Spalten im Einstieg ohne starkes Foto. */
export const WIDE = "48rem";
/** Ecke 2 px überall (scharf wie Zimmerl); rund nur Monogramm, Ring, Punkt. */
export const R = "2px";
export const ROUND = "100vmax";
/** Knopf 56 px, Leiste 52 px, Ziel 48 px, Monogramm 48 px. */
export const H_BTN = "calc(var(--sys-space-l) * 1.4)";
export const H_DOCK = "calc(var(--sys-space-l) * 1.3)";
export const H_MIN = "calc(var(--sys-space-xl) * .75)";
export const MONO = "calc(var(--sys-space-xl) * .75)";
/** Kopfzeile 76 px. */
export const HEAD_H = "calc(var(--sys-space-xl) * 1.1875)";
/** Deckkraft des Scheins (Systemblatt: fest 0,34). */
export const GLOW_OPACITY = 0.34;
/** Kern des Scheins (Systemblatt: hellster Punkt = 0,34 × 0,7). */
export const GLOW_CORE = 0.7;
