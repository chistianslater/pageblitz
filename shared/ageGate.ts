/**
 * FSK-18 / Age-Gate-Logik.
 *
 * Erkennt anhand der Branche/Kategorie + des Business-Namens, ob die Website
 * eine Altersbestätigung vor dem Besuch braucht. Das Flag wird beim Erstellen
 * der Website automatisch gesetzt und kann im Admin manuell überschrieben werden.
 *
 * Self-Declaration (Klick "Ich bin 18+") – ausreichend für Soft-Content
 * (Erotik-Boutique, Bar, Spirituosen, Wettbüro). Für harten Adult-Content
 * (Pornografie) ist eine echte AVS-Verifikation nötig, die liegt aber in
 * der Verantwortung des Plattform-Kunden.
 */

/** Schlüsselwörter, die Adult-/Alkohol-/Glücksspiel-Content anzeigen. */
const ADULT_KEYWORDS: string[] = [
  // Erotik
  "erotik", "erotic", "sexshop", "sex-shop", "bordell", "fkk", "escort",
  "tabledance", "stripclub", "swingerclub", "swinger", "dessous", "lingerie",
  "rotlicht", "etablissement", "adult", "porno", "fetisch", "bdsm", "sm-studio",
  "begleitservice", "kontaktbar", "saunaclub",
  // Alkohol
  "bar", "cocktailbar", "whiskybar", "weinhandlung", "weinhandel", "vinothek",
  "weingut", "winery", "brauerei", "spirituosen", "spirits", "destillerie",
  "distillery", "schnaps", "liqueur", "bier", "wein", "champagner", "sekt",
  "rum", "whisky", "whiskey", "gin", "vodka", "wodka",
  // Glücksspiel
  "casino", "spielhalle", "spielothek", "wettbüro", "wettbuero", "wettannahme",
  "lotto", "sportwetten",
  // Tabak / E-Zigarette
  "tabakwaren", "tabak", "shisha", "vape", "e-zigarette", "ezigarette",
  "headshop", "head-shop",
  // Cannabis (legal CBD vs. nicht)
  "cannabis", "cbd-shop", "growshop", "grow-shop",
];

/**
 * Prüft, ob die gegebene Kategorie + (optional) Business-Name auf einen
 * Branchenbereich hindeutet, der eine Altersbestätigung erfordert.
 */
export function shouldRequireAgeGate(category?: string | null, businessName?: string | null): boolean {
  const haystack = `${category || ""} ${businessName || ""}`.toLowerCase();
  if (!haystack.trim()) return false;
  return ADULT_KEYWORDS.some((kw) => haystack.includes(kw));
}

/** Default-Mindestalter — könnte später pro Site konfigurierbar werden. */
export const AGE_GATE_MIN_AGE = 18;
