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
  /**
   * Allgemeinere Gruppen (KI-Schlüssel aus classifyIndustry), die dieser
   * Satz verfeinert: Sagt die KI „handwerk", die Kategorie aber
   * „Schreinerei", gewinnt der genauere Satz.
   */
  refines?: string[];
  /**
   * Schwache Stichworte („Takeaway", „Fast Food"): zählen nur, wenn die
   * Kategorie keinen Satz mit einem normalen Stichwort trifft — und beim
   * Verfeinern nur, wenn die Kategorie den allgemeinen Satz nicht selbst
   * trifft („Restaurant & Takeaway" bleibt Restaurant).
   */
  weakKeywords?: string[];
  /**
   * Verfeinert nur, wenn die Kategorie diesen Satz mindestens so lang trifft
   * wie den allgemeinen Satz selbst (Klar K1: Praxis-Satz mit „arzt" darf
   * „Tierarzt" nicht aus „medizin" holen). Gesundheitssätze und Pension
   * („Hundepension" bleibt beim Hotel-Satz).
   */
  strictRefine?: boolean;
  /**
   * Schlagworte, die nur als ganzes Wort zählen, egal wie lang (Freundlich
   * F1: „kita" steckt in „Nikita"). Zählen wie normale Schlagworte.
   */
  wholeWords?: string[];
  /**
   * Ganze Wörter, die nur in der KATEGORIE zählen, nie im Namen (Review F1:
   * „Krippe" ist Kita nur als Kategorie — nicht „Zur Krippe" (Gaststätte),
   * nicht „Kinderhaus Mode").
   */
  categoryWords?: string[];
  /**
   * Sperrwörter (ganze Wörter) in der Kategorie: Dann zählt der Satz gar
   * nicht („adult day care", „ice cream equipment supplier").
   */
  blockers?: string[];
  /**
   * Abend- und Dunkelmotive (Nacht N1): Gastraum am Abend, angerichteter
   * Teller auf dunklem Grund, Weinregal/Bar, Salon mit warmem Licht,
   * Boutique-Zimmer mit Lampenlicht. Nur für Systeme mit dunklem Papier —
   * Zuordnung, Hero, Über-uns und Galerie (buildStockFallbackImages) lesen
   * die Liste nicht, helle Systeme bleiben unverändert.
   */
  evening?: string[];
}

// Map of industry keywords → curated Unsplash photo IDs
export const INDUSTRY_IMAGES: Record<string, IndustryImageSet> = {
  // ── Hair & Beauty ──────────────────────────────────
  friseur: {
    keywords: [
      "friseur",
      "hair",
      "salon",
      // „barber"/„barbier": eigener Satz `barbier` (2026-10-12, Plakat P1).
      "beauty",
      "hairdresser",
      "coiffeur",
      "frisör",
      "hairstylist",
      // Nagelstudio: eigener Satz `nagelstudio` (2026-10-18).
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
    // Abendmotive (Nacht N1): Salon mit warmem bzw. gedämpftem Licht, Hochsteckfrisur, Föhn am Platz, Haar auf Schwarz.
    // Im Browser gesichtet, HTTP 200 (2026-10-12).
    evening: [
      "https://images.unsplash.com/photo-1773904215697-e6c21fc27ac2?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1790009419857-51fa0a2d9354?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1672788694268-ecc234591d31?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1637777292536-27a13272dbea?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620939391250-eb822ac0818a?w=1400&q=85&auto=format&fit=crop",
    ],
  },

  // ── Barbier & Barbershop (2026-10-12, Plakat P1) ───────────────
  // Barbershop-Raum, Bartschnitt, Fade, Barbierstuhl. Vorher landete
  // „Barbier" beim Friseur-Satz (Salon-Fotos mit Damen) — Barbiere bekommen
  // jetzt in allen Designs Barbershop-Fotos. „barber"/„barbier" stehen nur
  // noch hier; ein Friseursalon mit „Barber" im Namen bleibt beim Friseur,
  // weil die Kategorie schwerer wiegt.
  barbier: {
    keywords: [
      "barbier",
      "barber",
      "barbershop",
      "barber shop",
      "barbiersalon",
      "herrenfriseur",
      "bartpflege",
      "bartschnitt",
      "nassrasur",
    ],
    refines: ["friseur"],
    hero: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1672257493626-038f96997ade?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1599011176306-4a96f1516d4d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582771498000-8ad44e6c84db?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621645582931-d1d3e6564943?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?w=800&q=80&auto=format&fit=crop",
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
      // „imbiss": eigener Satz `imbiss` (2026-10-12, Plakat P1).
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
      "bewirtung",
      "essen auf rädern",
      "mahlzeit",
      "meal",
    ],
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
    ],
    // Abendmotive (Nacht N1): Gastraum abends, Weinkeller-Tisch, angerichtete Teller auf dunklem Grund, Gedeck am Fenster.
    // Im Browser gesichtet, HTTP 200 (2026-10-12).
    evening: [
      "https://images.unsplash.com/photo-1552960226-639240203497?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609238000857-303bf54099b1?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1709548145082-04d0cde481d4?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1695555438641-7ccdace35d78?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547478267-54ce493dd7d6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469234496837-d0101f54be3e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621494268492-d01b98eba7e4?w=1400&q=85&auto=format&fit=crop",
    ],
  },

  // ── Imbiss, Döner & Kebab (2026-10-12, Plakat P1) ───────────────
  // Dönerspieß, Dürüm, Wraps mit Pommes, Grill. „Grill" allein und
  // „Grillrestaurant" bleiben beim Restaurant, Pizza beim bisherigen Satz.
  // Komposita („Döner Kebab Restaurant") brauchen das lange Stichwort,
  // sonst gewinnt „restaurant" als längerer Treffer.
  imbiss: {
    keywords: [
      "imbiss",
      "schnellimbiss",
      "döner",
      "doener",
      "doner",
      "döner kebab",
      "doner kebab",
      "doener kebab",
      "kebab restaurant",
      "kebap",
      "kebab",
      "dürüm",
      "dürum",
      "durum",
      "lahmacun",
      // „Gyros"/„Falafel" allein heißen oft Restaurant — nur als Imbiss.
      "gyros imbiss",
      "falafel imbiss",
      "shawarma",
      "currywurst",
      "pommesbude",
      "frittenbude",
      "snackbar",
    ],
    weakKeywords: ["takeaway", "take away", "fast food", "fastfood"],
    refines: ["restaurant"],
    hero: [
      "https://images.unsplash.com/photo-1596995804697-27d11d43652e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1778866677043-6f7871cdbec8?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1773514294087-b93f864866a5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1699728088614-7d1d4277414b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1773620494884-940e0db95e46?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1653379557259-48a725b08460?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1593504049359-74330189a345?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80&auto=format&fit=crop",
    ],
    // Abendmotive (Nacht N1): Bar mit warmem Licht, Weinregal, Kerzen und Flasche, Gläser.
    // Im Browser gesichtet, HTTP 200 (2026-10-12).
    evening: [
      "https://images.unsplash.com/photo-1693520016313-e129d398a467?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580929753530-ef52238116c5?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581291641156-1f2e1da8db6f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758827926633-621fb8694e6e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610065333275-b3e5c63fc872?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1723309765458-611f53ab39c0?w=1400&q=85&auto=format&fit=crop",
    ],
  },

  // ── Bauunternehmen & Handwerk ───────────────────────
  handwerk: {
    keywords: [
      "handwerk",
      "bau",
      "elektriker",
      // Klempner, Sanitär, Heizung: eigener Satz `sanitaer` (2026-10-18).
      // Schreiner/Tischler: eigener Satz `schreinerei` (2026-10-11),
      // Maler: eigener Satz `maler` (2026-10-18).
      "zimmerer",
      "dachdecker",
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
    // Fensterputzerin entfernt (2026-10-07): stand bei jeder Schreinerei
    // ohne eigene Fotos im Einstieg.
    hero: [
      "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595814432314-90095f342694?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop",
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
      // Yoga, Pilates: eigene Sätze (2026-10-18).
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
  // Seit Klar K1 haben Zahnarzt, Physio und Arztpraxis eigene Sätze (unten).
  // Tierarzt, Heilpraktiker, Psychotherapie und Apotheke bleiben bewusst hier;
  // ihre langen Stichworte schlagen „arzt"/„praxis" des Praxis-Satzes
  // (längster Treffer gewinnt: „Tierarztpraxis" ⊃ „arztpraxis").
  medizin: {
    keywords: [
      "medizin",
      "gesundheit",
      "klinik",
      "krankenhaus",
      "therapie",
      // Apotheke: eigener Satz `apotheke` (2026-10-18).
      "medical",
      "heilpraktiker",
      "naturheil",
      "orthopäde",
      "gynäkologie",
      "kardiologie",
      "neurologie",
      "psychiatrie",
      "psychologie",
      "psycholog",
      "psychotherap",
      "dermatologie",
    ],
    hero: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Zahnarzt & Kieferorthopädie (2026-10-12, Klar K1) ──────────
  // Moderne Behandlungsräume, Zahnärzte am Patienten, Röntgenbild — kein
  // Mund in Großaufnahme. Alle Motive im Browser gesichtet, HTTP 200.
  zahnarzt: {
    keywords: [
      "zahnarzt",
      // schlägt „arztpraxis" des Praxis-Satzes
      "zahnarztpraxis",
      "zahnärzt",
      "zahnmedizin",
      "zahnklinik",
      "zahnheilkunde",
      "kieferorthopäd",
      "kieferorthopädie",
      "kfo",
      "oralchirurg",
      "implantologie",
      "dental",
      "dentist",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1728342057953-94bfad8f0e7e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1662837625421-5fd8ed6131a0?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1643660526741-094639fbe53a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1704455306251-b4634215d98f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1662837625427-970713d74aa6?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1663755489920-5e09f66d011a?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Physiotherapie & Ergotherapie (2026-10-12, Klar K1) ─────────
  // Behandlung auf der Liege, Übungen mit Therapeutin, Gangschule,
  // Praxisraum. Keine Wellness-Massage: „Massage" allein bleibt neutral.
  physio: {
    keywords: [
      "physiotherapie",
      "physiotherapeut",
      "physio",
      "krankengymnastik",
      // Ergotherapie: eigener Satz `ergotherapie` (2026-10-18).
      "manuelle therapie",
      "massagepraxis",
      "medizinische massage",
      "osteopath",
      "chiropraktik",
      "chiropractor",
      "rehazentrum",
      "rehabilitation",
      "physical therap",
      "physiotherapy",
    ],
    refines: ["medizin", "fitness"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1706353399656-210cca727a33?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1630226040750-d934f017f0e4?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1709880754472-be89c13abc52?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1770012905139-713758ded6ec?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1645005512968-0c1fe99f0093?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1645005513713-9e2b92a687d3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1768507423533-b87b62769758?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1645005512964-5057008b4425?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Arztpraxis & Allgemeinmedizin (2026-10-12, Klar K1) ─────────
  // Ärztin/Arzt im Gespräch, Sprechzimmer, Wartebereich — keine
  // Blutdruck-Klischees. Psychotherapie bleibt bei „medizin", Tierarzt hat
  // seit Freundlich F1 einen eigenen Satz (`tierarzt`).
  praxis: {
    keywords: [
      // Kein nacktes „praxis“ (Nacht N0): Fußpflege-, Logopädie-, Hebammen-,
      // Kosmetik- und Tattoo-„Praxen“ bekamen sonst Arztpraxis-Fotos.
      "arzt",
      "ärztin",
      "ärzte",
      "arztpraxis",
      "ärztehaus",
      "hausarzt",
      "hausärztin",
      "allgemeinmedizin",
      "allgemeinarzt",
      "allgemeinärztin",
      "facharzt",
      "fachärztin",
      "internist",
      "innere medizin",
      "kinderarzt",
      "kinderärztin",
      "gemeinschaftspraxis",
      "versorgungszentrum",
      "mvz",
      "doctor",
      "general practitioner",
      "family doctor",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1758691461935-202e2ef6b69f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217871099-88310a909a32?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1629909614456-6b1c5c94cecc?w=800&q=80&auto=format&fit=crop",
      // Wandschild mit Bandzitat ersetzt (2026-10-18): Blutdruckmessung.
      "https://images.unsplash.com/photo-1758691462123-8a17ae95d203?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589279003513-467d320f47eb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1771574204208-b47e2d863bc5?w=800&q=80&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1537984822441-cff330075342?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
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
      "tutor",
      "kurs",
      "course",
      "akademie",
      "academy",
      "seminar",
      "workshop",
      "weiterbildung",
      "training",
      // Fahrschule: eigener Satz `fahrschule` (2026-10-18).
      "sprachschule",
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
      "hostel",
      "airbnb",
      "unterkunft",
      "accommodation",
      "resort",
      "motel",
      "bed and breakfast",
      "boutique hotel",
      "boutique-hotel",
      "hotel garni",
      "boardinghouse",
      "boarding house",
      "lodging",
      "herberge",
      "ferienhof",
      // Tierpensionen behalten diesen Satz (wie vor dem Pension-Satz): das
      // längere Wort schlägt „pension" im Satz `pension`.
      "hundepension",
      "hunde pension",
      "tierpension",
      "tier pension",
      "katzenpension",
      "katzen pension",
      "pferdepension",
      "pferde pension",
    ],
    hero: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80&auto=format&fit=crop",
    ],
    // Abendmotive (Nacht N1): Boutique-Zimmer mit Lampenlicht, dunkle Wände, Schreibtisch am Abend.
    // Im Browser gesichtet, HTTP 200 (2026-10-12).
    evening: [
      "https://images.unsplash.com/photo-1645619179966-1647b5591f80?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1711059985570-4c32ed12a12c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1701725047112-ecfe6c4f0cad?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1740047957758-24c66b4468e4?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1783014619882-0e9ee99f0a20?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1780126752257-cae35f118114?w=1400&q=85&auto=format&fit=crop",
    ],
  },

  // ── Pension, Gasthof, Ferienwohnung (2026-10-12) ───────────────
  // Einfache Unterkunft statt Resort-/Poolhotel: helle Gästezimmer,
  // Frühstück, Gaststube, Gasthaus-Fassade mit Geranien, Holzflur, Dorf und
  // Landschaft. Keine Pools, kein Spa, kein Luxus. Alle Motive gesichtet und
  // per HTTP 200 geprüft. Verfeinert „hospitality" (KI-Schlüssel „hotel"):
  // Hotel, Hostel, Resort und Ferienhof bleiben dort.
  pension: {
    keywords: [
      "pension",
      "gasthof",
      "gästehaus",
      "gaestehaus",
      "ferienwohnung",
      "ferienzimmer",
      "fremdenzimmer",
      "gästezimmer",
      "gaestezimmer",
      "zimmervermietung",
      "privatzimmer",
    ],
    refines: ["hospitality"],
    // Verfeinert nur, wenn „pension" mindestens so lang trifft wie der
    // Hotel-Satz selbst: KI „hotel" + „Hundepension" bleibt beim Hotel-Satz.
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1565089849244-55f033575bb6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1775744244614-beb197cfac53?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1773225630750-a7dc5e70ea82?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1766431066492-9bec8410a57b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1759139445627-5ce9d5fac8f9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1754597302822-4b96f3442d3f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1704283735270-f973e7e9c14e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1788032008128-23291ef60c78?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1649056325447-72874fa7db56?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635542927159-5d4ec69068b1?w=800&q=80&auto=format&fit=crop",
    ],
    // Abendmotive (Nacht): warme Gaststube, Gasthaus und Hütten in der
    // Dämmerung bzw. bei Nacht. Gesichtet, HTTP 200 (2026-10-12).
    evening: [
      "https://images.unsplash.com/photo-1714733340805-268e89cf861a?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1645450433868-6509200515ec?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1789466190150-16cfde9c0ab6?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1736317855552-d7db0552c8fd?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1657215223750-c4988d4a2635?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1767729606859-7228b96c4c40?w=1400&q=85&auto=format&fit=crop",
    ],
  },

  // ── Bäckerei & Konditorei (2026-10-11, Werkstoff W1) ───────────
  // Alle Motive im Browser gesichtet (Brot, Gebäck, Bäcker am Ofen) und
  // per HTTP 200 geprüft. Schlüssel = KI-Schlüssel aus classifyIndustry.
  baeckerei: {
    keywords: [
      "bäckerei",
      "baeckerei",
      "bäcker",
      "baecker",
      "backstube",
      "backhaus",
      "backwaren",
      "konditorei",
      "konditor",
      "bakery",
      "brötchen",
    ],
    refines: ["cafe"],
    hero: [
      "https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1789152952858-2b2270419149?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1515182629504-727d7753751f?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534432182912-63863115e106?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1597528662465-55ece5734101?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1711672284661-bd70e38f31b2?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Schreinerei & Tischlerei (2026-10-11, Werkstoff W1) ────────
  // Werkstatt, Hände am Hobel, Anreißen, Stemmeisen, Schleifen.
  schreinerei: {
    keywords: [
      "schreinerei",
      "schreiner",
      "tischlerei",
      "tischler",
      "möbelbau",
      "möbeltischler",
      "holzwerkstatt",
      "ladenbau",
      "drechsler",
      "carpenter",
      "carpentry",
      "joinery",
      "woodworking",
    ],
    refines: ["handwerk"],
    hero: [
      "https://images.unsplash.com/photo-1687422810663-c316494f725a?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631396326838-de37e5f8bcbc?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547609434-b732edfee020?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1659930087003-2d64e33181f7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497219055242-93359eeed651?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497218770144-3fea6dbc33fe?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1642006953665-4046190641ee?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1683115096447-5d01c11d3ead?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544164560-adac3045edb2?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Maler (2026-10-18) ─────────────────────────────
  // Wände, Fassaden, Farbfächer — vorher Baustellenfotos aus `handwerk`.
  maler: {
    keywords: [
      "maler",
      "malerbetrieb",
      "malermeister",
      "lackierer",
      "anstreicher",
      "tapezierer",
      "raumausstatter",
      "painter",
      "painting contractor",
    ],
    refines: ["handwerk"],
    hero: [
      "https://images.unsplash.com/photo-1688372198189-de6a51777a81?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1742900280861-32bed068938b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622250544703-997d69d856e3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1693985120993-e9b203ce7631?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1768839725085-829e6ac7ac26?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Garten- und Landschaftsbau (2026-10-18) ────────
  // Terrassen, Rasen, Pflanzarbeit. Die Gärtnerei (Pflanzenverkauf) bleibt
  // bei `nature` — „gärtnerei" ist dort das längere Stichwort.
  gaertner: {
    keywords: [
      "gärtner",
      "landschaftsgärtner",
      "landschaftsbau",
      "galabau",
      "gartenpflege",
      "gartenbau",
      "baumpflege",
      "landscaper",
      "gardener",
    ],
    refines: ["nature", "handwerk"],
    hero: [
      "https://images.unsplash.com/photo-1734079692147-c6fc9438a2d0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1686663048931-6df69f577a2f?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1734079692079-aae7e24a7035?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1734303023491-db8037a21f09?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1738193830098-2d92352a1856?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Nagelstudio (2026-10-18) ──────────────────────
  // Maniküre am Tisch, Lackregal, fertige Nägel.
  nagelstudio: {
    keywords: [
      "nagelstudio",
      "nageldesign",
      "nagelpflege",
      "maniküre",
      "pediküre",
      "nail salon",
      "nail studio",
      "nails",
      "manicure",
    ],
    refines: ["friseur"],
    hero: [
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619607146034-5a05296c8f9a?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1634449862841-8c6e970117e5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612887390768-fb02affea7a6?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1769687209448-025548dfca8b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Sanitär & Heizung (2026-10-18) ────────────────
  // Rohre, Bad, Heizungskeller — vorher Baustellenfotos aus `handwerk`.
  sanitaer: {
    keywords: [
      "klempner",
      "sanitär",
      "heizung",
      "sanitärinstallation",
      "heizungsinstallation",
      "heizungsbau",
      "installateur",
      "badsanierung",
      "plumber",
      "plumbing",
    ],
    refines: ["handwerk"],
    hero: [
      "https://images.unsplash.com/photo-1676210134188-4c05dd172f89?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1749532125405-70950966b0e5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620653713380-7a34b773fef8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1650551182991-b07558247564?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1676210134050-6f12c6898395?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Gebäudereinigung (2026-10-18) ─────────────────
  // Büros, Flure, Glas. Kein „reinigung“ allein: Textil- und chemische Reinigung sind etwas anderes.
  reinigung: {
    keywords: [
      "gebäudereinigung",
      "reinigungsservice",
      "reinigungsfirma",
      "reinigungsdienst",
      "büroreinigung",
      "unterhaltsreinigung",
      "glasreinigung",
      "fensterreinigung",
      "gebäudeservice",
      "cleaning service",
      "office cleaning",
      "commercial cleaning",
      "janitorial",
    ],
    hero: [
      "https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1763026227930-ec2c91d4e7f2?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1627905646269-7f034dcc5738?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482449609509-eae2a7ea42b7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1437326300822-01d8f13c024f?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Haushalts- und Hausreinigung (2026-10-18) ─────
  // Wohnung, Küche, Treppe — privat statt Büro.
  hausreinigung: {
    keywords: [
      "hausreinigung",
      "haushaltsreinigung",
      "haushaltshilfe",
      "haushaltsservice",
      "putzhilfe",
      "putzfrau",
      "house cleaning",
      "maid service",
    ],
    refines: ["reinigung"],
    hero: [
      "https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1713110824336-f78c320dcf8e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1646980241033-cd7abda2ee88?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1757387240036-d7eb9b096c40?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Apotheke (2026-10-18) ─────────────────────────
  // Beratung am Tresen, Regale, Packungen.
  apotheke: {
    keywords: [
      "apotheke",
      "apotheker",
      "pharmacy",
      "pharmacie",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1642055514517-7b52288890ec?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603706580932-6befcf7d8521?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1757800945999-ed0fa905d0f5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Ergotherapie (2026-10-18) ─────────────────────
  // Feinmotorik, Alltagstraining, Kinder und Ältere — keine Massagebank.
  ergotherapie: {
    keywords: [
      "ergotherapie",
      "ergotherapeut",
      "ergotherapeutin",
      "occupational therapy",
    ],
    refines: ["medizin", "physio"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1762955911431-4c44c7c3f408?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758598737547-666bce663667?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1758598737547-666bce663667?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1762955913084-96ea3f986468?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1645005512942-a17817fb7c11?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611073615830-9f76902c10fe?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1575364289437-fb1479d52732?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1769720204844-caa13e11d826?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Logopädie (2026-10-18) ────────────────────────
  // Sprechen, Zuhören, Spielen mit Kindern und Erwachsenen.
  logopaedie: {
    keywords: [
      "logopädie",
      "logopäde",
      "logopädin",
      "sprachtherapie",
      "sprachheil",
      "stimmtherapie",
      "speech therapy",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1771765767087-ce71e4a7916a?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1709127347884-a106974ef58d?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1728138240695-54ebc33215f2?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1709127347884-a106974ef58d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758273240631-59d44c8f5b66?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1685362158423-abf004b858d2?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596066190600-3af9aadaaea1?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Architekturbüro (2026-10-18) ──────────────────
  // Häuser, Pläne, Zeichentisch.
  architekt: {
    keywords: [
      "architekt",
      "architektin",
      "architekturbüro",
      "architektur",
      "architect",
    ],
    hero: [
      "https://images.unsplash.com/photo-1696237461860-630be53f179c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1598368195835-91e67f80c9d7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564703048291-bcf7f001d83d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598367815092-a2c0cbc1ea3d?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1633354747567-e0682586f082?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618385455730-2571c38966b7?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Innenarchitektur (2026-10-18) ─────────────────
  // Wohnräume, Stoff- und Materialproben.
  innenarchitekt: {
    keywords: [
      "innenarchitekt",
      "innenarchitektin",
      "innenarchitektur",
      "interior design",
      "interior designer",
      "inneneinrichtung",
    ],
    refines: ["architekt"],
    hero: [
      "https://images.unsplash.com/photo-1606744888344-493238951221?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1774199496664-a9690967be5a?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1781888699751-15f2b304693c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1770970831074-6e88b6cc260b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1664638413302-d1ca29ac885b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1774199496664-a9690967be5a?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Yoga (2026-10-18) ─────────────────────────────
  // Helle Räume, Matten, Kurse — keine Hanteln.
  yoga: {
    keywords: [
      "yoga",
      "yogastudio",
      "yogaschule",
      "yogalehrer",
      "yogalehrerin",
    ],
    refines: ["fitness"],
    hero: [
      "https://images.unsplash.com/photo-1763403921315-f2ef8697199f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1676496962536-d8ef110ff6f0?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1676496962536-d8ef110ff6f0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626444232874-e72c020eeb0e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617734417481-aafe074f1b86?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1761035005546-62b8018b212a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1764111585875-1c09efea69ae?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1761034114082-c2d63456a82a?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Pilates (2026-10-18) ──────────────────────────
  // Reformer, Studio, Geräte an der Wand.
  pilates: {
    keywords: [
      "pilates",
      "pilatesstudio",
      "reformer",
    ],
    refines: ["fitness"],
    hero: [
      "https://images.unsplash.com/photo-1747238415033-b74eec07eb59?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1783841193384-4269c68aa050?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1783841193384-4269c68aa050?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1747240549807-fc3962949818?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1771270786606-f5a0e57db762?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1747239685045-fcbcf98985db?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1747239202356-764770773c9a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591258370814-01609b341790?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Fahrschule (2026-10-18) ───────────────────────
  // Fahrstunde, Übungsplatz, Motorrad-Parcours.
  fahrschule: {
    keywords: [
      "fahrschule",
      "fahrlehrer",
      "fahrlehrerin",
      "führerschein",
      "driving school",
    ],
    refines: ["education", "automotive"],
    hero: [
      "https://images.unsplash.com/photo-1773063449875-332dff62b6e3?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553782097-130fef5d3e27?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1630406144797-821be1f35d75?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553782097-130fef5d3e27?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1691371107034-e28ee43a669e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611508106567-6218ae6c5f6a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1537211790624-e6f568af4b13?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1777620659283-58b88ac292de?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Reisebüro (2026-10-18) ────────────────────────
  // Ziele, Karten, Beratung — keine fremden Reisepässe.
  reisebuero: {
    keywords: [
      "reisebüro",
      "reisebuero",
      "reiseagentur",
      "reiseveranstalter",
      "reiseberatung",
      "travel agency",
      "travel agent",
    ],
    hero: [
      "https://images.unsplash.com/photo-1783443162577-ffb10e6ebed7?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563297814-f1545e82dc5e?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563297814-f1545e82dc5e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1759054714057-02518b192bde?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Laden & Einzelhandel (2026-10-11, Werkstoff W1) ────────────
  // Ladenräume, Tresen, Regale. Kein „shop"/„boutique" als Schlagwort:
  // „Barber Shop" und „Beauty Boutique" gehören zum Friseur.
  laden: {
    keywords: [
      "laden",
      "einzelhandel",
      "fachgeschäft",
      "kiosk",
      "buchhandlung",
      "schreibwaren",
      "spielwaren",
      "haushaltswaren",
      "feinkost",
      "unverpackt",
      "concept store",
      "retail",
    ],
    hero: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1759050486852-fdfe2fdc7bea?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1787209516537-a8e66a1b4360?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1771574209038-01ad953ca43a?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1777628530456-bb93d3a03faf?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1764955307141-056b240923a1?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1769988037967-053235c08171?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1764795849986-d7f7f2f16cec?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1477120206578-46b3ca98a4e2?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ════ Freundlich F1 (2026-10-13): Bildsätze der Zielbranchen ════
  // Warm, hell, im Browser gesichtet (Kontaktbogen je Satz) und per HTTP 200
  // geprüft (1400er und 800er Zuschnitt). Schlagworte als ganze Fachwörter —
  // „Tierarzt" schlägt „arzt" (Praxis), „Hundepension" bleibt beim Hotel-Satz.
  // ── Kita, Kindergarten, Krippe, Tagesmutter ──
  // Helle Gruppenräume, Spielzeug, Malen, Spielplatz — Kinder nur von hinten, unscharf oder in Händen, keine Gesichter in Nahaufnahme.
  kita: {
    wholeWords: ["kita", "kitas"],
    categoryWords: ["krippe", "krippen", "kinderhaus", "day care", "daycare"],
    blockers: [
      "adult",
      "adults",
      "senior",
      "seniors",
      "elderly",
      "dog",
      "dogs",
      "pet",
      "pets",
      "hunde",
      "tagespflege",
      "seniorenheim",
    ],
    keywords: [
      "kindertagesstätte",
      "kindertagesstaette",
      "kindergarten",
      "kinderkrippe",
      "kindertagespflege",
      "tagespflegestelle",
      "großtagespflege",
      "tagesmutter",
      "tagesmütter",
      "tagesvater",
      "tageseltern",
      "kinderbetreuung",
      "child care",
      "childcare",
      "preschool",
      "nursery school",
    ],
    hero: [
      "https://images.unsplash.com/photo-1567746455504-cb3213f8f5b8?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1763310225537-f7161d5c93e9?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631512700403-ee66a05fd497?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1786667395574-8121327f52c8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578349035260-9f3d4042f1f7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560130958-0ea787c275de?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558576997-a29a7b11a56c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567405258710-35a7015252c0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1642379831546-67d5e2bf8bcc?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1728268934722-8d328b063b34?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596997000103-e597b3ca50df?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Nachhilfe & Lernstudio ──
  // Hausaufgaben, Hände mit Stift, Lernplatz am Fenster, Lernraum — keine Kindergesichter.
  nachhilfe: {
    wholeWords: ["lernzentrum"],
    keywords: [
      "nachhilfe",
      "nachhilfeinstitut",
      "nachhilfeschule",
      "lernstudio",
      "lernförderung",
      "hausaufgabenbetreuung",
      "hausaufgabenhilfe",
      "schülerhilfe",
      "tutoring",
    ],
    hero: [
      "https://images.unsplash.com/photo-1613186420419-868111e7ac07?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589884629000-60c572c6ba7a?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585432959315-d9342fd58eb6?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1601397922721-4326ae07bbc5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560785477-d43d2b34e0df?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588451658762-573f563865a7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1707246719682-6841358980c0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621356986575-05811227a42e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601642964568-1917224f4e4d?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Musikschule & Musikunterricht ──
  // Unterricht am Klavier und an der Gitarre, Kinderhände auf Tasten, Instrumente im hellen Raum.
  musikschule: {
    keywords: [
      "musikschule",
      "musikunterricht",
      "musiklehrer",
      "musikpädagog",
      "klavierunterricht",
      "gitarrenunterricht",
      "gesangsunterricht",
      "instrumentalunterricht",
      "früherziehung",
      "music school",
      "music lesson",
      "music teacher",
      "music instructor",
    ],
    hero: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1696522732406-065ef560da8c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758524944402-1903b38f848f?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519076976365-9c64dbd98317?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1636464808108-644053e72420?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599866193011-348f9eb29868?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564528183203-ec84690e06a8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1711048421235-3fcb9dcf82f7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614355013870-f3916bc15ced?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556379118-7034d926d258?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Hundesalon & Hundefriseur ──
  // Schneiden, Föhnen, Baden, Bürsten, frisch gepflegte Hunde — kein Maulkorb, kein Schwarzweiß.
  hundesalon: {
    keywords: [
      "hundesalon",
      "hundefriseur",
      "hundefrisör",
      "tierfriseur",
      "hundepflege",
      "hundepflegesalon",
      "katzensalon",
      "dog groom",
      "pet groom",
    ],
    refines: ["friseur"],
    hero: [
      "https://images.unsplash.com/photo-1719464454959-9cf304ef4774?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528846104175-4fd300ee59da?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1630841257082-0792caf642ae?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1611173622933-91942d394b04?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1675430426271-d74b542f21e4?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1727510190155-51abda425a82?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576033008321-bc748ab54838?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601299583228-1a74f6152ba7?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1651502829291-785542414770?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Eisdiele, Eiscafé, Gelateria ──
  // Eistheke, Kugeln in der Waffel, Becher, Sommer — keine Markennamen, kein Ladenschild.
  eisdiele: {
    blockers: [
      "supplier",
      "suppliers",
      "equipment",
      "wholesale",
      "wholesaler",
      "manufacturer",
      "distributor",
      "großhandel",
      "grosshandel",
      "hersteller",
      "lieferant",
      "zubehör",
    ],
    keywords: [
      "eisdiele",
      "eiscafé",
      "eiscafe",
      "eissalon",
      "eisladen",
      "eismanufaktur",
      "eiskonditorei",
      "gelateria",
      "gelato",
      "speiseeis",
      "softeis",
      "ice cream",
      "frozen yogurt",
    ],
    refines: ["cafe"],
    hero: [
      "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572837663132-76c0ccd9cb6f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1717853411695-c9f844e1df46?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1560801619-01d71da0f70c?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1636696301991-3e176a6b77dc?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1629385701021-fcd568a743e8?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1718810125230-e8e2271354f5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1629385744299-74b9cf013f52?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593558159516-d0be2a960c52?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621693129587-48dd0d0aa740?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1695217862908-7c7875423256?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Hebamme & Geburtshaus ──
  // Babybauch, Hände, Babyfüße, Kinderzimmer, Hebamme bei der Untersuchung zu Hause — keine Klinik, keine Babygesichter in Nahaufnahme.
  hebamme: {
    keywords: [
      "hebamme",
      "hebammen",
      "hebammenpraxis",
      "geburtshaus",
      "geburtsvorbereitung",
      "rückbildung",
      "wochenbett",
      "stillberatung",
      "midwife",
      "birth center",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1550964271-3804324b5ff8?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586102728466-46b99b3bc411?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615766553246-9147b6d50e90?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1586688406974-932bae2ec688?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1625238967691-b36b2d852b33?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570919887593-3555c02d7a74?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600397905180-3764c3ce025b?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544268211-ba72491bf350?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1575304180743-49fb3fba066e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546908244-5e40b5e4f413?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1677682693104-bc4758db3b45?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Tierarzt & Tierklinik ──
  // Untersuchung am Tisch, Tierärztin mit Katze, Welpe auf dem Arm — keine OP, keine Instrumente, kein Praxisschild.
  tierarzt: {
    keywords: [
      "tierarzt",
      "tierarztpraxis",
      "tierärzt",
      "tierpraxis",
      "kleintierpraxis",
      "tierklinik",
      "tiermedizin",
      "veterinär",
      "veterinar",
      "tierheilprakti",
      "tierphysiotherap",
      "animal hospital",
    ],
    refines: ["medizin"],
    strictRefine: true,
    hero: [
      "https://images.unsplash.com/photo-1630438994394-3deff7a591bf?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1700665537650-1bf37979aae0?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1700665537604-412e89a285c3?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1657672733246-9c942ace6195?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1643213641079-1e60ef170910?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1725409796872-8b41e8eca929?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1728013274420-ed02b1f58887?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1719752585472-ddc1cc7edbf6?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1730677769210-7b5a39d0635e?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631307495039-3f9e947c2070?w=800&q=80&auto=format&fit=crop",
    ],
  },
  // ── Tierbedarf & Zoohandlung ──
  // Hund im hellen Laden, Regale mit Futter und Zubehör, Spielzeug, Futterschalen, Hundebett — keine Ketten-Logos.
  tierbedarf: {
    wholeWords: ["pet store", "pet shop", "pet supply", "pet supplies"],
    keywords: [
      "tierbedarf",
      "heimtierbedarf",
      "haustierbedarf",
      "hundebedarf",
      "katzenbedarf",
      "zoohandlung",
      "zoofachhandel",
      "zoofachgeschäft",
      "zoofachmarkt",
      "zooladen",
      "zoogeschäft",
      "tierhandlung",
      "tierhandel",
      "tierfutter",
      "tiernahrung",
    ],
    hero: [
      "https://images.unsplash.com/photo-1516453734593-8d198ae84bcf?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1733451629760-d5fc1c818698?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581888227599-779811939961?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1626204451832-91eb35617cc6?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588099140103-eb7e0ae84d00?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589924749359-9697080c3577?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1745252777945-d430ecf54580?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1679689384991-35f609124c37?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1636272181093-a7b3f01cf995?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1651571479382-2ec05e291a33?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615427911942-911cca0ae4f1?w=800&q=80&auto=format&fit=crop",
    ],
  },

  // ── Default / Neutral Fallback ─────────────────────
  // Frueher lagen hier abstrakte Farbverlaeufe. Auf einer Kundenseite sagen
  // sie nichts und lassen sie halbfertig wirken (Betreiber-Befund
  // 2026-09-09) — ein neutrales Foto von Arbeit und Raum traegt immer noch
  // mehr als ein Verlauf. Alle IDs sind im Bestand geprueft.
  default: {
    keywords: [],
    hero: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop",
    ],
  },
};
