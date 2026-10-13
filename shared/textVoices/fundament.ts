import type { TextVoice } from "./types";

export const FUNDAMENT: TextVoice = {
  id: "fundament",
  name: "Fundament",
  essence: "Tiefes Marineblau gegen Weiß — Substanz, Seriosität, klare Kante.",
  industries: [
    "fachhandel",
    "immobilien",
    "immobilienmakler",
    "makler",
    "hausverwaltung",
    "versicherung",
    "finanzberatung",
    "vermoegensberatung",
    "notariat",
    "autohaus",
    "abschleppdienst",
    "sicherheitsdienst",
    "detektei",
    "coaching",
    "unternehmensberatung",
    "uebersetzungsbuero",
    "übersetzungsbüro",
  ],
  llmHints: {
    do: [
      "sachliche, vertrauensbildende Sprache",
      "konkrete Zahlen (Objekte, Jahre, Erfolgsquote)",
      "kurze Substantiv-Headlines (2–3 Wörter)",
    ],
    dont: ["Superlative", "Emojis", "lockere Umgangssprache"],
  },
};
