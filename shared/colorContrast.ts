/**
 * Color contrast utilities based on WCAG 2.1 relative luminance.
 * Used to ensure text is always readable against any background color.
 */

/**
 * Parse a hex color string to RGB components.
 * Supports #rrggbb and #rgb formats.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

/**
 * Calculate relative luminance of a color (WCAG 2.1).
 * Returns a value between 0 (black) and 1 (white).
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // fallback: assume medium luminance

  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/**
 * Returns true if the color is "light" (luminance > 0.35).
 * Threshold is slightly lower than 0.5 to account for mid-tones that still
 * need dark text (e.g. warm creams, light yellows).
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.35;
}

/**
 * Returns the best contrasting text color (#000000 or #ffffff) for a given
 * background color, based on WCAG contrast ratio.
 */
export function getContrastColor(bgHex: string): "#000000" | "#ffffff" {
  return isLightColor(bgHex) ? "#000000" : "#ffffff";
}

/**
 * Returns the best contrasting text color for a given background,
 * but biased toward the brand primary color when contrast is sufficient.
 * Falls back to black/white when primary color doesn't have enough contrast.
 *
 * @param bgHex - background color
 * @param primaryHex - brand primary color to prefer if contrast is OK
 * @param minRatio - minimum WCAG contrast ratio (default 4.5 for AA normal text)
 */
export function getContrastColorWithBrand(
  bgHex: string,
  primaryHex: string,
  minRatio = 4.5
): string {
  const bgLum = getLuminance(bgHex);
  const primaryLum = getLuminance(primaryHex);

  // WCAG contrast ratio formula
  const lighter = Math.max(bgLum, primaryLum);
  const darker = Math.min(bgLum, primaryLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  if (ratio >= minRatio) {
    return primaryHex; // primary color has sufficient contrast → use it
  }

  // Primary doesn't have enough contrast → fall back to black or white
  return isLightColor(bgHex) ? "#000000" : "#ffffff";
}

/**
 * Given a section background color and a heading color (usually primary),
 * returns a safe heading color that is readable on that background.
 *
 * Uses 3.0:1 threshold (WCAG AA for large text / headings ≥18pt bold),
 * which allows brand colors like orange on white to remain visible.
 *
 * Rules:
 * - If heading color has WCAG AA Large contrast (≥3.0) against bg → keep it
 * - If bg is light and heading is also light → darken to near-black
 * - If bg is dark and heading is also dark → lighten to near-white
 */
export function getSafeHeadingColor(bgHex: string, headingHex: string): string {
  return getContrastColorWithBrand(bgHex, headingHex, 3.0);
}

/**
 * Returns a safe navbar/logo text color for a given navbar background.
 * Prefers white on dark backgrounds, dark on light backgrounds.
 */
export function getNavTextColor(navBgHex: string): "#000000" | "#ffffff" {
  return getContrastColor(navBgHex);
}
