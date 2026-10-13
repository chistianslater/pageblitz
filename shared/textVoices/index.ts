/**
 * Textstimmen (Packs entfernen, 2026-10-13): die 20 früheren Pack-
 * Verfassungen, reduziert auf Ton und Regeln. Wahl je Betrieb über
 * Branchen-Pool (`getVoicePool`), Kontext-Signale (`rankVoices`) und die
 * Rotation über `layout_counters` (server/generationV2/selectVoice.ts) —
 * unverändert gegenüber der Pack-Wahl. Gespeichert im historischen Feld
 * `stylePackId`.
 */
import { resolveDesignCategory } from "../blueprints/categoryAliases";
import type { PackId } from "../siteContract/types";
import type { TextVoice } from "./types";
import { WERKBANK } from "./werkbank";
import { KANZLEI } from "./kanzlei";
import { MORGENLICHT } from "./morgenlicht";
import { GUSTO } from "./gusto";
import { PATINA } from "./patina";
import { SALON_NOIR } from "./salon-noir";
import { MARKTPLATZ } from "./marktplatz";
import { LANDGUT } from "./landgut";
import { ATELIER } from "./atelier";
import { KLARWERK } from "./klarwerk";
import { VERVE } from "./verve";
import { ZUNFT } from "./zunft";
import { SCHIMMER } from "./schimmer";
import { FUNDAMENT } from "./fundament";
import { KARAT } from "./karat";
import { PLAKAT } from "./plakat";
import { RASTER } from "./raster";
import { STROM } from "./strom";
import { RIVIERA } from "./riviera";
import { ERNTE } from "./ernte";

export type { TextVoice } from "./types";

export const TEXT_VOICES: Partial<Record<PackId, TextVoice>> = {
  werkbank: WERKBANK,
  kanzlei: KANZLEI,
  morgenlicht: MORGENLICHT,
  gusto: GUSTO,
  patina: PATINA,
  "salon-noir": SALON_NOIR,
  marktplatz: MARKTPLATZ,
  landgut: LANDGUT,
  atelier: ATELIER,
  klarwerk: KLARWERK,
  verve: VERVE,
  zunft: ZUNFT,
  schimmer: SCHIMMER,
  fundament: FUNDAMENT,
  karat: KARAT,
  plakat: PLAKAT,
  raster: RASTER,
  strom: STROM,
  riviera: RIVIERA,
  ernte: ERNTE,
};

/**
 * Unbekannte lokale Betriebe (kein Branchenmatch) landen bei Werkbank —
 * einer bewährten Handwerk-/Service-Richtung — nicht bei Klarwerk
 * (IT-Ästhetik). Klarwerk, Kanzlei und Atelier sind nie Generic-Fallback.
 */
export const FALLBACK_VOICE: PackId = "werkbank";

/**
 * Neue Templates: nur bei klarem Keyword-Treffer (IT / Kanzlei / Kreativ)
 * in den Top-Vorschlägen. Nicht als Default, Nachbar-Füller oder unsicherer Score.
 */
export const SELECTIVE_VOICES: ReadonlySet<PackId> = new Set([
  "klarwerk",
  "kanzlei",
  "atelier",
  // Neue Richtungen 2026-08-30: nur bei direktem Branchen-Match anbieten —
  // ihre Ästhetik ist zu spitz für den generischen Füller-Pool.
  "karat",
  "plakat",
  "raster",
  "strom",
]);

export function getVoice(id: PackId): TextVoice {
  const c = TEXT_VOICES[id];
  if (!c) throw new Error(`Textstimme nicht registriert: ${id}`);
  return c;
}

/**
 * Minimale Präfix-Länge für "beginnt mit"-Matches.
 * Verhindert, dass sehr kurze Industry-Keys (z. B. "bar", 3 Zeichen) als
 * Präfix eines unrelated längeren Wortes zählen ("Barbershop" darf NICHT
 * über "bar" auf das Gastro-Pack "gusto" matchen). Exakte Treffer sind davon
 * ausgenommen — "bar" als eigenständiges Wort matcht weiterhin.
 */
const MIN_PREFIX_MATCH_LENGTH = 4;

/** Exakt oder langes Präfix (≥ 8) — selbstbewusster Vorschlag. */
const CONFIDENT_SCORE = 100;

/** Gastgewerbe-Fallback, wenn Hospitality erkannt aber kein Pack scored. */
const HOSPITALITY_FALLBACK: readonly PackId[] = ["patina", "landgut", "gusto"];

/**
 * Unbekannte/unsichere Branche: branchenneutrale Allround-Richtungen,
 * die optisch fast überall tragen — nicht Handwerker-Packs (werkbank/zunft).
 */
export const NEUTRAL_FALLBACK: readonly PackId[] = [
  "patina",
  "fundament",
  "morgenlicht",
];

/**
 * Deutsche Umlaute/ß → ASCII (ae/oe/ue/ss), danach restliche Akzente per NFD
 * abstreifen (Café → cafe). `&` fällt weg, damit "B&B" zu "bb" wird.
 */
function transliterate(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Zerlegt einen transliterierten String in Wort-Tokens (a-z-Läufe plus Bindestrich-Komposita). */
function tokenize(value: string): string[] {
  const prepared = value
    .replace(/\bb\s*&\s*b\b/g, "bed-and-breakfast")
    .replace(/\bbed\s+and\s+breakfast\b/g, "bed-and-breakfast");
  const parts = prepared.split(/[^a-z]+/i).filter(Boolean);
  const hyphenated = prepared
    .split(/[^a-z-]+/i)
    .filter(
      token => token.length > 0 && /[a-z]/i.test(token) && token.includes("-")
    );
  return [...new Set([...parts, ...hyphenated])];
}

/**
 * Längere/exakte Industry-Keys schlagen kurze Prefix-Treffer.
 * Prefix ab 8 Zeichen zählt als selbstbewusst (Handwerker→handwerk,
 * Innenarchitekturbüro→innenarchitekt), kürzere Prefixes sind unsicher.
 */
function matchScore(token: string, industry: string): number {
  if (token === industry) return 100 + industry.length;
  // Deutsche Komposita tragen die Branche am Wortende: „Kebab|imbiss",
  // „Haus|arzt", „Bier|lokal". Das Grundwort bestimmt, was der Betrieb ist —
  // deshalb zählt ein Treffer am Ende so sicher wie ein exakter. Ab vier
  // Zeichen, damit „Sushi|bar" nicht über „bar" läuft.
  if (token.endsWith(industry) && industry.length >= MIN_PREFIX_MATCH_LENGTH) {
    return 100 + industry.length;
  }
  if (
    token.startsWith(industry) &&
    industry.length >= MIN_PREFIX_MATCH_LENGTH
  ) {
    return (industry.length >= 8 ? 100 : 50) + industry.length;
  }
  if (industry.startsWith(token) && token.length >= MIN_PREFIX_MATCH_LENGTH) {
    return (token.length >= 8 ? 100 : 50) + token.length;
  }
  return 0;
}

const HOSPITALITY_TOKENS = new Set([
  "hotel",
  "hotellerie",
  "lodging",
  "lodge",
  "pension",
  "unterkunft",
  "hostel",
  "motel",
  "gaestehaus",
  "garni",
  "boardinghouse",
  "boarding",
  "resort",
  "gasthof",
  "gasthaus",
  "herberge",
  "ferienhof",
  "ferienwohnung",
  "beherbergung",
  "bb",
  "bnb",
  "bedbreakfast",
  "bedandbreakfast",
  "accommodation",
]);

/**
 * Hotel, Pension, Lodge, B&B u. ä. — nicht Restaurant/Café.
 * Packs wie Gusto (Gastro-Stimme) nutzen das, um Kickers nicht vom
 * Tisch-Reservieren ins Zimmer-Willkommen kippen zu lassen.
 */
export function isLodgingCategory(
  category: string | null | undefined
): boolean {
  if (!category?.trim()) return false;
  const tokens = tokenize(transliterate(resolveDesignCategory(category)));
  return isHospitalityQuery(tokens, tokens.join(""));
}

function isHospitalityQuery(tokens: string[], compact: string): boolean {
  if (
    compact === "bb" ||
    compact === "bnb" ||
    compact.includes("bedbreakfast") ||
    compact.includes("boutiquehotel")
  ) {
    return true;
  }
  return tokens.some(
    token =>
      HOSPITALITY_TOKENS.has(token) ||
      token.startsWith("hotel") ||
      token.startsWith("pension") ||
      token.startsWith("lodging") ||
      token.startsWith("lodge") ||
      token.startsWith("boarding")
  );
}

function industryMatchScore(
  tokens: string[],
  compact: string,
  industry: string
): number {
  const industryKey = transliterate(industry);
  const indTokens = tokenize(industryKey);
  const indCompact = indTokens.join("");
  if (!indCompact) return 0;

  if (compact === indCompact && indCompact.length >= 2) {
    return 100 + indCompact.length;
  }

  // "it-service" trifft "IT-Service" (beide Tokens), nicht bloß "Service".
  if (indTokens.length > 1) {
    return indTokens.every(token => tokens.includes(token))
      ? 100 + indCompact.length
      : 0;
  }

  let best = 0;
  for (const token of tokens) {
    best = Math.max(best, matchScore(token, industryKey));
  }
  return best;
}

function bestIndustryScore(
  voice: TextVoice,
  tokens: string[],
  compact: string
): number {
  let best = 0;
  for (const industry of voice.industries) {
    best = Math.max(best, industryMatchScore(tokens, compact, industry));
    if (best >= 200) return best;
  }
  return best;
}

/**
 * Kanonischer Schlüssel einer Branchen-Eingabe für Dedupe/Zählung
 * (Branchen-Lücken-Logging): gleiche Normalisierung wie das Matching,
 * damit „Naturschutzbund", „naturschutz-bund" und „NATURSCHUTZBUND"
 * nicht als getrennte Lücken zählen.
 */
export function normalizeCategoryKey(category: string): string {
  return transliterate(category)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 160);
}

/**
 * Ob IRGENDEIN Pack die Kategorie direkt über `industries` trifft.
 * false ⇒ getVoicePool landet im Neutral-Fallback — das ist das Signal
 * fürs Branchen-Lücken-Logging (neue Template-Richtung priorisieren).
 * Hotellerie zählt als abgedeckt (eigener Hospitality-Fallback ist gewollt).
 */
export function hasDirectVoiceMatch(category: string): boolean {
  const tokens = tokenize(transliterate(resolveDesignCategory(category)));
  const compact = tokens.join("");
  if (!compact) return true;
  if (isHospitalityQuery(tokens, compact)) return true;
  return (Object.values(TEXT_VOICES) as TextVoice[]).some(
    voice => bestIndustryScore(voice, tokens, compact) > 0
  );
}

/** Ob ein Pack die Kategorie direkt über `industries` trifft (kein Fallback). */
export function voiceMatchesCategory(
  packId: PackId,
  categoryKey: string
): boolean {
  const voice = TEXT_VOICES[packId];
  if (!voice) return false;
  const tokens = tokenize(transliterate(resolveDesignCategory(categoryKey)));
  return bestIndustryScore(voice, tokens, tokens.join("")) > 0;
}

/**
 * Ästhetisch kompatible Nachbarn je Designrichtung. Der direkte Branchen-
 * Match bleibt erster Vorschlag; Nachbarn verhindern die frühere
 * 1:1-Zuordnung „Branche = Template".
 *
 * Klarwerk/Kanzlei/Atelier stehen hier nicht als Füller — sie dürfen nur
 * auftauchen, wenn die Kategorie sie direkt und selbstbewusst matcht.
 */
const DIRECTION_NEIGHBORS: Record<PackId, readonly PackId[]> = {
  werkbank: ["fundament", "zunft", "patina"],
  kanzlei: ["fundament", "morgenlicht", "patina"],
  morgenlicht: ["schimmer", "patina", "landgut"],
  gusto: ["landgut", "patina", "zunft"],
  patina: ["landgut", "gusto", "schimmer"],
  "salon-noir": ["schimmer", "patina", "morgenlicht"],
  marktplatz: ["verve", "zunft", "patina"],
  landgut: ["gusto", "patina", "zunft"],
  atelier: ["patina", "schimmer", "fundament"],
  klarwerk: ["fundament", "morgenlicht", "werkbank"],
  verve: ["marktplatz", "werkbank", "fundament"],
  zunft: ["landgut", "werkbank", "patina"],
  schimmer: ["morgenlicht", "salon-noir", "patina"],
  fundament: ["werkbank", "zunft", "morgenlicht"],
  karat: ["salon-noir", "schimmer", "patina"],
  plakat: ["verve", "werkbank", "marktplatz"],
  raster: ["fundament", "atelier", "klarwerk"],
  strom: ["klarwerk", "fundament", "werkbank"],
  riviera: ["landgut", "gusto", "morgenlicht"],
  ernte: ["landgut", "marktplatz", "patina"],
};

/** Bewährte Füller, falls Nachbarn nicht reichen — nie die neuen Templates. */
const SAFE_FILL: readonly PackId[] = [
  "werkbank",
  "gusto",
  "morgenlicht",
  "patina",
  "landgut",
  "fundament",
  "zunft",
];

/**
 * Zielgroesse des Kandidaten-Pools. War 3 — dadurch liefen zwoelf Friseur-
 * Seiten in Bocholt auf exakt drei Packs (4/4/4, gemessen 2026-09-09): bei
 * drei direkten Treffern brach die Erweiterung sofort ab, und der
 * Rotations-Zaehler konnte nur darueber kreisen. Fuenf holt kuratierte
 * Nachbarrichtungen dazu, ohne den Charakter der Branche zu verlassen.
 */
const POOL_ZIELBREITE = 5;

/** Harte Untergrenze — nur hierfuer duerfen die generischen Fueller ran. */
const POOL_MINDESTBREITE = 3;

/**
 * Richtungen, die nie als Nachbar oder Füller in fremde Branchen rutschen.
 * Gusto ist Gastro-Stimme (Speisekarte, „Tisch reservieren") — als Nachbar
 * von Patina/Landgut landete es bei Bestattern, Yogastudios und Blumenläden.
 * Anders als SELECTIVE_VOICES zählt für Gusto auch ein unsicherer Treffer
 * („Dönerladen" über „doener").
 */
const DIRECT_ONLY_VOICES: ReadonlySet<PackId> = new Set([
  ...SELECTIVE_VOICES,
  "gusto",
]);

function allowInPool(id: PackId, direct: PackId[]): boolean {
  return !DIRECT_ONLY_VOICES.has(id) || direct.includes(id);
}

function expandPool(direct: PackId[]): PackId[] {
  const expanded = [...direct];
  // Erst kuratierte Nachbarrichtungen — bis zur Zielbreite.
  for (const primary of direct) {
    for (const neighbor of DIRECTION_NEIGHBORS[primary] ?? []) {
      if (!allowInPool(neighbor, direct)) continue;
      if (!expanded.includes(neighbor)) expanded.push(neighbor);
      if (expanded.length >= POOL_ZIELBREITE) return expanded;
    }
  }
  // Die generischen Fueller nur, wenn sonst nicht einmal drei Kandidaten
  // zusammenkommen. Sie bis zur Zielbreite aufzufuellen wuerde `werkbank`
  // in den Friseur-Pool schieben — genau die Verwaesserung, gegen die die
  // kuratierten Richtungen existieren.
  for (const id of SAFE_FILL) {
    if (expanded.length >= POOL_MINDESTBREITE) break;
    if (!allowInPool(id, direct)) continue;
    if (!expanded.includes(id)) expanded.push(id);
  }
  return expanded;
}

/** Direkte Branchen-Matches zuerst, danach kompatible Richtungen; min. 3. */
export function getVoicePool(categoryKey: string): PackId[] {
  const tokens = tokenize(transliterate(resolveDesignCategory(categoryKey)));
  const compact = tokens.join("");
  const hospitality = isHospitalityQuery(tokens, compact);
  const scored = (Object.values(TEXT_VOICES) as TextVoice[])
    .map(voice => ({
      id: voice.id,
      score: bestIndustryScore(voice, tokens, compact),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const confident = scored.filter(entry => {
    if (entry.score < CONFIDENT_SCORE) return false;
    if (SELECTIVE_VOICES.has(entry.id) && hospitality) return false;
    return true;
  });
  const uncertainSafe = scored.filter(
    entry =>
      entry.score > 0 &&
      entry.score < CONFIDENT_SCORE &&
      !SELECTIVE_VOICES.has(entry.id)
  );

  let base = (confident.length > 0 ? confident : uncertainSafe).map(
    entry => entry.id
  );
  if (hospitality) {
    base = base.filter(id => !SELECTIVE_VOICES.has(id));
  }
  if (base.length === 0) {
    base = hospitality ? [...HOSPITALITY_FALLBACK] : [...NEUTRAL_FALLBACK];
  }

  return expandPool(base);
}

/**
 * Feinwahl innerhalb des Pools nach Kontext (Google-Beschreibung): passt
 * ein Signal, bleiben nur diese Stimmen; sonst der ganze Pool. Der Kontext
 * ändert nie die Fakten des Betriebs (wie zu Pack-Zeiten).
 */
export function rankVoices(pool: readonly PackId[], context = ""): PackId[] {
  const signals: Partial<Record<PackId, RegExp>> = {
    "salon-noir": /boutique|exklusiv|luxus|luxury|premium|balayage/i,
    schimmer: /wellness|pflege|entspann|beauty|kosmetik/i,
    morgenlicht: /familien|familie|kinder|persönlich|gesundheit/i,
    patina: /tradition|handgemacht|gemütlich|historisch/i,
    landgut: /natur|regional|landhaus|garten|nachhaltig/i,
    gusto: /italien|trattoria|pasta|wein|küche/i,
    verve: /urban|sport|fitness|dynamisch|barber/i,
    raster: /architektur|minimal|raum|präzision/i,
    werkbank: /werkstatt|handwerk|schreiner|holz/i,
    klarwerk: /software|digital|technologie|it-service/i,
    fundament: /beratung|sicherheit|immobilien|finanzen/i,
  };
  const matches = pool.filter(id => signals[id]?.test(context));
  return matches.length ? matches : [...pool];
}
