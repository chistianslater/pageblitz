import { NACHT } from "../../../../../../shared/designSystems/nacht";
import { FIT_EM, PHOTO_BOOST } from "./entryCss";

/**
 * Schätzung fürs Handy, damit der Hauptknopf im ersten Bildschirm liegt
 * (Abnahme 2026-10-12: bei langen Namen lag er bei 390 × 844 unter der
 * Kante). Referenz ist ein schmales Handy (360 px, Inhalt 20 rem). Die
 * Funktion zählt nur Zeilen; die Höhen rechnet das CSS aus den Tokens
 * (`--nc-block`, entryCss.ts). Die Schätzung ist eher großzügig — bei
 * breiteren Handys werden es weniger Zeilen, das Foto nur etwas kleiner
 * als nötig.
 */

/** Referenzbreite: 360 px Fenster, 20 px Rand je Seite. */
const REF_VW = 360;
const REF_W = 320;
const REM = 16;
/** Mittlere Zeichenbreite von Jost (Satz, Fakten) in em, eher reichlich. */
const LEDE_EM = 0.52;
const SMALL_EM = 0.55;
/** Foto-Einstieg: Name höchstens 14 vw (entryCss). */
const PHOTO_VW = 0.14;
/** Ab so vielen Namenszeilen gilt der Name als lang (Stufe ohne Zuschlag). */
export const LONG_NAME_LINES = 3;

/** Typo-Größe in px bei der Referenzbreite („clamp(a, b + c vw, d)" oder „x rem"). */
function sizeAt(spec: string): number {
  const rem = (t: string) => parseFloat(t) * REM;
  const c = spec.match(
    /^clamp\(([\d.]+)rem,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw,\s*([\d.]+)rem\)$/
  );
  if (c) {
    const fluid = rem(c[2]) + (parseFloat(c[3]) / 100) * REF_VW;
    return Math.min(Math.max(fluid, rem(c[1])), rem(c[4]));
  }
  if (/^[\d.]+rem$/.test(spec)) return rem(spec);
  throw new Error(`Nacht: Größe nicht lesbar: ${spec}`);
}

/** Zeilen bei gieriger Wortverteilung (ein zu langes Wort belegt mehrere). */
export function wrapLines(text: string, perLine: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let lines = 0;
  let used = 0;
  for (const word of words) {
    const len = [...word].length;
    if (used > 0 && used + 1 + len <= perLine) {
      used += 1 + len;
      continue;
    }
    lines += Math.max(1, Math.ceil(len / perLine));
    used = len > perLine ? len % perLine || perLine : len;
  }
  return lines;
}

const perLine = (sizePx: number, em: number) =>
  Math.max(1, Math.floor(REF_W / (sizePx * em)));

export type EntryFit = {
  nameLines: number;
  ledeLines: number;
  factLines: number;
  /** Name belegt ≥ 3 Zeilen: Anzeigestufe ohne Foto-Zuschlag. */
  long: boolean;
};

/**
 * `title`: der große Name (Marke), `facts`: je Absatz der Text (Heute-Zeile,
 * Bewertung). Zeichen des längsten Worts begrenzen die Größe wie im CSS.
 */
export function entryFit({
  title,
  lede,
  facts,
}: {
  title: string;
  lede?: string;
  facts: readonly string[];
}): EntryFit {
  const longest = Math.max(
    1,
    ...title.split(/[\s–—-]+/).map(w => [...w].length)
  );
  const fit = REF_W / longest / FIT_EM;
  const display = sizeAt(NACHT.type.display.size);
  const boosted = Math.min(display * PHOTO_BOOST, PHOTO_VW * REF_VW, fit);
  const name = title.toLocaleUpperCase("de");
  const boostedLines = wrapLines(name, perLine(boosted, FIT_EM));
  const long = boostedLines >= LONG_NAME_LINES;
  const nameLines = long
    ? wrapLines(name, perLine(Math.min(display, fit), FIT_EM))
    : boostedLines;
  const ledeLines = lede
    ? wrapLines(lede, perLine(sizeAt(NACHT.type.lede.size), LEDE_EM))
    : 0;
  const small = perLine(sizeAt(NACHT.type.small.size), SMALL_EM);
  const factLines = facts.reduce((n, f) => n + wrapLines(f, small), 0);
  return { nameLines, ledeLines, factLines, long };
}
