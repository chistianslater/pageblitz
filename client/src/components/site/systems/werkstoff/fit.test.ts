import { describe, expect, test } from "vitest";
import {
  FIT_SAFETY,
  FOOT_ONE_LINE_MAX,
  fitFootWord,
  fitName,
  lineEm,
  splitLines,
} from "./fit";

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

describe("Werkstoff: Fuß-Wortmarke (nie abgeschnitten)", () => {
  test("kurze und mittlere Namen bleiben eine Zeile", () => {
    expect(fitFootWord("Brandt").lines).toEqual(["Brandt"]);
    expect(fitFootWord("Demo-Werkstatt").lines).toEqual(["Demo-Werkstatt"]);
    expect(lineEm("Demo-Werkstatt")).toBeLessThan(FOOT_ONE_LINE_MAX);
  });

  test("lange Namen: zwei Zeilen an Leerzeichen oder nach Bindestrich", () => {
    expect(fitFootWord("Pageblitz Demo-Werkstatt").lines).toEqual([
      "Pageblitz",
      "Demo-Werkstatt",
    ]);
    expect(fitFootWord("Brockmann-Westerhoffmeyer").lines).toEqual([
      "Brockmann-",
      "Westerhoffmeyer",
    ]);
    const long = fitFootWord("Tischlerei und Innenausbau Westerhoff");
    expect(long.lines).toHaveLength(2);
    expect(long.widthEm).toBeLessThan(
      lineEm("Tischlerei und Innenausbau Westerhoff") * FIT_SAFETY
    );
  });

  test("ein Wort ohne Trennstelle bleibt eine Zeile (CSS bricht notfalls)", () => {
    expect(fitFootWord("Donaudampfschifffahrtsgesellschaft").lines).toHaveLength(1);
  });
});
