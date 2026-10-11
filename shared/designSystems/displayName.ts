/**
 * Anzeigename ohne Rechtsform: „Hairlounge Hachtkemper GmbH" wird im großen
 * Namen und im Kopf zu „Hairlounge Hachtkemper". Rechtstexte, Fußadresse,
 * JSON-LD und Seitentitel behalten den vollen Namen — nur die Gestaltung
 * nutzt diese Funktion.
 */

/** Rechtsformen, längste zuerst, damit „GmbH & Co. KG" vor „KG" greift. */
const LEGAL_FORMS = [
  String.raw`gmbh\s*&\s*co\.?\s*kgaa`,
  String.raw`gmbh\s*&\s*co\.?\s*kg`,
  String.raw`ug\s*\(haftungsbeschränkt\)\s*&\s*co\.?\s*kg`,
  String.raw`ug\s*\(haftungsbeschränkt\)`,
  String.raw`&\s*co\.?\s*kg`,
  String.raw`ggmbh`,
  String.raw`gmbh`,
  String.raw`mbh`,
  String.raw`ug`,
  String.raw`e\.\s?kfm\.?`,
  String.raw`e\.\s?kfr\.?`,
  String.raw`e\.\s?k\.?`,
  String.raw`kgaa`,
  String.raw`kg`,
  String.raw`ohg`,
  String.raw`gbr`,
  String.raw`ag`,
];

/** Rechtsform am Ende, davor Leerraum oder Komma (nie am Wortanfang). */
const LEGAL_TAIL = new RegExp(
  String.raw`(?:\s*,\s*|\s+)(?:${LEGAL_FORMS.join("|")})\.?\s*$`,
  "iu"
);

/** „Inh. Maria Müller" / „Inhaberin …" am Ende, auch nach Strich. */
const OWNER_TAIL = /(?:\s*[,–—-]\s*|\s+)inh(?:\.|aber(?:in)?\b)\s*\S.*$/iu;

/** Unter dieser Länge bleibt der volle Name stehen. */
const MIN_LENGTH = 2;

function stripOnce(name: string): string {
  return name
    .replace(OWNER_TAIL, "")
    .replace(LEGAL_TAIL, "")
    .replace(/[\s,–—-]+$/u, "");
}

export function displayName(name: string): string {
  const original = name.trim();
  let current = original;
  // Mehrere Anhänge („Salon GmbH, Inh. X") — höchstens ein paar Runden.
  for (let i = 0; i < 3; i++) {
    const next = stripOnce(current);
    if (next === current) break;
    current = next;
  }
  return current.length >= MIN_LENGTH ? current : original;
}
