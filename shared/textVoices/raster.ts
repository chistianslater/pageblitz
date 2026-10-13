import type { TextVoice } from "./types";

export const RASTER: TextVoice = {
  id: "raster",
  name: "Raster",
  essence:
    "Weiß, ein strenges Spaltenraster und ein roter Punkt — Schweizer Typografie ohne Lärm.",
  industries: [
    "architekt",
    "architekturbuero",
    "architekturbüro",
    "ingenieurbuero",
    "ingenieurbüro",
    "bauingenieur",
    "vermessung",
    "statiker",
    "stadtplanung",
    "verlag",
    "lektorat",
    "grafikdesign",
    "produktdesign",
  ],
  llmHints: {
    do: [
      "präzise, knappe Sachsprache",
      "Projekte und Kennzahlen nüchtern benennen",
      "Substantiv-Headlines",
    ],
    dont: ["Marketing-Adjektive", "Ausrufezeichen", "Emojis"],
  },
};
