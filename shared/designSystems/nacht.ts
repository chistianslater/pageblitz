import type { DesignSystemDef } from "./types";

/** Googles latin-ext-Bereich (Fonts-API, Stand 2026-10). */
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const NACHT: DesignSystemDef = {
  id: "nacht",
  name: "Nacht",
  essence: "Dunkel, warm, ein Abend lang",
  // Abweichung 1: Papier ist dunkel (color-scheme, theme-color, Studio-Rahmen).
  scheme: "dark",
  // Abweichung 3: jedes Foto einmal je Seite — die drei freien Galeriefotos
  // zählen erst nach Einstiegs- und Über-uns-Foto (Abnahme 2026-10-12).
  freeGalleryBeyondShown: true,
  fonts: {
    display: {
      family: "Gilda Display",
      fallback: "'Didot', 'Bodoni 72', Georgia, serif",
      files: [
        { file: "gilda-display-latin.woff2", weight: "400", style: "normal" },
        { file: "gilda-display-latin-ext.woff2", weight: "400", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
    text: {
      family: "Jost",
      fallback: "'Futura', 'Century Gothic', system-ui, sans-serif",
      files: [
        { file: "jost-latin-wght.woff2", weight: "300 700", style: "normal" },
        { file: "jost-latin-ext-wght.woff2", weight: "300 700", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
  },
  preload: ["gilda-display-latin.woff2", "jost-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(2.75rem, 1.9rem + 3.6vw, 6rem)", line: 1, track: "0.02em", weight: 400, upper: true },
    figure: { font: "display", size: "clamp(8.5rem, 6rem + 10.5vw, 16rem)", line: 0.8, track: "-0.01em", weight: 400 },
    h2: { font: "display", size: "clamp(2rem, 1.6rem + 1.7vw, 3.25rem)", line: 1.06, track: "0.015em", weight: 400, upper: true },
    h3: { font: "display", size: "clamp(1.5rem, 1.38rem + 0.5vw, 1.875rem)", line: 1.2, track: "0.005em", weight: 400 },
    lede: { font: "text", size: "clamp(1.25rem, 1.16rem + 0.4vw, 1.5rem)", line: 1.5, track: "0em", weight: 350 },
    body: { font: "text", size: "clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)", line: 1.65, track: "0.005em", weight: 400 },
    small: { font: "text", size: "1rem", line: 1.55, track: "0.01em", weight: 400 },
    kicker: { font: "text", size: "0.9375rem", line: 1.3, track: "0.16em", weight: 500, upper: true },
    link: { font: "text", size: "1rem", line: 1.2, track: "0.14em", weight: 500, upper: true },
    mark: { font: "display", size: "clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)", line: 1, track: "0.08em", weight: 400, upper: true },
    data: { font: "text", size: "1.125rem", line: 1.35, track: "0.01em", weight: 500 },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6.5rem",
    section: "clamp(5rem, 3.6rem + 6vw, 9rem)",
    gutter: "clamp(1.25rem, 0.75rem + 2.15vw, 3rem)",
    measure: "34rem", max: "80rem",
  },
  // Abweichung 2: `glow` (zwei Scheinfarben, Deckkraft 0,34 im System-CSS).
  palettes: [
    { id: "petrol", name: "Petrol", paper: "#1c2a2a", surface: "#24363a", ink: "#f2ece3", muted: "#c5ccc4", rule: "#3a5052",
      accent: "#e1a97c", deep: "#101b1c", onDeep: "#f2ece3", signal: "#d6996a", onSignal: "#132121",
      glow: ["#50784a", "#8c875f"] },
    { id: "pflaume", name: "Pflaume", paper: "#251a20", surface: "#30222a", ink: "#f4ebe6", muted: "#d2c1c5", rule: "#4a3640",
      accent: "#e6a996", deep: "#160f13", onDeep: "#f4ebe6", signal: "#dc9d89", onSignal: "#22161b",
      glow: ["#6e3a4e", "#8a6a55"] },
    { id: "nachtblau", name: "Nachtblau", paper: "#151d2a", surface: "#1d2738", ink: "#eef0f3", muted: "#bfc7d3", rule: "#33405a",
      accent: "#dcc394", deep: "#0c121c", onDeep: "#eef0f3", signal: "#d4b885", onSignal: "#131a26",
      glow: ["#2c4a6e", "#6d6a58"] },
  ],
  // Dunkelt und wärmt jedes Foto; Text auf Foto nur über Verlauf zur Grundfarbe (≥ 88 %).
  imageFilter: "saturate(.78) contrast(1.08) brightness(.8) sepia(.1)",
};
