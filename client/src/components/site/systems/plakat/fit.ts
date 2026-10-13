import { stripMarks } from "../../richText";
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
const UNKNOWN_EM = { 88: 0.45, 82: 0.42, 92: 0.48 } as const;

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
 * Jede Zeile vor der letzten mindestens so viel Schrift (ohne Einzug) wie
 * dieser Anteil der längsten — sonst steht ein kurzes Wort allein zwischen
 * langen Zeilen („MASSARBEIT / AUS / HOLZ. PUNKT.") und das Plakat franst
 * aus. Die letzte Zeile darf kürzer auslaufen („… / BORKEN."), aber nicht
 * unter MIN_LAST.
 */
export const MIN_INK = 0.5;
export const MIN_LAST = 0.3;

/** Kurze Wörter, die nicht am Zeilenende stehen sollen („HANDWERK FÜR / HAAR."). */
const CLINGING = new Set(
  "ab am an auf aus bei bis das dem den der des die ein im in mit um und vom von zu zum zur für".split(" ")
);

/** Satzanfang am Zeilenende („GUT AUFGEHOBEN. VON / ANFANG AN."). */
const sentenceStart = (line: string) => /[.!?]\s+\S+$/.test(line);

/** Artikel/Präposition am Zeilenende, die zum nächsten Wort gehört. */
const clinging = (line: string) =>
  CLINGING.has(line.split(" ").pop()!.toLocaleLowerCase("de-DE"));

/**
 * So viel breiter (= kleinere Schrift) darf eine Staffel sein, damit nichts
 * am Zeilenende hängt — mehr ist ein hängendes „UND" nicht wert.
 */
const CLING_COST = 0.12;

/** Gleich breit (Schrift ±1 %): dann entscheidet die Ausgewogenheit. */
const TIE = 0.01;

type Candidate = {
  lines: string[];
  width: number;
  ink: number;
  /** Zeilen tragen genug Schrift (MIN_INK, MIN_LAST), kein Satzanfang am Ende. */
  even: boolean;
  /** Und kein Artikel/keine Präposition am Zeilenende. */
  ok: boolean;
};

function candidate(lines: string[], track: number): Candidate {
  const inks = lines.map(l => lineEm(l, 88, track));
  const max = Math.max(...inks);
  const last = inks[inks.length - 1] / max;
  const body = Math.min(...inks.slice(0, -1), max) / max;
  const even =
    body >= MIN_INK && last >= MIN_LAST && !lines.some(sentenceStart);
  return {
    lines,
    width: widthOf(lines, track),
    ink: Math.min(body, last),
    even,
    ok: even && !lines.slice(0, -1).some(clinging),
  };
}

/** Schmalste; bei Gleichstand die ausgewogenere, dann die mit weniger Zeilen. */
function narrowest(pool: Candidate[]): Candidate {
  const min = Math.min(...pool.map(c => c.width));
  return pool
    .filter(c => c.width <= min * (1 + TIE))
    .reduce((a, b) =>
      b.ink > a.ink + 1e-6 ||
      (Math.abs(b.ink - a.ink) <= 1e-6 && b.lines.length < a.lines.length)
        ? b
        : a
    );
}

/**
 * Staffel-Zeilen der großen Zeile (Systemblatt: „FADE, / BART, /
 * FERTIG."): alle Aufteilungen in bis zu drei Zeilen mit bis zu drei
 * Wörtern, die zweite Zeile eingerückt; gewählt wird die schmalste (größte
 * Schrift) unter den ausgewogenen Staffeln (MIN_INK/MIN_LAST, kein
 * Satzanfang am Zeilenende); hängt dort ein Artikel oder eine Präposition
 * am Zeilenende, die schmalste ohne, wenn sie höchstens CLING_COST breiter
 * ist. Gibt es keine
 * ausgewogene, die schmalste überhaupt (ein langes Wort trägt die Breite,
 * „STEUERBERATUNGSGESELLSCHAFT / AM MARKT"). Mehr als neun Wörter: kein
 * Staffelsatz, Fließsatz in Stufe h2.
 */
export function staggerLines(text: string, track = 0): Display {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: [], indent: -1, widthEm: 1 };
  if (words.length > MAX_LINES * MAX_WORDS_PER_LINE)
    return { lines: [], indent: -1, widthEm: 1 };
  const all: Candidate[] = [];
  const search = (rest: string[], lines: string[]) => {
    if (rest.length === 0) {
      all.push(candidate(lines, track));
      return;
    }
    if (lines.length === MAX_LINES) return;
    for (let n = 1; n <= Math.min(MAX_WORDS_PER_LINE, rest.length); n++)
      search(rest.slice(n), [...lines, rest.slice(0, n).join(" ")]);
  };
  search(words, []);
  if (all.length === 0) return { lines: [], indent: -1, widthEm: 1 };
  // Eine Zeile ist immer „ausgewogen" — zählt als Staffel nur bei einem Wort.
  const staffel = all.filter(c => c.lines.length > 1 || words.length === 1);
  const even = staffel.filter(c => c.even);
  const evenBest = even.length > 0 ? narrowest(even) : narrowest(all);
  const clean = even.filter(c => c.ok);
  const cleanBest = clean.length > 0 ? narrowest(clean) : undefined;
  const best =
    cleanBest && cleanBest.width <= evenBest.width * (1 + CLING_COST)
      ? cleanBest
      : evenBest;
  return {
    lines: best.lines,
    indent: best.lines.length > 1 ? 1 : -1,
    widthEm: Math.max(best.width, 1) * FIT_SAFETY,
  };
}

/**
 * Breite des längsten Worts in em (mit Aufschlag) — für Sätze, die der
 * Browser umbricht (Kapitel, Seitentitel, Fließsatz der großen Zeile): Das
 * CSS deckelt die Stufe bei `100cqi / --pk-word`, so passt jedes Wort in
 * die Zeile und nichts bricht im Wort. Marker (**fett** …) zählen nicht.
 */
export function wordFitEm(
  text: string,
  stretch: Stretch = 92,
  track = 0
): number {
  const words = stripMarks(text).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  return (
    Math.max(...words.map(w => lineEm(w, stretch, track)), 1) * FIT_SAFETY
  );
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
