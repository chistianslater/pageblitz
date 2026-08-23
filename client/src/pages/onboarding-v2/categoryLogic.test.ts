import { describe, expect, test } from "vitest";
import {
  ALL_CATEGORIES,
  MAX_CATEGORY_SUGGESTIONS,
  filterCategorySuggestions,
} from "./categoryLogic";

describe("categoryLogic", () => {
  test("ALL_CATEGORIES ist flach, nicht leer und dedupliziert", () => {
    expect(ALL_CATEGORIES.length).toBeGreaterThan(100);
    expect(new Set(ALL_CATEGORIES).size).toBe(ALL_CATEGORIES.length);
  });

  test("leere/whitespace Eingabe → keine Vorschläge", () => {
    expect(filterCategorySuggestions("")).toEqual([]);
    expect(filterCategorySuggestions("   ")).toEqual([]);
  });

  test("filtert case-insensitiv, Präfix-Treffer vor Teilstring-Treffern", () => {
    const result = filterCategorySuggestions("werbe");
    expect(result).toContain("Werbeagentur");
    // Präfix-Treffer stehen vor reinen Teilstring-Treffern.
    const prefixCount = result.filter(c =>
      c.toLowerCase().startsWith("werbe")
    ).length;
    expect(
      result
        .slice(0, prefixCount)
        .every(c => c.toLowerCase().startsWith("werbe"))
    ).toBe(true);
  });

  test("Teilstring-Treffer werden gefunden (»salon« → Friseursalon)", () => {
    expect(filterCategorySuggestions("salon")).toContain("Friseursalon");
  });

  test("kappt bei MAX_CATEGORY_SUGGESTIONS", () => {
    // "e" trifft praktisch jede Branche.
    expect(filterCategorySuggestions("e").length).toBe(
      MAX_CATEGORY_SUGGESTIONS
    );
    expect(filterCategorySuggestions("e", 3).length).toBe(3);
  });

  test("kein Treffer → leere Liste (Freitext bleibt dem Nutzer)", () => {
    expect(filterCategorySuggestions("xyzquux")).toEqual([]);
  });
});
