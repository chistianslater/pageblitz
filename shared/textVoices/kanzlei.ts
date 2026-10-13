import type { TextVoice } from "./types";

export const KANZLEI: TextVoice = {
  id: "kanzlei",
  name: "Kanzlei",
  essence:
    "Pergament, Kieferngrün und eine ruhige Serife — eine Kammer, kein Raster.",
  industries: [
    "steuerberater",
    "rechtsanwalt",
    "anwalt",
    "notar",
    "unternehmensberatung",
    "finanzberater",
    "wirtschaftspruefer",
    "buchhaltung",
    "anlageservice",
    "anlageberatung",
    "treuhand",
    "wirtschaftsberatung",
    "beratung",
  ],
  llmHints: {
    do: [
      "präzise, nüchterne Sprache",
      "Zahlen und Fakten nach vorn",
      "kurze Substantiv-Headlines (2–3 Wörter)",
      "Vertrauen, Klarheit, Verbindlichkeit — seriöse Beratung, nicht Gerichtssaal",
      "Wortwahl an die tatsächliche Kategorie koppeln (Anlage, Steuer, Recht, Unternehmensberatung)",
    ],
    dont: [
      "Superlative",
      "Emotionalisierung",
      "Emojis oder Ausrufezeichen",
      "Anwalt, Klage, Mandant, Kanzlei, Rechtsgebiet, Prozess — außer die Kategorie ist tatsächlich eine Rechts- oder Steuerkanzlei",
    ],
  },
};
