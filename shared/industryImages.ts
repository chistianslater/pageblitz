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
export const INDUSTRY_IMAGES: Record<string, IndustryImageSet> = {
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
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Restaurant & Food ──────────────────────────────
  restaurant: {
    keywords: ["restaurant", "gastro", "gastronomie", "essen", "küche", "speise", "sushi", "burger", "steakhouse", "grill", "wirtshaus", "gasthaus", "food", "imbiss", "steak", "lunch", "mittagstisch", "taverne", "ristorante", "trattoria", "italienisch", "italien", "pizzeria", "pizza", "genuss", "aroma", "lecker", "speisen", "küchenchef", "koch", "tafel", "buffet", "catering", "bistro", "café", "delivery", "lieferservice", "speiselokal", "gasthof", "bewirtung", "essen auf rädern", "mahlzeit", "meal"],
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Pizzeria & Italian ──────────────────────────────
  pizza: {
    keywords: ["pizza", "pizzeria", "pizze", "napoli", "italienisch", "italien", "italian", "pasta", "trattoria", "osteria", "pizzaservice", "ristorante", "italy", "teig", "ofen", "amaro", "amareo", "bella", "mamma", "italy", "basilikum", "mozzarella"],
    hero: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574129624162-fa167303c403?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593504049359-74330189a345?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Bar & Tapas ────────────────────────────────────
  bar: {
    keywords: ["bar", "tapas", "cocktail", "lounge", "pub", "kneipe", "weinbar", "wein", "bier", "brauerei", "brewery", "nightlife", "nachtleben", "aperitivo", "tapasbar"],
    hero: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527761939622-933c972a0b08?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Bauunternehmen & Handwerk ───────────────────────
  handwerk: {
    keywords: ["handwerk", "bau", "elektriker", "klempner", "maler", "schreiner", "tischler", "zimmerer", "dachdecker", "sanitär", "heizung", "installation", "craft", "construction", "renovierung", "fliesenleger", "bauunternehmen", "baufirma", "hochbau", "tiefbau", "rohbau"],
    hero: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Medizin & Beratung ─────────────────────────────
  medizin: {
    keywords: ["arzt", "zahnarzt", "praxis", "medizin", "gesundheit", "klinik", "physiotherapie", "therapie", "apotheke", "doctor", "dental", "medical", "rechtsanwalt", "anwalt", "steuerberater", "beratung", "consulting", "kanzlei", "law", "legal"],
    hero: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Immobilien ─────────────────────────────────────
  immobilien: {
    keywords: ["immobilien", "makler", "real estate", "wohnung", "haus", "miete", "kauf", "property"],
    hero: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Default / Neutral Fallback ─────────────────────
  default: {
    keywords: [],
    hero: [
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554147090-e1221a04a025?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1400&q=80&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80&auto=format&fit=crop",
    ]
  },
};

/**
 * Refined industry color palettes with sophisticated, harmonious colors.
 * Following the 60-30-10 rule for balanced visual hierarchy.
 */
export const INDUSTRY_COLORS: Record<string, any[]> = {
  friseur: [
    // Warm champagne & taupe - Elegant, premium salon
    { primary: "#9a8b7a", secondary: "#f8f6f3", accent: "#c4a882", background: "#fdfcfb", surface: "#f5f3f0", text: "#2d2a26", textLight: "#7a756e", gradient: "linear-gradient(135deg, #9a8b7a 0%, #c4a882 100%)" },
    // Soft rosewood & cream - Feminine, boutique
    { primary: "#8b6b6b", secondary: "#fdf2f2", accent: "#c4a882", background: "#fffafa", surface: "#fdf2f2", text: "#3d2c2c", textLight: "#7a6b6b", gradient: "linear-gradient(135deg, #8b6b6b 0%, #c4a882 100%)" },
  ],
  restaurant: [
    // Deep slate & warm gold - Fine dining atmosphere
    { primary: "#3d4a5d", secondary: "#bfa880", accent: "#f5f3f0", background: "#fdfcfb", surface: "#f8f6f3", text: "#1f242b", textLight: "#6b7280", gradient: "linear-gradient(135deg, #3d4a5d 0%, #bfa880 100%)" },
    // Warm earth & olive - Natural, organic cuisine
    { primary: "#6b5b4f", secondary: "#8b7355", accent: "#e8ded4", background: "#faf8f5", surface: "#f0ece4", text: "#3d342e", textLight: "#7a6b5f", gradient: "linear-gradient(135deg, #6b5b4f 0%, #8b7355 100%)" },
  ],
  pizza: [
    // Classic terracotta & sage - Italian heritage
    { primary: "#a0522d", secondary: "#d4a574", accent: "#6b8e6b", background: "#faf8f5", surface: "#f5f0e8", text: "#3d2c1f", textLight: "#7a6b5a", gradient: "linear-gradient(135deg, #a0522d 0%, #6b8e6b 100%)" },
    // Warm charcoal & cream - Modern trattoria
    { primary: "#3d3d3d", secondary: "#c4a882", accent: "#e8ded4", background: "#fdfcfb", surface: "#f8f6f3", text: "#1a1a1a", textLight: "#6b6b6b", gradient: "linear-gradient(135deg, #3d3d3d 0%, #c4a882 100%)" },
  ],
  handwerk: [
    // Steel blue & warm brass - Professional craftsman
    { primary: "#4a5568", secondary: "#bfa880", accent: "#e2e8f0", background: "#ffffff", surface: "#f7fafc", text: "#1a202c", textLight: "#718096", gradient: "linear-gradient(135deg, #4a5568 0%, #bfa880 100%)" },
    // Olive & warm gray - Natural, sustainable
    { primary: "#5c6b5c", secondary: "#9a8b7a", accent: "#e8ded4", background: "#faf9f7", surface: "#f0ede8", text: "#2d2c2a", textLight: "#6b6b69", gradient: "linear-gradient(135deg, #5c6b5c 0%, #9a8b7a 100%)" },
  ],
  fitness: [
    // Deep charcoal & soft teal - Modern, sophisticated gym
    { primary: "#2d3748", secondary: "#4a6b6b", accent: "#e2e8f0", background: "#1a202c", surface: "#2d3748", text: "#f7fafc", textLight: "rgba(247,250,252,0.6)", gradient: "linear-gradient(135deg, #2d3748 0%, #4a6b6b 100%)" },
    // Warm slate & sage - Holistic wellness
    { primary: "#4a5568", secondary: "#6b8e6b", accent: "#e8ded4", background: "#ffffff", surface: "#f7fafc", text: "#1a202c", textLight: "#718096", gradient: "linear-gradient(135deg, #4a5568 0%, #6b8e6b 100%)" },
  ],
  medizin: [
    // Clean white & soft blue-gray - Clinical, trustworthy
    { primary: "#64748b", secondary: "#94a3b8", accent: "#e8ded4", background: "#ffffff", surface: "#f8fafc", text: "#334155", textLight: "#64748b", gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" },
    // Soft teal & warm white - Healing, calm
    { primary: "#5a8a8a", secondary: "#8ab5b5", accent: "#e8f4f4", background: "#fafdfd", surface: "#f0f7f7", text: "#2d4a4a", textLight: "#5a7a7a", gradient: "linear-gradient(135deg, #5a8a8a 0%, #8ab5b5 100%)" },
  ],
  immobilien: [
    // Rich navy & warm gold - Premium properties
    { primary: "#1e3a5f", secondary: "#c9a227", accent: "#f5f3f0", background: "#ffffff", surface: "#f8f9fa", text: "#1a1a1a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%)" },
    // Charcoal & copper - Urban modern
    { primary: "#3d3d3d", secondary: "#b87333", accent: "#e8ded4", background: "#faf8f5", surface: "#f5f0e8", text: "#1a1a1a", textLight: "#6b6b6b", gradient: "linear-gradient(135deg, #3d3d3d 0%, #b87333 100%)" },
  ],
  beratung: [
    // Deep navy & warm gray - Professional, trustworthy
    { primary: "#1e3a5f", secondary: "#9a8b7a", accent: "#e8ded4", background: "#faf8f5", surface: "#f5f0e8", text: "#1a1a1a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #1e3a5f 0%, #9a8b7a 100%)" },
    // Charcoal & soft gold - Sophisticated advisory
    { primary: "#3d3d3d", secondary: "#c4a882", accent: "#f5f3f0", background: "#fdfcfb", surface: "#f8f6f3", text: "#1a1a1a", textLight: "#6b6b6b", gradient: "linear-gradient(135deg, #3d3d3d 0%, #c4a882 100%)" },
  ],
  auto: [
    // Deep charcoal & silver - Premium automotive
    { primary: "#2d2d2d", secondary: "#9ca3af", accent: "#e5e7eb", background: "#ffffff", surface: "#f3f4f6", text: "#1a1a1a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #2d2d2d 0%, #9ca3af 100%)" },
    // Navy & soft copper - Classic elegance
    { primary: "#1e3a5f", secondary: "#bfa880", accent: "#f5f3f0", background: "#faf8f5", surface: "#f5f0e8", text: "#1a1a1a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #1e3a5f 0%, #bfa880 100%)" },
  ],
  cafe: [
    // Warm brown & cream - Cozy coffeehouse
    { primary: "#6b4e3d", secondary: "#d4a574", accent: "#f5e6d3", background: "#fff8f0", surface: "#f5e6d3", text: "#3d2c1f", textLight: "#8b6b5a", gradient: "linear-gradient(135deg, #6b4e3d 0%, #d4a574 100%)" },
    // Olive & warm white - Natural, organic cafe
    { primary: "#5c6b5c", secondary: "#9a8b7a", accent: "#e8ded4", background: "#faf9f7", surface: "#f0ede8", text: "#2d2c2a", textLight: "#6b6b69", gradient: "linear-gradient(135deg, #5c6b5c 0%, #9a8b7a 100%)" },
  ],
  hotel: [
    // Rich gold & charcoal - Luxury hospitality
    { primary: "#c9a227", secondary: "#2d2d2d", accent: "#f5f3f0", background: "#fdfcfb", surface: "#f8f6f3", text: "#1a1a1a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #c9a227 0%, #2d2d2d 100%)" },
    // Deep teal & cream - Boutique elegance
    { primary: "#2d4a4a", secondary: "#5a8a8a", accent: "#e8ded4", background: "#fafdfd", surface: "#f0f7f7", text: "#1a2d2d", textLight: "#5a7a7a", gradient: "linear-gradient(135deg, #2d4a4a 0%, #5a8a8a 100%)" },
  ],
  bauunternehmen: [
    // Steel & warm brass - Construction excellence
    { primary: "#4a5568", secondary: "#bfa880", accent: "#e2e8f0", background: "#ffffff", surface: "#f7fafc", text: "#1a202c", textLight: "#718096", gradient: "linear-gradient(135deg, #4a5568 0%, #bfa880 100%)" },
    // Charcoal & copper - Industrial modern
    { primary: "#3d3d3d", secondary: "#b87333", accent: "#e8ded4", background: "#faf8f5", surface: "#f5f0e8", text: "#1a1a1a", textLight: "#6b6b6b", gradient: "linear-gradient(135deg, #3d3d3d 0%, #b87333 100%)" },
  ],
  default: [
    // Classic slate & warm gold - Universal elegance
    { primary: "#475569", secondary: "#bfa880", accent: "#e2e8f0", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #475569 0%, #bfa880 100%)" },
    // Warm gray & soft peach - Friendly professional
    { primary: "#64748b", secondary: "#d4a574", accent: "#f8fafc", background: "#ffffff", surface: "#f1f5f9", text: "#334155", textLight: "#64748b", gradient: "linear-gradient(135deg, #64748b 0%, #d4a574 100%)" },
  ],
};

/**
 * Get gallery images for a given industry category.
 * Re-exported here so the frontend can use it without importing from server/.
 * Uses intelligent matching with priority for longer, more specific keywords.
 */
export function getGalleryImages(category: string, _businessName: string = ""): string[] {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Sortiere Keys nach Priorität: längere/spezifischere Keywords zuerst
  const sortedKeys = Object.keys(INDUSTRY_IMAGES).sort((a, b) => {
    const keywordsA = (INDUSTRY_IMAGES[a] as IndustryImageSet).keywords;
    const keywordsB = (INDUSTRY_IMAGES[b] as IndustryImageSet).keywords;
    // Durchschnittliche Keyword-Länge als Prioritätsmaßstab
    const avgLenA = keywordsA.reduce((sum, kw) => sum + kw.length, 0) / keywordsA.length;
    const avgLenB = keywordsB.reduce((sum, kw) => sum + kw.length, 0) / keywordsB.length;
    return avgLenB - avgLenA; // Längere zuerst
  });
  
  // 1. Versuche: Exaktes Match (category enthält Keyword komplett)
  for (const key of sortedKeys) {
    const kws = (INDUSTRY_IMAGES[key] as IndustryImageSet).keywords;
    // Prüfe ob ein Keyword exakt oder als Wort enthalten ist
    const hasMatch = kws.some((kw: string) => {
      const normalizedKw = kw.toLowerCase();
      // Exakter Match oder als ganzes Wort
      return normalizedCategory === normalizedKw ||
             normalizedCategory.includes(normalizedKw) ||
             normalizedKw.includes(normalizedCategory);
    });
    if (hasMatch) {
      const imageSet = INDUSTRY_IMAGES[key] as IndustryImageSet;
      return imageSet?.gallery || imageSet?.hero?.slice(0, 2) || [];
    }
  }
  
  // Fallback zu default
  const defaultSet = INDUSTRY_IMAGES.default as IndustryImageSet;
  return defaultSet?.gallery || defaultSet?.hero?.slice(0, 2) || [];
}
