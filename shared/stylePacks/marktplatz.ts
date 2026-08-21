import type { PackConstitution } from "./types";

export const MARKTPLATZ: PackConstitution = {
  id: "marktplatz",
  name: "Marktplatz",
  essence:
    "Bonbonfarben, runde fette Buchstaben, Sticker — Freude ab der ersten Sekunde.",
  industries: [
    "kita",
    "kindergarten",
    "musikschule",
    "hundeschule",
    "eisdiele",
    "spielwaren",
    "nachhilfe",
  ],
  theme: "light",
  palette: [
    {
      name: "Vanille",
      hex: "#FFF8EC",
      role: "canvas",
      usage: "Seitengrund.",
    },
    { name: "Weiß", hex: "#FFFFFF", role: "surface", usage: "Karten." },
    { name: "Tinte", hex: "#262133", role: "ink", usage: "Text." },
    {
      name: "Fliederrauch",
      hex: "#5D5570",
      role: "muted",
      usage: "Sekundärtext.",
    },
    {
      name: "Puderrand",
      hex: "#F0E4CC",
      role: "line",
      usage: "Hairlines, Kartenschatten.",
    },
    {
      name: "Koralle",
      hex: "#FF6B57",
      role: "accent",
      locked: true,
      usage: "CTA, Akzentwort, Umrandungen — nie flächig über 24px hinaus.",
    },
    {
      name: "Sonne",
      hex: "#FFC838",
      role: "accent-2",
      usage: "Sticker-Pille, Kritzel-Unterstreichung.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Koralle.",
    },
  ],
  type: {
    display: {
      family: "Baloo 2",
      weights: [600, 800],
      fallback: "system-ui, sans-serif",
      googleCss: "Baloo+2:wght@600;800",
    },
    body: {
      family: "Nunito",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Nunito:wght@400;600;700",
    },
    scale: {
      basePx: 16,
      ratio: 1.22,
      heroClamp: "clamp(2.2rem, 4.4vw, 3.4rem)",
    },
  },
  shape: {
    radiusCard: "22px",
    radiusButton: "14px",
    buttonStyle: "hard-shadow-fill",
    density: "normal",
  },
  signature: {
    hero: "Konfetti-Grund aus zwei Pastell-Punktmustern + Inhaltskarte im Hero um −1,2° gekippt mit hartem Farbschatten + drei rotierte Sticker (Sonne-Pille, Ink-Karte, gestrichelte Outline-Karte) + Kritzel-Unterstreichung unter dem Akzentwort + Scallop-Kante am Hero-Ende",
    decor: [
      "confetti-ground",
      "tilted-card",
      "stickers",
      "squiggle-underline",
      "scallop-edge",
    ],
    imageTreatment:
      "flach und verspielt wie Bonbon-Formen, ohne Fotorealismus — frei im Konfetti-Grund platziert, nie randlos rechteckig",
  },
  llmHints: {
    do: [
      "verspielte, herzliche Sprache mit echter Freude",
      "konkrete Details (Altersgruppen, Schnupperangebote, Ansprechpartner)",
      "kurze, klare Sätze, die auch Eltern beim Überfliegen mitnehmen",
    ],
    dont: [
      "Kinder- oder Tier-Klischees ohne echten Bezug zum Angebot",
      "medizinische oder erzieherische Heilsversprechen",
      "kalte, unternehmerische Fachsprache",
    ],
  },
};
