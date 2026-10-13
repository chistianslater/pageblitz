/** Explicit vocabulary bridge between the onboarding picker and design taxonomy.
 * These are aesthetic/industry matches, not substitutions for business facts.
 * Never pass the resolved value into generated copy or the stored category.
 */
const GROUPS: Record<string, readonly string[]> = {
  restaurant: ["Steakhouse", "Fischrestaurant", "Kantine", "Diner"],
  imbiss: ["meal takeaway", "Take-away", "Schnellimbiss"],
  bar: ["Cocktailbar", "Nachtclub", "night club"],
  catering: ["Lieferservice", "Abholservice", "meal delivery"],
  kosmetik: [
    "Beautysalon",
    "Beauty-Center",
    "Hautpflege-Klinik",
    "Augenbrauen-Studio",
    "Waxing-Studio",
    "beauty salon",
  ],
  nagelstudio: ["nail salon"],
  friseur: ["hair salon", "hair care", "barber shop"],
  arzt: [
    "Allgemeinarzt",
    "Hautarzt",
    "Augenarzt",
    "Orthopäde",
    "Gynäkologe",
    "Kinderarzt",
    "Krankenhaus",
    "Klinik",
    "doctor",
  ],
  zahnarzt: ["Kieferorthopäde", "Zahnklinik", "dentist"],
  physiotherapie: ["Chiropraktiker", "Therapeut", "physiotherapist"],
  logopaedie: ["Logopäde"],
  ergotherapie: ["Ergotherapeut"],
  podologie: ["Podologe"],
  hoerakustiker: ["Hörgeräteakustiker"],
  psychotherapie: [
    "Psychologe",
    "Psychotherapeut",
    "Psychotherapeutin",
    "psychologist",
  ],
  tierarzt: ["veterinary care"],
  apotheke: ["pharmacy"],
  heilpraktiker: ["Ernährungsberater"],
  fitness: [
    "Personal Trainer",
    "Schwimmbad",
    "Sportverein",
    "Golfclub",
    "Tennisclub",
    "Boxstudio",
    "gym",
    "fitness center",
  ],
  yoga: ["yoga studio"],
  bauunternehmen: ["Generalunternehmer", "general contractor"],
  schreiner: ["Zimmermann", "Zimmerei"],
  maler: ["Stuckateur", "painter"],
  elektriker: ["electrician"],
  dachdecker: ["roofing contractor"],
  schluesseldienst: ["locksmith"],
  handwerk: [
    "Dämmtechnik",
    "Fensterbauer",
    "Schornsteinfeger",
    "Raumausstatter",
  ],
  gebaeudereinigung: ["Schädlingsbekämpfung", "Wäscherei"],
  "kfz-werkstatt": [
    "Autowerkstatt",
    "Autowaschanlage",
    "Reifenservice",
    "Karosseriebau",
    "Lackiererei",
    "Autolackiererei",
    "Reifenhändler",
    "Tankstelle",
    "car repair",
    "car wash",
    "gas station",
  ],
  autohaus: [
    "Gebrauchtwagenhändler",
    "Motorradhändler",
    "Autovermietung",
    "car dealer",
    "car rental",
  ],
  steuerberater: ["Steuerberatung", "Lohnbuchhaltung", "accounting"],
  rechtsanwalt: ["lawyer"],
  immobilienmakler: ["real estate agency"],
  versicherung: ["insurance agency"],
  finanzberatung: ["Bank", "Kreditgenossenschaft"],
  softwareentwicklung: ["Softwareunternehmen"],
  "it-service": ["Computerreparatur", "Handyreparatur"],
  werbeagentur: ["Marketingagentur", "Druckerei", "Copyshop"],
  fotograf: ["Videoproduktion"],
  nachhilfe: ["Schule", "Kunstschule"],
  kita: ["Kindertagesstätte"],
  eventplanung: ["Veranstaltungsort", "Hochzeitslocation", "Eventplaner"],
  reisebuero: ["travel agency"],
  boutique: ["Bekleidungsgeschäft", "Schuhgeschäft"],
  modegeschaeft: ["Brautmodengeschäft", "Brautmoden", "clothing store"],
  juwelier: ["jewelry store"],
  buchhandlung: ["book store"],
  florist: ["Blumengeschäft"],
  fachhandel: [
    "Elektronikgeschäft",
    "Möbelgeschäft",
    "Haushaltswarengeschäft",
    "Tierhandlung",
    "Spielzeuggeschäft",
    "Sportgeschäft",
    "Baumarkt",
    "Tierhandel",
    "Kiosk",
    "Spätkauf",
    "home goods store",
    "furniture store",
    "electronics store",
    "hardware store",
    "pet store",
    "shoe store",
    "bicycle store",
  ],
  hofladen: [
    "Supermarkt",
    "Lebensmittelgeschäft",
    "supermarket",
    "grocery store",
  ],
  baeckerei: ["bakery"],
  konditorei: ["Chocolatier", "Confiserie"],
  weingut: ["Winzer", "Weinbau"],
  ferienwohnung: ["Campingplatz", "campground"],
  hotel: ["lodging"],
  gartenbau: ["Gartengestaltung", "Gartencenter"],
  bestatter: ["Bestattungsunternehmen", "funeral home"],
  umzugsunternehmen: [
    "Kurierdienst",
    "Lagerhaus",
    "Logistik",
    "Spedition",
    "moving company",
  ],
  // Personenbeförderung — gleiche Fahrzeug-/Service-Welt wie Umzug
  umzug: [
    "Taxi",
    "Taxiservice",
    "Taxiunternehmen",
    "Chauffeurservice",
    "taxi service",
  ],
  hundeschule: ["Hundetrainer", "Reitschule"],
  tierpension: ["Hundepension", "Tierheim"],
  metallbau: [
    "Maschinenbau",
    "Metallverarbeitung",
    "Fertigung",
    "Produktionsbetrieb",
    "Schweißtechnik",
  ],
  unternehmensberatung: ["Personalberatung"],
};

/** Zielbegriffe der Brücke — jeder muss selbst ein Pack direkt treffen. */
export const CATEGORY_ALIAS_TARGETS: readonly string[] = Object.keys(GROUPS);

export function categoryAliasKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
const ALIASES = new Map(
  Object.entries(GROUPS).flatMap(([target, values]) =>
    values.map(value => [categoryAliasKey(value), target] as const)
  )
);

export function resolveDesignCategory(category: string): string {
  return ALIASES.get(categoryAliasKey(category)) ?? category;
}

export function designIndustryKey(category: string): string {
  const key = categoryAliasKey(resolveDesignCategory(category));
  if (/friseur|barber|haarsalon/.test(key)) return "friseur";
  if (/restaurant|pizzeria|trattoria/.test(key)) return "restaurant";
  return key;
}
