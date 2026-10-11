import { GEIST_ADVANCE } from "../../../../../../shared/designSystems/rasterMetrics";
import { isTradeWord } from "../../../../../../shared/designSystems/tradeWords";
import { RASTER } from "../../../../../../shared/designSystems/raster";

/**
 * Wortmarken-Fit (Systemblatt, Endwerte Punkt 4): Der Einstiegsname füllt
 * die Spalte. Größe = min(26 rem, Spalte ÷ Breite des längsten Worts),
 * Untergrenze `display`. Gemessen wird mit der eingecheckten Advance-Tabelle
 * von Geist (Versal, Laufweite −0,05 em) — serverseitig, ohne JS im Browser.
 * Passt das längste Wort nicht über die Untergrenze, wandert das Gewerk in
 * den Kicker („Kfz-Meisterbetrieb Yilmaz" → YILMAZ).
 */

/** Laufweite der Stufe `display` in em (−0,05 em). */
const TRACK = parseFloat(RASTER.type.display.track);
/** Untergrenze: kleinster Wert der Stufe `display` (3,75 rem). */
export const FIT_FLOOR_REM = parseFloat(
  RASTER.type.display.size.match(/clamp\(\s*([\d.]+)rem/)![1]
);
/** Obergrenze laut Systemblatt. */
export const FIT_MAX_REM = 26;
/** Schmalste unterstützte Breite: 320 px = 20 rem. */
const REFERENCE_VIEWPORT_REM = 20;

/**
 * Wert eines `clamp(min, a rem + b vw, max)`-Tokens bei gegebener Breite
 * (rem). 1vw = Breite/100.
 */
export function clampAt(token: string, viewportRem: number): number {
  const m = token.match(
    /^clamp\(\s*([\d.]+)rem\s*,\s*(-?[\d.]+)rem\s*\+\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)$/
  );
  if (!m) throw new Error(`Raster: kein clamp-Token: ${token}`);
  const [min, a, b, max] = m.slice(1).map(Number);
  return Math.min(max, Math.max(min, a + (b * viewportRem) / 100));
}

/**
 * Spalte, an der die Entscheidung fällt (Gewerk in den Kicker, Untergrenze):
 * 320 px Breite minus zweimal Rand `gutter` (dort 1,125 rem) = 17,75 rem.
 * Breitere Bildschirme haben breitere Spalten — was hier passt, passt überall.
 */
export const REFERENCE_COLUMN_REM =
  REFERENCE_VIEWPORT_REM -
  2 * clampAt(RASTER.space.gutter, REFERENCE_VIEWPORT_REM);
/**
 * Breite Spalte (Desktop 1440 px: 90 rem minus Ränder ≈ 80 rem). Daraus die
 * Zeilenzahl, die das CSS als Höhenbremse nutzt (`--rs-lines`): ein Name
 * über drei Zeilen darf den ersten Bildschirm nicht allein füllen.
 */
export const WIDE_COLUMN_REM = 80;
/** Kleinste Größe, wenn nichts mehr wandern kann: Stufe h2 (1,75 rem). */
export const FIT_HARD_FLOOR_REM = parseFloat(
  RASTER.type.h2.size.match(/clamp\(\s*([\d.]+)rem/)![1]
);
/** Unbekannte Zeichen rechnen breit (wie „W"), lieber Luft als Überlauf. */
const UNKNOWN = 0.95;
/** Tabelle ohne Kerning ist leicht breiter als der Satz; kleine Reserve. */
const SAFETY = 1.02;

const upper = (text: string) => text.toLocaleUpperCase("de-DE");

/** Breite eines Textes in Versal in em (inkl. Laufweite, Standard `display`). */
export function wordWidthEm(text: string, track = TRACK): number {
  const chars = [...upper(text)];
  const advance = chars.reduce((n, c) => n + (GEIST_ADVANCE[c] ?? UNKNOWN), 0);
  return (advance + chars.length * track) * SAFETY;
}

/** Umbruchstellen: Leerraum und nach einem Bindestrich („Müller-|Lüdenscheidt"). */
function breakUnits(name: string): string[] {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(word => word.split(/(?<=[-–])(?=\p{L})/u));
}

function longestEm(name: string): number {
  return Math.max(0, ...breakUnits(name).map(u => wordWidthEm(u)));
}

/** Gieriger Zeilenfall bei gegebener Größe (Leerzeichen messen mit). */
function wrap(name: string, sizeRem: number, columnRem: number): string[] {
  const lines: string[] = [];
  for (const word of name.split(/\s+/).filter(Boolean)) {
    const units = word.split(/(?<=[-–])(?=\p{L})/u);
    units.forEach((unit, i) => {
      const last = lines[lines.length - 1];
      const joiner = i === 0 ? " " : "";
      const candidate = last === undefined ? unit : last + joiner + unit;
      if (last !== undefined && wordWidthEm(candidate) * sizeRem <= columnRem)
        lines[lines.length - 1] = candidate;
      else lines.push(unit);
    });
  }
  return lines.map(upper);
}

export type WordmarkFit = {
  /** Text der Wortmarke (ohne gewandertes Gewerk), Originalschreibung. */
  wordmark: string;
  /** Gewerk, das in den Kicker wandert. */
  kickerWord?: string;
  /** Größe in rem bei der gegebenen Spalte. */
  size: number;
  /** Zeilen in Versal. */
  lines: string[];
  /** Breite des längsten Worts in em — trägt das CSS (`--rs-fit`). */
  widthEm: number;
  /** Untergrenze `display` unterschritten (kein Gewerk zum Wandern). */
  belowFloor: boolean;
};

function sizeFor(widthEm: number, columnRem: number): number {
  return widthEm > 0 ? Math.min(FIT_MAX_REM, columnRem / widthEm) : FIT_MAX_REM;
}

/**
 * Reine Funktion: `name` bitte schon ohne Rechtsform (displayName). Die
 * Wanderung des Gewerks entscheidet die Referenzspalte (Handy), damit das
 * Markup auf allen Breiten gleich ist; `columnRem` bestimmt Größe und Zeilen.
 */
export function fitWordmark(name: string, columnRem: number): WordmarkFit {
  const clean = name.trim().replace(/\s+/g, " ");
  const fitsAtFloor = (text: string) =>
    sizeFor(longestEm(text), REFERENCE_COLUMN_REM) >= FIT_FLOOR_REM;

  let wordmark = clean;
  let kickerWord: string | undefined;
  if (clean && !fitsAtFloor(clean)) {
    const words = clean.split(" ");
    const rest = words.filter(w => !isTradeWord(w));
    const restText = rest.join(" ").replace(/^[&+,\s]+|[&+,\s]+$/g, "");
    if (rest.length < words.length && /\p{L}/u.test(restText)) {
      wordmark = restText;
      kickerWord = words.filter(isTradeWord).join(" ");
    }
  }

  const widthEm = longestEm(wordmark);
  const belowFloor = Boolean(wordmark) && !fitsAtFloor(wordmark);
  const fitted = sizeFor(widthEm, columnRem);
  const size = belowFloor
    ? Math.max(FIT_HARD_FLOOR_REM, fitted)
    : Math.max(FIT_FLOOR_REM, fitted);
  return {
    wordmark,
    ...(kickerWord ? { kickerWord } : {}),
    size,
    lines: wordmark ? wrap(wordmark, size, columnRem) : [],
    widthEm,
    belowFloor,
  };
}
