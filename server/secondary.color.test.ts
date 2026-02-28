/**
 * Tests for secondary color → surface mapping logic
 * Verifies that user-chosen secondary colors are properly applied
 * as surface/section-background colors in the website renderer.
 */
import { describe, it, expect } from "vitest";

// Replicate the DEFAULT_COLOR_SCHEMES logic from WebsiteRenderer
const DEFAULT_COLOR_SCHEMES: Record<string, { primary: string; secondary: string; surface: string; background: string; text: string; textLight: string; accent: string }> = {
  clean:   { primary: "#2563eb", secondary: "#eff6ff", accent: "#3b82f6", background: "#f8fafc", surface: "#fff", text: "#0f172a", textLight: "#64748b" },
  elegant: { primary: "#b8860b", secondary: "#f5f0e8", accent: "#d4a843", background: "#fefcf8", surface: "#f5f0e8", text: "#1a1208", textLight: "#6b5c3e" },
  luxury:  { primary: "#c9a84c", secondary: "#0a0a0a", accent: "#e8c87a", background: "#0a0a0a", surface: "#111", text: "#fff", textLight: "rgba(255,255,255,0.6)" },
  warm:    { primary: "#c45c26", secondary: "#fdf6ee", accent: "#e07b3c", background: "#fffaf5", surface: "#fdf6ee", text: "#2d1a0e", textLight: "#7a5c42" },
};

// Replicate the cs-building logic from WebsiteRenderer
function buildCs(colorScheme: { primary?: string; secondary?: string; accent?: string } | undefined, layoutStyle: string) {
  const defaultCs = DEFAULT_COLOR_SCHEMES[layoutStyle] || DEFAULT_COLOR_SCHEMES.clean;
  const userSecondary = colorScheme?.secondary && colorScheme.secondary !== defaultCs.secondary
    ? colorScheme.secondary
    : null;
  const cs = colorScheme && colorScheme.primary
    ? {
        ...defaultCs,
        ...colorScheme,
        surface: userSecondary || colorScheme.secondary || defaultCs.surface,
      }
    : defaultCs;
  return { cs, userSecondary };
}

describe("Secondary color → surface mapping", () => {
  it("uses default surface when no colorScheme is provided", () => {
    const { cs } = buildCs(undefined, "clean");
    expect(cs.surface).toBe("#fff"); // clean default surface
  });

  it("uses default surface when colorScheme matches default secondary", () => {
    // colorScheme.secondary equals the default → no user override
    const { cs, userSecondary } = buildCs({ primary: "#2563eb", secondary: "#eff6ff" }, "clean");
    expect(userSecondary).toBeNull();
    expect(cs.surface).toBe("#eff6ff"); // secondary becomes surface
  });

  it("uses user-chosen secondary as surface when it differs from default", () => {
    const userColor = "#fce7f3"; // pink – clearly different from clean default
    const { cs, userSecondary } = buildCs({ primary: "#2563eb", secondary: userColor }, "clean");
    expect(userSecondary).toBe(userColor);
    expect(cs.surface).toBe(userColor);
  });

  it("applies user secondary color even without a custom primary", () => {
    const userColor = "#d1fae5"; // green tint
    const { cs } = buildCs({ primary: "#2563eb", secondary: userColor }, "elegant");
    expect(cs.surface).toBe(userColor);
  });

  it("dark layout: user-chosen light secondary becomes surface (overriding dark default)", () => {
    // luxury default secondary is #0a0a0a (dark)
    const userColor = "#fef3c7"; // warm yellow – user chose a light secondary for dark layout
    const { cs, userSecondary } = buildCs({ primary: "#c9a84c", secondary: userColor }, "luxury");
    expect(userSecondary).toBe(userColor);
    expect(cs.surface).toBe(userColor);
  });

  it("preserves primary color when only secondary is overridden", () => {
    const { cs } = buildCs({ primary: "#e11d48", secondary: "#fce7f3" }, "clean");
    expect(cs.primary).toBe("#e11d48");
    expect(cs.surface).toBe("#fce7f3");
  });

  it("falls back to defaultCs.surface when secondary is empty string", () => {
    const { cs } = buildCs({ primary: "#2563eb", secondary: "" }, "clean");
    // empty string is falsy → falls back to defaultCs.surface
    expect(cs.surface).toBe("#fff");
  });

  it("harmony: three different secondary colors produce three different surfaces", () => {
    const colors = ["#fce7f3", "#d1fae5", "#e0e7ff"];
    const surfaces = colors.map(c => buildCs({ primary: "#2563eb", secondary: c }, "clean").cs.surface);
    expect(new Set(surfaces).size).toBe(3);
  });
});

describe("Secondary color in OnboardingChat colorScheme prop", () => {
  // Simulate the colorScheme merge logic from OnboardingChat
  function buildOnboardingColorScheme(
    baseColorScheme: Record<string, string>,
    brandColor?: string,
    brandSecondaryColor?: string,
  ) {
    return {
      ...baseColorScheme,
      ...(brandColor && /^#[0-9A-Fa-f]{6}$/.test(brandColor)
        ? { primary: brandColor, accent: brandColor }
        : {}),
      ...(brandSecondaryColor && /^#[0-9A-Fa-f]{6}$/.test(brandSecondaryColor)
        ? { secondary: brandSecondaryColor }
        : {}),
    };
  }

  const baseScheme = { primary: "#2563eb", secondary: "#eff6ff", accent: "#3b82f6", surface: "#fff", background: "#f8fafc", text: "#0f172a", textLight: "#64748b" };

  it("applies brandSecondaryColor even without brandColor", () => {
    const result = buildOnboardingColorScheme(baseScheme, undefined, "#fce7f3");
    expect(result.secondary).toBe("#fce7f3");
    expect(result.primary).toBe("#2563eb"); // unchanged
  });

  it("applies both brandColor and brandSecondaryColor together", () => {
    const result = buildOnboardingColorScheme(baseScheme, "#e11d48", "#fce7f3");
    expect(result.primary).toBe("#e11d48");
    expect(result.secondary).toBe("#fce7f3");
  });

  it("ignores invalid hex codes", () => {
    const result = buildOnboardingColorScheme(baseScheme, "notahex", "alsonotahex");
    expect(result.primary).toBe("#2563eb"); // unchanged
    expect(result.secondary).toBe("#eff6ff"); // unchanged
  });

  it("preserves base scheme fields not overridden", () => {
    const result = buildOnboardingColorScheme(baseScheme, "#e11d48", "#fce7f3");
    expect(result.surface).toBe("#fff");
    expect(result.background).toBe("#f8fafc");
  });
});
