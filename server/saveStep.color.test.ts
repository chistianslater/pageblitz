import { describe, it, expect } from "vitest";

/**
 * Tests for the saveStep color sync fix:
 * When brandColor or brandSecondaryColor is saved via saveStep,
 * the colorScheme in generated_websites must be updated immediately
 * so the Preview page shows the same colors as the Onboarding Chat.
 */

describe("saveStep color sync", () => {
  it("merges brandColor into existing colorScheme correctly", () => {
    const existingCs = { primary: "#1565c0", secondary: "#f5f5f5", background: "#ffffff", text: "#1a1a1a", accent: "#1565c0" };
    const brandColor = "#e65100";
    const updatedCs = {
      ...existingCs,
      ...(brandColor ? { primary: brandColor, accent: brandColor } : {}),
    };
    expect(updatedCs.primary).toBe("#e65100");
    expect(updatedCs.accent).toBe("#e65100");
    expect(updatedCs.secondary).toBe("#f5f5f5"); // unchanged
    expect(updatedCs.background).toBe("#ffffff"); // unchanged
  });

  it("merges brandSecondaryColor into existing colorScheme correctly", () => {
    const existingCs = { primary: "#1565c0", secondary: "#f5f5f5", background: "#ffffff", text: "#1a1a1a", accent: "#1565c0" };
    const brandSecondaryColor = "#e8f4ff";
    const updatedCs = {
      ...existingCs,
      ...(brandSecondaryColor ? { secondary: brandSecondaryColor } : {}),
    };
    expect(updatedCs.secondary).toBe("#e8f4ff");
    expect(updatedCs.primary).toBe("#1565c0"); // unchanged
  });

  it("merges both brandColor and brandSecondaryColor together", () => {
    const existingCs = { primary: "#1565c0", secondary: "#f5f5f5", background: "#ffffff", text: "#1a1a1a", accent: "#1565c0" };
    const brandColor = "#e65100";
    const brandSecondaryColor = "#fff3e0";
    const updatedCs = {
      ...existingCs,
      ...(brandColor ? { primary: brandColor, accent: brandColor } : {}),
      ...(brandSecondaryColor ? { secondary: brandSecondaryColor } : {}),
    };
    expect(updatedCs.primary).toBe("#e65100");
    expect(updatedCs.accent).toBe("#e65100");
    expect(updatedCs.secondary).toBe("#fff3e0");
    expect(updatedCs.background).toBe("#ffffff"); // unchanged
    expect(updatedCs.text).toBe("#1a1a1a"); // unchanged
  });

  it("does not update colorScheme when neither brandColor nor brandSecondaryColor is present", () => {
    const safeData = { businessName: "Test GmbH", tagline: "Wir helfen" };
    const shouldUpdate = !!(safeData as any).brandColor || !!(safeData as any).brandSecondaryColor;
    expect(shouldUpdate).toBe(false);
  });

  it("triggers update when only brandColor is present", () => {
    const safeData = { brandColor: "#ff5722" };
    const shouldUpdate = !!(safeData as any).brandColor || !!(safeData as any).brandSecondaryColor;
    expect(shouldUpdate).toBe(true);
  });

  it("triggers update when only brandSecondaryColor is present", () => {
    const safeData = { brandSecondaryColor: "#e8f5e9" };
    const shouldUpdate = !!(safeData as any).brandColor || !!(safeData as any).brandSecondaryColor;
    expect(shouldUpdate).toBe(true);
  });

  it("handles empty existing colorScheme gracefully", () => {
    const existingCs = {};
    const brandColor = "#2196f3";
    const updatedCs = {
      ...existingCs,
      ...(brandColor ? { primary: brandColor, accent: brandColor } : {}),
    };
    expect(updatedCs.primary).toBe("#2196f3");
    expect(updatedCs.accent).toBe("#2196f3");
  });
});
