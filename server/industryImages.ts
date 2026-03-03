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

/**
 * Returns the layout pool and industry key for a given category/businessName.
 * The pool is a list of layout styles to choose from for this industry.
 * 
 * Uses intelligent matching: prioritizes longer, more specific keywords
 * to avoid false matches (e.g., "bauunternehmen" matched as "bau" → medical).
 */
export function getLayoutPool(category: string, businessName: string = "", explicitIndustryKey?: string): { pool: string[]; industryKey: string } {
  const KEY_TO_POOL: Record<string, string[]> = {
    friseur: ["elegant", "fresh", "luxury"],
    restaurant: ["warm", "fresh", "modern"],
    pizza: ["warm", "fresh", "modern"],
    bar: ["luxury", "warm", "elegant"],
    cafe: ["warm", "fresh", "modern"],
    hotel: ["luxury", "warm", "elegant"],
    bauunternehmen: ["bold", "trust", "modern"],
    handwerk: ["bold", "trust", "modern"],
    fitness: ["vibrant", "dynamic", "fresh"],
    beauty: ["elegant", "fresh", "luxury"],
    medizin: ["trust", "clean", "fresh"],
    immobilien: ["trust", "luxury", "modern"],
    baeckerei: ["warm", "fresh", "modern"],
    beratung: ["trust", "clean", "modern"],
    reinigung: ["bold", "trust", "clean"],
    auto: ["bold", "craft", "clean"],
    fotografie: ["modern", "dynamic", "vibrant"],
    garten: ["fresh", "warm", "clean"],
    tech: ["modern", "dynamic", "vibrant"],
  };
  
  if (explicitIndustryKey && KEY_TO_POOL[explicitIndustryKey]) {
    return { pool: KEY_TO_POOL[explicitIndustryKey], industryKey: explicitIndustryKey };
  }
  
  const combined = `${category} ${businessName}`.toLowerCase().trim();
  
  // WICHTIG: Sortiere nach Priorität - spezifischere (längere) Keywords zuerst!
  // Damit "bauunternehmen" vor "bau" geprüft wird
  const POOLS_PRIORITY = [
    // 1. Spezifischste Begriffe (längere Wörter, compound words)
    { test: (s: string) => /bauunternehmen|baufirma|hochbau|tiefbau|rohbau|construction company|building company/.test(s), pool: ["bold", "trust", "modern"], key: "bauunternehmen" },
    { test: (s: string) => /unternehmensberatung|business consulting|management consulting/.test(s), pool: ["trust", "clean", "modern"], key: "beratung" },
    { test: (s: string) => /steuerberatung|tax consulting|tax advisory/.test(s), pool: ["trust", "clean", "modern"], key: "beratung" },
    { test: (s: string) => /rechtsanwalt|anwaltskanzlei|law firm|attorney at law/.test(s), pool: ["trust", "clean", "modern"], key: "legal" },
    { test: (s: string) => /zahnarztpraxis|dental clinic|dental practice/.test(s), pool: ["trust", "clean", "fresh"], key: "medical" },
    { test: (s: string) => /arztpraxis|medical practice|doctor.?s office/.test(s), pool: ["trust", "clean", "fresh"], key: "medical" },
    { test: (s: string) => /kfz-werkstatt|autowerkstatt|car repair shop|auto repair/.test(s), pool: ["bold", "craft", "clean"], key: "automotive" },
    { test: (s: string) => /friseursalon|hair salon|beauty salon|nail salon/.test(s), pool: ["elegant", "fresh", "luxury"], key: "beauty" },
    { test: (s: string) => /fitnessstudio|fitness center|gym center|training center/.test(s), pool: ["vibrant", "dynamic", "fresh"], key: "fitness" },
    { test: (s: string) => /immobilienmakler|real estate agent|property agent/.test(s), pool: ["trust", "luxury", "modern"], key: "immobilien" },
    
    // 2. Normale Branchen-Keywords (mittlere Spezifität)
    { test: (s: string) => /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading|esthetician|eyebrow|eyelash|skincare|skin care|facial|pedicure|manicure|hairdresser|hairstylist/.test(s), pool: ["elegant", "fresh", "luxury"], key: "beauty" },
    { test: (s: string) => /pizzeria|pizza|burger|delivery|lieferservice|fast.?food|takeout|takeaway|diner|imbiss|snack/.test(s), pool: ["bold", "fresh", "modern"], key: "fastfood" },
    { test: (s: string) => /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|sushi|gastronomie|bakery|patisserie|confectionery|coffee.?shop|coffee house|steakhouse|seafood|italian|chinese|japanese|thai|mexican|indian|greek|french|american|brunch|breakfast|lunch|dinner|mahlzeit/.test(s), pool: ["warm", "fresh", "modern"], key: "food" },
    { test: (s: string) => /dachdecker|klempner|sanitär|heizung|elektriker|maler|zimmermann|schreiner|tischler|fliesenleger|contractor|roofing|plumber|plumbing|carpenter|carpentry|painter|painting|renovation|installation|tischler|electrician|electrical|hvac|heating|cooling|air.?condition|masonry|concrete|drywall|flooring|tile|insulation|waterproof|window|door|fence|deck|patio|siding|gutter|handyman|remodel/.test(s), pool: ["bold", "trust", "modern"], key: "handwerk" },
    // "bau" separat UND NACH spezifischeren Begriffen prüfen!
    { test: (s: string) => /handwerk|bau$|\sbau\s|bauunternehmen|baufirma|bauwerk|baustelle/.test(s), pool: ["bold", "trust", "modern"], key: "handwerk" },
    { test: (s: string) => /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire|auto.?repair|auto.?body|auto.?service|car.?wash|car.?dealer|dealership|transmission|oil.?change|brake|exhaust|collision|towing|used.?car|new.?car/.test(s), pool: ["bold", "craft", "clean"], key: "automotive" },
    { test: (s: string) => /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance|athletic|athletics|swimming|pool|tennis|golf|cycling|running|triathlon|weightlifting|zumba|barre|bootcamp|spin|hiit|stretch|flexibility|wellness.?center/.test(s), pool: ["vibrant", "dynamic", "fresh"], key: "fitness" },
    { test: (s: string) => /zahnarzt|arzt|medizin|doctor|dental|dentist|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker|physician|surgeon|orthopedic|pediatric|gynecolog|dermatolog|ophthalmolog|optometrist|optician|audiolog|cardiolog|neurolog|psychiatr|psycholog|therapist|counselor|mental.?health|urgent.?care|emergency|laboratory|lab|radiology|physical.?therapy|occupational|speech|dietitian|nutritionist|acupuncture|naturopath/.test(s), pool: ["trust", "clean", "fresh"], key: "medical" },
    { test: (s: string) => /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|accounting|tax|finanz|wirtschaft|notariat|immobilien|makler|real.?estate|attorney|lawyer|notary|financial|finance|insurance|investment|mortgage|bank|credit|audit|bookkeeping|cpa|advisor|wealth|asset|property.?management|business.?consulting/.test(s), pool: ["trust", "clean", "modern"], key: "legal" },
    { test: (s: string) => /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable|landscaping|landscape|lawn|mowing|tree|arborist|nursery|greenhouse|horticulture|irrigation|outdoor|yard|groundskeeping/.test(s), pool: ["fresh", "warm", "clean"], key: "nature" },
    { test: (s: string) => /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving|janitorial|maid|housekeeping|carpet.?clean|window.?clean|pressure.?wash|power.?wash|disinfect|sanitiz|exterminator|termite|rodent|storage|self.?storage/.test(s), pool: ["bold", "trust", "clean"], key: "cleaning" },
    { test: (s: string) => /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup|photographer|photography|videograph|video.?production|graphic|print|signage|advertising|pr.?agency|social.?media|seo|branding|copywriting|content/.test(s), pool: ["modern", "dynamic", "vibrant"], key: "tech" },
    { test: (s: string) => /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung|driving.?school|music.?school|art.?school|language|childcare|daycare|preschool|kindergarten|montessori|after.?school|college|university/.test(s), pool: ["trust", "fresh", "modern"], key: "education" },
    { test: (s: string) => /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel|tour|resort|motel|bed.?and.?breakfast|b&b|vacation|rental|venue|banquet|conference|catering.?event|entertainment|nightclub|bar|lounge|brewery|winery|distillery/.test(s), pool: ["luxury", "warm", "elegant"], key: "hospitality" },
  ];
  
  for (const entry of POOLS_PRIORITY) {
    if (entry.test(combined)) return { pool: entry.pool, industryKey: entry.key };
  }
  
  return { pool: ["clean", "modern", "trust", "fresh"], industryKey: "general" };
}

/**
 * Returns a single layout style for a given category/businessName.
 * Uses a hash of the businessName to pick deterministically from the pool.
 */
export function getLayoutStyle(category: string, businessName: string = "", industryKey?: string): string {
  const { pool } = getLayoutPool(category, businessName, industryKey);
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = ((hash << 5) - hash) + businessName.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
}
