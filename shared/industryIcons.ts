/**
 * Industry-specific icons for service cards and UI elements.
 * Automatically assigns appropriate icons based on business category.
 */

import type { LucideIcon } from "lucide-react";

// Icon names mapped to industries
export const INDUSTRY_ICONS: Record<string, string[]> = {
  // Hair & Beauty
  friseur: ["Scissors", "Sparkles", "Crown", "Palette", "Heart", "Star"],
  beauty: ["Sparkles", "Heart", "Crown", "Palette", "Droplet", "Sun"],
  nails: ["Palette", "Sparkles", "Heart", "Star", "Crown", "Gem"],
  kosmetik: ["Droplet", "Sparkles", "Heart", "Sun", "Leaf", "Crown"],
  spa: ["Droplet", "Leaf", "Heart", "Sun", "Wind", "Sparkles"],

  // Food & Beverage
  restaurant: ["Utensils", "ChefHat", "Flame", "Wine", "GlassWater", "Coffee"],
  cafe: ["Coffee", "Croissant", "Cookie", "GlassWater", "Utensils", "Heart"],
  bar: ["Wine", "GlassWater", "Music", "Flame", "Star", "Moon"],
  pizza: ["Pizza", "Flame", "Utensils", "ChefHat", "Heart", "Star"],
  baeckerei: ["Croissant", "Cookie", "Coffee", "ChefHat", "Heart", "Star"],

  // Health & Fitness
  fitness: ["Dumbbell", "Heart", "Flame", "Activity", "Target", "Trophy"],
  yoga: ["Leaf", "Heart", "Sun", "Moon", "Wind", "Sparkles"],
  physiotherapie: ["Activity", "Heart", "Droplet", "Leaf", "Sun", "Target"],
  arzt: ["Heart", "Activity", "Shield", "Cross", "Droplet", "Sun"],
  zahnarzt: ["Smile", "Heart", "Shield", "Sparkles", "Star", "Sun"],

  // Home & Construction
  handwerk: ["Hammer", "Wrench", "Ruler", "HardHat", "Shield", "CheckCircle"],
  bau: ["HardHat", "Ruler", "Hammer", "Shield", "CheckCircle", "Building"],
  garten: ["Leaf", "Sun", "Droplet", "Tree", "Flower", "Wind"],
  reinigung: ["Droplet", "Sparkles", "Shield", "CheckCircle", "Sun", "Wind"],

  // Professional Services
  anwalt: ["Scale", "Shield", "Briefcase", "BookOpen", "FileText", "CheckCircle"],
  steuerberater: ["Calculator", "FileText", "Briefcase", "Shield", "CheckCircle", "BookOpen"],
  beratung: ["Briefcase", "Target", "Lightbulb", "Users", "CheckCircle", "Star"],

  // Automotive
  auto: ["Car", "Wrench", "Shield", "CheckCircle", "Sparkles", "Star"],
  mechaniker: ["Wrench", "Car", "Tool", "Shield", "CheckCircle", "Flame"],

  // Photography & Media
  fotografie: ["Camera", "Image", "Aperture", "Sun", "Sparkles", "Star"],
  design: ["Palette", "Image", "Lightbulb", "Ruler", "Star", "Sparkles"],

  // Tech
  tech: ["Cpu", "Code", "Smartphone", "Globe", "Zap", "Lightbulb"],
  it: ["Code", "Cpu", "Server", "Globe", "Shield", "Zap"],

  // Default fallback
  default: ["Sparkles", "Star", "Heart", "CheckCircle", "Shield", "Target"],
};

/**
 * Get appropriate icons for a business category
 */
export function getIndustryIcons(category: string): string[] {
  const key = Object.keys(INDUSTRY_ICONS).find((k) =>
    category.toLowerCase().includes(k)
  );
  return INDUSTRY_ICONS[key || "default"] || INDUSTRY_ICONS.default;
}

/**
 * Get a single icon for a service based on index and category
 */
export function getServiceIcon(category: string, index: number): string {
  const icons = getIndustryIcons(category);
  return icons[index % icons.length];
}
