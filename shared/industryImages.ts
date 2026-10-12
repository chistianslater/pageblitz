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
  },

  // ── Bauunternehmen & Handwerk ───────────────────────
  handwerk: {
    keywords: [
      "handwerk",
      "bau",
      "elektriker",
      "klempner",
      "maler",
      // Schreiner/Tischler: eigener Satz `schreinerei` (2026-10-11).
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
      "apotheke",
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
      "tierarzt",
      "tierarztpraxis",
      "tierärzt",
      "tierpraxis",
      "kleintierpraxis",
      "tierklinik",
      "tiermedizin",
      "veterinär",
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
      "ergotherapie",
      "ergotherapeut",
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
  // Blutdruck-Klischees. Tierarzt/Psychotherapie bleiben bei „medizin".
  praxis: {
    keywords: [
      "praxis",
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
    hero: [
      "https://images.unsplash.com/photo-1758691461935-202e2ef6b69f?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631217871099-88310a909a32?w=1400&q=85&auto=format&fit=crop",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1629909614456-6b1c5c94cecc?w=800&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1762625570087-6d98fca29531?w=800&q=80&auto=format&fit=crop",
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
      "boutique-hotel",
      "hotel garni",
      "boardinghouse",
      "boarding house",
      "lodging",
      "gasthof",
      "gästehaus",
      "gaestehaus",
      "herberge",
      "ferienwohnung",
      "ferienhof",
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
