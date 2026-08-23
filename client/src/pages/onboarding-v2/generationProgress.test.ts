import { describe, expect, test } from "vitest";
import {
  PHASES,
  PHASE_BOUNDS,
  PHASE_EXPECTED_MS,
  approach,
  phaseIndexFor,
  progressAt,
} from "./generationProgress";

describe("phaseIndexFor", () => {
  test("ordnet Server-Fortschritt der richtigen Phase zu (Stufen aus runJob.ts)", () => {
    expect(phaseIndexFor(0)).toBe(0);
    expect(phaseIndexFor(10)).toBe(0);
    expect(phaseIndexFor(30)).toBe(1);
    expect(phaseIndexFor(55)).toBe(2);
    expect(phaseIndexFor(89)).toBe(2);
    expect(phaseIndexFor(90)).toBe(3);
    expect(phaseIndexFor(100)).toBe(3);
  });
  test("Phasen-Konstanten sind konsistent (ein Erwartungswert je Phase)", () => {
    expect(PHASES).toHaveLength(PHASE_BOUNDS.length - 1);
    expect(PHASE_EXPECTED_MS).toHaveLength(PHASES.length);
  });
});

describe("progressAt", () => {
  const from = 55;
  const to = 90;
  const expected = 35_000;

  test("startet bei fromPct (t = 0)", () => {
    expect(progressAt(1000, 1000, from, to, expected)).toBeCloseTo(from, 5);
  });

  test("steigt streng monoton — der Balken steht nie", () => {
    let prev = -1;
    for (let t = 0; t <= 120_000; t += 500) {
      const v = progressAt(t, 0, from, to, expected);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
  });

  test("nähert sich asymptotisch toPct − 1, überschreitet es nie", () => {
    // Selbst nach 10× der erwarteten Dauer bleibt der Wert unter toPct − 1.
    expect(progressAt(expected * 10, 0, from, to, expected)).toBeLessThan(
      to - 1
    );
    // …liegt aber nach der erwarteten Dauer schon deutlich im Zielbereich.
    expect(progressAt(expected, 0, from, to, expected)).toBeGreaterThan(
      from + (to - 1 - from) * 0.8
    );
  });

  test("degenerierte Spanne (toPct − 1 <= fromPct) bleibt bei fromPct", () => {
    expect(progressAt(5000, 0, 89, 90, 1000)).toBe(89);
  });
});

describe("approach", () => {
  test("nähert sich dem Ziel, ohne es in einem Schritt zu überspringen", () => {
    const next = approach(30, 60, 100);
    expect(next).toBeGreaterThan(30);
    expect(next).toBeLessThan(60);
  });

  test("läuft nie rückwärts — Ziel unterhalb des Ist-Werts ändert nichts", () => {
    expect(approach(70, 55, 100)).toBe(70);
  });

  test("konvergiert über viele Schritte gegen das Ziel (weicher Phasensprung)", () => {
    let shown = 54;
    for (let i = 0; i < 100; i++) shown = approach(shown, 60, 16);
    expect(shown).toBeGreaterThan(59.5);
    expect(shown).toBeLessThanOrEqual(60);
  });
});
