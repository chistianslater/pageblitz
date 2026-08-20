import { describe, expect, test } from "vitest";
import { FALLBACK_PACK, getConstitution, getPackPool, STYLE_PACKS } from "./index";

describe("stylePacks registry", () => {
  test("werkbank ist registriert und vollständig", () => {
    const c = getConstitution("werkbank");
    expect(c.palette.length).toBeGreaterThanOrEqual(4);
    expect(c.palette.some((p) => p.role === "canvas")).toBe(true);
    expect(c.palette.some((p) => p.role === "accent")).toBe(true);
    expect(c.signature.decor.length).toBeGreaterThanOrEqual(2);
  });
  test("unbekannte Branche fällt auf FALLBACK_PACK zurück", () => {
    expect(getPackPool("unbekannte-branche")).toEqual([FALLBACK_PACK]);
  });
  test("Schreinerei landet bei werkbank", () => {
    expect(getPackPool("schreinerei")[0]).toBe("werkbank");
  });
  test("jede registrierte Verfassung hat konsistente id", () => {
    for (const [id, c] of Object.entries(STYLE_PACKS)) expect(c!.id).toBe(id);
  });
});
