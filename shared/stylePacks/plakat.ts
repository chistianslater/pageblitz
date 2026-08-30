import type { PackConstitution } from "./types";

export const PLAKAT: PackConstitution = {
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
  theme: "light",
  palette: [
    {
      name: "Knochen",
      hex: "#F4F0E6",
      role: "canvas",
      usage: "Seitengrund — warmes Papierweiß.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten — immer mit harter schwarzer Kante.",
    },
    {
      name: "Druckschwarz",
      hex: "#121212",
      role: "ink",
      usage: "Text, Kanten, Offset-Schatten.",
    },
    {
      name: "Asche",
      hex: "#57534A",
      role: "muted",
      usage: "Sekundärtext, Meta.",
    },
    {
      name: "Kante",
      hex: "#121212",
      role: "line",
      usage: "Rahmen sind Tinte: 2–3px, nie grau.",
    },
    {
      name: "Elektroblau",
      hex: "#2B44FF",
      role: "accent",
      locked: true,
      usage: "CTA-Fläche, Sticker, Unterstreichungen — knallt gegen Schwarz.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Elektroblau.",
    },
  ],
  type: {
    display: {
      family: "Archivo Black",
      weights: [400],
      fallback: "Impact, sans-serif",
      googleCss: "Archivo+Black",
    },
    body: {
      family: "Public Sans",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Public+Sans:wght@400;600;700",
    },
    scale: {
      basePx: 16,
      ratio: 1.3,
      heroClamp: "clamp(2.6rem, 7.5vw, 5.6rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "hard-shadow-block",
    density: "normal",
  },
  signature: {
    hero: "Plakatwand: Versal-Headline in Archivo Black mit blau unterstrichenem Wort, Foto in 3px-Rahmen mit 10px-Offset-Schatten, rotierter Sticker-Badge mit Google-Wertung",
    decor: ["hard-border", "offset-shadow", "sticker-badge", "underline-block"],
    imageTreatment:
      "roh und ungefiltert, 3px Tintenrahmen + Offset-Schatten — nie randlos, nie abgerundet",
  },
  llmHints: {
    do: [
      "kurze, laute Headlines in Alltagssprache",
      "direkte Ansprache (du)",
      "Handwerk und Szene-Glaubwürdigkeit betonen",
    ],
    dont: ["Konzernsprache", "Floskeln wie ganzheitlich", "Passivsätze"],
  },
};
