import type { DesignSystemDef } from "./types";

export const JOURNAL: DesignSystemDef = {
  id: "journal",
  name: "Journal",
  essence: "Magazin, ruhig, gebildet",
  fonts: {
    display: {
      family: "Newsreader",
      fallback: "Georgia, 'Times New Roman', serif",
      files: [
        { file: "newsreader-latin-o36-wght.woff2", weight: "300 500", style: "normal" },
        { file: "newsreader-latin-o36-wght-italic.woff2", weight: "300 500", style: "italic" },
      ],
    },
    text: {
      family: "Source Sans 3",
      fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      files: [{ file: "source-sans-3-latin-wght.woff2", weight: "200 900", style: "normal" }],
    },
  },
  preload: ["newsreader-latin-o36-wght.woff2", "newsreader-latin-o36-wght-italic.woff2"],
  type: {
    display: { font: "display", size: "clamp(4.5rem, 3rem + 6.4vw, 8.5rem)", line: 0.94, track: "-0.022em", weight: 300 },
    h2: { font: "display", size: "clamp(2rem, 1.55rem + 1.9vw, 3.25rem)", line: 1.08, track: "-0.012em", weight: 300 },
    h3: { font: "display", size: "clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem)", line: 1.25, track: "0.005em", weight: 400 },
    lede: { font: "display", size: "clamp(1.25rem, 1.1rem + 0.65vw, 1.625rem)", line: 1.38, track: "0em", weight: 400 },
    body: { font: "display", size: "1.0625rem", line: 1.6, track: "0.012em", weight: 400 },
    small: { font: "text", size: "0.875rem", line: 1.55, track: "0.02em", weight: 400 },
    kicker: { font: "text", size: "0.6875rem", line: 1.35, track: "0.2em", weight: 500, upper: true },
    link: { font: "text", size: "0.875rem", line: 1.4, track: "0.05em", weight: 400 },
    mark: { font: "display", size: "1rem", line: 1.2, track: "0.22em", weight: 400, upper: true },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: ".875rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6rem",
    section: "clamp(6rem, 4.5rem + 5vw, 10rem)",
    gutter: "clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)",
    measure: "36rem",
    max: "90rem",
  },
  palettes: [
    { id: "papier", name: "Papier", paper: "#f3eee7", ink: "#2f2e2c", muted: "#5d5a55", rule: "#d9d3c9", accent: "#6e5643", deep: "#2f2e2c", onDeep: "#f3eee7" },
    { id: "salbei", name: "Salbei", paper: "#eef0ea", ink: "#232924", muted: "#556057", rule: "#d2d8cd", accent: "#4a6545", deep: "#253027", onDeep: "#eef0ea" },
    { id: "ton", name: "Ton", paper: "#f4ece6", ink: "#2e2420", muted: "#6a5951", rule: "#e0d2c8", accent: "#9a4630", deep: "#2e2420", onDeep: "#f4ece6" },
  ],
};
