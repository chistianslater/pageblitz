/** Explicit vocabulary bridge between the onboarding picker and design taxonomy.
 * These are aesthetic/industry matches, not substitutions for business facts.
 * Never pass the resolved value into generated copy or the stored category.
 */
const GROUPS: Record<string, readonly string[]> = {
  restaurant: ["Steakhouse", "Fischrestaurant", "Kantine", "Diner"],
  bar: ["Cocktailbar", "Nachtclub"],
  catering: ["Lieferservice", "Abholservice"],
  kosmetik: [
    "Beautysalon",
    "Beauty-Center",
    "Hautpflege-Klinik",
    "Augenbrauen-Studio",
    "Waxing-Studio",
  ],
  arzt: [
    "Allgemeinarzt",
    "Hautarzt",
    "Augenarzt",
    "Orthopäde",
    "Gynäkologe",
    "Kinderarzt",
    "Krankenhaus",
    "Klinik",
  ],
  zahnarzt: ["Kieferorthopäde"],
  physiotherapie: ["Chiropraktiker", "Therapeut"],
  logopaedie: ["Logopäde"],
  ergotherapie: ["Ergotherapeut"],
  podologie: ["Podologe"],
  hoerakustiker: ["Hörgeräteakustiker"],
  psychotherapie: ["Psychologe"],
  heilpraktiker: ["Ernährungsberater"],
  fitness: [
    "Personal Trainer",
    "Schwimmbad",
    "Sportverein",
    "Golfclub",
    "Tennisclub",
    "Boxstudio",
  ],
  bauunternehmen: ["Generalunternehmer"],
  schreiner: ["Zimmermann"],
  maler: ["Stuckateur"],
  handwerk: ["Dämmtechnik", "Fensterbauer", "Schornsteinfeger"],
  gebaeudereinigung: ["Schädlingsbekämpfung", "Wäscherei"],
  "kfz-werkstatt": [
    "Autowerkstatt",
    "Autowaschanlage",
    "Reifenservice",
    "Karosseriebau",
  ],
  autohaus: ["Gebrauchtwagenhändler", "Motorradhändler"],
  steuerberater: ["Steuerberatung", "Lohnbuchhaltung"],
  finanzberatung: ["Bank", "Kreditgenossenschaft"],
  softwareentwicklung: ["Softwareunternehmen"],
  "it-service": ["Computerreparatur"],
  werbeagentur: ["Marketingagentur", "Druckerei"],
  fotograf: ["Videoproduktion"],
  nachhilfe: ["Schule", "Kunstschule"],
  kita: ["Kindertagesstätte"],
  eventplanung: ["Veranstaltungsort", "Hochzeitslocation", "Eventplaner"],
  boutique: ["Bekleidungsgeschäft", "Schuhgeschäft"],
  fachhandel: [
    "Elektronikgeschäft",
    "Möbelgeschäft",
    "Haushaltswarengeschäft",
    "Tierhandlung",
    "Spielzeuggeschäft",
    "Sportgeschäft",
    "Baumarkt",
  ],
  hofladen: ["Supermarkt", "Lebensmittelgeschäft"],
  gartenbau: ["Gartengestaltung", "Gartencenter"],
  bestatter: ["Bestattungsunternehmen"],
  umzugsunternehmen: ["Kurierdienst", "Lagerhaus", "Logistik", "Spedition"],
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
