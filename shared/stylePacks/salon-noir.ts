import type { PackConstitution } from "./types";

export const SALON_NOIR: PackConstitution = {
  id: "salon-noir",
  name: "Salon Noir",
  essence:
    "Fast-Schwarz, Champagner und kursive Serifen — Understatement mit Glanz.",
  industries: [
    "friseur",
    "barbershop",
    "barbier",
    "tattoo",
    "piercing",
    "makeup",
  ],
  theme: "dark",
  palette: [
    {
      name: "Fast-Schwarz",
      hex: "#121110",
      role: "canvas",
      usage: "Seitengrund — die fast-schwarze Bühne.",
    },
    {
      name: "Kohle",
      hex: "#211F1C",
      role: "surface",
      usage: "Karten, Preislisten-Flächen.",
    },
    {
      name: "Ivory",
      hex: "#F4EDE3",
      role: "ink",
      usage: "Text auf dunklem Grund.",
    },
    {
      name: "Rauchgrau",
      hex: "#B5AC9E",
      role: "muted",
      usage: "Sekundärtext, vertikales Seitenlabel.",
    },
    {
      name: "Graphit",
      hex: "#3A362F",
      role: "line",
      usage: "Hairlines, Trenner.",
    },
    {
      name: "Champagner",
      hex: "#C8A96A",
      role: "accent",
      locked: true,
      usage:
        "Passepartout-Rahmen, Preise, Ghost-CTA-Border, Eyebrow — nie flächig über 24px.",
    },
    {
      name: "Fast-Schwarz",
      hex: "#121110",
      role: "accent-contrast",
      usage: "Text auf Champagner.",
    },
  ],
  type: {
    display: {
      family: "Cormorant Garamond",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600",
    },
    body: {
      family: "Jost",
      weights: [300, 400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Jost:wght@300;400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.4rem, 5.2vw, 4.2rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "ghost-letterspaced",
    density: "normal",
  },
  signature: {
    hero: "fixierter Champagner-Passepartout-Rahmen umläuft die ganze Seite + zentrierte Nav mit gesperrtem Serifen-Logo zwischen zwei Link-Gruppen + kursive Serifen-Headline überlappt das rechte Bild-Panel (z-index) + Ghost-CTA + vertikales, letterspaced Seitenlabel rechts",
    decor: [
      "passepartout-frame",
      "centered-nav",
      "headline-image-overlap",
      "ghost-cta",
      "vertical-label",
    ],
    imageTreatment:
      "als Flat-SVG in 1px-Champagner-Rahmen, kein Gradient/Filter — dunkle Flächen mit einem Champagner-Lichtstreifen",
  },
  llmHints: {
    do: [
      "knappe, souveräne Sätze",
      "Handwerksbegriffe präzise verwenden",
      'Preise im Format „ab 45" ohne Euro-Zeichen',
    ],
    dont: ["Superlativ-Stapel", "Emojis", "übertriebene Rabatt-Sprache"],
  },
};
