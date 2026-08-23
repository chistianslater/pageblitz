import { describe, expect, test } from "vitest";
import { getPackAccent } from "./packAccent";
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
