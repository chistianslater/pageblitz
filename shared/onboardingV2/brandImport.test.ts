import { describe, expect, test } from "vitest";
import {
  matchFontPair,
  nearestAccentName,
  buildBrandSuggestion,
} from "./brandImport";

describe("Marken-Import: Zuordnung (2026-09-03)", () => {
  test("Schriftpaar wird über den Familiennamen gefunden", () => {
    expect(matchFontPair(["Space Grotesk", "Inter"])).toBe("modern");
    expect(matchFontPair(["Archivo Black"])).toBe("kraftvoll");
  });

  test("unbekannte Schriften werden grob nach Serif/Sans zugeordnet", () => {
    const serif = matchFontPair(["Bodoni Moda Serif"]);
    const sans = matchFontPair(["Foobar Grotesque"]);
    expect(serif).not.toBeNull();
    expect(sans).not.toBeNull();
    expect(serif).not.toBe(sans);
  });

  test("ohne Schriften kein Vorschlag", () => {
    expect(matchFontPair([])).toBeNull();
  });

  test("nächste kuratierte Farbe wird benannt", () => {
    expect(nearestAccentName("#a3402a")).toBe("Terrakotta");
    expect(nearestAccentName("#1d3fbf")).toBe("Royal");
  });

  test("Vorschlag bündelt Logo, Farbe samt Namen und Schriftpaar", () => {
    expect(
      buildBrandSuggestion({
        origin: "https://brandt.example",
        logoUrl: "https://brandt.example/logo.svg",
        accent: "#a3402a",
        fonts: ["Playfair Display", "Inter"],
      })
    ).toEqual({
      domain: "brandt.example",
      logoUrl: "https://brandt.example/logo.svg",
      accent: "#a3402a",
      accentName: "Terrakotta",
      fontPairId: "elegant",
      fonts: ["Playfair Display", "Inter"],
      hasAnything: true,
    });
  });

  test("nichts erkannt → hasAnything false", () => {
    const suggestion = buildBrandSuggestion({
      origin: "https://x.example",
      logoUrl: null,
      accent: null,
      fonts: [],
    });
    expect(suggestion.hasAnything).toBe(false);
    expect(suggestion.domain).toBe("x.example");
  });
});
