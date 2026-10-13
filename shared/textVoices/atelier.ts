import type { TextVoice } from "./types";

export const ATELIER: TextVoice = {
  id: "atelier",
  name: "Atelier",
  essence:
    "Riesige Serifen, harte Kanten, ein Signalrot — Magazin statt Website.",
  industries: [
    "fotograf",
    "fotografie",
    "fotostudio",
    "grafikdesign",
    "architekt",
    "architekturbuero",
    "kunsthandwerk",
    "werbeagentur",
    "innenarchitekt",
  ],
  llmHints: {
    do: [
      "kurze, redaktionelle Sätze wie eine Bildunterschrift",
      "konkrete Substantive statt Adjektive",
      "Leistungen als knappe, nummerierte Begriffe",
    ],
    dont: [
      "verspielte Emojis oder Ausrufezeichen",
      "Marketing-Superlative",
      "lange Schachtelsätze",
    ],
  },
};
