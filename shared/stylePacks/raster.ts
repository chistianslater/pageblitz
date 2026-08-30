import type { PackConstitution } from "./types";

export const RASTER: PackConstitution = {
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
  theme: "light",
  palette: [
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "canvas",
      usage: "Seitengrund — reines Weiß, viel davon.",
    },
    {
      name: "Papier",
      hex: "#F4F4F1",
      role: "surface",
      usage: "Zurückhaltende Flächen, Tabellenzeilen.",
    },
    {
      name: "Tiefschwarz",
      hex: "#0B0B0A",
      role: "ink",
      usage: "Text — maximaler Kontrast.",
    },
    {
      name: "Grauton",
      hex: "#6B6B64",
      role: "muted",
      usage: "Marginalien, Nummern, Meta.",
    },
    {
      name: "Linie",
      hex: "#D9D9D2",
      role: "line",
      usage: "Rasterlinien — sichtbar, aber leise.",
    },
    {
      name: "Signalrot",
      hex: "#E02D10",
      role: "accent",
      locked: true,
      usage: "Der eine rote Punkt: Nummern, aktive Zustände, CTA.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Signalrot.",
    },
    {
      name: "Dunkelrot",
      hex: "#B62108",
      role: "accent-text",
      usage: "Rote Kleintexte auf Weiß (≥4,5:1).",
    },
  ],
  type: {
    display: {
      family: "Inter Tight",
      weights: [500, 600, 700],
      fallback: "Helvetica, Arial, sans-serif",
      googleCss: "Inter+Tight:wght@500;600;700",
    },
    body: {
      family: "Inter",
      weights: [400, 500],
      fallback: "Helvetica, Arial, sans-serif",
      googleCss: "Inter:wght@400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.4rem, 5.5vw, 4.6rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "flat-ink",
    density: "normal",
  },
  signature: {
    hero: "Rasterbühne: Index-Marginalie (01 — Büro) links, enge Grotesk-Headline über acht Spalten, dokumentarisches Foto rechts mit nummerierter Bildunterschrift, rote Punkt-Markierung vor dem CTA",
    decor: ["column-ruler", "index-margin", "red-dot", "figure-caption"],
    imageTreatment:
      "dokumentarisch, unbeschnitten wirkend, mit nummerierter Bildunterschrift (Abb. 01) — nie dekorativ gerahmt",
  },
  llmHints: {
    do: [
      "präzise, knappe Sachsprache",
      "Projekte und Kennzahlen nüchtern benennen",
      "Substantiv-Headlines",
    ],
    dont: ["Marketing-Adjektive", "Ausrufezeichen", "Emojis"],
  },
};
