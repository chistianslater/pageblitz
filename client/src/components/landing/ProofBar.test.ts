import { describe, expect, test } from "vitest";
import { counterValue, easeOutCubic } from "./ProofBar";

describe("ProofBar Counter (Conversion-Pass 2026-08-25)", () => {
  test("easeOutCubic startet bei 0 und endet exakt bei 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    // Monoton steigend, früher schneller Fortschritt (ease-out-Charakter)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  test("counterValue klemmt den Fortschritt und rundet", () => {
    expect(counterValue(14, 0)).toBe(0);
    expect(counterValue(14, 1)).toBe(14);
    expect(counterValue(14, 1.5)).toBe(14); // Überlauf geklemmt
    expect(counterValue(14, -0.2)).toBe(0); // Unterlauf geklemmt
    expect(counterValue(3, 0.5)).toBeGreaterThanOrEqual(2);
  });
});
