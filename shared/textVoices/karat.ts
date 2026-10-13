import type { TextVoice } from "./types";

export const KARAT: TextVoice = {
  id: "karat",
  name: "Karat",
  essence:
    "Onyx, Champagner-Gold und hohe Serifen — Vitrinenlicht auf dunklem Samt.",
  industries: [
    "juwelier",
    "goldschmiede",
    "goldschmiedin",
    "uhrmacher",
    "uhren",
    "schmuck",
    "trauringe",
    "luxushotel",
    "boutique-hotel",
    "weinhandlung",
    "parfuemerie",
    "parfümerie",
  ],
  llmHints: {
    do: [
      "leise, präzise Sprache — Material und Handwerk benennen",
      "Maßarbeit, Termine nach Vereinbarung, Beratung betonen",
      "kurze, getragene Headlines",
    ],
    dont: ["Rabatt-Sprache", "Ausrufezeichen", "Emojis"],
  },
};
