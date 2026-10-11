import { describe, expect, test } from "vitest";
import { fitName, lineEm, splitLines } from "./fit";

describe("Werkstoff: Name füllt die Breite", () => {
  test("zwei Zeilen, längste Zeile so kurz wie möglich", () => {
    expect(splitLines("Laden am Markt")).toEqual(["Laden", "am Markt"]);
    expect(splitLines("Holtkamp")).toEqual(["Holtkamp"]);
    expect(splitLines("Schreinerei Holtkamp")).toEqual(["Schreinerei", "Holtkamp"]);
  });

  test("Breite wächst mit Zeichen, Großbuchstaben breiter", () => {
    expect(lineEm("MM")).toBeGreaterThan(lineEm("mm"));
    expect(lineEm("Holtkamp")).toBeGreaterThan(lineEm("Holt"));
    expect(fitName("Laden am Markt").widthEm).toBeCloseTo(lineEm("am Markt"));
  });
});
