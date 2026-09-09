import type { PackId } from "../siteContract/types";
import { designSeed } from "../siteContract/designProfile";
import { getColorWorlds } from "./colorWorlds";
import { getConstitution } from "./index";

/**
 * Sichtbare Streuung zwischen Seiten desselben Packs (Betreiber-Wunsch
 * 2026-09-05): „so säh jedes Design minimal anders aus".
 *
 * Layouts würfelt `deriveDesignProfile` längst aus dem Betriebsnamen. Was
 * fehlte, waren Farbwelt und Schriftpaar — beide blieben bei jeder
 * Generierung auf dem Pack-Standard.
 *
 * Farbe ist unkritisch: Die Welten werden aus der Pack-Palette selbst
 * abgeleitet, das Pack bleibt also erkennbar. Schrift ist es nicht — die
 * acht Paare sind global, nicht pro Pack abgestimmt. Ein handwerkliches
 * Paar auf einer Kanzlei würde die kuratierte Wirkung zerstören. Deshalb
 * bekommt jedes Pack hier eine eigene Auswahl, aus der gewürfelt wird.
 */
export const PACK_FONT_PAIRS: Record<PackId, readonly string[]> = {
  // Werkstatt, Handwerk, Bau: kräftig und sachlich, nichts Zartes.
  werkbank: ["kraftvoll", "markant", "modern"],
  fundament: ["kraftvoll", "serioes", "modern"],
  zunft: ["klassisch", "kraftvoll", "freundlich"],
  // Gehoben und ruhig.
  "salon-noir": ["elegant", "luxurioes", "modern"],
  karat: ["luxurioes", "elegant", "serioes"],
  schimmer: ["luxurioes", "elegant", "modern"],
  atelier: ["elegant", "modern", "luxurioes"],
  // Warm, traditionell, nahbar.
  patina: ["klassisch", "elegant", "freundlich"],
  landgut: ["klassisch", "freundlich", "elegant"],
  gusto: ["klassisch", "freundlich", "elegant"],
  ernte: ["freundlich", "klassisch", "elegant"],
  marktplatz: ["freundlich", "kraftvoll", "klassisch"],
  morgenlicht: ["freundlich", "elegant", "klassisch"],
  riviera: ["elegant", "freundlich", "modern"],
  // Sachlich, technisch, vertrauensbildend.
  kanzlei: ["serioes", "klassisch", "modern"],
  klarwerk: ["modern", "serioes", "markant"],
  raster: ["modern", "markant", "serioes"],
  strom: ["modern", "markant", "kraftvoll"],
  // Laut und plakativ.
  plakat: ["markant", "kraftvoll", "modern"],
  verve: ["markant", "modern", "kraftvoll"],
};

/**
 * Deterministische Wahl aus einer Liste. Eigener Versatz je Achse, damit
 * Schrift und Farbe nicht aneinanderhängen — sonst bekäme jeder Betrieb mit
 * Schrift A immer auch Welt A, und die Streuung wäre nur halb so groß.
 */
function waehle<T>(werte: readonly T[], name: string, versatz: number): T {
  const seed = designSeed(`${name}:${versatz}`);
  return werte[seed % werte.length];
}

export function pickPackFontPair(packId: PackId, businessName: string): string {
  const liste = PACK_FONT_PAIRS[packId];
  return waehle(liste, businessName, 11);
}

export function pickPackColorWorld(
  packId: PackId,
  businessName: string
): string {
  const welten = getColorWorlds(packId).map(w => w.id);
  return waehle(welten, businessName, 29);
}

/**
 * Akzent-Tafel (Betreiber-Entscheidung 2026-09-09). Zwoelf Friseur-Seiten
 * liefen in Terracotta, weil die Farbwelten nur Grund und Flaeche drehen.
 * Der erste Versuch drehte den Farbton rechnerisch — das ergab gruene und
 * magentafarbene Friseure: HSL-Grad sind perzeptuell ungleich, im Gelb-Gruen-
 * Band springt der Eindruck auf wenigen Grad, im Blau kaum.
 *
 * Deshalb dieselbe Struktur wie bei PACK_FONT_PAIRS: von Hand gesetzte Toene
 * je Pack statt einer Regel. Der erste Eintrag ist immer der Original-Akzent
 * der Verfassung, damit die kuratierte Identitaet in der Mischung bleibt.
 * Auf dunklen Gruenden (gusto, salon-noir, karat, verve, strom) stehen
 * hellere Toene, auf hellen gedecktere — den Rest sichert der Kontrast-Guard
 * in `toCssVars`, geprueft ueber alle Packs x alle Welten.
 */
export const PACK_ACCENTS: Record<PackId, readonly string[]> = {
  // Handwerk: Rost, Ziegel, Stahl — nichts Zartes.
  werkbank: ["#FF4D00", "#C2410C", "#A62B1F", "#2F5D7C", "#8A6A1F"],
  fundament: ["#7A5F2E", "#2F4E7A", "#3F6B5A", "#8A3F3F", "#5A4A6B"],
  zunft: ["#5E1F22", "#8A4A1F", "#6B5A2E", "#3F5C47", "#7A2F4A"],
  // Kanzlei/Beratung: gedeckt, nie modisch.
  kanzlei: ["#3F5C47", "#2F4858", "#5A4632", "#6B3A3A", "#3C4E6B"],
  // Gesundheit: ruhig, hell, kein Alarmrot.
  morgenlicht: ["#76664C", "#5F7A6A", "#4E6E7A", "#8A6B55", "#6B6E8A"],
  patina: ["#A8532F", "#7D6B4F", "#5F7A5A", "#8A5A6B", "#4F7A6B"],
  // Dunkle Gruende — hellere, warme Toene.
  "salon-noir": ["#C8A96A", "#C08A7E", "#A98BB5", "#8FB09A", "#C4776A"],
  // Juwelier: die Materialien des Fachs — Gold, Platin, Rosegold,
  // Smaragd, Saphir. Bewusst anders als salon-noir, das denselben
  // dunklen Grund hat.
  karat: ["#CBA35C", "#A8B8C4", "#D4A0A8", "#4F9E7F", "#5E7FC4"],
  gusto: ["#C99B4A", "#D4703A", "#A8B36A", "#C0554A", "#7FA88A"],
  // Kosmetik/Wellness: warm, aber nicht nur erdig.
  schimmer: ["#A4493D", "#8A5A7A", "#6B7F6A", "#A87B3D", "#5E7A8A"],
  // Gruen und Garten.
  landgut: ["#4A6741", "#6B7F3A", "#8A6A2E", "#3F6B6B", "#8A4A3A"],
  ernte: ["#234386", "#7A8A2E", "#A85A2E", "#5A3F6B", "#2E7A6B"],
  riviera: ["#0E7898", "#2E8B7A", "#C4783D", "#3F5CA8", "#B5546B"],
  // Grafisch und klar.
  atelier: ["#E0301E", "#1F4FD8", "#0F8A6A", "#E07A00", "#6B2FA8"],
  raster: ["#E02D10", "#0F4FA8", "#0F7A5A", "#C47A00", "#5A3FA8"],
  klarwerk: ["#C45C26", "#2F6BB0", "#2E7D6B", "#7A4FA8", "#A63D5E"],
  // Laut.
  marktplatz: ["#FF6B57", "#E8A33D", "#3FA796", "#7B5EA7", "#D6486F"],
  plakat: ["#2B44FF", "#FF2B6B", "#FF7A00", "#00A86B", "#8A2BFF"],
  verve: ["#D4F542", "#3FE0A0", "#FF5CA8", "#4AC8FF", "#FF8A3D"],
  strom: ["#3BE0C4", "#4A9CFF", "#B54AFF", "#FFD24A", "#FF6B9C"],
};

/** Der unveraenderte Akzent aus der Pack-Verfassung. */
export function packAccentHex(packId: PackId): string {
  const eintrag = getConstitution(packId).palette.find(
    color => color.role === "accent"
  );
  if (!eintrag) throw new Error(`Palette-Rolle fehlt: ${packId}/accent`);
  return eintrag.hex;
}

export function pickPackAccent(packId: PackId, businessName: string): string {
  return waehle(PACK_ACCENTS[packId], businessName, 47);
}

/**
 * Setzt den gewaehlten Akzent in ein Welt-Set. Die Welt hat `accent-text`
 * und `accent-contrast` aus dem ALTEN Akzent abgeleitet — beide muessen
 * weichen, sonst stuende neben dem neuen Akzent ein Kleintext im alten Ton.
 * Ohne sie fuehrt der Kontrast-Guard in `toCssVars` sie korrekt nach.
 */
export function weltMitAkzent(
  overrides: Record<string, string>,
  accent: string
): Record<string, string> {
  const rest = { ...overrides };
  delete rest["accent-text"];
  delete rest["accent-contrast"];
  return { ...rest, accent };
}
