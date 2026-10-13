import type { DesignSystemDef } from "./types";

/** Googles latin-ext-Bereich (Fonts-API, Stand 2026-10). */
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const FREUNDLICH: DesignSystemDef = {
  id: "freundlich",
  name: "Freundlich",
  essence: "Weich, hell, man fühlt sich willkommen",
  // Jedes Foto einmal je Seite (claimPhotos), wie Klar und Nacht.
  freeGalleryBeyondShown: true,
  fonts: {
    display: {
      family: "Bricolage Grotesque",
      fallback: "'Avenir Next', 'Trebuchet MS', system-ui, sans-serif",
      files: [
        // Instanz opsz 72, wdth 100, wght 500–800.
        { file: "bricolage-latin-wght.woff2", weight: "500 800", style: "normal" },
        { file: "bricolage-latin-ext-wght.woff2", weight: "500 800", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
    text: {
      family: "Instrument Sans",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [
        // Instanz wdth 100, wght 400–700.
        { file: "instrument-sans-latin-wght.woff2", weight: "400 700", style: "normal" },
        { file: "instrument-sans-latin-ext-wght.woff2", weight: "400 700", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
  },
  preload: ["bricolage-latin-wght.woff2", "instrument-sans-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(2.875rem, 1.9rem + 4.2vw, 6rem)", line: 1.02, track: "-0.04em", weight: 700 },
    figure: { font: "display", size: "clamp(2.75rem, 2rem + 3.2vw, 4.5rem)", line: 1, track: "-0.035em", weight: 650 },
    h2: { font: "display", size: "clamp(2.25rem, 1.45rem + 3.4vw, 4.75rem)", line: 1.06, track: "-0.035em", weight: 650 },
    h3: { font: "display", size: "clamp(1.375rem, 1.2rem + 0.75vw, 1.875rem)", line: 1.18, track: "-0.02em", weight: 600 },
    lede: { font: "text", size: "clamp(1.1875rem, 1.1rem + 0.4vw, 1.375rem)", line: 1.5, track: "0em", weight: 400 },
    body: { font: "text", size: "clamp(1.125rem, 1.09rem + 0.15vw, 1.1875rem)", line: 1.6, track: "0em", weight: 400 },
    small: { font: "text", size: "1rem", line: 1.5, track: "0em", weight: 400 },
    kicker: { font: "text", size: "1rem", line: 1.25, track: "0em", weight: 500 },
    link: { font: "text", size: "1.0625rem", line: 1.2, track: "0em", weight: 600 },
    mark: { font: "display", size: "clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)", line: 1, track: "-0.03em", weight: 700 },
    data: { font: "text", size: "1.0625rem", line: 1.35, track: "0em", weight: 600 },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6rem",
    section: "clamp(4.5rem, 3.3rem + 5vw, 8rem)",
    gutter: "clamp(1.25rem, 0.95rem + 1.3vw, 2rem)",
    measure: "36rem", max: "86.25rem",
  },
  // Abweichung 1: `shape` (Radien, Druckkante, Kippwinkel, Wolkenkante).
  shape: {
    radius: { s: "12px", m: "20px", l: "28px", pill: "999px" },
    press: "4px", tile: "3px", tilt: "1.5deg", edge: "cloud",
  },
  // Abweichung 2: `band` + `edge` je Palette. Abweichung 3: `tints` (genau vier Pastelle).
  palettes: [
    { id: "wald", name: "Wald", paper: "#f4f0e5", surface: "#ffffff", band: "#eae4d3", ink: "#14261d", muted: "#3f5045", rule: "#ddd6c3",
      accent: "#33684e", deep: "#1b3428", onDeep: "#f4f0e5", signal: "#be5219", onSignal: "#ffffff", edge: "#84360d",
      tints: [
        { id: "blau", bg: "#c9e0f2", ink: "#14261d", muted: "#34485a", edge: "#5488b2" },
        { id: "limette", bg: "#d6e59a", ink: "#14261d", muted: "#3b4a24", edge: "#93a452" },
        { id: "rosa", bg: "#f6d7e8", ink: "#14261d", muted: "#553a49", edge: "#b9849f" },
        { id: "pfirsich", bg: "#f9d8c0", ink: "#14261d", muted: "#57402f", edge: "#b98b69" },
      ] },
    { id: "himmel", name: "Himmel", paper: "#f5f1e8", surface: "#ffffff", band: "#e9e3d6", ink: "#16233b", muted: "#414c63", rule: "#dcd6c8",
      accent: "#28508f", deep: "#1d3157", onDeep: "#f5f1e8", signal: "#f2b632", onSignal: "#16233b", edge: "#16233b",
      tints: [
        { id: "himmel", bg: "#cfe3f6", ink: "#16233b", muted: "#33496a", edge: "#5d8fc4" },
        { id: "sonne", bg: "#f7e6a6", ink: "#16233b", muted: "#4f4423", edge: "#b89a3a" },
        { id: "pfirsich", bg: "#fad9c2", ink: "#16233b", muted: "#5a412f", edge: "#c08a64" },
        { id: "flieder", bg: "#e2dcf5", ink: "#16233b", muted: "#463e66", edge: "#8b7cc0" },
      ] },
    { id: "beere", name: "Beere", paper: "#f7f0ea", surface: "#ffffff", band: "#eee3da", ink: "#2b1627", muted: "#57424f", rule: "#e3d6cd",
      accent: "#8a2f62", deep: "#45203d", onDeep: "#f7f0ea", signal: "#c94a3a", onSignal: "#ffffff", edge: "#7d2a1f",
      tints: [
        { id: "rose", bg: "#f7d4de", ink: "#2b1627", muted: "#5a3644", edge: "#c0879a" },
        { id: "aprikose", bg: "#fbdcc0", ink: "#2b1627", muted: "#5b3f28", edge: "#c6915f" },
        { id: "flieder", bg: "#e6dcf3", ink: "#2b1627", muted: "#4a3b62", edge: "#9784bf" },
        { id: "butter", bg: "#f4e7ad", ink: "#2b1627", muted: "#4f4420", edge: "#b8a24b" },
      ] },
  ],
  // Hebt Handyfotos minimal an, wärmt einen Hauch zur Creme.
  imageFilter: "saturate(1.04) contrast(1.03) brightness(1.02) sepia(.04)",
};
