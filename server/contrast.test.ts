/**
 * Tests for color contrast utility (shared/colorContrast.ts)
 * Verifies WCAG-compliant contrast checking for headings and logo text.
 */
import { describe, it, expect } from "vitest";
import {
  getLuminance,
  isLightColor,
  getContrastColor,
  getSafeHeadingColor,
} from "../shared/colorContrast";

// Helper: compute contrast ratio from two hex colors
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("getLuminance", () => {
  it("returns 0 for pure black", () => {
    expect(getLuminance("#000000")).toBeCloseTo(0, 3);
  });

  it("returns ~1 for pure white", () => {
    expect(getLuminance("#ffffff")).toBeCloseTo(1, 1);
  });

  it("returns ~0.2126 for pure red", () => {
    expect(getLuminance("#ff0000")).toBeCloseTo(0.2126, 2);
  });

  it("handles 3-char hex", () => {
    expect(getLuminance("#fff")).toBeCloseTo(1, 1);
    expect(getLuminance("#000")).toBeCloseTo(0, 3);
  });
});

describe("getContrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("returns 1 for same color", () => {
    expect(getContrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 1);
  });

  it("returns ratio >= 1 always", () => {
    expect(getContrastRatio("#e85d04", "#fffaf5")).toBeGreaterThanOrEqual(1);
  });
});

describe("isLightColor", () => {
  it("identifies white as light", () => {
    expect(isLightColor("#ffffff")).toBe(true);
  });

  it("identifies black as dark", () => {
    expect(isLightColor("#000000")).toBe(false);
  });

  it("identifies cream/beige as light", () => {
    expect(isLightColor("#fefcf8")).toBe(true);
    expect(isLightColor("#f5f0e8")).toBe(true);
  });

  it("identifies dark navy as dark", () => {
    expect(isLightColor("#0a0a0a")).toBe(false);
    expect(isLightColor("#1a1a2e")).toBe(false);
  });

  it("identifies medium orange as dark (below 0.5 luminance threshold)", () => {
    // Orange #e85d04 has luminance ~0.16 → dark
    expect(isLightColor("#e85d04")).toBe(false);
  });
});

describe("getContrastColor", () => {
  it("returns dark text for light background", () => {
    const color = getContrastColor("#ffffff");
    expect(color).toBe("#000000");
  });

  it("returns light text for dark background", () => {
    const color = getContrastColor("#000000");
    expect(color).toBe("#ffffff");
  });

  it("returns light text for dark primary (orange)", () => {
    const color = getContrastColor("#e85d04");
    expect(color).toBe("#ffffff");
  });

  it("returns dark text for very light primary (cream)", () => {
    const color = getContrastColor("#fefcf8");
    expect(color).toBe("#000000");
  });
});

describe("getSafeHeadingColor", () => {
  it("keeps primary color if contrast is sufficient on dark bg", () => {
    // Orange on dark background has good contrast
    const result = getSafeHeadingColor("#0a0a0a", "#e85d04");
    expect(result).toBe("#e85d04");
  });

  it("falls back to dark text when primary is too light on light bg", () => {
    // Light cream primary on light cream background → insufficient contrast
    const result = getSafeHeadingColor("#fefcf8", "#f5f0e8");
    // Should fall back to a dark color since both are very light
    expect(isLightColor(result)).toBe(false);
  });

  it("keeps orange primary on white background (sufficient contrast)", () => {
    // Orange #e85d04 on white: contrast ratio ~4.5:1 → sufficient
    const result = getSafeHeadingColor("#ffffff", "#e85d04");
    expect(result).toBe("#e85d04");
  });

  it("falls back when primary is nearly same as background", () => {
    // Very light yellow on white → insufficient
    const result = getSafeHeadingColor("#ffffff", "#fffde7");
    expect(isLightColor(result)).toBe(false);
  });

  it("handles the Francisco's Tapas case: warm primary on cream bg", () => {
    // Primary: warm orange-brown on cream background
    const primary = "#c45c26"; // warm orange
    const bg = "#fffaf5"; // cream
    const result = getSafeHeadingColor(bg, primary);
    // Orange on cream should have sufficient contrast
    const ratio = getContrastRatio(bg, result);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });
});

describe("Real-world layout scenarios", () => {
  it("ElegantLayout: gold primary on cream background is readable", () => {
    const primary = "#b8860b"; // dark gold
    const bg = "#fefcf8"; // cream
    const ratio = getContrastRatio(bg, primary);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("WarmLayout: warm orange on cream background is readable", () => {
    const primary = "#c45c26";
    const bg = "#fffaf5";
    const ratio = getContrastRatio(bg, primary);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("DynamicLayout: green on dark background is readable", () => {
    const primary = "#22c55e";
    const bg = "#0a0a0a";
    const ratio = getContrastRatio(bg, primary);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("CTA section: white text on orange background is readable", () => {
    const primary = "#e85d04";
    const textColor = "#ffffff";
    const ratio = getContrastRatio(primary, textColor);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("CTA section: dark text on light yellow primary is readable", () => {
    const primary = "#f5e642"; // very light yellow
    const textColor = "#1a1a1a"; // dark fallback
    const ratio = getContrastRatio(primary, textColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
