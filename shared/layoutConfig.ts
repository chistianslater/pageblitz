/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH – Color Scheme Contrast Helper
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Since the v1→v2 cutover (Plan B4b) this file only holds `withOnColors`, the
 * one function still used by the v2 pipeline (server/industryImages.ts →
 * getIndustryColorScheme) to derive readable "on-*" text colors for a color
 * scheme. All v1 font/layout-style/design-token config that used to live here
 * was removed together with the v1 generator.
 */

import { type ColorScheme } from "./types";
import { getContrastColor } from "./colorContrast";
export type { ColorScheme };

/**
 * Calculates 'on' contrast colors for a color scheme.
 */
export function withOnColors(
  cs: Omit<
    ColorScheme,
    "onPrimary" | "onSecondary" | "onAccent" | "onSurface" | "onBackground"
  >
): ColorScheme {
  return {
    ...cs,
    onPrimary: getContrastColor(cs.primary),
    onSecondary: getContrastColor(cs.secondary),
    onAccent: getContrastColor(cs.accent),
    onSurface: getContrastColor(cs.surface),
    onBackground: getContrastColor(cs.background),
  };
}
