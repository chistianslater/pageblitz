/**
 * Schriftgröße „Name füllt die Breite" ohne JS (Systemblatt: Typo-Einstieg,
 * Wortmarke im Fuß). Zilla Slab 700 hat keine Messtabelle im Repo; die
 * Breite wird aus Zeichenklassen geschätzt (eher zu breit als zu schmal,
 * damit nichts überläuft). Das CSS teilt die Spaltenbreite (`cqi`) durch
 * die geschätzte Breite der längsten Zeile in em.
 */

const NARROW = /[iljtfr.,:;'’!|ı\-]/;
const WIDE_LOWER = /[mw]/;
const WIDE_UPPER = /[MWÆŒ]/;

/** Geschätzte Laufweite eines Zeichens in em (Zilla Slab 700). */
function charEm(ch: string): number {
  if (ch === " ") return 0.26;
  if (NARROW.test(ch)) return 0.34;
  if (WIDE_LOWER.test(ch)) return 0.84;
  if (WIDE_UPPER.test(ch)) return 0.94;
  if (/\d/.test(ch)) return 0.58;
  if (ch !== ch.toLocaleLowerCase("de")) return 0.68;
  return 0.54;
}

/** Breite einer Zeile in em (inkl. Laufweite der Stufe, z. B. −0,012 em). */
export function lineEm(text: string, track = 0): number {
  return [...text].reduce((sum, ch) => sum + charEm(ch) + track, 0);
}

/**
 * Bestmögliche Aufteilung in höchstens `maxLines` Zeilen (nur an
 * Leerzeichen): die längste Zeile so kurz wie möglich. Ein Wort bleibt
 * eine Zeile.
 */
export function splitLines(name: string, maxLines = 2, track = 0): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  let best: string[] = [words.join(" ")];
  let bestWidth = lineEm(best[0], track);
  const search = (rest: string[], lines: string[]) => {
    if (lines.length === maxLines - 1 || rest.length === 1) {
      const all = [...lines, rest.join(" ")];
      const width = Math.max(...all.map(l => lineEm(l, track)));
      if (width < bestWidth - 1e-6) {
        best = all;
        bestWidth = width;
      }
      return;
    }
    for (let i = 1; i < rest.length; i++)
      search(rest.slice(i), [...lines, rest.slice(0, i).join(" ")]);
    // Auch weniger Zeilen zulassen.
    const all = [...lines, rest.join(" ")];
    const width = Math.max(...all.map(l => lineEm(l, track)));
    if (width < bestWidth - 1e-6) {
      best = all;
      bestWidth = width;
    }
  };
  search(words, []);
  return best;
}

/**
 * Sicherheitsaufschlag: Die Schätzung liegt gegen die echte Zilla-Breite
 * (gemessen im Browser) bis 2 % zu niedrig — sonst bricht „am Markt" um.
 */
export const FIT_SAFETY = 1.06;

/** Zeilen und Breite der längsten Zeile (em, mit Aufschlag) für `--ws-fit`. */
export function fitName(
  name: string,
  maxLines = 2,
  track = 0
): { lines: string[]; widthEm: number } {
  const lines = splitLines(name, maxLines, track);
  return {
    lines,
    widthEm: Math.max(...lines.map(l => lineEm(l, track)), 1) * FIT_SAFETY,
  };
}

/**
 * Ab dieser Breite (em, eine Zeile) bricht die Fuß-Wortmarke auf zwei
 * Zeilen um: bei 320 px Breite (≈ 280 px Spalte) bliebe die Zeile sonst
 * unter etwa 30 px Schriftgröße.
 */
export const FOOT_ONE_LINE_MAX = 9;

/**
 * Fuß-Wortmarke (Systemblatt: Name füllt die Breite): eine Zeile, lange
 * Namen auf zwei Zeilen — getrennt an Leerzeichen oder nach einem
 * Bindestrich („Demo-|Werkstatt"). Die längste Zeile bestimmt `--ws-fit`.
 */
export function fitFootWord(
  mark: string,
  track = 0
): { lines: string[]; widthEm: number } {
  const text = mark.trim();
  const one = lineEm(text, track);
  let lines = [text];
  if (one > FOOT_ONE_LINE_MAX) {
    let best = one;
    for (let i = 1; i < text.length; i++) {
      const prev = text[i - 1];
      if (prev !== " " && prev !== "-") continue;
      const a = text.slice(0, i).trim();
      const b = text.slice(i).trim();
      if (!a || !b) continue;
      const w = Math.max(lineEm(a, track), lineEm(b, track));
      if (w < best - 1e-6) {
        best = w;
        lines = [a, b];
      }
    }
  }
  return {
    lines,
    widthEm: Math.max(...lines.map(l => lineEm(l, track)), 1) * FIT_SAFETY,
  };
}
