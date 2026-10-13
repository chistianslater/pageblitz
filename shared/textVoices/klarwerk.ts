import type { TextVoice } from "./types";

export const KLARWERK: TextVoice = {
  id: "klarwerk",
  name: "Klarwerk",
  essence:
    "Graphitpapier, Kupfer und eine geometrische Grotesk — Präzision statt Bento.",
  industries: [
    "it-service",
    "it-dienstleister",
    "edv",
    "softwareentwicklung",
    "webdesign",
    "agentur",
    "ingenieurbuero",
    "it",
    "systemhaus",
    "informatik",
    "reisebuero",
  ],
  llmHints: {
    do: [
      "klare, funktionale Sprache",
      "konkrete Kennzahlen und Zeitangaben",
      "kurze, aktive Sätze",
    ],
    dont: [
      "Marketing-Superlative",
      "verspielte Emojis",
      "lange Schachtelsätze",
      "Entwickler-Jargon (Deploy, Repo, Quellcode, Terminal, Tickets) — außer die Kategorie ist Softwareentwicklung",
    ],
  },
};
