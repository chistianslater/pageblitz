import type { TextVoice } from "./types";

export const STROM: TextVoice = {
  id: "strom",
  name: "Strom",
  essence:
    "Nachtblau, Elektro-Cyan und Mono-Labels — Kontrollraumlicht mit leisem Glühen.",
  industries: [
    "it-service",
    "it-dienstleistung",
    "softwareentwicklung",
    "webentwicklung",
    "systemhaus",
    "elektrotechnik",
    "elektroinstallation",
    "photovoltaik",
    "solaranlagen",
    "solartechnik",
    "smarthome",
    "ladeinfrastruktur",
    "netzwerktechnik",
  ],
  llmHints: {
    do: [
      "klare, technische Sprache ohne Buzzword-Dichte",
      "Reaktionszeiten, Wartung, Sicherheit konkret machen",
      "kurze Substantiv-Headlines",
    ],
    dont: ["Web3/KI-Buzzwords ohne Substanz", "Emojis", "Superlative"],
  },
};
