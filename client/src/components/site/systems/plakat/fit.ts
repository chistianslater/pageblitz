import { versalEszett } from "../shared";
import { LEAGUE_GOTHIC_EM } from "./glyphs";

/**
 * „Text füllt die Breite" ohne JS (Systemblatt: Einstieg in Staffel,
 * Riesenname im Fuß). Die Breite einer Zeile kommt aus den gemessenen
 * League-Gothic-Breiten (glyphs.ts); das CSS teilt die Spaltenbreite
 * (`cqi`) durch die breiteste Zeile in em (`--pk-fit`). So läuft bei 320 px
 * nichts über, und kurze Zeilen werden riesig (gedeckelt durch die Stufe).
 */

export type Stretch = keyof typeof LEAGUE_GOTHIC_EM;

/** Unbekannte Zeichen: so breit wie das breiteste Versal (lieber zu breit). */
const UNKNOWN_EM = { 88: 0.45, 82: 0.42 } as const;

/** Aufschlag gegen Rundung, Kerning-Ausreißer und Laufweite. */
export const FIT_SAFETY = 1.04;

/** Zweite Zeile der Staffel springt um so viele em ein (Systemblatt). */
export const STAGGER_INDENT = 1.6;

/** Versal wie im CSS (uppercase), ß als ẞ (versalEszett). */
export const versal = (text: string) =>
  versalEszett(text).toLocaleUpperCase("de-DE");

/** Akzent-Versalien ohne Zerlegung (NFD) → gleich breiter Grundbuchstabe. */
const BASE_LETTER: Record<string, string> = { Ł: "L", Đ: "D", Ø: "O", Ħ: "H" };

/**
 * Breite eines Zeichens: gemessen, sonst wie sein Grundbuchstabe (latin-ext
 * der League Gothic setzt Ş, Ğ, İ, Č, Ő … so breit wie S, G, I, C, O),
 * sonst der breite Rückfall.
 */
function charEm(table: Record<string, number>, ch: string, stretch: Stretch) {
  const base = BASE_LETTER[ch] ?? ch.normalize("NFD")[0];
  return table[ch] ?? table[base] ?? UNKNOWN_EM[stretch];
}

/** Breite einer Zeile in em (Versal, inkl. Laufweite je Zeichen). */
export function lineEm(text: string, stretch: Stretch = 88, track = 0): number {
  const table = LEAGUE_GOTHIC_EM[stretch] as Record<string, number>;
  return [...versal(text)].reduce(
    (sum, ch) => sum + charEm(table, ch, stretch) + track,
    0
  );
}

/** Staffel: höchstens drei Zeilen mit höchstens drei Wörtern. */
const MAX_LINES = 3;
const MAX_WORDS_PER_LINE = 3;

export type Display = {
  /** Zeilen; leer = Fließsatz (zu lang für die Staffel). */
  lines: string[];
  /** Index der eingerückten Zeile (Staffel), sonst -1. */
  indent: number;
  /** Breite der breitesten Zeile in em (mit Einzug und Aufschlag). */
  widthEm: number;
};

const widthOf = (lines: string[], track: number) =>
  Math.max(
    ...lines.map(
      (l, i) => lineEm(l, 88, track) + (i === 1 ? STAGGER_INDENT : 0)
    )
  );

/**
 * Staffel-Zeilen der großen Zeile (Systemblatt: „FADE, / BART, /
 * FERTIG."): alle Aufteilungen in bis zu drei Zeilen mit bis zu drei
 * Wörtern, die zweite Zeile eingerückt; gewählt wird die schmalste (größte
 * Schrift). Mehr als neun Wörter: kein Staffelsatz, Fließsatz in Stufe h2.
 */
export function staggerLines(text: string, track = 0): Display {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: [], indent: -1, widthEm: 1 };
  if (words.length > MAX_LINES * MAX_WORDS_PER_LINE)
    return { lines: [], indent: -1, widthEm: 1 };
  let best: string[] | undefined;
  let bestWidth = Infinity;
  const search = (rest: string[], lines: string[]) => {
    if (rest.length === 0) {
      const width = widthOf(lines, track);
      if (width < bestWidth - 1e-6) {
        best = lines;
        bestWidth = width;
      }
      return;
    }
    if (lines.length === MAX_LINES) return;
    for (let n = 1; n <= Math.min(MAX_WORDS_PER_LINE, rest.length); n++)
      search(rest.slice(n), [...lines, rest.slice(0, n).join(" ")]);
  };
  search(words, []);
  if (!best) return { lines: [], indent: -1, widthEm: 1 };
  return {
    lines: best,
    indent: best.length > 1 ? 1 : -1,
    widthEm: Math.max(bestWidth, 1) * FIT_SAFETY,
  };
}

/** Ab dieser Breite (em, eine Zeile) teilt sich die Fuß-Wortmarke. */
export const FOOT_ONE_LINE_MAX = 5.5;

/**
 * Fuß-Wortmarke (Systemblatt: Riesenname): eine Zeile; lange Namen auf
 * zwei Zeilen, getrennt an Leerzeichen oder nach einem Bindestrich.
 */
export function footWord(
  mark: string,
  track = 0
): { lines: string[]; widthEm: number } {
  const text = mark.trim();
  const one = lineEm(text, 82, track);
  let lines = [text];
  if (one > FOOT_ONE_LINE_MAX) {
    // Erst an Leerzeichen trennen; nach einem Bindestrich nur ohne Leerzeichen.
    const cuts = (sep: string) => {
      let best = one;
      let out: string[] | undefined;
      for (let i = 1; i < text.length; i++) {
        if (text[i - 1] !== sep) continue;
        const a = text.slice(0, i).trim();
        const b = text.slice(i).trim();
        if (!a || !b) continue;
        const w = Math.max(lineEm(a, 82, track), lineEm(b, 82, track));
        if (w < best - 1e-6) {
          best = w;
          out = [a, b];
        }
      }
      return out;
    };
    lines = cuts(" ") ?? cuts("-") ?? lines;
  }
  return {
    lines,
    widthEm:
      Math.max(...lines.map(l => lineEm(l, 82, track)), 0.5) * FIT_SAFETY,
  };
}
