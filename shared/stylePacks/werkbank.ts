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
      hex: "#FF4D00",
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
      heroClamp: "clamp(2.6rem, 6vw, 5rem)",
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
