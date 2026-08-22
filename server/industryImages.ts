/**
 * Curated Unsplash photo library for industry-specific website images.
 * This file acts as a server-side wrapper for the shared configuration.
 */

import { INDUSTRY_IMAGES, INDUSTRY_COLORS, type IndustryImageSet } from "@shared/industryImages";
import { withOnColors, type ColorScheme } from "@shared/layoutConfig";

export { INDUSTRY_IMAGES, type IndustryImageSet };

/**
 * Find the best matching image set for a given industry/category string.
 * Also checks business name for keywords.
 * If industryKey is provided, it uses that directly.
 * 
 * Uses intelligent matching: prioritizes longer, more specific keywords
 * to avoid false matches (e.g., "bauunternehmen" vs "bau").
 */
export function getIndustryImages(category: string, businessName: string = "", industryKey?: string): IndustryImageSet {
  if (industryKey && INDUSTRY_IMAGES[industryKey]) {
    return INDUSTRY_IMAGES[industryKey];
  }

  const combined = `${category} ${businessName}`.toLowerCase().trim();
  
  // Sortiere nach Priorität: längere/spezifischere Keywords zuerst
  const entries = Object.entries(INDUSTRY_IMAGES).sort(([, setA], [, setB]) => {
    const avgLenA = setA.keywords.reduce((sum, kw) => sum + kw.length, 0) / setA.keywords.length;
    const avgLenB = setB.keywords.reduce((sum, kw) => sum + kw.length, 0) / setB.keywords.length;
    return avgLenB - avgLenA; // Längere zuerst
  });

  // 1. Versuche: Exaktes oder starkes Match
  for (const [, imageSet] of entries) {
    const hasMatch = imageSet.keywords.some(kw => {
      const normalizedKw = kw.toLowerCase();
      // Prüfe auf exakten Match oder als Teilstring
      return combined === normalizedKw ||
             combined.includes(normalizedKw) ||
             normalizedKw.includes(combined);
    });
    if (hasMatch) {
      return imageSet;
    }
  }

  return INDUSTRY_IMAGES.default;
}

/**
 * Get a random hero image URL for a given industry.
 * Uses a seed based on business name for consistency (same business → same image).
 */
export function getHeroImageUrl(category: string, businessName: string = "", industryKey?: string): string {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  const heroes = imageSet.hero;
  // Use a simple hash of the businessName to pick a consistent image
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = ((hash << 5) - hash) + businessName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % heroes.length;
  return heroes[idx];
}

/**
 * Get gallery images for a given industry.
 */
export function getGalleryImages(category: string, businessName: string = "", industryKey?: string): string[] {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  return imageSet.gallery || imageSet.hero.slice(0, 2);
}

/**
 * Industry-specific color palettes.
 * Returns a ColorScheme object matching the industry's visual identity.
 */
export function getIndustryColorScheme(category: string, businessName: string = "", industryKey?: string): ColorScheme {
  const key = industryKey || getIndustryKey(category, businessName);
  const palettes = INDUSTRY_COLORS[key] || INDUSTRY_COLORS.default;
  
  // Hash the business name to pick a consistent palette from the options
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = ((hash << 5) - hash) + businessName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % palettes.length;
  return withOnColors(palettes[idx]);
}

function getIndustryKey(category: string, businessName: string): string {
  const combined = `${category} ${businessName}`.toLowerCase();
  for (const [key, imageSet] of Object.entries(INDUSTRY_IMAGES)) {
    if (imageSet.keywords.some(kw => combined.includes(kw))) {
      return key;
    }
  }
  return "default";
}

/**
 * Returns a contrast color (#0f172a or #f8fafc) for a given hex color.
 * Re-exported here for backwards compatibility with routers.ts imports.
 */
export function getContrastColor(hexColor: string): string {
  if (!hexColor || typeof hexColor !== "string") return "#f8fafc";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) return "#f8fafc";
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? "#0f172a" : "#f8fafc";
}

