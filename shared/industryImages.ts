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

export const INDUSTRY_COLORS: Record<string, any[]> = {
  friseur: [
    { primary: "#bfa37e", secondary: "#1a1a1a", accent: "#f2f2f2", background: "#ffffff", surface: "#faf9f6", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #bfa37e 0%, #1a1a1a 100%)" },
    { primary: "#a67c8e", secondary: "#4a3b42", accent: "#fdf2f8", background: "#fffbfc", surface: "#fceef5", text: "#2d2428", textLight: "#8b737d", gradient: "linear-gradient(135deg, #a67c8e 0%, #4a3b42 100%)" },
    { primary: "#7d8c7d", secondary: "#4a5d4a", accent: "#d4b996", background: "#f9faf8", surface: "#edf0ed", text: "#1e291e", textLight: "#647464", gradient: "linear-gradient(135deg, #7d8c7d 0%, #d4b996 100%)" },
  ],
  restaurant: [
    { primary: "#1e293b", secondary: "#b3966a", accent: "#f8fafc", background: "#ffffff", surface: "#f1f5f9", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #1e293b 0%, #b3966a 100%)" },
    { primary: "#9a3412", secondary: "#334155", accent: "#fbbf24", background: "#fffcfb", surface: "#fef2f2", text: "#1e1b1b", textLight: "#71717a", gradient: "linear-gradient(135deg, #9a3412 0%, #334155 100%)" },
    { primary: "#3f4234", secondary: "#1c1c1c", accent: "#a67c8e", background: "#ffffff", surface: "#f5f5f4", text: "#1c1917", textLight: "#78716c", gradient: "linear-gradient(135deg, #3f4234 0%, #1c1c1c 100%)" },
  ],
  pizza: [
    { primary: "#991b1b", secondary: "#166534", accent: "#f59e0b", background: "#fffcf5", surface: "#fef9c3", text: "#450a0a", textLight: "#7f1d1d", gradient: "linear-gradient(135deg, #991b1b 0%, #166534 100%)" },
    { primary: "#7c2d12", secondary: "#1a1a1a", accent: "#d97706", background: "#fafaf9", surface: "#f5f5f4", text: "#1c1917", textLight: "#78716c", gradient: "linear-gradient(135deg, #7c2d12 0%, #1a1a1a 100%)" },
  ],
  handwerk: [
    { primary: "#334155", secondary: "#b45309", accent: "#f8fafc", background: "#ffffff", surface: "#f1f5f9", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #334155 0%, #b45309 100%)" },
    { primary: "#166534", secondary: "#451a03", accent: "#f59e0b", background: "#fcfdfc", surface: "#f0fdf4", text: "#064e3b", textLight: "#374151", gradient: "linear-gradient(135deg, #166534 0%, #f59e0b 100%)" },
    { primary: "#1e3a8a", secondary: "#1e40af", accent: "#fbbf24", background: "#ffffff", surface: "#eff6ff", text: "#1e3a8a", textLight: "#60a5fa", gradient: "linear-gradient(135deg, #1e3a8a 0%, #fbbf24 100%)" },
  ],
  fitness: [
    { primary: "#bef264", secondary: "#0a0a0a", accent: "#ffffff", background: "#050505", surface: "#121212", text: "#ffffff", textLight: "rgba(255,255,255,0.6)", gradient: "linear-gradient(135deg, #bef264 0%, #0a0a0a 100%)" },
    { primary: "#38bdf8", secondary: "#1e293b", accent: "#ffffff", background: "#0f172a", surface: "#1e293b", text: "#f8fafc", textLight: "#94a3b8", gradient: "linear-gradient(135deg, #38bdf8 0%, #1e293b 100%)" },
  ],
  medizin: [
    { primary: "#0ea5e9", secondary: "#0369a1", accent: "#10b981", background: "#ffffff", surface: "#f0f9ff", text: "#0c4a6e", textLight: "#075985", gradient: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)" },
    { primary: "#10b981", secondary: "#065f46", accent: "#3b82f6", background: "#fcfdfd", surface: "#f0fdfa", text: "#064e3b", textLight: "#0f766e", gradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" },
  ],
  immobilien: [
    { primary: "#0f172a", secondary: "#334155", accent: "#b3966a", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #0f172a 0%, #b3966a 100%)" },
    { primary: "#9a3412", secondary: "#431407", accent: "#1e293b", background: "#fffcfb", surface: "#fef2f2", text: "#431407", textLight: "#71717a", gradient: "linear-gradient(135deg, #9a3412 0%, #1e293b 100%)" },
  ],
  beratung: [
    { primary: "#0d9488", secondary: "#0f172a", accent: "#f59e0b", background: "#ffffff", surface: "#f0fdfa", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #0d9488 0%, #0f172a 100%)" },
    { primary: "#1e40af", secondary: "#1e1b4b", accent: "#f59e0b", background: "#ffffff", surface: "#eff6ff", text: "#1e1b4b", textLight: "#64748b", gradient: "linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)" },
  ],
  auto: [
    { primary: "#18181b", secondary: "#dc2626", accent: "#ffffff", background: "#ffffff", surface: "#f4f4f5", text: "#18181b", textLight: "#71717a", gradient: "linear-gradient(135deg, #18181b 0%, #dc2626 100%)" },
    { primary: "#3b82f6", secondary: "#0f172a", accent: "#ffffff", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)" },
  ],
  cafe: [
    { primary: "#451a03", secondary: "#78350f", accent: "#fef3c7", background: "#fffcf5", surface: "#fef9e7", text: "#451a03", textLight: "#92400e", gradient: "linear-gradient(135deg, #451a03 0%, #fef3c7 100%)" },
    { primary: "#166534", secondary: "#334155", accent: "#dcfce7", background: "#ffffff", surface: "#f0fdf4", text: "#064e3b", textLight: "#475569", gradient: "linear-gradient(135deg, #166534 0%, #334155 100%)" },
  ],
  hotel: [
    { primary: "#b3966a", secondary: "#0f172a", accent: "#f8fafc", background: "#ffffff", surface: "#f9fafb", text: "#0f172a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #b3966a 0%, #0f172a 100%)" },
    { primary: "#0d9488", secondary: "#7c2d12", accent: "#f1f5f9", background: "#ffffff", surface: "#f0fdfa", text: "#115e59", textLight: "#4b5563", gradient: "linear-gradient(135deg, #0d9488 0%, #7c2d12 100%)" },
  ],
  bauunternehmen: [
    { primary: "#f97316", secondary: "#1e293b", accent: "#ffffff", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #f97316 0%, #1e293b 100%)" },
    { primary: "#eab308", secondary: "#18181b", accent: "#ffffff", background: "#0a0a0a", surface: "#18181b", text: "#ffffff", textLight: "rgba(255,255,255,0.6)", gradient: "linear-gradient(135deg, #eab308 0%, #18181b 100%)" },
  ],
  default: [
    { primary: "#2563eb", secondary: "#1e3a8a", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)" },
    { primary: "#7c3aed", secondary: "#4c1d95", accent: "#f59e0b", background: "#ffffff", surface: "#f5f3ff", text: "#1e1b4b", textLight: "#6d6a8a", gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" },
    { primary: "#10b981", secondary: "#065f46", accent: "#f59e0b", background: "#ffffff", surface: "#f0fdf4", text: "#064e3b", textLight: "#374151", gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)" },
  ],
};

/**
 * Get gallery images for a given industry category.
 * Re-exported here so the frontend can use it without importing from server/.
 */
export function getGalleryImages(category: string, _businessName: string = ""): string[] {
  const key = Object.keys(INDUSTRY_IMAGES).find((k) => {
    const kws = (INDUSTRY_IMAGES[k] as IndustryImageSet).keywords;
    return kws.some((kw: string) => category.toLowerCase().includes(kw));
  }) || "default";
  const imageSet = INDUSTRY_IMAGES[key] as IndustryImageSet;
  return imageSet?.gallery || imageSet?.hero?.slice(0, 2) || [];
}
