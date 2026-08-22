/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ── Website Generation Types ───────────────────────────
// v1's WebsiteData/WebsiteSection/DesignTokens were removed with the v1
// generator (Plan B4b) — the v2 contract lives in shared/siteContract/*.

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  gradient?: string;
  onPrimary: string;
  onSecondary: string;
  onAccent: string;
  onSurface: string;
  onBackground: string;
  // Dark layout / dark section overrides
  darkBackground?: string;
  lightText?: string;
}

export interface BusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  hasWebsite: boolean;
}
