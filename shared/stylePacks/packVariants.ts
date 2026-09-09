import type { PackId } from "../siteContract/types";
import { designSeed } from "../siteContract/designProfile";
import { getColorWorlds } from "./colorWorlds";
import { getConstitution } from "./index";
import { hexToHsl, hslToHex } from "./colorMath";

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
 * Akzent-Streuung (Betreiber-Befund 2026-09-09): Zwoelf Friseur-Seiten,
 * acht davon in Terracotta. Die Farbwelten drehen nur Grund und Flaeche —
 * der Akzent, den man in Ueberschriften und Buttons sieht, blieb je Pack
 * derselbe. Drei Packs mit warmen Akzenten ergaben also drei Farben.
 *
 * Gedreht wird ausschliesslich der Farbton. Saettigung und Helligkeit
 * bleiben, damit ein gedecktes Pack gedeckt bleibt und ein lautes laut —
 * sonst kippt die kuratierte Wirkung. Die Spannweite reicht bis 80 Grad
 * (Betreiber: "ruhig etwas groesser"): aus Terracotta wird Rose, Ocker
 * oder Weinrot, aber nie Neongruen.
 */
const ACCENT_DREHUNGEN = [-80, -55, -35, -18, 0, 18, 35, 55, 80] as const;

/** Der unveraenderte Akzent aus der Pack-Verfassung. */
export function packAccentHex(packId: PackId): string {
  const eintrag = getConstitution(packId).palette.find(
    color => color.role === "accent"
  );
  if (!eintrag) throw new Error(`Palette-Rolle fehlt: ${packId}/accent`);
  return eintrag.hex;
}

export function pickPackAccent(packId: PackId, businessName: string): string {
  const grad = waehle(ACCENT_DREHUNGEN, businessName, 47);
  const hsl = hexToHsl(packAccentHex(packId));
  // h liegt in 0..1 — Drehung in Grad umrechnen und den Kreis schliessen.
  const h = (((hsl.h + grad / 360) % 1) + 1) % 1;
  return hslToHex({ ...hsl, h });
}

/**
 * Setzt den gedrehten Akzent in ein Welt-Set. Die Welt hat `accent-text`
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
