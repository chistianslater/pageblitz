/**
 * Gewerk- und Branchenwörter in Betriebsnamen („Kfz-Meisterbetrieb Yilmaz",
 * „Schlüsseldienst Nord"). Raster schiebt sie in den Kicker, wenn das
 * längste Wort der Wortmarke sonst nicht über die Untergrenze `display`
 * passt (Systemblatt, Wortmarken-Regel). Nur Kleinschreibung.
 */
export const TRADE_WORDS: readonly string[] = [
  "kfz",
  "meisterbetrieb",
  "autowerkstatt",
  "werkstatt",
  "autoservice",
  "reifenservice",
  "service",
  "abschleppdienst",
  "pannenhilfe",
  "notdienst",
  "schlüsseldienst",
  "schluesseldienst",
  "aufsperrdienst",
  "rohrreinigung",
  "taxi",
  "taxiunternehmen",
  "kurierdienst",
  "steuerberatung",
  "steuerberater",
  "steuerberaterin",
  "steuerkanzlei",
  "steuerbüro",
  "kanzlei",
  "anwaltskanzlei",
  "rechtsanwalt",
  "rechtsanwältin",
  "rechtsanwälte",
  "notar",
  "versicherung",
  "versicherungen",
  "versicherungsbüro",
  "hausverwaltung",
  "immobilien",
  "sanitär",
  "heizung",
  "elektro",
  "elektrotechnik",
  "elektriker",
  "malerbetrieb",
  "maler",
  "malermeister",
  "tischlerei",
  "schreinerei",
  "zimmerei",
  "dachdecker",
  "dachdeckerei",
  "metallbau",
  "gartenbau",
  "galabau",
  "gebäudereinigung",
  "umzüge",
  "umzugsunternehmen",
  "friseur",
  "friseurin",
  "friseursalon",
  "physiotherapie",
  "praxis",
  "arztpraxis",
  "zahnarztpraxis",
  "zahnarzt",
  "fahrschule",
  "bestattungen",
  "bäckerei",
  "metzgerei",
  "fleischerei",
  "ingenieurbüro",
  "architekturbüro",
];

/**
 * Endungen, die ein zusammengesetztes Wort als Gewerk ausweisen
 * („Elektrotechnik", „Malerbetrieb", „Hausnotdienst"). Nur lange Endungen,
 * damit Familiennamen nicht hineinfallen.
 */
const TRADE_SUFFIXES = [
  "betrieb",
  "werkstatt",
  "dienst",
  "praxis",
  "beratung",
  "kanzlei",
  "technik",
  "service",
  "büro",
  "reinigung",
];

const WORDS = new Set(TRADE_WORDS);

function isTradePart(part: string): boolean {
  const p = part.toLocaleLowerCase("de-DE").replace(/[^\p{L}]/gu, "");
  if (!p) return false;
  if (WORDS.has(p)) return true;
  return TRADE_SUFFIXES.some(s => p.length > s.length + 2 && p.endsWith(s));
}

/**
 * Ist das (durch Leerraum getrennte) Wort ein Gewerk? Bindestrich-Wörter
 * nur, wenn jeder Teil eins ist („Kfz-Service" ja, „Müller-Elektro" nein).
 */
export function isTradeWord(word: string): boolean {
  const parts = word.split(/[-–]/).filter(Boolean);
  return parts.length > 0 && parts.every(isTradePart);
}
