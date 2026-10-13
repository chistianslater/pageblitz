import type { TextVoice } from "./types";

export const RIVIERA: TextVoice = {
  id: "riviera",
  name: "Riviera",
  essence:
    "Sonnenweiß, Meerblau und Arkadenbögen — Mittagslicht an einer Uferpromenade.",
  industries: [
    "ferienwohnung",
    "ferienhaus",
    "apartments",
    "pension",
    "hotel",
    "gaestehaus",
    "gästehaus",
    "strandbar",
    "beachclub",
    "eiscafe",
    "eiscafé",
    "eisdiele",
    "segelschule",
    "surfschule",
    "bootsverleih",
    "reiseveranstalter",
  ],
  llmHints: {
    do: [
      "leichte, einladende Sprache — Licht, Lage, Ruhe",
      "konkrete Ausstattung und Umgebung nennen",
      "Gastfreundschaft ohne Kitsch",
    ],
    dont: ["Paradies-Floskeln", "Emojis", "Superlative wie traumhaft"],
  },
};
