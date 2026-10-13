import type { TextVoice } from "./types";

export const PLAKAT: TextVoice = {
  id: "plakat",
  name: "Plakat",
  essence:
    "Knochenweiß, harte schwarze Kanten und Elektroblau — geklebt wie ein Siebdruck-Plakat.",
  industries: [
    "tattoostudio",
    "tattoo",
    "piercingstudio",
    "barbershop",
    "streetwear",
    "skateshop",
    "plattenladen",
    "veranstaltungstechnik",
    "eventtechnik",
    "siebdruck",
    "merchandise",
    "boulderhalle",
  ],
  llmHints: {
    do: [
      "kurze, laute Headlines in Alltagssprache",
      "direkte Ansprache (du)",
      "Handwerk und Szene-Glaubwürdigkeit betonen",
    ],
    dont: ["Konzernsprache", "Floskeln wie ganzheitlich", "Passivsätze"],
  },
};
