import type { DesignSystemDef } from "./types";

export const WERKSTOFF: DesignSystemDef = {
  id: "werkstoff",
  name: "Werkstoff",
  essence: "Warm, handfest, ehrlich",
  fonts: {
    display: {
      family: "Zilla Slab",
      fallback: "Rockwell, 'Roboto Slab', Georgia, serif",
      files: [{ file: "zilla-slab-latin-700.woff2", weight: "700", style: "normal" }],
    },
    text: {
      family: "Karla",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [{ file: "karla-latin-wght.woff2", weight: "200 800", style: "normal" }],
    },
    // Dritte Rolle für Zettel, Zeiten, Preise, Bildzeilen — nicht vorgeladen.
    mono: {
      family: "DM Mono",
      fallback: "ui-monospace, 'SF Mono', Menlo, monospace",
      files: [{ file: "dm-mono-latin-500.woff2", weight: "500", style: "normal" }],
    },
  },
  preload: ["zilla-slab-latin-700.woff2", "karla-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(3rem, 1.6rem + 5.8vw, 7.25rem)", line: 0.94, track: "-0.012em", weight: 700 },
    figure: { font: "display", size: "clamp(8rem, 4.5rem + 14vw, 17.5rem)", line: 0.8, track: "-0.03em", weight: 700 },
    h2: { font: "display", size: "clamp(2.25rem, 1.6rem + 2.7vw, 4.25rem)", line: 1, track: "-0.01em", weight: 700 },
    h3: { font: "display", size: "clamp(1.375rem, 1.15rem + 0.85vw, 1.875rem)", line: 1.12, track: "-0.005em", weight: 700 },
    lede: { font: "text", size: "clamp(1.1875rem, 1.05rem + 0.55vw, 1.4375rem)", line: 1.42, track: "-0.005em", weight: 500 },
    body: { font: "text", size: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)", line: 1.55, track: "0em", weight: 400 },
    small: { font: "text", size: "0.9375rem", line: 1.45, track: "0em", weight: 400 },
    kicker: { font: "text", size: "0.9375rem", line: 1.3, track: "0.005em", weight: 600 },
    link: { font: "text", size: "1rem", line: 1.3, track: "0em", weight: 600 },
    mark: { font: "display", size: "clamp(1.375rem, 1.25rem + 0.4vw, 1.625rem)", line: 1, track: "-0.01em", weight: 700 },
    data: { font: "mono", size: "clamp(0.8125rem, 0.78rem + 0.12vw, 0.875rem)", line: 1.5, track: "0.03em", weight: 500, upper: true },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6rem",
    section: "clamp(4.5rem, 3.2rem + 5.4vw, 8.5rem)",
    gutter: "clamp(1.25rem, 0.95rem + 1.4vw, 2.5rem)",
    measure: "36rem", max: "90rem",
  },
  palettes: [
    { id: "kiefer", name: "Kiefer", paper: "#f1e6cf", ink: "#211b14", muted: "#5e5243", rule: "#d9c8a6",
      accent: "#a23a1c", deep: "#2a2119", onDeep: "#f1e6cf", signal: "#b2421f", onSignal: "#ffffff" },
    { id: "leinen", name: "Leinen", paper: "#ebe8df", ink: "#1c1f1a", muted: "#575b52", rule: "#cfcbbd",
      accent: "#2f5b3c", deep: "#22281f", onDeep: "#ebe8df", signal: "#2f5b3c", onSignal: "#ffffff" },
    { id: "ton", name: "Ton", paper: "#f4e3d3", ink: "#24180f", muted: "#62503f", rule: "#e0c6ad",
      accent: "#8f4a14", deep: "#3b2414", onDeep: "#f4e3d3", signal: "#94501a", onSignal: "#ffffff" },
  ],
  // Eine warme Gradierung für alle Fotos (Systemblatt `--grade`).
  imageFilter: "saturate(.86) sepia(.1) contrast(1.05) brightness(1.01)",
};
