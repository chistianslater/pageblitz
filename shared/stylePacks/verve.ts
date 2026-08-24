import type { PackConstitution } from "./types";

export const VERVE: PackConstitution = {
  id: "verve",
  name: "Verve",
  essence:
    "Kondensierte Versalien, Volt-Akzent, Schräglauf — Bewegung im Stand.",
  industries: [
    "fitnessstudio",
    "fitness",
    "personal-training",
    "tanzschule",
    "kampfsport",
    "crossfit",
    "boxen",
  ],
  theme: "dark",
  palette: [
    {
      name: "Tiefschwarz",
      hex: "#101114",
      role: "canvas",
      usage: "Seitengrund — die dunkle Bühne.",
    },
    {
      name: "Rauchglas",
      hex: "#1C1E24",
      role: "surface",
      usage: "Karten, Panels, Programm-Flächen.",
    },
    {
      name: "Nebel",
      hex: "#F5F5F2",
      role: "ink",
      usage: "Text auf dunklem Grund.",
    },
    {
      name: "Stahlgrau",
      hex: "#9DA0A8",
      role: "muted",
      usage: "Sekundärtext, Meta.",
    },
    {
      name: "Kohlerand",
      hex: "#2C2E35",
      role: "line",
      usage: "Trenner, Outline-Stroke des Ghost-Worts.",
    },
    {
      name: "Volt",
      hex: "#D4F542",
      role: "accent",
      locked: true,
      usage:
        "Skew-CTA, Volt-Tape, Panel-Border, Headline-Block — nie als Fließtextfarbe.",
    },
    {
      name: "Tiefschwarz",
      hex: "#101114",
      role: "accent-contrast",
      usage: "Text auf Volt.",
    },
  ],
  type: {
    display: {
      family: "Bebas Neue",
      weights: [400],
      fallback: "'Arial Narrow', sans-serif",
      googleCss: "Bebas+Neue",
    },
    body: {
      family: "Inter",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;600;700",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.3rem, 8vw, 5.2rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "skew-uppercase",
    density: "dense",
  },
  signature: {
    hero: "Outline-Riesenwort im Hintergrund (businessName wiederholt, Bebas ~150px, transparent + 1px Line-Stroke) + skewX(-6°)-Panel rechts (Flat-Foto mit 4px-Volt-Border links) + zweizeilige Headline (2. Zeile als Volt-Block skewX(-6°)) + Volt-Tape quer über die Hero-Ecke (rotate(-8°), Bebas letterspaced) + Skew-CTA + Skew-Stat-Chips + Nav mit Bebas-Volt-Logo",
    decor: [
      "ghost-outline-word",
      "skew-panel",
      "volt-tape",
      "skew-cta",
      "skew-stat-chips",
    ],
    imageTreatment:
      "als Flat-SVG im skewX(-6°) Panel mit 4px-Volt-Border links, dunkle Flächen + Volt-Diagonale, kein Gradient/Filter",
  },
  llmHints: {
    do: [
      "kurze, energische Ansagen",
      "konkrete Zahlen/Ergebnisse (Wochen, Wiederholungen, Klassenzeiten)",
      "Versalien-taugliche knappe Headlines (2–4 Wörter pro Zeile)",
    ],
    dont: ["Superlativ-Stapel", "Emojis", "Angst-/Druck-Marketing"],
  },
};
