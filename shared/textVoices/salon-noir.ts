import type { TextVoice } from "./types";

export const SALON_NOIR: TextVoice = {
  id: "salon-noir",
  name: "Salon Noir",
  essence:
    "Fast-Schwarz, Champagner und kursive Serifen — Understatement mit Glanz.",
  industries: [
    "friseur",
    "barbershop",
    "barbier",
    "tattoo",
    "piercing",
    "makeup",
  ],
  llmHints: {
    do: [
      "knappe, souveräne Sätze",
      "Handwerksbegriffe präzise verwenden",
      'Preise im Format „ab 45" ohne Euro-Zeichen',
    ],
    dont: ["Superlativ-Stapel", "Emojis", "übertriebene Rabatt-Sprache"],
  },
};
