import { describe, expect, test } from "vitest";
import { contrastRatio, getPackAccent, getPackAccentText } from "./packAccent";
import { getConstitution, FALLBACK_PACK } from "@shared/stylePacks";

describe("getPackAccent", () => {
  test("gültiges Pack liefert den Hex-Wert der Akzentfarbe aus der Verfassung", () => {
    const expected = getConstitution("werkbank").palette.find(
      c => c.role === "accent"
    )?.hex;
    expect(getPackAccent("werkbank")).toBe(expected);
  });

  test("unbekannte Pack-ID fällt auf die Akzentfarbe von FALLBACK_PACK zurück", () => {
    const expected = getConstitution(FALLBACK_PACK).palette.find(
      c => c.role === "accent"
    )?.hex;
    expect(getPackAccent("does-not-exist")).toBe(expected);
  });

  test("leer (null/undefined) fällt auf die Akzentfarbe von FALLBACK_PACK zurück", () => {
    const expected = getConstitution(FALLBACK_PACK).palette.find(
      c => c.role === "accent"
    )?.hex;
    expect(getPackAccent(undefined)).toBe(expected);
    expect(getPackAccent(null)).toBe(expected);
  });

  test("Ergebnis ist immer ein gültiger 6-stelliger Hex-Farbcode", () => {
    expect(getPackAccent("werkbank")).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getPackAccent("schimmer")).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getPackAccent("unknown-pack-id")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("getPackAccentText (Link-Text auf Weiß, Plan B6 Task 9/Fixwelle)", () => {
  test("nutzt accent-text, wenn die Verfassung die Rolle hat (werkbank)", () => {
    const expected = getConstitution("werkbank").palette.find(
      c => c.role === "accent-text"
    )?.hex;
    expect(expected).toBeDefined();
    expect(getPackAccentText("werkbank")).toBe(expected);
  });

  test("alle 14 Packs: Linkfarbe erreicht auf Weiß mindestens 4,5:1", () => {
    const ids = [
      "werkbank",
      "patina",
      "kanzlei",
      "salon-noir",
      "morgenlicht",
      "marktplatz",
      "gusto",
      "landgut",
      "atelier",
      "klarwerk",
      "verve",
      "zunft",
      "schimmer",
      "fundament",
    ];
    for (const id of ids) {
      expect(
        contrastRatio(getPackAccentText(id), "#FFFFFF"),
        `Pack ${id}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("contrastRatio: Schwarz/Weiß = 21, gleiche Farbe = 1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#abcdef", "#abcdef")).toBeCloseTo(1, 5);
  });
});
