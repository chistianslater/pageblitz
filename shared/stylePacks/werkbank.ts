import type { PackConstitution } from "./types";

export const WERKBANK: PackConstitution = {
  id: "werkbank",
  name: "Werkbank",
  essence: "Beton, Stahl und eine Signalfarbe — Typografie wie ein Werkstück.",
  industries: [
    "schreinerei",
    "tischler",
    "bau",
    "dachdecker",
    "elektriker",
    "sanitaer",
    "kfz",
    "metallbau",
    "maler",
    "geruestbau",
    "handwerk",
    "klempner",
    "schluesseldienst",
  ],
  theme: "light",
  palette: [
    {
      name: "Beton",
      hex: "#E8E6E1",
      role: "canvas",
      usage: "Seitengrund — nie Reinweiß.",
    },
    {
      name: "Putz",
      hex: "#F4F2EE",
      role: "surface",
      usage: "Karten, helle Flächen.",
    },
    {
      name: "Kohle",
      hex: "#191919",
      role: "ink",
      usage: "Text, dunkle Panels, Rail.",
    },
    {
      name: "Staub",
      hex: "#4A4844",
      role: "muted",
      usage: "Sekundärtext, Meta.",
    },
    {
      name: "Fuge",
      hex: "#CFCCC5",
      role: "line",
      usage: "Trennlinien, Rahmen.",
    },
    {
      name: "Signal",
      // War #FF4D00 (Neon-Orange) — Kontrast gegen Beton-Canvas (#E8E6E1) und
      // Weiß-auf-Signal (CTA) lag bei nur ~2,7:1/3,3:1 (axe color-contrast,
      // B4c Task 7 a11y-Pass). #A83600 (dunkleres Rostorange) hält die
      // Signalfarben-Identität, erreicht aber ≥4,5:1 in beiden Richtungen.
      hex: "#A83600",
      role: "accent",
      locked: true,
      usage: "CTA, Akzentwort, Bild-Border — nie großflächig.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Signal/Kohle.",
    },
  ],
  type: {
    display: {
      family: "Archivo Black",
      weights: [400],
      fallback: "'Arial Black', sans-serif",
      googleCss: "Archivo+Black",
    },
    body: {
      family: "Inter",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;600;700",
    },
    utility: {
      family: "Space Mono",
      weights: [400],
      fallback: "monospace",
      googleCss: "Space+Mono",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(1.9rem, 8.5vw, 5rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "block-uppercase",
    density: "dense",
  },
  signature: {
    hero: "vertical-rail + stacked-display (Zeile 2 outline, Zeile 3 accent) + diagonal-photo + marquee",
    decor: ["vertical-rail", "marquee", "diagonal-clip", "mono-index"],
    imageTreatment: "harter Schnitt, warmes Duotone, 8px Signal-Border links",
  },
  llmHints: {
    do: [
      "kurze, direkte Sätze",
      "Versalien-taugliche knappe Headlines (2–4 Wörter pro Zeile)",
      "Leistungen als nummerierte, knappe Begriffe",
    ],
    dont: [
      "blumige Adjektive",
      "Ausrufezeichen-Häufung",
      "englische Buzzwords",
    ],
  },
};
