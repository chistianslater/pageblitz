import type { PackId } from "../siteContract/types";
import { PACK_IDS } from "../siteContract/types";

export interface PackSummary {
  id: PackId;
  name: string;
  essence: string;
  accent: string;
}

/**
 * Handgepflegte Kurzfassung der 14 Style-Pack-Verfassungen — nur was die
 * Landingpage (`PackShowcase`, Hero-Ghost-Rotation) tatsächlich braucht:
 * id/name/essence/accent. Existiert, damit der Landing-Chunk nicht das
 * komplette `shared/stylePacks`-Modul (alle 14 Verfassungen inkl.
 * Typografie/Decor/Hero-Spezifikation, ~2000 Zeilen) laden muss, nur um vier
 * Felder pro Pack anzuzeigen (Task 6, Performance-Hebel Chunking).
 *
 * `accent` ist der Flächen-Akzent (Rolle `accent`, Akzentpunkt der Karte) —
 * nicht der Kleintext-Ton `accent-text` (werkbank/marktplatz/schimmer, B6
 * Task 9). Bei Änderungen an Name/Essenz/Akzentfarbe einer Verfassung muss
 * dieser Eintrag manuell nachgezogen werden — `summary.test.ts` prüft jeden Eintrag
 * gegen `STYLE_PACKS`/`getConstitution` und schlägt fehl, sobald beide
 * Quellen auseinanderlaufen. Reihenfolge = `PACK_IDS`.
 */
export const PACK_SUMMARY: readonly PackSummary[] = [
  {
    id: "werkbank",
    name: "Werkbank",
    essence:
      "Beton, Stahl und eine Signalfarbe — Typografie wie ein Werkstück.",
    accent: "#FF4D00",
  },
  {
    id: "patina",
    name: "Patina",
    essence:
      "Pergament, Terrakotta und Serifenkursive — wie ein gut gealtertes Journal.",
    accent: "#A8532F",
  },
  {
    id: "kanzlei",
    name: "Kanzlei",
    essence:
      "Pergament, Kieferngrün und eine ruhige Serife — eine Kammer, kein Raster.",
    accent: "#3F5C47",
  },
  {
    id: "salon-noir",
    name: "Salon Noir",
    essence:
      "Fast-Schwarz, Champagner und kursive Serifen — Understatement mit Glanz.",
    accent: "#C8A96A",
  },
  {
    id: "morgenlicht",
    name: "Morgenlicht",
    essence:
      "Warmes Morgenlicht, Naturmaterialien und ruhige Serifentypografie — Praxisgefühl wie Premium-Wellness.",
    accent: "#76664C",
  },
  {
    id: "marktplatz",
    name: "Marktplatz",
    essence:
      "Bonbonfarben, runde fette Buchstaben, Sticker — Freude ab der ersten Sekunde.",
    accent: "#FF6B57",
  },
  {
    id: "gusto",
    name: "Gusto",
    essence:
      "Espresso-Dunkel, warmes Gold, kursive Serifen — ein Abend in einem Satz.",
    accent: "#C99B4A",
  },
  {
    id: "landgut",
    name: "Landgut",
    essence: "Leinen, Blattgrün und organische Formen — geerdet und lebendig.",
    accent: "#4A6741",
  },
  {
    id: "atelier",
    name: "Atelier",
    essence:
      "Riesige Serifen, harte Kanten, ein Signalrot — Magazin statt Website.",
    accent: "#E0301E",
  },
  {
    id: "klarwerk",
    name: "Klarwerk",
    essence:
      "Graphitpapier, Kupfer und eine geometrische Grotesk — Präzision statt Bento.",
    accent: "#C45C26",
  },
  {
    id: "verve",
    name: "Verve",
    essence:
      "Kondensierte Versalien, Volt-Akzent, Schräglauf — Bewegung im Stand.",
    accent: "#D4F542",
  },
  {
    id: "zunft",
    name: "Zunft",
    essence:
      "Tiefes Bordeaux, Siegel-Gold, klassische Serifen — Tradition, die man schmeckt.",
    accent: "#5E1F22",
  },
  {
    id: "schimmer",
    name: "Lichtlabor",
    essence:
      "Editoriale Präzision, Makrofotografie und warmes Karmin — Beauty ohne Klischees.",
    accent: "#A4493D",
  },
  {
    id: "fundament",
    name: "Fundament",
    essence:
      "Tiefes Marineblau gegen Weiß — Substanz, Seriosität, klare Kante.",
    accent: "#7A5F2E",
  },
  {
    id: "karat",
    name: "Karat",
    essence:
      "Onyx, Champagner-Gold und hohe Serifen — Vitrinenlicht auf dunklem Samt.",
    accent: "#CBA35C",
  },
  {
    id: "plakat",
    name: "Plakat",
    essence:
      "Knochenweiß, harte schwarze Kanten und Elektroblau — geklebt wie ein Siebdruck-Plakat.",
    accent: "#2B44FF",
  },
  {
    id: "raster",
    name: "Raster",
    essence:
      "Weiß, ein strenges Spaltenraster und ein roter Punkt — Schweizer Typografie ohne Lärm.",
    accent: "#E02D10",
  },
  {
    id: "strom",
    name: "Strom",
    essence:
      "Nachtblau, Elektro-Cyan und Mono-Labels — Kontrollraumlicht mit leisem Glühen.",
    accent: "#3BE0C4",
  },
  {
    id: "riviera",
    name: "Riviera",
    essence:
      "Sonnenweiß, Meerblau und Arkadenbögen — Mittagslicht an einer Uferpromenade.",
    accent: "#0E7898",
  },
  {
    id: "ernte",
    name: "Ernte",
    essence:
      "Cremepapier, tiefes Indigo und Honig-Formen — ein handgezeichnetes Kochbuch im Food-Magazin.",
    accent: "#234386",
  },
];

/** Verifiziert Reihenfolge = `PACK_IDS` (Landing-Grid-Reihenfolge). */
export const PACK_SUMMARY_ORDER: readonly PackId[] = PACK_IDS;
