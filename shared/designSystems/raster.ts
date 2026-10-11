import type { DesignSystemDef } from "./types";

export const RASTER: DesignSystemDef = {
  id: "raster",
  name: "Raster",
  essence: "Schweizerisch, genau, sachlich",
  fonts: {
    display: {
      family: "Geist",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [{ file: "geist-latin-wght.woff2", weight: "100 900", style: "normal" }],
    },
    text: {
      family: "Geist",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [{ file: "geist-latin-wght.woff2", weight: "100 900", style: "normal" }],
    },
  },
  preload: ["geist-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(3.75rem, 1.5rem + 9.4vw, 11rem)", line: 0.88, track: "-0.05em", weight: 400, upper: true },
    figure: { font: "display", size: "clamp(4.5rem, 3rem + 6vw, 8.25rem)", line: 0.9, track: "-0.045em", weight: 400 }, // NEU (Vorschlag)
    h2: { font: "display", size: "clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)", line: 1.08, track: "-0.03em", weight: 400 },
    h3: { font: "text", size: "clamp(1.375rem, 1.15rem + 0.9vw, 1.75rem)", line: 1.22, track: "-0.02em", weight: 400 },
    lede: { font: "display", size: "clamp(1.875rem, 1.35rem + 2.3vw, 3rem)", line: 1.08, track: "-0.03em", weight: 400 },
    body: { font: "text", size: "clamp(1.0625rem, 1rem + 0.25vw, 1.125rem)", line: 1.45, track: "-0.01em", weight: 400 },
    small: { font: "text", size: "0.9375rem", line: 1.35, track: "-0.01em", weight: 400 },
    kicker: { font: "text", size: "1rem", line: 1.3, track: "-0.015em", weight: 400 },
    link: { font: "text", size: "clamp(1.0625rem, 1rem + 0.2vw, 1.125rem)", line: 1.2, track: "-0.015em", weight: 500 },
    mark: { font: "display", size: "clamp(1.375rem, 1.15rem + 0.6vw, 1.75rem)", line: 1, track: "-0.05em", weight: 400, upper: true },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "3.5rem", "2xl": "4.5rem",
    section: "clamp(4rem, 2.5rem + 5.6vw, 7.5rem)",
    gutter: "clamp(1.125rem, -0.1rem + 4.6vw, 4rem)",
    measure: "40rem",
    max: "90rem",
  },
  palettes: [
    { id: "papier", name: "Papier", paper: "#f1f0ec", ink: "#141414", muted: "#5b5a56", rule: "#d3d1cb", accent: "#23419a", deep: "#161616", onDeep: "#f1f0ec", signal: "#23419a", onSignal: "#ffffff" },
    { id: "werk", name: "Werk", paper: "#f7f7f6", ink: "#0e0e0e", muted: "#585858", rule: "#dadada", accent: "#b83a00", deep: "#121212", onDeep: "#f7f7f6", signal: "#ff4f00", onSignal: "#0e0e0e" },
    { id: "kohle", name: "Kohle", paper: "#141414", ink: "#f3f3f0", muted: "#a2a29e", rule: "#333331", accent: "#ffd426", deep: "#050505", onDeep: "#f3f3f0", signal: "#ffd426", onSignal: "#141414" },
  ],
};
