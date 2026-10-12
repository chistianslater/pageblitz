import { describe, expect, test } from "vitest";
import { versalEszett } from "./versal";

describe("versalEszett: ß als ẞ für Versal-Display", () => {
  test("ersetzt jedes ß durch ẞ, sonst nichts", () => {
    expect(versalEszett("Hafenstraße")).toBe("Hafenstraẞe");
    expect(versalEszett("Großer Grüß-Spaß")).toBe("Groẞer Grüẞ-Spaẞ");
    expect(versalEszett("Döner & Dürüm")).toBe("Döner & Dürüm");
  });
  test("nach CSS-uppercase bleibt ẞ erhalten (nie „SS“)", () => {
    const shown = versalEszett("Straße").toUpperCase();
    expect(shown).toBe("STRAẞE");
    expect(shown).not.toContain("SS");
  });
  test("idempotent, leer bleibt leer, ẞ unverändert", () => {
    expect(versalEszett(versalEszett("Fuß"))).toBe("Fuẞ");
    expect(versalEszett("")).toBe("");
    expect(versalEszett("GROẞ")).toBe("GROẞ");
  });
});
