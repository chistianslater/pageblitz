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
    keywords: [
      "friseur",
      "hair",
      "salon",
      "barber",
      "beauty",
      "hairdresser",
      "coiffeur",
      "frisör",
      "hairstylist",
      "nail",
      "lash",
      "brow",
      "manicure",
      "pedicure",
    ],
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
    keywords: [
      "restaurant",
      "gastro",
      "gastronomie",
      "essen",
      "küche",
      "speise",
      "sushi",
      "burger",
      "steakhouse",
      "grill",
      "wirtshaus",
      "gasthaus",
      "food",
      "imbiss",
      "steak",
      "lunch",
      "mittagstisch",
      "taverne",
      "ristorante",
      "trattoria",
      "italienisch",
      "italien",
      "pizzeria",
      "pizza",
      "genuss",
      "aroma",
      "lecker",
      "speisen",
      "küchenchef",
      "koch",
      "tafel",
      "buffet",
      "catering",
      "bistro",
      "delivery",
      "lieferservice",
      "speiselokal",
      "gasthof",
      "bewirtung",
      "essen auf rädern",
      "mahlzeit",
      "meal",
    ],
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=1400&q=85&auto=format&fit=crop",
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

  // ── Café & Coffee ──────────────────────────────────
  cafe: {
    keywords: [
      "café",
      "cafe",
      "kaffee",
      "kaffeehaus",
      "kaffeebar",
      "coffeeshop",
      "coffee shop",
      "kaffeerösterei",
      "rösterei",
      "barista",
      "espresso",
      "espressobar",
      "cappuccino",
    ],
    hero: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Pizzeria & Italian ──────────────────────────────
  pizza: {
    keywords: [
      "pizza",
      "pizzeria",
      "pizze",
      "napoli",
      "italian",
      "pasta",
      "osteria",
      "pizzaservice",
      "italy",
      "basilikum",
      "mozzarella",
    ],
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
    keywords: [
      "bar",
      "tapas",
      "cocktail",
      "lounge",
      "pub",
      "kneipe",
      "weinbar",
      "wein",
      "bier",
      "brauerei",
      "brewery",
      "nightlife",
      "nachtleben",
      "aperitivo",
      "tapasbar",
    ],
    hero: [
      "https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527761939622-933c972a0b08?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Bauunternehmen & Handwerk ───────────────────────
  handwerk: {
    keywords: [
      "handwerk",
      "bau",
      "elektriker",
      "klempner",
      "maler",
      "schreiner",
      "tischler",
      "zimmerer",
      "dachdecker",
      "sanitär",
      "heizung",
      "installation",
      "craft",
      "construction",
      "renovierung",
      "fliesenleger",
      "bauunternehmen",
      "baufirma",
      "hochbau",
      "tiefbau",
      "rohbau",
    ],
    hero: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622674529-47cadf5f1eeb?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622674529-47cadf5f1eeb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Fitness & Sport ────────────────────────────────
  fitness: {
    keywords: [
      "fitness",
      "gym",
      "sport",
      "training",
      "yoga",
      "pilates",
      "crossfit",
      "personal trainer",
      "gesundheit",
    ],
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

  // ── Rechtsanwalt & Kanzlei ─────────────────────────
  // NOTE: Dedicated legal images – no longer mixed with medical
  legal: {
    keywords: [
      "rechtsanwalt",
      "anwalt",
      "kanzlei",
      "law",
      "legal",
      "attorney",
      "lawyer",
      "steuerberater",
      "notar",
      "notariat",
      "anwaltskanzlei",
      "rechtsbüro",
      "steuerberatung",
      "steuerrecht",
      "kanzleiname",
    ],
    hero: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Medizin & Gesundheit ───────────────────────────
  // NOTE: Keywords strictly medical only – legal terms moved to `legal` category
  medizin: {
    keywords: [
      "arzt",
      "zahnarzt",
      "praxis",
      "medizin",
      "gesundheit",
      "klinik",
      "physiotherapie",
      "therapie",
      "apotheke",
      "doctor",
      "dental",
      "medical",
      "heilpraktiker",
      "osteopath",
      "chiropractor",
      "orthopäde",
      "gynäkologie",
      "kardiologie",
      "neurologie",
      "psychiatrie",
      "psychologie",
      "dermatologie",
    ],
    hero: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Unternehmensberatung & Consulting ──────────────
  beratung: {
    keywords: [
      "unternehmensberatung",
      "consulting",
      "management consulting",
      "business consulting",
      "beratung",
      "strategie",
      "unternehmensberater",
      "wirtschaftsberatung",
      "versicherung",
      "finanzberatung",
      "finanz",
    ],
    hero: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Immobilien ─────────────────────────────────────
  immobilien: {
    keywords: [
      "immobilien",
      "makler",
      "real estate",
      "wohnung",
      "haus",
      "miete",
      "kauf",
      "property",
    ],
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

  // ── Auto & Kfz ─────────────────────────────────────
  automotive: {
    keywords: [
      "auto",
      "kfz",
      "car",
      "garage",
      "werkstatt",
      "mechanic",
      "karosserie",
      "tuning",
      "fahrzeug",
      "vehicle",
      "motorrad",
      "motorcycle",
      "reifenservice",
      "autowerkstatt",
      "kfz-werkstatt",
    ],
    hero: [
      "https://images.unsplash.com/photo-1487622914050-2dcc6b9995cc?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1537984822441-cff330075342?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1487622914050-2dcc6b9995cc?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1537984822441-cff330075342?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Tech & Digital ─────────────────────────────────
  tech: {
    keywords: [
      "tech",
      "software",
      "digital",
      "agency",
      "agentur",
      "web",
      "app",
      "it",
      "computer",
      "marketing",
      "design",
      "media",
      "kreativ",
      "startup",
      "developer",
      "programm",
      "it-beratung",
      "webdesign",
      "webentwicklung",
      "app-entwicklung",
    ],
    hero: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Garten & Natur ─────────────────────────────────
  nature: {
    keywords: [
      "garten",
      "garden",
      "florist",
      "blumen",
      "flower",
      "pflanze",
      "plant",
      "bio",
      "organic",
      "öko",
      "eco",
      "natur",
      "nachhaltig",
      "sustainable",
      "landscaping",
      "landscape",
      "lawn",
      "baumschule",
      "gärtnerei",
      "gartengestaltung",
      "gartenarbeit",
    ],
    hero: [
      "https://images.unsplash.com/photo-1466781783364-f716f4a00f30?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Bildung & Coaching ─────────────────────────────
  education: {
    keywords: [
      "schule",
      "school",
      "bildung",
      "education",
      "coaching",
      "coach",
      "nachhilfe",
      "tutor",
      "kurs",
      "course",
      "akademie",
      "academy",
      "seminar",
      "workshop",
      "weiterbildung",
      "training",
      "fahrschule",
      "musikschule",
      "sprachschule",
      "kinderbetreuung",
    ],
    hero: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510531704581-5b2870972060?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510531704581-5b2870972060?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Hotel & Gastgewerbe ────────────────────────────
  hospitality: {
    keywords: [
      "hotel",
      "pension",
      "hostel",
      "airbnb",
      "unterkunft",
      "accommodation",
      "resort",
      "motel",
      "bed and breakfast",
      "boutique hotel",
      "gasthof",
      "herberge",
    ],
    hero: [
      "https://images.unsplash.com/photo-1582719471537-41efb92911d3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1582719471537-41efb92911d3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80&auto=format&fit=crop",
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
    ],
  },
};

/**
 * Get gallery images for a given industry category.
 * Re-exported here so the frontend can use it without importing from server/.
 * Uses intelligent matching with priority for longer, more specific keywords.
 */
export function getGalleryImages(
  category: string,
  _businessName: string = ""
): string[] {
  const normalizedCategory = category.toLowerCase().trim();

  // Sortiere Keys nach Priorität: längere/spezifischere Keywords zuerst
  const sortedKeys = Object.keys(INDUSTRY_IMAGES).sort((a, b) => {
    const keywordsA = (INDUSTRY_IMAGES[a] as IndustryImageSet).keywords;
    const keywordsB = (INDUSTRY_IMAGES[b] as IndustryImageSet).keywords;
    // Durchschnittliche Keyword-Länge als Prioritätsmaßstab
    const avgLenA =
      keywordsA.length > 0
        ? keywordsA.reduce((sum, kw) => sum + kw.length, 0) / keywordsA.length
        : 0;
    const avgLenB =
      keywordsB.length > 0
        ? keywordsB.reduce((sum, kw) => sum + kw.length, 0) / keywordsB.length
        : 0;
    return avgLenB - avgLenA; // Längere zuerst
  });

  // 1. Versuche: Exaktes Match (category enthält Keyword komplett)
  for (const key of sortedKeys) {
    const kws = (INDUSTRY_IMAGES[key] as IndustryImageSet).keywords;
    // Prüfe ob ein Keyword exakt oder als Wort enthalten ist
    const hasMatch = kws.some((kw: string) => {
      const normalizedKw = kw.toLowerCase();
      // Exakter Match oder als ganzes Wort
      return (
        normalizedCategory === normalizedKw ||
        normalizedCategory.includes(normalizedKw) ||
        normalizedKw.includes(normalizedCategory)
      );
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

// ── Client-seitige Hilfsfunktionen für Kaskaden-Updates ─────────────────────

/**
 * Findet das passende IndustryImageSet für eine Kategorie (client-seitig nutzbar).
 * Interne Hilfsfunktion – nicht exportiert.
 */
function resolveImageSet(
  category: string,
  businessName: string = ""
): IndustryImageSet {
  const normalizedCombined = `${category} ${businessName}`.toLowerCase().trim();

  // Sortiere nach Priorität: längere/spezifischere Keywords zuerst
  const sortedKeys = Object.keys(INDUSTRY_IMAGES).sort((a, b) => {
    const kA = (INDUSTRY_IMAGES[a] as IndustryImageSet).keywords;
    const kB = (INDUSTRY_IMAGES[b] as IndustryImageSet).keywords;
    const avgA =
      kA.length > 0 ? kA.reduce((s, k) => s + k.length, 0) / kA.length : 0;
    const avgB =
      kB.length > 0 ? kB.reduce((s, k) => s + k.length, 0) / kB.length : 0;
    return avgB - avgA;
  });

  for (const key of sortedKeys) {
    const kws = (INDUSTRY_IMAGES[key] as IndustryImageSet).keywords;
    if (
      kws.some((kw: string) => {
        const n = kw.toLowerCase();
        return (
          normalizedCombined === n ||
          normalizedCombined.includes(n) ||
          n.includes(normalizedCombined)
        );
      })
    ) {
      return INDUSTRY_IMAGES[key] as IndustryImageSet;
    }
  }

  return INDUSTRY_IMAGES.default as IndustryImageSet;
}

/**
 * Gibt eine deterministische Hero-Bild-URL für eine Branche zurück (client-seitig).
 * Gleiche Logik wie die Server-Version in server/industryImages.ts.
 */
export function getHeroImageUrl(
  category: string,
  businessName: string = ""
): string {
  const imageSet = resolveImageSet(category, businessName);
  const heroes = imageSet.hero;
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash << 5) - hash + businessName.charCodeAt(i);
    hash |= 0;
  }
  return heroes[Math.abs(hash) % heroes.length];
}
