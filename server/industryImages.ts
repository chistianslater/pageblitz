/**
 * Curated Unsplash photo library for industry-specific website images.
 * All photos are free to use via Unsplash's public CDN.
 * Format: https://images.unsplash.com/photo-{id}?w=1200&q=80&auto=format&fit=crop
 */

export interface IndustryImageSet {
  hero: string[];
  about?: string[];
  gallery?: string[];
  keywords: string[];
}

// Map of industry keywords → curated Unsplash photo IDs
const INDUSTRY_IMAGES: Record<string, IndustryImageSet> = {
  // ── Hair & Beauty ──────────────────────────────────
  friseur: {
    keywords: ["friseur", "hair", "salon", "barber", "beauty", "hairdresser", "coiffeur"],
    hero: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Restaurant & Food ──────────────────────────────
  restaurant: {
    keywords: ["restaurant", "gastro", "essen", "food", "cafe", "bistro", "küche", "speise", "pizza", "sushi", "burger"],
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Handwerk & Bau ─────────────────────────────────
  handwerk: {
    keywords: ["handwerk", "bau", "elektriker", "klempner", "maler", "schreiner", "tischler", "zimmerer", "dachdecker", "sanitär", "heizung", "installation", "craft", "construction"],
    hero: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Fitness & Sport ────────────────────────────────
  fitness: {
    keywords: ["fitness", "gym", "sport", "training", "yoga", "pilates", "crossfit", "personal trainer", "gesundheit"],
    hero: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Medizin & Gesundheit ───────────────────────────
  medizin: {
    keywords: ["arzt", "zahnarzt", "praxis", "medizin", "gesundheit", "klinik", "physiotherapie", "therapie", "apotheke", "doctor", "dental", "medical"],
    hero: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Immobilien ─────────────────────────────────────
  immobilien: {
    keywords: ["immobilien", "makler", "real estate", "wohnung", "haus", "miete", "kauf", "property"],
    hero: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Rechtsanwalt & Beratung ────────────────────────
  beratung: {
    keywords: ["rechtsanwalt", "anwalt", "steuerberater", "beratung", "consulting", "kanzlei", "law", "legal", "finanzen", "versicherung"],
    hero: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Reinigung & Haushaltsservice ───────────────────
  reinigung: {
    keywords: ["reinigung", "cleaning", "haushaltsservice", "gebäudereinigung", "putzen", "hausmeister"],
    hero: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Fotografie ─────────────────────────────────────
  fotografie: {
    keywords: ["fotograf", "photography", "fotostudio", "hochzeitsfotograf", "portrait"],
    hero: [
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Auto & KFZ ─────────────────────────────────────
  auto: {
    keywords: ["auto", "kfz", "werkstatt", "autowerkstatt", "reifenservice", "car", "vehicle", "garage"],
    hero: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Blumen & Garten ────────────────────────────────
  garten: {
    keywords: ["blumen", "florist", "garten", "gartenbau", "landschaftsbau", "flower", "garden"],
    hero: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── IT & Tech ──────────────────────────────────────
  tech: {
    keywords: ["it", "software", "tech", "digital", "computer", "web", "app", "entwicklung", "programmierung"],
    hero: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Default / Generic ──────────────────────────────
  default: {
    keywords: [],
    hero: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85&auto=format&fit=crop",
    ],
  },
};

/**
 * Find the best matching image set for a given industry/category string.
 */
export function getIndustryImages(category: string): IndustryImageSet {
  const lower = (category || "").toLowerCase();

  for (const [, imageSet] of Object.entries(INDUSTRY_IMAGES)) {
    if (imageSet.keywords.some(kw => lower.includes(kw))) {
      return imageSet;
    }
  }

  return INDUSTRY_IMAGES.default;
}

/**
 * Get a random hero image URL for a given industry.
 * Uses a seed based on business name for consistency (same business → same image).
 */
export function getHeroImageUrl(category: string, seed: string = ""): string {
  const imageSet = getIndustryImages(category);
  const heroes = imageSet.hero;
  // Use a simple hash of the seed to pick a consistent image
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % heroes.length;
  return heroes[idx];
}

/**
 * Get gallery images for a given industry.
 */
export function getGalleryImages(category: string): string[] {
  const imageSet = getIndustryImages(category);
  return imageSet.gallery || imageSet.hero.slice(0, 2);
}

/**
 * Industry-specific color palettes.
 * Returns a ColorScheme object matching the industry's visual identity.
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  gradient: string;
}

const INDUSTRY_COLORS: Record<string, ColorScheme[]> = {
  friseur: [
    { primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560", background: "#ffffff", surface: "#f8f5f2", text: "#1a1a2e", textLight: "#6b6b7b", gradient: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)" },
    { primary: "#c9a96e", secondary: "#8b6914", accent: "#1a1a2e", background: "#faf9f7", surface: "#f2ede6", text: "#2c2416", textLight: "#8b7355", gradient: "linear-gradient(135deg, #c9a96e 0%, #8b6914 100%)" },
  ],
  restaurant: [
    { primary: "#c0392b", secondary: "#922b21", accent: "#f39c12", background: "#fffef8", surface: "#fdf6e3", text: "#2c1810", textLight: "#7d6b5e", gradient: "linear-gradient(135deg, #c0392b 0%, #f39c12 100%)" },
    { primary: "#2d6a4f", secondary: "#1b4332", accent: "#d4a017", background: "#f8faf8", surface: "#e8f5e9", text: "#1b2e1b", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #2d6a4f 0%, #d4a017 100%)" },
  ],
  handwerk: [
    { primary: "#e67e22", secondary: "#ca6f1e", accent: "#2c3e50", background: "#ffffff", surface: "#fdf8f3", text: "#2c2416", textLight: "#7d6b5e", gradient: "linear-gradient(135deg, #e67e22 0%, #2c3e50 100%)" },
    { primary: "#2980b9", secondary: "#1a5276", accent: "#f39c12", background: "#f8fbff", surface: "#eaf4fb", text: "#1a2a3a", textLight: "#5d7a8a", gradient: "linear-gradient(135deg, #2980b9 0%, #1a5276 100%)" },
  ],
  fitness: [
    { primary: "#e74c3c", secondary: "#c0392b", accent: "#f39c12", background: "#ffffff", surface: "#fdf8f8", text: "#1a0a0a", textLight: "#7d5a5a", gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" },
    { primary: "#1abc9c", secondary: "#148f77", accent: "#f39c12", background: "#f8fffd", surface: "#e8f8f5", text: "#0a2a24", textLight: "#5a7a70", gradient: "linear-gradient(135deg, #1abc9c 0%, #148f77 100%)" },
  ],
  medizin: [
    { primary: "#2980b9", secondary: "#1a5276", accent: "#27ae60", background: "#f8fbff", surface: "#eaf4fb", text: "#1a2a3a", textLight: "#5d7a8a", gradient: "linear-gradient(135deg, #2980b9 0%, #27ae60 100%)" },
    { primary: "#16a085", secondary: "#0e6655", accent: "#2980b9", background: "#f8fffd", surface: "#e8f8f5", text: "#0a2a24", textLight: "#5a7a70", gradient: "linear-gradient(135deg, #16a085 0%, #2980b9 100%)" },
  ],
  immobilien: [
    { primary: "#2c3e50", secondary: "#1a252f", accent: "#c9a96e", background: "#ffffff", surface: "#f5f6fa", text: "#1a1a2e", textLight: "#7f8c8d", gradient: "linear-gradient(135deg, #2c3e50 0%, #c9a96e 100%)" },
    { primary: "#8e44ad", secondary: "#6c3483", accent: "#f39c12", background: "#fdf8ff", surface: "#f5eafb", text: "#1a0a2e", textLight: "#7d5a8a", gradient: "linear-gradient(135deg, #8e44ad 0%, #f39c12 100%)" },
  ],
  beratung: [
    { primary: "#1a3a5c", secondary: "#0f2744", accent: "#c9a96e", background: "#f8faff", surface: "#eef2f8", text: "#0f1e2e", textLight: "#5d7a8a", gradient: "linear-gradient(135deg, #1a3a5c 0%, #c9a96e 100%)" },
  ],
  auto: [
    { primary: "#2c3e50", secondary: "#1a252f", accent: "#e74c3c", background: "#f5f6fa", surface: "#ecf0f1", text: "#1a1a2e", textLight: "#7f8c8d", gradient: "linear-gradient(135deg, #2c3e50 0%, #e74c3c 100%)" },
  ],
  default: [
    { primary: "#3b82f6", secondary: "#1d4ed8", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
    { primary: "#7c3aed", secondary: "#5b21b6", accent: "#f59e0b", background: "#faf8ff", surface: "#f3f0ff", text: "#1e1b4b", textLight: "#6d6a8a", gradient: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" },
    { primary: "#059669", secondary: "#047857", accent: "#f59e0b", background: "#f8fffc", surface: "#ecfdf5", text: "#0a2a1e", textLight: "#5a7a6a", gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
  ],
};

/**
 * Get a color scheme for a given industry, with variety based on a seed.
 */
export function getIndustryColorScheme(category: string, seed: string = ""): ColorScheme {
  const lower = (category || "").toLowerCase();
  let schemes: ColorScheme[] | undefined;

  for (const [key, colors] of Object.entries(INDUSTRY_COLORS)) {
    if (key === "default") continue;
    const imageSet = INDUSTRY_IMAGES[key];
    if (imageSet?.keywords.some(kw => lower.includes(kw))) {
      schemes = colors;
      break;
    }
  }

  if (!schemes) schemes = INDUSTRY_COLORS.default;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return schemes[Math.abs(hash) % schemes.length];
}

/**
 * Get a layout style for a given industry.
 * Different industries get different visual layouts.
 */
export function getLayoutStyle(category: string, seed: string = ""): string {
  const lower = (category || "").toLowerCase();

  // Industry-specific layout preferences (DE + EN GMB categories)
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("bistro") || lower.includes("food") || lower.includes("pizza") || lower.includes("sushi") || lower.includes("hotel") || lower.includes("lodging")) return "fullbleed";
  if (lower.includes("friseur") || lower.includes("salon") || lower.includes("beauty") || lower.includes("hair") || lower.includes("barber") || lower.includes("coiffeur") || lower.includes("nail") || lower.includes("spa") || lower.includes("massage")) return "elegant";
  if (lower.includes("handwerk") || lower.includes("bau") || lower.includes("elektriker") || lower.includes("contractor") || lower.includes("roofing") || lower.includes("plumber") || lower.includes("carpenter") || lower.includes("painter") || lower.includes("construction") || lower.includes("renovation") || lower.includes("installation")) return "bold";
  if (lower.includes("fitness") || lower.includes("sport") || lower.includes("gym") || lower.includes("yoga") || lower.includes("training") || lower.includes("crossfit") || lower.includes("pilates")) return "dynamic";
  if (lower.includes("arzt") || lower.includes("zahnarzt") || lower.includes("medizin") || lower.includes("doctor") || lower.includes("dental") || lower.includes("medical") || lower.includes("health") || lower.includes("clinic") || lower.includes("pharmacy") || lower.includes("physiotherap") || lower.includes("therapist")) return "clean";
  if (lower.includes("immobilien") || lower.includes("makler") || lower.includes("real estate") || lower.includes("property") || lower.includes("luxury") || lower.includes("premium")) return "premium";
  if (lower.includes("rechtsanwalt") || lower.includes("anwalt") || lower.includes("beratung") || lower.includes("law") || lower.includes("legal") || lower.includes("consulting") || lower.includes("accountant") || lower.includes("tax") || lower.includes("steuer") || lower.includes("versicherung")) return "professional";
  if (lower.includes("auto") || lower.includes("kfz") || lower.includes("car") || lower.includes("vehicle") || lower.includes("garage") || lower.includes("mechanic") || lower.includes("werkstatt")) return "bold";

  // Fallback: vary by seed for more diversity
  const styles = ["classic", "bold", "elegant", "dynamic", "clean", "premium"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return styles[Math.abs(hash) % styles.length];
}
