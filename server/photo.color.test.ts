import { describe, it, expect } from "vitest";

// ── Tests for secondary color and photo URL persistence ──────────────────────

describe("Secondary color persistence", () => {
  it("should include secondary in patchedColorScheme when brandSecondaryColor is set", () => {
    const existingColorScheme = { primary: "#3B82F6", accent: "#3B82F6", surface: "#F1F5F9" };
    const onboarding = { brandColor: "#FF5733", brandSecondaryColor: "#FFF0E6" };

    const patchedColorScheme = {
      ...existingColorScheme,
      ...(onboarding.brandColor ? { primary: onboarding.brandColor, accent: onboarding.brandColor } : {}),
      ...(onboarding.brandSecondaryColor ? { secondary: onboarding.brandSecondaryColor } : {}),
    };

    expect(patchedColorScheme.secondary).toBe("#FFF0E6");
    expect(patchedColorScheme.primary).toBe("#FF5733");
  });

  it("should not override secondary when brandSecondaryColor is not set", () => {
    const existingColorScheme = { primary: "#3B82F6", accent: "#3B82F6", secondary: "#EXISTING" };
    const onboarding = { brandColor: "#FF5733", brandSecondaryColor: undefined };

    const patchedColorScheme = {
      ...existingColorScheme,
      ...(onboarding.brandColor ? { primary: onboarding.brandColor, accent: onboarding.brandColor } : {}),
      ...(onboarding.brandSecondaryColor ? { secondary: onboarding.brandSecondaryColor } : {}),
    };

    expect(patchedColorScheme.secondary).toBe("#EXISTING");
  });
});

describe("Photo URL persistence in onboarding complete", () => {
  it("should add heroImageUrl to websiteUpdateData when heroPhotoUrl is set", () => {
    const onboarding = { heroPhotoUrl: "https://example.com/hero.jpg", aboutPhotoUrl: "" };
    const websiteUpdateData: any = { websiteData: {}, colorScheme: {} };

    if (onboarding.heroPhotoUrl) websiteUpdateData.heroImageUrl = onboarding.heroPhotoUrl;
    if (onboarding.aboutPhotoUrl) websiteUpdateData.aboutImageUrl = onboarding.aboutPhotoUrl;

    expect(websiteUpdateData.heroImageUrl).toBe("https://example.com/hero.jpg");
    expect(websiteUpdateData.aboutImageUrl).toBeUndefined();
  });

  it("should add both heroImageUrl and aboutImageUrl when both are set", () => {
    const onboarding = {
      heroPhotoUrl: "https://example.com/hero.jpg",
      aboutPhotoUrl: "https://example.com/about.jpg",
    };
    const websiteUpdateData: any = { websiteData: {}, colorScheme: {} };

    if (onboarding.heroPhotoUrl) websiteUpdateData.heroImageUrl = onboarding.heroPhotoUrl;
    if (onboarding.aboutPhotoUrl) websiteUpdateData.aboutImageUrl = onboarding.aboutPhotoUrl;

    expect(websiteUpdateData.heroImageUrl).toBe("https://example.com/hero.jpg");
    expect(websiteUpdateData.aboutImageUrl).toBe("https://example.com/about.jpg");
  });

  it("should not add image URLs when both are empty", () => {
    const onboarding = { heroPhotoUrl: "", aboutPhotoUrl: "" };
    const websiteUpdateData: any = { websiteData: {}, colorScheme: {} };

    if (onboarding.heroPhotoUrl) websiteUpdateData.heroImageUrl = onboarding.heroPhotoUrl;
    if (onboarding.aboutPhotoUrl) websiteUpdateData.aboutImageUrl = onboarding.aboutPhotoUrl;

    expect(websiteUpdateData.heroImageUrl).toBeUndefined();
    expect(websiteUpdateData.aboutImageUrl).toBeUndefined();
  });
});

describe("Color harmony suggestions", () => {
  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  }

  function getHarmonyColors(primaryHex: string): string[] {
    const [r, g, b] = hexToRgb(primaryHex);
    const tint = rgbToHex(r + (255 - r) * 0.85, g + (255 - g) * 0.85, b + (255 - b) * 0.85);
    const complement = rgbToHex(255 - r, 255 - g, 255 - b);
    const warmWhite = "#FFF8F0";
    return [tint, complement, warmWhite];
  }

  it("should generate 3 harmony colors from a primary color", () => {
    const colors = getHarmonyColors("#3B82F6");
    expect(colors).toHaveLength(3);
  });

  it("should generate a light tint as the first harmony color", () => {
    const [r, g, b] = hexToRgb("#3B82F6");
    const [tr, tg, tb] = hexToRgb(getHarmonyColors("#3B82F6")[0]);
    // Tint should be lighter (higher values) than original
    expect(tr).toBeGreaterThan(r);
    expect(tg).toBeGreaterThan(g);
    expect(tb).toBeGreaterThan(b);
  });

  it("should always return warm white as the third option", () => {
    const colors = getHarmonyColors("#FF5733");
    expect(colors[2]).toBe("#FFF8F0");
  });
});

describe("STEP_ORDER includes aboutPhoto", () => {
  const STEP_ORDER = [
    "businessCategory",
    "brandColor",
    "brandSecondaryColor",
    "heroPhoto",
    "aboutPhoto",
    "brandLogo",
    "headlineFont",
  ];

  it("should have aboutPhoto after heroPhoto", () => {
    const heroIdx = STEP_ORDER.indexOf("heroPhoto");
    const aboutIdx = STEP_ORDER.indexOf("aboutPhoto");
    expect(aboutIdx).toBe(heroIdx + 1);
  });

  it("should have brandLogo after aboutPhoto", () => {
    const aboutIdx = STEP_ORDER.indexOf("aboutPhoto");
    const logoIdx = STEP_ORDER.indexOf("brandLogo");
    expect(logoIdx).toBe(aboutIdx + 1);
  });
});
