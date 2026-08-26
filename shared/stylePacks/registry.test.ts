import { describe, expect, test } from "vitest";
import {
  FALLBACK_PACK,
  getConstitution,
  getPackPool,
  STYLE_PACKS,
} from "./index";

describe("stylePacks registry", () => {
  test("werkbank ist registriert und vollständig", () => {
    const c = getConstitution("werkbank");
    expect(c.palette.length).toBeGreaterThanOrEqual(4);
    expect(c.palette.some(p => p.role === "canvas")).toBe(true);
    expect(c.palette.some(p => p.role === "accent")).toBe(true);
    expect(c.signature.decor.length).toBeGreaterThanOrEqual(2);
  });
  test("unbekannte Branche fällt auf FALLBACK_PACK zurück", () => {
    expect(getPackPool("unbekannte-branche")[0]).toBe(FALLBACK_PACK);
    expect(getPackPool("unbekannte-branche")).toHaveLength(3);
  });
  test("FALLBACK_PACK ist klarwerk (Spec §3.1)", () => {
    expect(FALLBACK_PACK).toBe("klarwerk");
    expect(getPackPool("unbekannte-branche")[0]).toBe("klarwerk");
  });
  test("Schreinerei landet bei werkbank", () => {
    expect(getPackPool("schreinerei")[0]).toBe("werkbank");
    expect(getPackPool("schreinerei")).toEqual([
      "werkbank",
      "fundament",
      "zunft",
    ]);
  });
  test("jede registrierte Verfassung hat konsistente id", () => {
    for (const [id, c] of Object.entries(STYLE_PACKS)) expect(c!.id).toBe(id);
  });

  describe("getPackPool — Transliteration und Wortgrenzen-Matching", () => {
    test("Logopädie (Umlaut) matched morgenlicht via logopaedie", () => {
      expect(getPackPool("Logopädie")).toContain("morgenlicht");
    });
    test("Wirtschaftsprüfer (Umlaut) matched kanzlei via wirtschaftspruefer", () => {
      expect(getPackPool("Wirtschaftsprüfer")).toContain("kanzlei");
    });
    test("Barbershop matched NICHT gusto (kein reiner Substring-Treffer von 'bar')", () => {
      expect(getPackPool("Barbershop")).not.toContain("gusto");
    });
    test("Sanitärinstallateur matched werkbank via sanitaer-Präfix (Länge ≥ 4)", () => {
      expect(getPackPool("Sanitärinstallateur")).toContain("werkbank");
    });
  });
});
