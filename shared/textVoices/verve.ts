import type { TextVoice } from "./types";

export const VERVE: TextVoice = {
  id: "verve",
  name: "Verve",
  essence:
    "Kondensierte Versalien, Volt-Akzent, Schräglauf — Bewegung im Stand.",
  industries: [
    "fitnessstudio",
    "fitness",
    "personal-training",
    "tanzschule",
    "kampfsport",
    "crossfit",
    "boxen",
    "eventplanung",
    "dj",
    "fotobox",
  ],
  llmHints: {
    do: [
      "kurze, energische Ansagen",
      "konkrete Zahlen/Ergebnisse (Wochen, Wiederholungen, Klassenzeiten)",
      "Versalien-taugliche knappe Headlines (2–4 Wörter pro Zeile)",
    ],
    dont: ["Superlativ-Stapel", "Emojis", "Angst-/Druck-Marketing"],
  },
};
