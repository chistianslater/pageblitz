/**
 * Curated Unsplash photo library for industry-specific website images.
 * This file acts as a server-side wrapper for the shared configuration.
 */

import { INDUSTRY_IMAGES, type IndustryImageSet } from "@shared/industryImages";

export { INDUSTRY_IMAGES, type IndustryImageSet };

/**
 * Find the best matching image set for a given industry/category string.
 * Also checks business name for keywords.
 * If industryKey is provided, it uses that directly.
 *
 * Uses intelligent matching: prioritizes longer, more specific keywords
 * to avoid false matches (e.g., "bauunternehmen" vs "bau").
 */
export function getIndustryImages(
  category: string,
  businessName: string = "",
  industryKey?: string
): IndustryImageSet {
  if (industryKey && INDUSTRY_IMAGES[industryKey]) {
    return INDUSTRY_IMAGES[industryKey];
  }

  const combined = `${category} ${businessName}`.toLowerCase().trim();

  // Sortiere nach Priorität: längere/spezifischere Keywords zuerst
  const entries = Object.entries(INDUSTRY_IMAGES).sort(([, setA], [, setB]) => {
    const avgLenA =
      setA.keywords.reduce((sum, kw) => sum + kw.length, 0) /
      setA.keywords.length;
    const avgLenB =
      setB.keywords.reduce((sum, kw) => sum + kw.length, 0) /
      setB.keywords.length;
    return avgLenB - avgLenA; // Längere zuerst
  });

  // 1. Versuche: Exaktes oder starkes Match
  for (const [, imageSet] of entries) {
    const hasMatch = imageSet.keywords.some(kw => {
      const normalizedKw = kw.toLowerCase();
      // Prüfe auf exakten Match oder als Teilstring
      return (
        combined === normalizedKw ||
        combined.includes(normalizedKw) ||
        normalizedKw.includes(combined)
      );
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
export function getHeroImageUrl(
  category: string,
  businessName: string = "",
  industryKey?: string
): string {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  const heroes = imageSet.hero;
  // Use a simple hash of the businessName to pick a consistent image
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash << 5) - hash + businessName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % heroes.length;
  return heroes[idx];
}

/**
 * Get gallery images for a given industry.
 */
export function getGalleryImages(
  category: string,
  businessName: string = "",
  industryKey?: string
): string[] {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  return imageSet.gallery || imageSet.hero.slice(0, 2);
}
