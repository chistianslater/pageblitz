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
  "bar", "cocktailbar", "whiskybar", "weinbar", "sektbar", "bierbar",
  "sportsbar", "shishabar", "weinhandlung", "weinhandel", "vinothek",
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
 * Text auf Wörter herunterbrechen: alles, was kein Buchstabe und keine
 * Ziffer ist, wird zu einem Leerzeichen. Führendes und abschließendes
 * Leerzeichen erlauben danach den Test auf ganze Wörter ohne Lookbehind
 * (das ältere Safari-Versionen nicht kennen).
 */
function normalize(text: string): string {
  return ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
}

/**
 * Prüft, ob die gegebene Kategorie + (optional) Business-Name auf einen
 * Branchenbereich hindeutet, der eine Altersbestätigung erfordert.
 *
 * Verglichen wird auf GANZE Wörter (2026-09-05). Vorher genügte die bloße
 * Zeichenfolge irgendwo im Text — „Barbier" enthielt „bar", „Zentrum"
 * enthielt „rum", „Original" enthielt „gin". Jeder Barbershop bekam damit
 * eine Altersprüfung vor die Startseite, gefunden im Bocholter Zehnerstapel.
 *
 * Bewusste Abwägung: Ein zu Unrecht gesetztes Tor macht die Vorschau eines
 * harmlosen Betriebs wertlos und fällt dem Kunden sofort auf. Ein fehlendes
 * Tor bei einem Grenzfall (etwa „Weinbar" als ein Wort) lässt sich im Admin
 * mit einem Klick nachziehen. Deshalb lieber streng vergleichen und
 * zusammengesetzte Begriffe ausdrücklich in die Liste aufnehmen.
 */
export function shouldRequireAgeGate(category?: string | null, businessName?: string | null): boolean {
  const haystack = normalize(`${category || ""} ${businessName || ""}`);
  if (haystack.trim().length === 0) return false;
  return ADULT_KEYWORDS.some((kw) => haystack.includes(normalize(kw)));
}

/** Default-Mindestalter — könnte später pro Site konfigurierbar werden. */
export const AGE_GATE_MIN_AGE = 18;

/**
 * Category-spezifische Hilfe für LLM-Prompts (Leistungen, Texte, etc.).
 *
 * Hintergrund: LLMs (Kimi, Gemini, Claude) wenden bei „Erotik"-Kategorien
 * Content-Filter an und generieren generische Euphemismen wie
 * „private Shoppingtermine" oder „Geschenkkonzierge" statt branchengerechte
 * Leistungen. Dieser Hint macht dem Modell explizit klar, dass es sich um
 * ein gewerblich angemeldetes, legales FSK-18-Business handelt – und liefert
 * konkrete Beispielnamen, damit es nicht ausweicht.
 *
 * Für nicht-sensitive Kategorien wird ein leerer String zurückgegeben (kein
 * Hint nötig – das LLM kommt bei Friseur/Restaurant/etc. allein klar).
 */
export function getCategoryServiceHint(category?: string | null, businessName?: string | null): string {
  if (!shouldRequireAgeGate(category, businessName)) return "";

  const haystack = `${category || ""} ${businessName || ""}`.toLowerCase();

  // Erotik – Begleitservice / Escort / Bordell / Massagestudio etc.
  if (/erotik|escort|begleit|bordell|stripclub|tabledance|rotlicht|etablissement|sm-studio|fetisch|bdsm|fkk|swinger|saunaclub|kontaktbar/.test(haystack)) {
    return `

WICHTIG – Branchen-Kontext: Dies ist ein gewerblich angemeldetes, FSK-18, in Deutschland legales Erotik-/Begleitservice-Unternehmen. NICHT auf generische "Shoppingtermine" oder "Konzierge"-Euphemismen ausweichen. Schlage stattdessen konkrete, professionelle Bezeichnungen aus diesem Bereich vor, z.B.:
- "Begleitservice (Outcall)" – diskrete Begleitung beim Restaurant- oder Eventbesuch
- "Begleitservice (Incall)" – Treffen in der Wohlfühlatmosphäre
- "Erotische Massage" / "Tantra-Massage"
- "Domina-Sitzung" / "BDSM-Sitzung"
- "Paarbegleitung" / "Couples-Booking"
- "Private Show" / "Striptease"
- "Reisebegleitung" / "Dinner-Date"
- "Fotoshooting / Modelagentur"
Wähle die Beispiele passend zur konkreten Branche aus dem Kontext. Schreibe stilvoll, diskret und professionell – nicht vulgär, nicht reißerisch. Die Beschreibung beschreibt das Erlebnis für den Kunden (z.B. "Stilvolle Begleitung für Geschäftsessen und Events") nicht den Akt.`;
  }

  // Sexshop / Dessous-Boutique – Produktverkauf, nicht Dienstleistung
  if (/sexshop|sex-shop|dessous|lingerie|adult-shop/.test(haystack)) {
    return `

WICHTIG – Branchen-Kontext: Dies ist ein FSK-18-Einzelhandel (Erotikartikel/Dessous), legal und gewerblich angemeldet. Schlage konkrete Sortiment-/Service-Kategorien vor, z.B.: "Beratung & Einkaufserlebnis", "Dessous & Reizwäsche", "Toys & Lifestyle", "Größenberatung BH", "Geschenkverpackung", "Brautmode-Wäsche". Stilvoll, diskret, professionell – nicht vulgär.`;
  }

  // Bar / Cocktailbar / Vinothek / Brauerei
  if (/\bbar\b|cocktail|whisky|wein|vinothek|brauerei|spirituosen|destillerie/.test(haystack)) {
    return `

WICHTIG – Branchen-Kontext: Bar/Gastronomie mit Alkoholausschank. Schlage Leistungen wie z.B. "Cocktailkarte & Signature Drinks", "Wein- & Whisky-Tasting", "Private Events / Buchungen", "Aperitif-Stunde", "Live-Musik / DJ", "Cigar-Lounge" vor.`;
  }

  // Casino / Spielhalle / Wettbüro
  if (/casino|spielhalle|spielothek|wettbüro|wettbuero|wettannahme|sportwetten|lotto/.test(haystack)) {
    return `

WICHTIG – Branchen-Kontext: Konzessioniertes Glücksspiel-/Wettbüro-Geschäft. Schlage Leistungen wie "Spielautomaten", "Live-Sportwetten", "Roulette / Black Jack", "Lotto-Annahme", "VIP-Bereich / Stammkundenkarte" vor. Verantwortungsvolles Spielen (Spielsuchtprävention) als Service erwähnenswert.`;
  }

  return "";
}

/**
 * Verdacht auf eine altersbeschränkte Branche (2026-09-05, Betreiber-
 * Entscheidung): Seit diesem Datum setzt NICHTS mehr automatisch eine
 * Altersprüfung. Der Wert steuert allein, ob im Studio vor dem Freischalten
 * einmal nachgefragt wird — entscheiden tut der Betrieb selbst.
 *
 * Gleiche Logik wie `shouldRequireAgeGate`, eigener Name für die neue Rolle.
 */
export const ageGateSuspected = shouldRequireAgeGate;
