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
  // ── Default / Neutral Fallback ─────────────────────
  default: {
    keywords: [],
    hero: [
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1400&q=80&auto=format&fit=crop", // Minimalist Gradient Blue/Purple
      "https://images.unsplash.com/photo-1554147090-e1221a04a025?w=1400&q=80&auto=format&fit=crop", // Abstract Soft White Texture
      "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1400&q=80&auto=format&fit=crop", // Soft Studio Light
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1400&q=80&auto=format&fit=crop", // Minimalist Architecture Detail
      "https://images.unsplash.com/photo-1518655061766-48c238e0ff2e?w=1400&q=80&auto=format&fit=crop", // Clean Minimal Surface
    ],
    gallery: [
      "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80&auto=format&fit=crop",
    ]
  },
};

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
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  gradient: string;
  onPrimary: string;
  onSecondary: string;
  onAccent: string;
  onSurface: string;
  onBackground: string;
}

/**
 * Calculates the best contrast color (black or white) for a given background hex color.
 */
export function getContrastColor(hexColor: string): string {
  if (!hexColor || typeof hexColor !== "string") return "#ffffff";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) return "#ffffff";
  
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  
  // YIQ formula for perceived brightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  // High-End State of the Art: Instead of pure black/white, use very dark/light shades
  // for better aesthetics and readability. 
  // Lower threshold (145 instead of 128) makes it switch to white earlier,
  // preventing dark text on medium-dark backgrounds.
  return yiq >= 145 ? "#0f172a" : "#f8fafc";
}

const INDUSTRY_COLORS: Record<string, Omit<ColorScheme, "onPrimary" | "onSecondary" | "onAccent" | "onSurface" | "onBackground">[]> = {
  friseur: [
    // 1. Classic Black & Gold (Luxus) - Sophisticated & High-End
    { primary: "#bfa37e", secondary: "#1a1a1a", accent: "#f2f2f2", background: "#ffffff", surface: "#faf9f6", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #bfa37e 0%, #1a1a1a 100%)" },
    // 2. Muted Rose (Modern Feminine)
    { primary: "#a67c8e", secondary: "#4a3b42", accent: "#fdf2f8", background: "#fffbfc", surface: "#fceef5", text: "#2d2428", textLight: "#8b737d", gradient: "linear-gradient(135deg, #a67c8e 0%, #4a3b42 100%)" },
    // 3. Sage Green & Sand (Natural/Organic)
    { primary: "#7d8c7d", secondary: "#4a5d4a", accent: "#d4b996", background: "#f9faf8", surface: "#edf0ed", text: "#1e291e", textLight: "#647464", gradient: "linear-gradient(135deg, #7d8c7d 0%, #d4b996 100%)" },
  ],
  restaurant: [
    // 1. Fine Dining (Navy & Gold)
    { primary: "#1e293b", secondary: "#b3966a", accent: "#f8fafc", background: "#ffffff", surface: "#f1f5f9", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #1e293b 0%, #b3966a 100%)" },
    // 2. Warm Bistro (Terracotta & Slate)
    { primary: "#9a3412", secondary: "#334155", accent: "#fbbf24", background: "#fffcfb", surface: "#fef2f2", text: "#1e1b1b", textLight: "#71717a", gradient: "linear-gradient(135deg, #9a3412 0%, #334155 100%)" },
    // 3. Contemporary (Charcoal & Olive)
    { primary: "#3f4234", secondary: "#1c1c1c", accent: "#a67c8e", background: "#ffffff", surface: "#f5f5f4", text: "#1c1917", textLight: "#78716c", gradient: "linear-gradient(135deg, #3f4234 0%, #1c1c1c 100%)" },
  ],
  pizza: [
    // 1. Modern Italian (Tomato & Basil) - Muted, not loud
    { primary: "#991b1b", secondary: "#166534", accent: "#f59e0b", background: "#fffcf5", surface: "#fef9c3", text: "#450a0a", textLight: "#7f1d1d", gradient: "linear-gradient(135deg, #991b1b 0%, #166534 100%)" },
    // 2. Rustic Stone (Deep Coal & Wood)
    { primary: "#7c2d12", secondary: "#1a1a1a", accent: "#d97706", background: "#fafaf9", surface: "#f5f5f4", text: "#1c1917", textLight: "#78716c", gradient: "linear-gradient(135deg, #7c2d12 0%, #1a1a1a 100%)" },
  ],
  handwerk: [
    // 1. Industrial Slate & Gold
    { primary: "#334155", secondary: "#b45309", accent: "#f8fafc", background: "#ffffff", surface: "#f1f5f9", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #334155 0%, #b45309 100%)" },
    // 2. Forest Green & Earth (Natural)
    { primary: "#166534", secondary: "#451a03", accent: "#f59e0b", background: "#fcfdfc", surface: "#f0fdf4", text: "#064e3b", textLight: "#374151", gradient: "linear-gradient(135deg, #166534 0%, #f59e0b 100%)" },
    // 3. Deep Sea Blue (Professional)
    { primary: "#1e3a8a", secondary: "#1e40af", accent: "#fbbf24", background: "#ffffff", surface: "#eff6ff", text: "#1e3a8a", textLight: "#60a5fa", gradient: "linear-gradient(135deg, #1e3a8a 0%, #fbbf24 100%)" },
  ],
  fitness: [
    // 1. High-Performance Black & Neon Green (Sophisticated Neon)
    { primary: "#bef264", secondary: "#0a0a0a", accent: "#ffffff", background: "#050505", surface: "#121212", text: "#ffffff", textLight: "rgba(255,255,255,0.6)", gradient: "linear-gradient(135deg, #bef264 0%, #0a0a0a 100%)" },
    // 2. Electric Blue & Graphite
    { primary: "#38bdf8", secondary: "#1e293b", accent: "#ffffff", background: "#0f172a", surface: "#1e293b", text: "#f8fafc", textLight: "#94a3b8", gradient: "linear-gradient(135deg, #38bdf8 0%, #1e293b 100%)" },
  ],
  medizin: [
    // 1. Clinical Clean (Light Blue & White)
    { primary: "#0ea5e9", secondary: "#0369a1", accent: "#10b981", background: "#ffffff", surface: "#f0f9ff", text: "#0c4a6e", textLight: "#075985", gradient: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)" },
    // 2. Holistic Green (Soft Sage)
    { primary: "#10b981", secondary: "#065f46", accent: "#3b82f6", background: "#fcfdfd", surface: "#f0fdfa", text: "#064e3b", textLight: "#0f766e", gradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" },
  ],
  immobilien: [
    // 1. Prestige Navy
    { primary: "#0f172a", secondary: "#334155", accent: "#b3966a", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #0f172a 0%, #b3966a 100%)" },
    // 2. Modern Terracotta
    { primary: "#9a3412", secondary: "#431407", accent: "#1e293b", background: "#fffcfb", surface: "#fef2f2", text: "#431407", textLight: "#71717a", gradient: "linear-gradient(135deg, #9a3412 0%, #1e293b 100%)" },
  ],
  beratung: [
    // 1. Professional Deep Teal
    { primary: "#0d9488", secondary: "#0f172a", accent: "#f59e0b", background: "#ffffff", surface: "#f0fdfa", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #0d9488 0%, #0f172a 100%)" },
    // 2. Global Trust Blue
    { primary: "#1e40af", secondary: "#1e1b4b", accent: "#f59e0b", background: "#ffffff", surface: "#eff6ff", text: "#1e1b4b", textLight: "#64748b", gradient: "linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)" },
  ],
  auto: [
    // 1. Racing Charcoal
    { primary: "#18181b", secondary: "#dc2626", accent: "#ffffff", background: "#ffffff", surface: "#f4f4f5", text: "#18181b", textLight: "#71717a", gradient: "linear-gradient(135deg, #18181b 0%, #dc2626 100%)" },
    // 2. High-Tech Silver & Blue
    { primary: "#3b82f6", secondary: "#0f172a", accent: "#ffffff", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)" },
  ],
  bar: [
    // 1. Speakeasy (Deep Gold & Black)
    { primary: "#a16207", secondary: "#0a0a0a", accent: "#fef3c7", background: "#050505", surface: "#121212", text: "#f8fafc", textLight: "#a1a1aa", gradient: "linear-gradient(135deg, #a16207 0%, #0a0a0a 100%)" },
    // 2. Velvet Lounge (Deep Plum & Brass)
    { primary: "#4c1d95", secondary: "#0a0a0a", accent: "#b3966a", background: "#050505", surface: "#0f0f17", text: "#f8fafc", textLight: "#94a3b8", gradient: "linear-gradient(135deg, #4c1d95 0%, #b3966a 100%)" },
  ],
  cafe: [
    // 1. Modern Brew (Espresso & Cream)
    { primary: "#451a03", secondary: "#78350f", accent: "#fef3c7", background: "#fffcf5", surface: "#fef9e7", text: "#451a03", textLight: "#92400e", gradient: "linear-gradient(135deg, #451a03 0%, #fef3c7 100%)" },
    // 2. Urban Matcha (Soft Green & Slate)
    { primary: "#166534", secondary: "#334155", accent: "#dcfce7", background: "#ffffff", surface: "#f0fdf4", text: "#064e3b", textLight: "#475569", gradient: "linear-gradient(135deg, #166534 0%, #334155 100%)" },
  ],
  hotel: [
    // 1. Luxury Suite (Gold & Midnight)
    { primary: "#b3966a", secondary: "#0f172a", accent: "#f8fafc", background: "#ffffff", surface: "#f9fafb", text: "#0f172a", textLight: "#6b7280", gradient: "linear-gradient(135deg, #b3966a 0%, #0f172a 100%)" },
    // 2. Modern Resort (Teal & Sand)
    { primary: "#0d9488", secondary: "#7c2d12", accent: "#f1f5f9", background: "#ffffff", surface: "#f0fdfa", text: "#115e59", textLight: "#4b5563", gradient: "linear-gradient(135deg, #0d9488 0%, #7c2d12 100%)" },
  ],
  bauunternehmen: [
    // 1. Modern Construct (Slate & Orange)
    { primary: "#f97316", secondary: "#1e293b", accent: "#ffffff", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #f97316 0%, #1e293b 100%)" },
    // 2. Heavy Industry (Anthracite & Yellow)
    { primary: "#eab308", secondary: "#18181b", accent: "#ffffff", background: "#0a0a0a", surface: "#18181b", text: "#ffffff", textLight: "rgba(255,255,255,0.6)", gradient: "linear-gradient(135deg, #eab308 0%, #18181b 100%)" },
  ],
  default: [
    { primary: "#2563eb", secondary: "#1e3a8a", accent: "#f59e0b", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textLight: "#64748b", gradient: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)" },
    { primary: "#7c3aed", secondary: "#4c1d95", accent: "#f59e0b", background: "#ffffff", surface: "#f5f3ff", text: "#1e1b4b", textLight: "#6d6a8a", gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" },
    { primary: "#10b981", secondary: "#065f46", accent: "#f59e0b", background: "#ffffff", surface: "#f0fdf4", text: "#064e3b", textLight: "#374151", gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)" },
  ],
};

/**
 * Get a color scheme for a given industry, with variety based on a seed.
 */
export function getIndustryColorScheme(category: string, businessName: string = "", industryKey?: string): ColorScheme {
  const combined = `${category} ${businessName}`.toLowerCase();
  type PartialScheme = Omit<ColorScheme, "onPrimary" | "onSecondary" | "onAccent" | "onSurface" | "onBackground">;
  let schemes: PartialScheme[] | undefined;

  // Use explicit industryKey if provided
  if (industryKey && INDUSTRY_COLORS[industryKey]) {
    schemes = INDUSTRY_COLORS[industryKey] as PartialScheme[];
  } else {
    for (const [key, colors] of Object.entries(INDUSTRY_COLORS)) {
      if (key === "default") continue;
      const imageSet = INDUSTRY_IMAGES[key];
      if (imageSet?.keywords.some(kw => combined.includes(kw))) {
        schemes = colors as PartialScheme[];
        break;
      }
    }
  }
  if (!schemes) schemes = INDUSTRY_COLORS.default as PartialScheme[];
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
  const scheme = (schemes as PartialScheme[])[hash % schemes.length];

  // Dynamically calculate "on" contrast colors
  return {
    ...scheme,
    onPrimary: getContrastColor(scheme.primary),
    onSecondary: getContrastColor(scheme.secondary),
    onAccent: getContrastColor(scheme.accent),
    onSurface: getContrastColor(scheme.surface),
    onBackground: getContrastColor(scheme.background),
  };
}

/**
 * Get a layout style for a given industry.
 * Different industries get different visual layouts.
 */
export function getLayoutStyle(category: string, businessName: string = "", industryKey?: string): string {
  const combined = `${category} ${businessName}`.toLowerCase();

  // Mapping of industryKey to pool
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
    medizin: ["trust", "clean", "natural"],
    immobilien: ["trust", "luxury", "modern"],
    baeckerei: ["warm", "fresh", "modern"],
    beratung: ["trust", "luxury", "modern"],
    reinigung: ["bold", "trust", "clean"],
    auto: ["luxury", "craft", "clean"],
    fotografie: ["modern", "dynamic", "vibrant"],
    garten: ["natural", "warm", "fresh"],
    tech: ["modern", "dynamic", "vibrant"],
  };

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
  
  if (industryKey && KEY_TO_POOL[industryKey]) {
    pool = KEY_TO_POOL[industryKey];
  } else {
    for (let i = 0; i < POOLS.length; i++) {
      if (POOLS[i].test(combined)) {
        pool = POOLS[i].pool;
        break;
      }
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
export function getLayoutPool(category: string, businessName: string = "", explicitIndustryKey?: string): { pool: string[]; industryKey: string } {
  if (explicitIndustryKey) {
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
      medizin: ["trust", "clean", "natural"],
      immobilien: ["trust", "luxury", "modern"],
      baeckerei: ["warm", "fresh", "modern"],
      beratung: ["trust", "luxury", "modern"],
      reinigung: ["bold", "trust", "clean"],
      auto: ["luxury", "craft", "clean"],
      fotografie: ["modern", "dynamic", "vibrant"],
      garten: ["natural", "warm", "fresh"],
      tech: ["modern", "dynamic", "vibrant"],
    };
    if (KEY_TO_POOL[explicitIndustryKey]) {
      return { pool: KEY_TO_POOL[explicitIndustryKey], industryKey: explicitIndustryKey };
    }
  }

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
