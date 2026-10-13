import { FREUNDLICH } from "../../../../../../shared/designSystems/freundlich";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

/** Vollständige Typo-Deklaration einer Stufe aus den System-Variablen. */
export function step(s: TypeStep): string {
  const spec = FREUNDLICH.type[s];
  if (!spec) throw new Error(`Freundlich: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/** Desktop-Navigation, Hauptweg im Kopf, Kippen der Fotos. */
export const NAV = "64rem";
/** Handy-Leiste nur unterhalb dieser Breite (Systemblatt 10: Handy). */
export const DOCK = "48rem";
/** Zwei Spalten im Pastell-Einstieg mit kleinem Foto. */
export const WIDE = "48rem";
/** Knopf 56 px, Kopfknopf/Leiste 48 px, Ziel 44 px. */
export const H_BTN = "calc(var(--sys-space-l) * 1.4)";
export const H_SMALL = "calc(var(--sys-space-xl) * .75)";
export const H_MIN = "calc(var(--sys-space-l) * 1.1)";
/** Kopfzeile 76 px, Zeichen 38 px. */
export const HEAD_H = "calc(var(--sys-space-xl) * 1.1875)";
export const LOGO = "calc(var(--sys-space-l) * .95)";
/** Pille 36 px hoch, Punkt 7 px. */
export const PILL_H = "calc(var(--sys-space-l) * .9)";
export const DOT = "calc(var(--sys-space-xs) * .875)";
/** Wolkenkante 56 px (Handy) / 72 px (ab Desktop). */
export const CLOUD = "calc(var(--sys-space-l) * 1.4)";
export const CLOUD_WIDE = "calc(var(--sys-space-xl) * 1.125)";
/** Rand der Knöpfe und Kacheln 1,5 px (Systemblatt 7). */
export const LINE = "1.5px";
/** Fokus 3 px Akzent, Abstand 4 px (Endwerte). */
export const FOCUS = "3px";
