import type { PackId } from "../siteContract/types";
import { designSeed } from "../siteContract/designProfile";
import { getColorWorlds } from "./colorWorlds";

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
