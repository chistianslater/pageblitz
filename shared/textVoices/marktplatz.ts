import type { TextVoice } from "./types";

export const MARKTPLATZ: TextVoice = {
  id: "marktplatz",
  name: "Marktplatz",
  essence:
    "Bonbonfarben, runde fette Buchstaben, Sticker — Freude ab der ersten Sekunde.",
  industries: [
    "kita",
    "kindergarten",
    "musikschule",
    "hundeschule",
    "eisdiele",
    "spielwaren",
    "nachhilfe",
    "hundesalon",
    "fahrschule",
    "drogerie",
    "fahrradladen",
    "sprachschule",
    "musikunterricht",
  ],
  llmHints: {
    do: [
      "verspielte, herzliche Sprache mit echter Freude",
      "konkrete Details (Altersgruppen, Schnupperangebote, Ansprechpartner)",
      "kurze, klare Sätze, die auch Eltern beim Überfliegen mitnehmen",
    ],
    dont: [
      "Kinder- oder Tier-Klischees ohne echten Bezug zum Angebot",
      "medizinische oder erzieherische Heilsversprechen",
      "kalte, unternehmerische Fachsprache",
    ],
  },
};
