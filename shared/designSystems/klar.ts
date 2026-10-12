import type { DesignSystemDef } from "./types";

/** Googles latin-ext-Bereich (Fonts-API, Stand 2026-10). */
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const KLAR: DesignSystemDef = {
  id: "klar",
  name: "Klar",
  essence: "Freundlich, ruhig, gut lesbar",
  // Jedes Foto einmal je Seite (claimPhotos): die drei freien Galeriefotos
  // zählen erst nach den vor der Galerie gezeigten (Einstieg, Über uns).
  freeGalleryBeyondShown: true,
  fonts: {
    display: {
      family: "DM Sans",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [
        // Instanz opsz 24, wght 400–700.
        { file: "dm-sans-latin-wght.woff2", weight: "400 700", style: "normal" },
        { file: "dm-sans-latin-ext-wght.woff2", weight: "400 700", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
    text: {
      family: "Atkinson Hyperlegible Next",
      fallback: "Verdana, system-ui, sans-serif",
      files: [
        { file: "atkinson-next-latin-wght.woff2", weight: "200 800", style: "normal" },
        { file: "atkinson-next-latin-ext-wght.woff2", weight: "200 800", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
  },
  preload: ["dm-sans-latin-wght.woff2", "atkinson-next-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(2.5rem, 1.6rem + 3.85vw, 5rem)", line: 1.03, track: "-0.028em", weight: 560 },
    figure: { font: "display", size: "clamp(3.25rem, 2.3rem + 4vw, 6rem)", line: 0.95, track: "-0.035em", weight: 520 },
    h2: { font: "display", size: "clamp(2rem, 1.5rem + 2.2vw, 3.375rem)", line: 1.08, track: "-0.022em", weight: 560 },
    h3: { font: "display", size: "clamp(1.375rem, 1.27rem + 0.45vw, 1.75rem)", line: 1.2, track: "-0.012em", weight: 620 },
    lede: { font: "text", size: "clamp(1.25rem, 1.16rem + 0.4vw, 1.5rem)", line: 1.45, track: "-0.003em", weight: 400 },
    body: { font: "text", size: "clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)", line: 1.6, track: "0em", weight: 400 },
    small: { font: "text", size: "1rem", line: 1.5, track: "0em", weight: 400 },
    kicker: { font: "text", size: "1rem", line: 1.3, track: "0.005em", weight: 700 },
    link: { font: "text", size: "1.125rem", line: 1.3, track: "0em", weight: 700 },
    mark: { font: "display", size: "clamp(1.25rem, 1.18rem + 0.3vw, 1.5rem)", line: 1.05, track: "-0.02em", weight: 650 },
    data: { font: "text", size: "1.125rem", line: 1.35, track: "0.005em", weight: 700 },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6rem",
    section: "clamp(4rem, 3rem + 4.3vw, 7.5rem)",
    gutter: "clamp(1.25rem, 0.85rem + 1.7vw, 2.5rem)",
    measure: "36rem", max: "82rem",
  },
  // `surface`: Kartenfläche (siehe Abweichung 1 der Endwerte).
  palettes: [
    { id: "lind", name: "Lind", paper: "#f4f7ec", surface: "#ffffff", ink: "#15231a", muted: "#3f5044", rule: "#d6dfcb",
      accent: "#2b5e35", deep: "#173020", onDeep: "#f4f7ec", signal: "#234a2d", onSignal: "#dff0b0",
      fields: [
        { id: "lind", bg: "#dcecac", ink: "#15231a", muted: "#36472a" },
        { id: "tau", bg: "#e2ede4", ink: "#15231a", muted: "#3b4f42" },
        { id: "tief", bg: "#173020", ink: "#f4f7ec", muted: "#c4d4bf" },
      ] },
    { id: "wasser", name: "Wasser", paper: "#f2f6f7", surface: "#ffffff", ink: "#0f2129", muted: "#3c5059", rule: "#d2dee2",
      accent: "#145a73", deep: "#0c2a35", onDeep: "#f2f6f7", signal: "#11475b", onSignal: "#d3eef5",
      fields: [
        { id: "aqua", bg: "#cfe9ef", ink: "#0f2129", muted: "#2d4852" },
        { id: "lind", bg: "#e2edcf", ink: "#0f2129", muted: "#3b4a30" },
        { id: "tief", bg: "#0c2a35", ink: "#f2f6f7", muted: "#b9cfd6" },
      ] },
    { id: "sand", name: "Sand", paper: "#f6f2ec", surface: "#ffffff", ink: "#241c21", muted: "#54464c", rule: "#e2d8cf",
      accent: "#7a3a5f", deep: "#2e1c27", onDeep: "#f6f2ec", signal: "#5a2b47", onSignal: "#f9dfea",
      fields: [
        { id: "sand", bg: "#ebe2d3", ink: "#241c21", muted: "#51443a" },
        { id: "rose", bg: "#f3d9e3", ink: "#241c21", muted: "#573a48" },
        { id: "tief", bg: "#2e1c27", ink: "#f6f2ec", muted: "#dcc6d1" },
      ] },
  ],
  // Hebt schwache Praxisfotos leicht an, ohne zu verfärben.
  imageFilter: "saturate(.94) contrast(1.03) brightness(1.03)",
};
