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
 */
export function getIndustryImages(category: string, businessName: string = "", industryKey?: string): IndustryImageSet {
  if (industryKey && INDUSTRY_IMAGES[industryKey]) {
    return INDUSTRY_IMAGES[industryKey];
  }

  const combined = `${category} ${businessName}`.toLowerCase();

  for (const [, imageSet] of Object.entries(INDUSTRY_IMAGES)) {
    if (imageSet.keywords.some(kw => combined.includes(kw))) {
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
