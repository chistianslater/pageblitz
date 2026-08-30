import type { PackConstitution } from "./types";

export const ATELIER: PackConstitution = {
  id: "atelier",
  name: "Atelier",
  essence:
    "Riesige Serifen, harte Kanten, ein Signalrot — Magazin statt Website.",
  industries: [
    "fotograf",
    "fotografie",
    "fotostudio",
    "grafikdesign",
    "architekt",
    "architekturbuero",
    "kunsthandwerk",
    "werbeagentur",
    "innenarchitekt",
  ],
  theme: "light",
  palette: [
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "canvas",
      usage: "Seitengrund — reines Weiß, kein Warmton.",
    },
    {
      name: "Nebel",
      hex: "#EDEDEA",
      role: "surface",
      usage: "Karten, dezente Flächen.",
    },
    {
      name: "Schwarz",
      hex: "#0F0F0F",
      role: "ink",
      usage: "Text, harte 1–3px-Linien, Rahmen.",
    },
    {
      name: "Grau",
      hex: "#555550",
      role: "muted",
      usage: "Sekundärtext, Meta-Zeile, Bildunterschriften.",
    },
    {
      name: "Kante",
      hex: "#0F0F0F",
      role: "line",
      usage: "Harte 1–3px-Linien — kein Hairline-Grau.",
    },
    {
      name: "Signalrot",
      hex: "#E0301E",
      role: "accent",
      locked: true,
      usage: "Masthead-Punkt, Index, Unterstreichung — nie großflächig.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Bildunterschrift auf dem Cover-Bild.",
    },
    {
      // Signalrot #E0301E erreicht auf der Surface (#EDEDEA) nur 3,9:1 —
      // Kleintext (Kicker, Index, tel-small) nutzt den dunkleren Ton.
      name: "Signalrot dunkel",
      hex: "#C02100",
      role: "accent-text",
      usage: "Kicker, Index-Ziffern und Kleintext in Rot.",
    },
  ],
  type: {
    display: {
      family: "Instrument Serif",
      weights: [400],
      fallback: "Georgia, serif",
      googleCss: "Instrument+Serif:ital,wght@0,400;1,400",
    },
    body: {
      family: "Inter",
      weights: [400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500",
    },
    utility: {
      family: "Space Mono",
      weights: [400, 700],
      fallback: "monospace",
      googleCss: "Space+Mono:wght@400;700",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.2rem, 6.5vw, 4.75rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "mono-underline",
    density: "dense",
  },
  signature: {
    hero: "Zeitungs-Masthead volle Breite + Mono-Meta-Zeile + Cover-Komposition (Bild mit Bildzeile links, Caption-Spalte mit Rot-Index rechts)",
    decor: ["newspaper-masthead", "red-index", "caption-column", "mono-nav"],
    imageTreatment: "flache Graustufen-Flächen, 1px-Ink-Rahmen, nie randlos",
  },
  llmHints: {
    do: [
      "kurze, redaktionelle Sätze wie eine Bildunterschrift",
      "konkrete Substantive statt Adjektive",
      "Leistungen als knappe, nummerierte Begriffe",
    ],
    dont: [
      "verspielte Emojis oder Ausrufezeichen",
      "Marketing-Superlative",
      "lange Schachtelsätze",
    ],
  },
};
