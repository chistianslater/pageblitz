import type { PackConstitution } from "./types";

export const KLARWERK: PackConstitution = {
  id: "klarwerk",
  name: "Klarwerk",
  essence:
    "Graphitpapier, Kupfer und eine geometrische Grotesk — Präzision statt Bento.",
  industries: [
    "it-service",
    "it-dienstleister",
    "edv",
    "softwareentwicklung",
    "webdesign",
    "agentur",
    "ingenieurbuero",
    "it",
    "systemhaus",
    "informatik",
    "reisebuero",
  ],
  theme: "light",
  palette: [
    {
      name: "Graphitpapier",
      hex: "#F3F1EB",
      role: "canvas",
      usage: "Seitengrund — warmes Plotterpapier.",
    },
    {
      name: "Platte",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten, Readout-Zellen.",
    },
    {
      name: "Graphit",
      hex: "#161616",
      role: "ink",
      usage: "Text, Haarlinien, Foto-Rahmen.",
    },
    {
      name: "Rauch",
      hex: "#5C5A54",
      role: "muted",
      usage: "Sekundärtext, Readout-Label.",
    },
    {
      name: "Riss",
      hex: "#D4D0C6",
      role: "line",
      usage: "Haarlinien, Spec-Reihen.",
    },
    {
      name: "Kupfer",
      hex: "#C45C26",
      role: "accent",
      usage: "CTA, Index, Akzentwort, Statuspunkt.",
    },
    {
      // Weiß lag mit 4,28:1 knapp unter WCAG AA (axe: serious) —
      // dunkle Tinte auf Kupfer erreicht 4,9:1 und passt zum Tech-Look.
      name: "Tiefschwarz",
      hex: "#0F0E0C",
      role: "accent-contrast",
      usage: "Text auf Kupfer.",
    },
    {
      name: "Rost",
      hex: "#A84A1C",
      role: "accent-text",
      usage: "Kupfer-Text auf hellem Papier (≥ 4,5:1).",
    },
  ],
  type: {
    display: {
      family: "Syne",
      weights: [600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Syne:wght@600;700",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.6rem, 6vw, 5rem)",
    },
  },
  shape: {
    radiusCard: "4px",
    radiusButton: "4px",
    buttonStyle: "filled-accent",
    density: "normal",
  },
  signature: {
    hero: "Instrument-Split: geometrische Headline mit Kupfer-Akzentwort, Arbeitsfoto rechts, darunter ein schmales Readout (Kennzahlen + Statuspunkt)",
    decor: [
      "instrument-readout",
      "copper-rule",
      "spec-sheet",
      "accent-headline",
    ],
    imageTreatment:
      "scharf, kühl, 1px-Graphitrahmen — flache Geometrie nur als Dekor, nie als Foto-Ersatz",
  },
  llmHints: {
    do: [
      "klare, funktionale Sprache",
      "konkrete Kennzahlen und Zeitangaben",
      "kurze, aktive Sätze",
    ],
    dont: [
      "Marketing-Superlative",
      "verspielte Emojis",
      "lange Schachtelsätze",
      "Entwickler-Jargon (Deploy, Repo, Quellcode, Terminal, Tickets) — außer die Kategorie ist Softwareentwicklung",
    ],
  },
};
