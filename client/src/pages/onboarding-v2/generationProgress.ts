/**
 * Reine Fortschritts-Helfer für den Generierungs-Screen (Zeitmaschine,
 * Plan B7 Task 4): Der Server meldet grobe Stufen (runJob.ts: 10 → 30 →
 * 55 → 90 → 100), der Balken soll aber NIE stehen. Zwischen zwei
 * Server-Stufen läuft er deshalb zeitbasiert asymptotisch gegen die
 * Obergrenze der aktuellen Phase (toPct − 1) — er erreicht sie nie, ein
 * Phasenwechsel schiebt ihn weich weiter (`approach`).
 *
 * Ausgelagert aus GenerationScreen.tsx, damit die Mathematik ohne
 * rAF-/React-Testharness unit-testbar bleibt.
 */

// Reihenfolge entspricht den Fortschrittsstufen des Jobs (runJob.ts):
// 0–24 Stil, 25–54 Bilder, 55–89 Texte (LLM, längster Schritt), 90+ Vorschau.
export const PHASES = [
  "Stil wird gewählt",
  "Bilder werden gesetzt",
  "Texte entstehen",
  "Vorschau wird gebaut",
] as const;
export const PHASE_BOUNDS = [0, 25, 55, 90, 101] as const;

/**
 * Erwartete Dauer je Phase in ms — steuert nur die Geschwindigkeit des
 * Easings (nach dieser Zeit ist ~95 % der Phasen-Spanne erreicht), keine
 * harte Grenze. Texte (LLM) ist real der mit Abstand längste Schritt.
 */
export const PHASE_EXPECTED_MS = [4000, 6000, 35_000, 8000] as const;

/** Index der Phase, in der ein Server-Fortschrittswert liegt. */
export function phaseIndexFor(progress: number): number {
  for (let i = PHASE_BOUNDS.length - 2; i >= 0; i--) {
    if (progress >= PHASE_BOUNDS[i]) return i;
  }
  return 0;
}

/**
 * Zeitbasierter Zielwert innerhalb einer Phase: startet bei `fromPct`
 * (Phasenbeginn) und nähert sich asymptotisch `toPct − 1` — exponentielles
 * Easing mit τ = expectedMs / 3, d. h. nach `expectedMs` sind ~95 % der
 * Spanne erreicht. Streng monoton steigend, erreicht die Obergrenze nie.
 */
export function progressAt(
  nowMs: number,
  phaseStartMs: number,
  fromPct: number,
  toPct: number,
  expectedMs: number
): number {
  const ceiling = toPct - 1;
  if (ceiling <= fromPct) return fromPct;
  const t = Math.max(0, nowMs - phaseStartMs);
  const tau = Math.max(1, expectedMs / 3);
  return fromPct + (ceiling - fromPct) * (1 - Math.exp(-t / tau));
}

/**
 * Weicher Übergang des angezeigten Werts zum Zielwert (Halbwertszeit-
 * Glättung): pro Aufruf wird der Abstand zeitproportional verkleinert —
 * so springt der Balken bei einem Phasenwechsel (Server-Stufe hüpft z. B.
 * von 54 auf 55+) nicht, sondern gleitet. Läuft nie rückwärts.
 */
export function approach(
  shownPct: number,
  targetPct: number,
  dtMs: number,
  halfLifeMs = 350
): number {
  if (targetPct <= shownPct) return shownPct;
  const alpha = 1 - Math.pow(0.5, dtMs / Math.max(1, halfLifeMs));
  return shownPct + (targetPct - shownPct) * alpha;
}
