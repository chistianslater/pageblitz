/**
 * Kategorie-Kette für GMB-Places (Plan B7, Task 1).
 *
 * Liefert eine belastbare deutsche Branchenbezeichnung oder `null` — niemals
 * den Firmennamen oder den Suchbegriff (das war der SCHAU-&-HORCH-Bug:
 * `extractGmbCategory(types) || input.query` machte aus dem Firmennamen die
 * Kategorie, und der LLM riet daraus "Optik und Akustik").
 *
 * Kette: primaryTypeDisplayName (Places API v1, sofern nicht generisch)
 * → DE-Mapping des ersten gemappten spezifischen `types`-Eintrags → `null`.
 * `null` heißt: Kategorie unbekannt — die Generierung behandelt das als
 * "unbekannt", Task 5 baut darauf die Kategorie-Rückfrage im Studio.
 */

/**
 * Generische Google-Places-Types, die auf praktisch jedes Unternehmen
 * zutreffen — als Kategorie unbrauchbar. (Umzug aus `server/routers.ts`,
 * ergänzt um die v1-Catch-alls `service` und `health`.)
 */
export const GENERIC_GMB_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "local_business",
  "store",
  "food",
  "premise",
  "political",
  "geocode",
  "route",
  "service",
  "health",
]);

/**
 * Generische primaryTypeDisplayName-Werte, die die Kette nicht gewinnen
 * dürfen. Realer Befund (v1-Probe 2026-08-23, Place ChIJ255gMPZ9uEcR…):
 * primaryTypeDisplayName = "Services" — sagt nichts über die Branche.
 */
const GENERIC_DISPLAY_NAMES = new Set([
  "service",
  "services",
  "dienstleistung",
  "dienstleistungen",
  "dienstleister",
  "geschäft",
  "laden",
  "shop",
  "store",
  "unternehmen",
  "firma",
  "betrieb",
  "einrichtung",
  "establishment",
  "point of interest",
  "sehenswürdigkeit",
]);

/**
 * DE-Mapping gängiger spezifischer Google-Places-Types (Legacy + v1) auf
 * Branchenbezeichnungen, wie sie im Generierungs-Prompt und im Studio
 * auftauchen sollen. Nicht gemappte Types zählen bewusst NICHT — lieber
 * `null` (→ Rückfrage) als ein englischer Rohtype als "Kategorie".
 */
export const GMB_TYPE_LABELS_DE: Record<string, string> = {
  accounting: "Buchhaltung & Steuern",
  advertising_agency: "Werbeagentur",
  bakery: "Bäckerei",
  bank: "Bank",
  bar: "Bar",
  beauty_salon: "Kosmetikstudio",
  bicycle_store: "Fahrradladen",
  book_store: "Buchhandlung",
  butcher_shop: "Metzgerei",
  cafe: "Café",
  car_dealer: "Autohaus",
  car_rental: "Autovermietung",
  car_repair: "Kfz-Werkstatt",
  car_wash: "Autopflege & Waschanlage",
  carpenter: "Tischlerei",
  cleaning_service: "Gebäudereinigung",
  clothing_store: "Modegeschäft",
  consultant: "Beratung",
  dentist: "Zahnarztpraxis",
  doctor: "Arztpraxis",
  driving_school: "Fahrschule",
  electrician: "Elektroinstallation",
  electronics_store: "Elektronikgeschäft",
  florist: "Blumenladen",
  funeral_home: "Bestattungsinstitut",
  furniture_store: "Möbelhaus",
  garden_center: "Gartencenter",
  general_contractor: "Bauunternehmen",
  gym: "Fitnessstudio",
  hair_care: "Friseursalon",
  hair_salon: "Friseursalon",
  hardware_store: "Baumarkt & Eisenwaren",
  home_goods_store: "Einrichtungsgeschäft",
  ice_cream_shop: "Eisdiele",
  insurance_agency: "Versicherungsagentur",
  jewelry_store: "Juwelier",
  landscaper: "Garten- und Landschaftsbau",
  laundry: "Wäscherei & Textilreinigung",
  lawyer: "Rechtsanwaltskanzlei",
  locksmith: "Schlüsseldienst",
  lodging: "Hotel & Unterkunft",
  hotel: "Hotel",
  bed_and_breakfast: "Pension",
  guest_house: "Gästehaus",
  hostel: "Hostel",
  motel: "Motel",
  resort_hotel: "Resort",
  extended_stay_hotel: "Boardinghouse",
  inn: "Gasthof",
  manufacturer: "Hersteller",
  marketing_agency: "Marketingagentur",
  massage: "Massagepraxis",
  meal_delivery: "Lieferservice",
  meal_takeaway: "Imbiss & Takeaway",
  moving_company: "Umzugsunternehmen",
  nail_salon: "Nagelstudio",
  night_club: "Club",
  optician: "Optiker",
  painter: "Malerbetrieb",
  pet_store: "Tierbedarf",
  pharmacy: "Apotheke",
  photographer: "Fotograf",
  physiotherapist: "Physiotherapiepraxis",
  pizza_restaurant: "Pizzeria",
  plumber: "Sanitär & Heizung",
  real_estate_agency: "Immobilienmakler",
  restaurant: "Restaurant",
  roofing_contractor: "Dachdeckerbetrieb",
  school: "Schule & Unterricht",
  shoe_store: "Schuhgeschäft",
  spa: "Wellness & Spa",
  storage: "Lagerraum & Self-Storage",
  supermarket: "Supermarkt",
  tailor: "Schneiderei",
  tattoo_parlor: "Tattoostudio",
  travel_agency: "Reisebüro",
  veterinary_care: "Tierarztpraxis",
};

export type ResolveGmbCategoryInput = {
  /** Places API v1 `primaryTypeDisplayName.text` (deutsch angefragt). */
  primaryTypeDisplayName?: string | null;
  /** Legacy-`types`-Array aus Places Details/Search. */
  types?: string[] | null;
  /**
   * Editorial Summary des Place — aktuell nicht Teil der Kette, wird aber
   * mitgereicht, damit spätere Stufen (Task 3/5) ohne Signaturbruch darauf
   * zugreifen können.
   */
  editorialSummary?: string | null;
};

/**
 * Spezifische Beherbergungs-Types vor dem generischen `lodging` —
 * Google liefert oft `["lodging", "hotel", ...]` (generisch zuerst).
 */
const PREFERRED_LODGING_TYPES = [
  "hotel",
  "extended_stay_hotel",
  "resort_hotel",
  "motel",
  "bed_and_breakfast",
  "guest_house",
  "hostel",
  "inn",
] as const;

/**
 * Kategorie-Kette: primaryTypeDisplayName → DE-Mapping spezifischer types
 * → `null`. Niemals Firmenname oder Suchbegriff.
 */
export function resolveGmbCategory(
  input: ResolveGmbCategoryInput
): string | null {
  const displayName = input.primaryTypeDisplayName?.trim();
  if (displayName && !GENERIC_DISPLAY_NAMES.has(displayName.toLowerCase())) {
    return displayName;
  }

  const types = input.types ?? [];
  for (const preferred of PREFERRED_LODGING_TYPES) {
    if (!types.includes(preferred)) continue;
    const label = GMB_TYPE_LABELS_DE[preferred];
    if (label) return label;
  }

  for (const type of types) {
    if (GENERIC_GMB_TYPES.has(type)) continue;
    const label = GMB_TYPE_LABELS_DE[type];
    if (label) return label;
  }

  return null;
}
