import type { DesignSystemDef } from "./types";

/** Googles latin-ext-Bereich (Fonts-API, Stand 2026-10). */
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const PLAKAT: DesignSystemDef = {
  id: "plakat",
  name: "Plakat",
  essence: "Laut, fröhlich, selbstbewusst",
  fonts: {
    display: {
      family: "League Gothic",
      fallback: "'Oswald', 'Arial Narrow', Impact, sans-serif",
      files: [
        { file: "league-gothic-latin-wdth.woff2", weight: "400", style: "normal" },
        // Türkische, polnische, tschechische … Namen (ş ğ İ ł ć č ž ő …).
        { file: "league-gothic-latin-ext-wdth.woff2", weight: "400", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
    text: {
      family: "Hanken Grotesk",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [
        { file: "hanken-grotesk-latin-wght.woff2", weight: "100 900", style: "normal" },
        { file: "hanken-grotesk-latin-ext-wght.woff2", weight: "100 900", style: "normal", unicodeRange: LATIN_EXT },
        // Pfeil der Knöpfe (→) — fehlt im latin-Schnitt.
        { file: "hanken-grotesk-arrow-wght.woff2", weight: "100 900", style: "normal", unicodeRange: "U+2192" },
      ],
    },
  },
  preload: ["league-gothic-latin-wdth.woff2", "hanken-grotesk-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(5.75rem, 3.4rem + 10vw, 11rem)", line: 0.9, track: "0.005em", weight: 400, upper: true, stretch: "88%" },
    figure: { font: "display", size: "clamp(10rem, 5rem + 20vw, 22rem)", line: 0.8, track: "0em", weight: 400, upper: true, stretch: "82%" },
    h2: { font: "display", size: "clamp(3rem, 1.9rem + 4.7vw, 6.5rem)", line: 0.92, track: "0.005em", weight: 400, upper: true, stretch: "92%" },
    h3: { font: "text", size: "clamp(1.25rem, 1.1rem + 0.65vw, 1.75rem)", line: 1.15, track: "-0.01em", weight: 650 },
    lede: { font: "text", size: "clamp(1.125rem, 1rem + 0.55vw, 1.4375rem)", line: 1.42, track: "-0.005em", weight: 500 },
    body: { font: "text", size: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)", line: 1.6, track: "0em", weight: 400 },
    small: { font: "text", size: "0.9375rem", line: 1.45, track: "0em", weight: 500 },
    kicker: { font: "text", size: "0.9375rem", line: 1.3, track: "0em", weight: 600 },
    link: { font: "text", size: "1rem", line: 1.3, track: "0em", weight: 650 },
    mark: { font: "display", size: "clamp(1.875rem, 1.6rem + 1.1vw, 2.5rem)", line: 1, track: "0.02em", weight: 400, upper: true, stretch: "100%" },
    data: { font: "text", size: "0.9375rem", line: 1.3, track: "0.01em", weight: 650 },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6.5rem",
    section: "clamp(5rem, 3.6rem + 6vw, 7.5rem)",
    gutter: "clamp(1.25rem, 0.8rem + 1.95vw, 2.5rem)",
    measure: "34rem", max: "90rem",
  },
  palettes: [
    { id: "kante", name: "Kante", paper: "#f4f1ed", ink: "#16141c", muted: "#58546a", rule: "#d8d2cf",
      accent: "#b8282e", deep: "#1c1a44", onDeep: "#f4f1ed", signal: "#e8493a", onSignal: "#16141c",
      fields: [
        { id: "rosa", bg: "#f3b3aa", ink: "#16141c", muted: "#4a3b44" },
        { id: "flieder", bg: "#a8affa", ink: "#16141c", muted: "#2f3164" },
        { id: "nacht", bg: "#1c1a44", ink: "#f4f1ed", muted: "#c3c1de" },
      ] },
    { id: "senf", name: "Senf", paper: "#f6f2ea", ink: "#1b1410", muted: "#5d5048", rule: "#ddd3c6",
      accent: "#b13a10", deep: "#3b1309", onDeep: "#f6f2ea", signal: "#f04e23", onSignal: "#1b1410",
      fields: [
        { id: "senf", bg: "#f6bd3c", ink: "#1b1410", muted: "#4f3a14" },
        { id: "tomate", bg: "#ef7d57", ink: "#1b1410", muted: "#3d1d10" },
        { id: "glut", bg: "#3b1309", ink: "#f6f2ea", muted: "#e3c9bd" },
      ] },
    { id: "puls", name: "Puls", paper: "#f1f3ef", ink: "#0f1a1c", muted: "#4b5a5c", rule: "#cfd8d3",
      accent: "#0d6e5a", deep: "#0f2b33", onDeep: "#f1f3ef", signal: "#1a9470", onSignal: "#0f1a1c",
      fields: [
        { id: "minze", bg: "#8fd6b5", ink: "#0f1a1c", muted: "#24453d" },
        { id: "flieder", bg: "#a3abf8", ink: "#0f1a1c", muted: "#2a2f63" },
        { id: "tief", bg: "#0f2b33", ink: "#f1f3ef", muted: "#b8cdd0" },
      ] },
  ],
  // Graustufe für alle Fotos; Duoton entsteht im System-CSS per mix-blend-mode: multiply auf Feldfarbe.
  imageFilter: "grayscale(1) contrast(1.12) brightness(1.04)",
};
