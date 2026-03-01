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
    keywords: ["restaurant", "gastro", "gastronomie", "essen", "küche", "speise", "sushi", "burger", "steakhouse", "grill", "wirtshaus", "gasthaus", "food", "imbiss", "steak", "lunch", "mittagstisch", "taverne", "ristorante", "trattoria", "italienisch", "italien", "pizzeria", "pizza", "genuss", "aroma", "lecker", "speisen", "küchenchef", "koch", "tafel", "buffet", "catering", "bistro", "café", "delivery", "lieferservice", "speiselokal", "gasthof", "bewirtung", "essen auf rädern", "mahlzeit", "meal"],
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Pizzeria & Italian ──────────────────────────────
  pizza: {
    keywords: ["pizza", "pizzeria", "pizze", "napoli", "italienisch", "italien", "italian", "pasta", "trattoria", "osteria", "pizzaservice", "ristorante", "italy", "teig", "ofen", "amaro", "amareo", "bella", "mamma", "italy", "basilikum", "mozzarella"],
    hero: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574129624162-fa167303c403?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593504049359-74330189a345?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=1400&q=85&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536935338212-3b6abf17ac42?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527761939622-933c972a0b08?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Café & Bistro ──────────────────────────────────
  cafe: {
    keywords: ["café", "cafe", "bistro", "kaffee", "coffee", "coffeeshop", "bäckerei", "bakery", "konditorei", "patisserie", "brunch", "frühstück"],
    hero: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Hotel & Pension ────────────────────────────────
  hotel: {
    keywords: ["hotel", "pension", "hostel", "unterkunft", "übernachtung", "bed and breakfast", "b&b", "resort", "ferienwohnung", "gästehaus"],
    hero: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Bauunternehmen ─────────────────────────────────
  bauunternehmen: {
    keywords: ["bauunternehmen", "baufirma", "hochbau", "tiefbau", "rohbau", "bauprojekt", "bauträger", "generalunternehmer", "schlüsselfertig", "neubau", "umbau", "anbau"],
    hero: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Handwerk & Bau ─────────────────────────────────
  handwerk: {
    keywords: ["handwerk", "bau", "elektriker", "klempner", "maler", "schreiner", "tischler", "zimmerer", "dachdecker", "sanitär", "heizung", "installation", "craft", "construction", "renovierung", "fliesenleger"],
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
  // ── Beauty & Wellness ──────────────────────────────
  beauty: {
    keywords: ["beauty", "kosmetik", "nails", "spa", "wellness", "massage", "make-up", "hautpflege", "nagelstudio", "wimpern"],
    hero: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Bäckerei ───────────────────────────────────────
  baeckerei: {
    keywords: ["bäckerei", "bakery", "konditorei", "pastry", "kuchen", "brot", "brötchen"],
    hero: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Rechtsanwalt & Beratung ────────────────────────
  beratung: {
    keywords: ["rechtsanwalt", "anwalt", "steuerberater", "beratung", "consulting", "kanzlei", "law", "legal", "finanzen", "versicherung"],
    hero: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505664194779-8bebcec17ca2?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Reinigung & Haushaltsservice ───────────────────
  reinigung: {
    keywords: ["reinigung", "cleaning", "haushaltsservice", "gebäudereinigung", "putzen", "hausmeister"],
    hero: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Auto & KFZ ─────────────────────────────────────
  auto: {
    keywords: ["auto", "kfz", "werkstatt", "autowerkstatt", "reifenservice", "car", "vehicle", "garage", "reparatur"],
    hero: [
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Fotografie ─────────────────────────────────────
  fotografie: {
    keywords: ["fotograf", "photography", "fotostudio", "hochzeitsfotograf", "portrait", "shooting"],
    hero: [
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Blumen & Garten ────────────────────────────────
  garten: {
    keywords: ["blumen", "florist", "garten", "gartenbau", "landschaftsbau", "flower", "garden"],
    hero: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── IT & Tech ──────────────────────────────────────
  tech: {
    keywords: ["it", "software", "tech", "digital", "computer", "web", "app", "entwicklung", "programmierung"],
    hero: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  // ── Default / Generic ──────────────────────────────
  default: {
    keywords: [],
    hero: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&q=85&auto=format&fit=crop",
    ],
  },
};

/**
 * Find the best matching image set for a given industry/category string.
 * Also checks business name for keywords.
 */
export function getIndustryImages(category: string, businessName: string = ""): IndustryImageSet {
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
export function getHeroImageUrl(category: string, businessName: string = ""): string {
  const imageSet = getIndustryImages(category, businessName);
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
export function getGalleryImages(category: string, businessName: string = ""): string[] {
  const imageSet = getIndustryImages(category, businessName);
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
    // 1. Classic Black & Gold (Luxus)
    { primary: "#c9a96e", secondary: "#8b6914", accent: "#1a1a2e", background: "#faf9f7", surface: "#f2ede6", text: "#2c2416", textLight: "#8b7355", gradient: "linear-gradient(135deg, #c9a96e 0%, #8b6914 100%)" },
    // 2. Deep Rose (Modern Feminine)
    { primary: "#c2185b", secondary: "#880e4f", accent: "#fce4ec", background: "#fff8fb", surface: "#fce4ec", text: "#2c0a1a", textLight: "#8b4a6a", gradient: "linear-gradient(135deg, #c2185b 0%, #880e4f 100%)" },
    // 3. Sage Green (Natural/Organic)
    { primary: "#5a7a5a", secondary: "#3d5a3d", accent: "#c9a96e", background: "#f8faf5", surface: "#e8f0e8", text: "#1a2a1a", textLight: "#6a8a6a", gradient: "linear-gradient(135deg, #5a7a5a 0%, #c9a96e 100%)" },
    // 4. Midnight Navy (Sophisticated)
    { primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560", background: "#ffffff", surface: "#f8f5f2", text: "#1a1a2e", textLight: "#6b6b7b", gradient: "linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)" },
    // 5. Warm Terracotta
    { primary: "#b5451b", secondary: "#8b3214", accent: "#f5c842", background: "#fdf8f5", surface: "#f5e8e0", text: "#2c1a10", textLight: "#8b6a5a", gradient: "linear-gradient(135deg, #b5451b 0%, #f5c842 100%)" },
    // 6. Lavender & Cream
    { primary: "#7c5cbf", secondary: "#5a3d9a", accent: "#f5c842", background: "#faf8ff", surface: "#f0eafa", text: "#1e1040", textLight: "#7a6a9a", gradient: "linear-gradient(135deg, #7c5cbf 0%, #5a3d9a 100%)" },
  ],
  restaurant: [
    // 1. Classic Italian Red
    { primary: "#c0392b", secondary: "#922b21", accent: "#f39c12", background: "#fffef8", surface: "#fdf6e3", text: "#2c1810", textLight: "#7d6b5e", gradient: "linear-gradient(135deg, #c0392b 0%, #f39c12 100%)" },
    // 2. Forest Green (Farm-to-Table)
    { primary: "#2d6a4f", secondary: "#1b4332", accent: "#d4a017", background: "#f8faf8", surface: "#e8f5e9", text: "#1b2e1b", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #2d6a4f 0%, #d4a017 100%)" },
    // 3. Dark & Moody (Fine Dining)
    { primary: "#c9a96e", secondary: "#8b6914", accent: "#e94560", background: "#1a1410", surface: "#2a2018", text: "#f5ede0", textLight: "#c9a96e", gradient: "linear-gradient(135deg, #c9a96e 0%, #8b6914 100%)" },
    // 4. Mediterranean Blue
    { primary: "#1565c0", secondary: "#0d47a1", accent: "#ffa726", background: "#f8fbff", surface: "#e3f2fd", text: "#0a1a3a", textLight: "#5a7aaa", gradient: "linear-gradient(135deg, #1565c0 0%, #ffa726 100%)" },
    // 5. Warm Amber (Café/Bistro)
    { primary: "#e65100", secondary: "#bf360c", accent: "#ffd54f", background: "#fffbf5", surface: "#fff3e0", text: "#2c1a00", textLight: "#8b6a40", gradient: "linear-gradient(135deg, #e65100 0%, #ffd54f 100%)" },
    // 6. Slate & Copper
    { primary: "#b87333", secondary: "#8b5a1a", accent: "#37474f", background: "#faf8f5", surface: "#f0ebe0", text: "#2a1e10", textLight: "#8a7060", gradient: "linear-gradient(135deg, #b87333 0%, #37474f 100%)" },
  ],
  pizza: [
    // 1. Italian Heritage (Red, White, Green)
    { primary: "#c0392b", secondary: "#27ae60", accent: "#f39c12", background: "#fffef8", surface: "#fdf6e3", text: "#2c1810", textLight: "#7d6b5e", gradient: "linear-gradient(135deg, #c0392b 0%, #27ae60 100%)" },
    // 2. Warm Oven (Amber & Dark)
    { primary: "#d35400", secondary: "#e67e22", accent: "#2c3e50", background: "#1a1410", surface: "#2a2018", text: "#f5ede0", textLight: "#c9a96e", gradient: "linear-gradient(135deg, #d35400 0%, #e67e22 100%)" },
    // 3. Modern Trattoria (Slate & Gold)
    { primary: "#2c3e50", secondary: "#c9a96e", accent: "#e74c3c", background: "#ffffff", surface: "#f8f9fa", text: "#1a1a2e", textLight: "#7f8c8d", gradient: "linear-gradient(135deg, #2c3e50 0%, #c9a96e 100%)" },
    // 4. Tomato & Basil (Fresh)
    { primary: "#e74c3c", secondary: "#2ecc71", accent: "#f1c40f", background: "#fdfdfb", surface: "#f4f7f4", text: "#2c1a10", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #e74c3c 0%, #2ecc71 100%)" },
  ],
  handwerk: [
    // 1. Industrial Orange
    { primary: "#e67e22", secondary: "#ca6f1e", accent: "#2c3e50", background: "#ffffff", surface: "#fdf8f3", text: "#2c2416", textLight: "#7d6b5e", gradient: "linear-gradient(135deg, #e67e22 0%, #2c3e50 100%)" },
    // 2. Steel Blue (Elektriker/Sanitär)
    { primary: "#1565c0", secondary: "#0d47a1", accent: "#ffa726", background: "#f8fbff", surface: "#e3f2fd", text: "#0a1a3a", textLight: "#5a7aaa", gradient: "linear-gradient(135deg, #1565c0 0%, #ffa726 100%)" },
    // 3. Forest Green (Garten/Landschaft)
    { primary: "#2e7d32", secondary: "#1b5e20", accent: "#ff8f00", background: "#f8faf8", surface: "#e8f5e9", text: "#0a2a0a", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #2e7d32 0%, #ff8f00 100%)" },
    // 4. Dark Charcoal (Premium Handwerk)
    { primary: "#37474f", secondary: "#263238", accent: "#e67e22", background: "#f5f6fa", surface: "#eceff1", text: "#1a2a2e", textLight: "#7a8a8e", gradient: "linear-gradient(135deg, #37474f 0%, #e67e22 100%)" },
    // 5. Red & Black (Dachdecker/Bau)
    { primary: "#c62828", secondary: "#8b0000", accent: "#f5f5f5", background: "#ffffff", surface: "#fafafa", text: "#1a0a0a", textLight: "#8a6a6a", gradient: "linear-gradient(135deg, #c62828 0%, #8b0000 100%)" },
    // 6. Yellow & Black (Warnfarben/Sicherheit)
    { primary: "#f9a825", secondary: "#e65100", accent: "#212121", background: "#fffdf5", surface: "#fff8e1", text: "#1a1200", textLight: "#8a7a40", gradient: "linear-gradient(135deg, #f9a825 0%, #e65100 100%)" },
  ],
  fitness: [
    // 1. Power Red
    { primary: "#e74c3c", secondary: "#c0392b", accent: "#f39c12", background: "#ffffff", surface: "#fdf8f8", text: "#1a0a0a", textLight: "#7d5a5a", gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" },
    // 2. Electric Teal (Modern Gym)
    { primary: "#00bcd4", secondary: "#00838f", accent: "#ff5722", background: "#f0fffe", surface: "#e0f7fa", text: "#002a2e", textLight: "#5a8a8e", gradient: "linear-gradient(135deg, #00bcd4 0%, #ff5722 100%)" },
    // 3. Midnight Black (Premium)
    { primary: "#ff6f00", secondary: "#e65100", accent: "#ffffff", background: "#0a0a0a", surface: "#1a1a1a", text: "#ffffff", textLight: "#aaaaaa", gradient: "linear-gradient(135deg, #ff6f00 0%, #e65100 100%)" },
    // 4. Lime Green (CrossFit/Functional)
    { primary: "#7cb342", secondary: "#558b2f", accent: "#212121", background: "#f8fff5", surface: "#f1f8e9", text: "#1a2a0a", textLight: "#6a8a5a", gradient: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)" },
    // 5. Purple (Yoga/Wellness)
    { primary: "#7b1fa2", secondary: "#4a148c", accent: "#f5c842", background: "#faf5ff", surface: "#f3e5f5", text: "#1a0a2e", textLight: "#7a5a8a", gradient: "linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)" },
    // 6. Navy & Gold (Personal Training)
    { primary: "#1a237e", secondary: "#0d1757", accent: "#ffd600", background: "#f8f9ff", surface: "#e8eaf6", text: "#0a0e2e", textLight: "#5a6aaa", gradient: "linear-gradient(135deg, #1a237e 0%, #ffd600 100%)" },
  ],
  medizin: [
    // 1. Trust Blue
    { primary: "#1565c0", secondary: "#0d47a1", accent: "#27ae60", background: "#f8fbff", surface: "#e3f2fd", text: "#0a1a3a", textLight: "#5a7aaa", gradient: "linear-gradient(135deg, #1565c0 0%, #27ae60 100%)" },
    // 2. Healing Teal
    { primary: "#00695c", secondary: "#004d40", accent: "#1565c0", background: "#f8fffd", surface: "#e0f2f1", text: "#002a24", textLight: "#5a8a80", gradient: "linear-gradient(135deg, #00695c 0%, #1565c0 100%)" },
    // 3. Soft Purple (Psychologie/Therapie)
    { primary: "#6a1b9a", secondary: "#4a148c", accent: "#26c6da", background: "#faf5ff", surface: "#f3e5f5", text: "#1a0a2e", textLight: "#7a5a8a", gradient: "linear-gradient(135deg, #6a1b9a 0%, #26c6da 100%)" },
    // 4. Clean White & Navy
    { primary: "#1a237e", secondary: "#0d1757", accent: "#00bcd4", background: "#ffffff", surface: "#f5f7ff", text: "#0a0e2e", textLight: "#5a6aaa", gradient: "linear-gradient(135deg, #1a237e 0%, #00bcd4 100%)" },
    // 5. Warm Green (Naturheilkunde)
    { primary: "#388e3c", secondary: "#1b5e20", accent: "#ffa726", background: "#f8faf8", surface: "#e8f5e9", text: "#0a2a0a", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #388e3c 0%, #ffa726 100%)" },
  ],
  immobilien: [
    // 1. Prestige Dark
    { primary: "#2c3e50", secondary: "#1a252f", accent: "#c9a96e", background: "#ffffff", surface: "#f5f6fa", text: "#1a1a2e", textLight: "#7f8c8d", gradient: "linear-gradient(135deg, #2c3e50 0%, #c9a96e 100%)" },
    // 2. Modern Purple
    { primary: "#8e44ad", secondary: "#6c3483", accent: "#f39c12", background: "#fdf8ff", surface: "#f5eafb", text: "#1a0a2e", textLight: "#7d5a8a", gradient: "linear-gradient(135deg, #8e44ad 0%, #f39c12 100%)" },
    // 3. Warm Terracotta
    { primary: "#b5451b", secondary: "#8b3214", accent: "#2c3e50", background: "#fdf8f5", surface: "#f5e8e0", text: "#2c1a10", textLight: "#8b6a5a", gradient: "linear-gradient(135deg, #b5451b 0%, #2c3e50 100%)" },
    // 4. Emerald (Luxus)
    { primary: "#1b5e20", secondary: "#0a3a0a", accent: "#c9a96e", background: "#f8faf8", surface: "#e8f5e9", text: "#0a2a0a", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #1b5e20 0%, #c9a96e 100%)" },
  ],
  beratung: [
    // 1. Navy & Gold
    { primary: "#1a3a5c", secondary: "#0f2744", accent: "#c9a96e", background: "#f8faff", surface: "#eef2f8", text: "#0f1e2e", textLight: "#5d7a8a", gradient: "linear-gradient(135deg, #1a3a5c 0%, #c9a96e 100%)" },
    // 2. Charcoal & Teal
    { primary: "#00838f", secondary: "#005662", accent: "#37474f", background: "#f8ffff", surface: "#e0f7fa", text: "#002a2e", textLight: "#5a8a8e", gradient: "linear-gradient(135deg, #00838f 0%, #37474f 100%)" },
    // 3. Deep Burgundy
    { primary: "#6a1b2a", secondary: "#4a0a1a", accent: "#c9a96e", background: "#fdf8fa", surface: "#f5e8ec", text: "#2a0a10", textLight: "#8a5a6a", gradient: "linear-gradient(135deg, #6a1b2a 0%, #c9a96e 100%)" },
  ],
  auto: [
    // 1. Charcoal & Red
    { primary: "#2c3e50", secondary: "#1a252f", accent: "#e74c3c", background: "#f5f6fa", surface: "#ecf0f1", text: "#1a1a2e", textLight: "#7f8c8d", gradient: "linear-gradient(135deg, #2c3e50 0%, #e74c3c 100%)" },
    // 2. Racing Red
    { primary: "#c62828", secondary: "#8b0000", accent: "#212121", background: "#ffffff", surface: "#fafafa", text: "#1a0a0a", textLight: "#8a6a6a", gradient: "linear-gradient(135deg, #c62828 0%, #212121 100%)" },
    // 3. Electric Blue
    { primary: "#1565c0", secondary: "#0d47a1", accent: "#ffa726", background: "#f8fbff", surface: "#e3f2fd", text: "#0a1a3a", textLight: "#5a7aaa", gradient: "linear-gradient(135deg, #1565c0 0%, #ffa726 100%)" },
  ],
  bar: [
    // 1. Dark Burgundy & Brass (Weinbar/Tapas) – warm, dunkel, edel
    { primary: "#8b1a2e", secondary: "#5a0f1e", accent: "#c9a96e", background: "#1a0f0a", surface: "#2a1a12", text: "#f5e8d8", textLight: "#c9a96e", gradient: "linear-gradient(135deg, #8b1a2e 0%, #c9a96e 100%)" },
    // 2. Midnight Black & Copper (Cocktailbar/Lounge)
    { primary: "#b87333", secondary: "#8b5a1a", accent: "#e8c87a", background: "#0a0a0a", surface: "#1a1410", text: "#f0e8d8", textLight: "#b87333", gradient: "linear-gradient(135deg, #b87333 0%, #0a0a0a 100%)" },
    // 3. Deep Slate & Amber (Pub/Kneipe)
    { primary: "#d97706", secondary: "#b45309", accent: "#fbbf24", background: "#1c1a14", surface: "#2a2618", text: "#f5f0e0", textLight: "#d97706", gradient: "linear-gradient(135deg, #d97706 0%, #1c1a14 100%)" },
    // 4. Terracotta & Dark (Tapas/Spanisch)
    { primary: "#c0392b", secondary: "#8b1a10", accent: "#f39c12", background: "#1a0f0a", surface: "#2a1a10", text: "#f5e8d8", textLight: "#e07b3c", gradient: "linear-gradient(135deg, #c0392b 0%, #f39c12 100%)" },
  ],
  cafe: [
    // 1. Espresso & Cream (Klassisches Café)
    { primary: "#5d3a1a", secondary: "#3e2010", accent: "#d4a843", background: "#fdf8f0", surface: "#f5ece0", text: "#2a1a0a", textLight: "#8a6a4a", gradient: "linear-gradient(135deg, #5d3a1a 0%, #d4a843 100%)" },
    // 2. Dusty Rose & Mocha (Modernes Café/Brunch)
    { primary: "#a0522d", secondary: "#7a3a1a", accent: "#e8c4a0", background: "#fdf5f0", surface: "#f5e8dc", text: "#2a1a10", textLight: "#8a6a5a", gradient: "linear-gradient(135deg, #a0522d 0%, #e8c4a0 100%)" },
    // 3. Forest & Cream (Bio-Café)
    { primary: "#4a7c59", secondary: "#2d5a3a", accent: "#d4a843", background: "#f8faf5", surface: "#e8f0e8", text: "#1a2a1a", textLight: "#5a7a5a", gradient: "linear-gradient(135deg, #4a7c59 0%, #d4a843 100%)" },
    // 4. Warm Slate & Caramel (Bäckerei)
    { primary: "#c8860a", secondary: "#9a6208", accent: "#5d3a1a", background: "#fffbf5", surface: "#fff3e0", text: "#2a1a00", textLight: "#8a6a30", gradient: "linear-gradient(135deg, #c8860a 0%, #5d3a1a 100%)" },
  ],
  hotel: [
    // 1. Midnight Navy & Gold (Luxushotel)
    { primary: "#1a3a5c", secondary: "#0f2744", accent: "#c9a96e", background: "#0f1e2e", surface: "#1a2e44", text: "#f5ede0", textLight: "#c9a96e", gradient: "linear-gradient(135deg, #1a3a5c 0%, #c9a96e 100%)" },
    // 2. Champagne & Ivory (Boutique Hotel)
    { primary: "#c9a96e", secondary: "#8b6914", accent: "#1a3a5c", background: "#fdfaf5", surface: "#f5ede0", text: "#2a1e10", textLight: "#8a7050", gradient: "linear-gradient(135deg, #c9a96e 0%, #1a3a5c 100%)" },
    // 3. Forest & Linen (Landhotel/Pension)
    { primary: "#3d6b4f", secondary: "#2a4d38", accent: "#d4a843", background: "#faf8f3", surface: "#eef0e8", text: "#1a2a1a", textLight: "#6a8a6a", gradient: "linear-gradient(135deg, #3d6b4f 0%, #d4a843 100%)" },
    // 4. Warm Terracotta & Cream (Mediterranes Hotel)
    { primary: "#b5451b", secondary: "#8b3214", accent: "#c9a96e", background: "#fdf8f5", surface: "#f5e8e0", text: "#2c1a10", textLight: "#8b6a5a", gradient: "linear-gradient(135deg, #b5451b 0%, #c9a96e 100%)" },
  ],
  bauunternehmen: [
    // 1. Industrial Anthracite & Orange (Bauunternehmen)
    { primary: "#e67e22", secondary: "#ca6f1e", accent: "#37474f", background: "#f5f5f5", surface: "#eeeeee", text: "#1a1a1a", textLight: "#666666", gradient: "linear-gradient(135deg, #e67e22 0%, #37474f 100%)" },
    // 2. Dark Charcoal & Safety Yellow (Hochbau)
    { primary: "#f9a825", secondary: "#f57f17", accent: "#263238", background: "#1c1c1c", surface: "#2a2a2a", text: "#f5f5f5", textLight: "#aaaaaa", gradient: "linear-gradient(135deg, #f9a825 0%, #263238 100%)" },
    // 3. Steel Blue & Orange (Tiefbau/Infrastruktur)
    { primary: "#1565c0", secondary: "#0d47a1", accent: "#e67e22", background: "#f8fbff", surface: "#e3f2fd", text: "#0a1a3a", textLight: "#5a7aaa", gradient: "linear-gradient(135deg, #1565c0 0%, #e67e22 100%)" },
    // 4. Concrete Grey & Red (Rohbau/Abbruch)
    { primary: "#c62828", secondary: "#8b0000", accent: "#455a64", background: "#f5f5f5", surface: "#eceff1", text: "#1a1a1a", textLight: "#7a8a8e", gradient: "linear-gradient(135deg, #c62828 0%, #455a64 100%)" },
  ],
  default: [
    { primary: "#3b82f6", secondary: "#1d4ed8", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
    { primary: "#7c3aed", secondary: "#5b21b6", accent: "#f59e0b", background: "#faf8ff", surface: "#f3f0ff", text: "#1e1b4b", textLight: "#6d6a8a", gradient: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" },
    { primary: "#059669", secondary: "#047857", accent: "#f59e0b", background: "#f8fffc", surface: "#ecfdf5", text: "#0a2a1e", textLight: "#5a7a6a", gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
    { primary: "#dc2626", secondary: "#991b1b", accent: "#f59e0b", background: "#ffffff", surface: "#fef2f2", text: "#1a0a0a", textLight: "#8a6a6a", gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" },
    { primary: "#0891b2", secondary: "#0e7490", accent: "#f59e0b", background: "#f8ffff", surface: "#ecfeff", text: "#0a2a2e", textLight: "#5a8a8e", gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" },
    { primary: "#d97706", secondary: "#b45309", accent: "#1e3a5f", background: "#fffbf5", surface: "#fef3c7", text: "#2a1a00", textLight: "#8a7040", gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" },
    { primary: "#be185d", secondary: "#9d174d", accent: "#f59e0b", background: "#fff8fb", surface: "#fce7f3", text: "#2a0a1a", textLight: "#8a5a7a", gradient: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)" },
  ],
};

/**
 * Get a color scheme for a given industry, with variety based on a seed.
 */
export function getIndustryColorScheme(category: string, businessName: string = ""): ColorScheme {
  const combined = `${category} ${businessName}`.toLowerCase();
  let schemes: ColorScheme[] | undefined;
  for (const [key, colors] of Object.entries(INDUSTRY_COLORS)) {
    if (key === "default") continue;
    const imageSet = INDUSTRY_IMAGES[key];
    if (imageSet?.keywords.some(kw => combined.includes(kw))) {
      schemes = colors;
      break;
    }
  }
  if (!schemes) schemes = INDUSTRY_COLORS.default;
  // Use a stronger hash that mixes multiple characters for better distribution
  // This ensures two similar business names get different colors
  let h1 = 0x9e3779b9, h2 = 0x6c62272e;
  const seed = businessName || category || "default";
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x9e3779b9);
    h2 = Math.imul(h2 ^ c, 0x517cc1b7);
    h1 = (h1 << 13) | (h1 >>> 19);
    h2 = (h2 << 7) | (h2 >>> 25);
  }
  const hash = Math.abs(h1 ^ h2);
  return schemes[hash % schemes.length];
}

/**
 * Get a layout style for a given industry.
 * Different industries get different visual layouts.
 */
export function getLayoutStyle(category: string, businessName: string = ""): string {
  const combined = `${category} ${businessName}`.toLowerCase();

  /**
   * Industry → Layout Pool mapping.
   * Each industry maps to 2-4 structurally different layouts.
   * The businessName (seed) deterministically picks one from the pool,
   * ensuring maximum variance within the same industry.
   */
  const POOLS: Array<{ test: (s: string) => boolean; pool: string[] }> = [
    // Hair & Beauty (DE + EN GMB categories)
    {
      test: (s) => /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading|esthetician|eyebrow|eyelash|skincare|skin care|facial|pedicure|manicure|hairdresser|hairstylist/.test(s),
      pool: ["elegant", "fresh", "luxury"],
    },
    // Restaurant, Café, Food (DE + EN)
    {
      test: (s) => /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|burger|gastronomie|bakery|patisserie|coffee.?shop|coffee house|diner|steakhouse|seafood|italian|chinese|japanese|thai|mexican|indian|greek|french|american|fast.?food|takeout|takeaway|deli|sandwich|brunch|breakfast|lunch|dinner|delivery|lieferservice|mahlzeit/.test(s),
      pool: ["warm", "fresh", "modern"],
    },
    // Construction, Trades (DE + EN)
    {
      test: (s) => /handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|roofing|plumber|plumbing|carpenter|carpentry|painter|painting|construction|renovation|installation|tischler|fliesenleger|electrician|electrical|hvac|heating|cooling|air.?condition|masonry|concrete|drywall|flooring|tile|insulation|waterproof|window|door|fence|deck|patio|siding|gutter|handyman|remodel/.test(s),
      pool: ["bold", "trust", "modern"],  // dark bold | light professional | minimal
    },
    // Automotive (DE + EN)
    {
      test: (s) => /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire|auto.?repair|auto.?body|auto.?service|car.?wash|car.?dealer|dealership|transmission|oil.?change|brake|exhaust|collision|towing|used.?car|new.?car/.test(s),
      pool: ["luxury", "craft", "clean"],  // dark luxury | dark craft | light clean
    },
    // Fitness & Sport (DE + EN)
    {
      test: (s) => /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance|athletic|athletics|swimming|pool|tennis|golf|cycling|running|triathlon|weightlifting|zumba|barre|bootcamp|spin|hiit|stretch|flexibility|wellness.?center/.test(s),
      pool: ["vibrant", "dynamic", "fresh"],  // dark vibrant | dark dynamic | light fresh
    },
    // Medical & Health (DE + EN)
    {
      test: (s) => /arzt|zahnarzt|medizin|doctor|dental|dentist|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker|physician|surgeon|orthopedic|pediatric|gynecolog|dermatolog|ophthalmolog|optometrist|optician|audiolog|cardiolog|neurolog|psychiatr|psycholog|therapist|counselor|mental.?health|urgent.?care|emergency|laboratory|lab|radiology|physical.?therapy|occupational|speech|dietitian|nutritionist|acupuncture|naturopath/.test(s),
      pool: ["trust", "clean", "natural"],  // light trust | light clean | warm natural
    },
    // Legal, Finance, Consulting (DE + EN)
    {
      test: (s) => /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|accounting|tax|finanz|wirtschaft|unternehmensberatung|notariat|immobilien|makler|real.?estate|attorney|lawyer|notary|financial|finance|insurance|investment|mortgage|bank|credit|audit|bookkeeping|cpa|advisor|wealth|asset|property.?management|business.?consulting/.test(s),
      pool: ["trust", "luxury", "modern"],  // light trust | dark luxury | minimal modern
    },
    // Organic, Eco, Garden, Landscaping (DE + EN)
    {
      test: (s) => /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable|landscaping|landscape|lawn|mowing|tree|arborist|nursery|greenhouse|horticulture|irrigation|outdoor|yard|groundskeeping/.test(s),
      pool: ["natural", "warm", "fresh"],  // light natural | warm earthy | fresh airy
    },
    // Pest Control, Cleaning, Facility (DE + EN)
    {
      test: (s) => /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving|janitorial|maid|housekeeping|carpet.?clean|window.?clean|pressure.?wash|power.?wash|disinfect|sanitiz|exterminator|termite|rodent|storage|self.?storage/.test(s),
      pool: ["bold", "trust", "clean"],  // dark bold | light trust | minimal clean
    },
    // Tech, Agency, Digital, Creative (DE + EN)
    {
      test: (s) => /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup|photographer|photography|videograph|video.?production|graphic|print|signage|advertising|pr.?agency|social.?media|seo|branding|copywriting|content/.test(s),
      pool: ["modern", "dynamic", "vibrant"],  // minimal modern | dark dynamic | vibrant
    },
    // Education, Coaching (DE + EN)
    {
      test: (s) => /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung|driving.?school|music.?school|art.?school|language|childcare|daycare|preschool|kindergarten|montessori|after.?school|college|university/.test(s),
      pool: ["trust", "fresh", "natural"],  // light trust | fresh airy | warm natural
    },
    // Hotel, Tourism, Events (DE + EN)
    {
      test: (s) => /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel|tour|resort|motel|bed.?and.?breakfast|b&b|vacation|rental|venue|banquet|conference|catering.?event|entertainment|nightclub|bar|lounge|brewery|winery|distillery/.test(s),
      pool: ["luxury", "warm", "elegant"],  // dark luxury | warm earthy | light elegant
    },
  ];

  // Find matching pool
  let pool: string[] = ["clean", "modern", "trust", "fresh"];
  for (let i = 0; i < POOLS.length; i++) {
    if (POOLS[i].test(combined)) {
      pool = POOLS[i].pool;
      break;
    }
  }

  // Deterministic hash of businessName → pick from pool
  let hash = 0;
  const s = businessName || category || "default";
  for (let i = 0; i < s.length; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

/**
 * Returns the layout pool and industry key for a category.
 */
export function getLayoutPool(category: string, businessName: string = ""): { pool: string[]; industryKey: string } {
  const combined = `${category} ${businessName}`.toLowerCase();
  const POOLS_SIMPLE = [
    { test: (s: string) => /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading|esthetician|eyebrow|eyelash|skincare|skin care|facial|pedicure|manicure|hairdresser|hairstylist/.test(s), pool: ["elegant", "fresh", "luxury"], key: "beauty" },
    { test: (s: string) => /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|burger|gastronomie|bakery|patisserie|coffee.?shop|coffee house|diner|steakhouse|seafood|italian|chinese|japanese|thai|mexican|indian|greek|french|american|fast.?food|takeout|takeaway|deli|sandwich|brunch|breakfast|lunch|dinner|delivery|lieferservice|mahlzeit/.test(s), pool: ["warm", "fresh", "modern"], key: "food" },
    { test: (s: string) => /handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|roofing|plumber|plumbing|carpenter|carpentry|painter|painting|construction|renovation|installation|tischler|fliesenleger|electrician|electrical|hvac|heating|cooling|air.?condition|masonry|concrete|drywall|flooring|tile|insulation|waterproof|window|door|fence|deck|patio|siding|gutter|handyman|remodel/.test(s), pool: ["bold", "trust", "modern"], key: "construction" },
    { test: (s: string) => /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire|auto.?repair|auto.?body|auto.?service|car.?wash|car.?dealer|dealership|transmission|oil.?change|brake|exhaust|collision|towing|used.?car|new.?car/.test(s), pool: ["luxury", "craft", "clean"], key: "automotive" },
    { test: (s: string) => /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance|athletic|athletics|swimming|pool|tennis|golf|cycling|running|triathlon|weightlifting|zumba|barre|bootcamp|spin|hiit|stretch|flexibility|wellness.?center/.test(s), pool: ["vibrant", "dynamic", "fresh"], key: "fitness" },
    { test: (s: string) => /arzt|zahnarzt|medizin|doctor|dental|dentist|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker|physician|surgeon|orthopedic|pediatric|gynecolog|dermatolog|ophthalmolog|optometrist|optician|audiolog|cardiolog|neurolog|psychiatr|psycholog|therapist|counselor|mental.?health|urgent.?care|emergency|laboratory|lab|radiology|physical.?therapy|occupational|speech|dietitian|nutritionist|acupuncture|naturopath/.test(s), pool: ["trust", "clean", "natural"], key: "medical" },
    { test: (s: string) => /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|accounting|tax|finanz|wirtschaft|unternehmensberatung|notariat|immobilien|makler|real.?estate|attorney|lawyer|notary|financial|finance|insurance|investment|mortgage|bank|credit|audit|bookkeeping|cpa|advisor|wealth|asset|property.?management|business.?consulting/.test(s), pool: ["trust", "luxury", "modern"], key: "legal" },
    { test: (s: string) => /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable|landscaping|landscape|lawn|mowing|tree|arborist|nursery|greenhouse|horticulture|irrigation|outdoor|yard|groundskeeping/.test(s), pool: ["natural", "warm", "fresh"], key: "nature" },
    { test: (s: string) => /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving|janitorial|maid|housekeeping|carpet.?clean|window.?clean|pressure.?wash|power.?wash|disinfect|sanitiz|exterminator|termite|rodent|storage|self.?storage/.test(s), pool: ["bold", "trust", "clean"], key: "cleaning" },
    { test: (s: string) => /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup|photographer|photography|videograph|video.?production|graphic|print|signage|advertising|pr.?agency|social.?media|seo|branding|copywriting|content/.test(s), pool: ["modern", "dynamic", "vibrant"], key: "tech" },
    { test: (s: string) => /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung|driving.?school|music.?school|art.?school|language|childcare|daycare|preschool|kindergarten|montessori|after.?school|college|university/.test(s), pool: ["trust", "fresh", "natural"], key: "education" },
    { test: (s: string) => /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel|tour|resort|motel|bed.?and.?breakfast|b&b|vacation|rental|venue|banquet|conference|catering.?event|entertainment|nightclub|bar|lounge|brewery|winery|distillery/.test(s), pool: ["luxury", "warm", "elegant"], key: "hospitality" },
  ];
  for (const entry of POOLS_SIMPLE) {
    if (entry.test(combined)) return { pool: entry.pool, industryKey: entry.key };
  }
  return { pool: ["clean", "modern", "trust", "fresh"], industryKey: "general" };
}
