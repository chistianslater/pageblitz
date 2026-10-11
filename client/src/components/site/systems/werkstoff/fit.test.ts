import { describe, expect, test } from "vitest";
import { FIT_SAFETY, fitName, lineEm, splitLines } from "./fit";

describe("Werkstoff: Name füllt die Breite", () => {
  test("zwei Zeilen, längste Zeile so kurz wie möglich", () => {
    expect(splitLines("Laden am Markt")).toEqual(["Laden", "am Markt"]);
    expect(splitLines("Holtkamp")).toEqual(["Holtkamp"]);
    expect(splitLines("Schreinerei Holtkamp")).toEqual(["Schreinerei", "Holtkamp"]);
  });

  test("Breite wächst mit Zeichen, Großbuchstaben breiter", () => {
    expect(lineEm("MM")).toBeGreaterThan(lineEm("mm"));
    expect(lineEm("Holtkamp")).toBeGreaterThan(lineEm("Holt"));
    expect(fitName("Laden am Markt").widthEm).toBeCloseTo(lineEm("am Markt") * FIT_SAFETY);
  });

  test("Schätzung nah an der gemessenen Zilla-Breite (Browser, −0,012 em)", () => {
    // Gemessen mit Playwright/Chromium, Zilla Slab 700, 100 px.
    const measured: [string, number][] = [
      ["am Markt", 4.256], ["Holtkamp", 4.358], ["Overbeck", 4.109],
      ["Schreinerei", 4.999], ["Brandt", 3.058], ["Bäckerei Steinofen", 8.09],
    ];
    for (const [text, em] of measured) {
      const est = lineEm(text, -0.012) * FIT_SAFETY;
      expect(est, text).toBeGreaterThanOrEqual(em);
      expect(est, text).toBeLessThan(em * 1.12);
    }
  });
});
