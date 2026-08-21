import type { PackConstitution } from "./types";

export const GUSTO: PackConstitution = {
  id: "gusto",
  name: "Gusto",
  essence:
    "Espresso-Dunkel, warmes Gold, kursive Serifen — ein Abend in einem Satz.",
  industries: [
    "restaurant",
    "trattoria",
    "weinbar",
    "bar",
    "catering",
    "bistro",
  ],
  theme: "dark",
  palette: [
    {
      name: "Espresso",
      hex: "#16110D",
      role: "canvas",
      usage: "Seitengrund — die dunkle Bühne.",
    },
    {
      name: "Mokka",
      hex: "#241C15",
      role: "surface",
      usage: "Karten, Menü-Flächen.",
    },
    {
      name: "Creme",
      hex: "#F3E9DB",
      role: "ink",
      usage: "Text auf dunklem Grund.",
    },
    {
      name: "Sand",
      hex: "#B9A88F",
      role: "muted",
      usage: "Sekundärtext, Beschreibungen.",
    },
    {
      name: "Rauch",
      hex: "#3A2F22",
      role: "line",
      usage: "Punktlinien, Hairlines, Divider.",
    },
    {
      name: "Gold",
      hex: "#C99B4A",
      role: "accent",
      locked: true,
      usage:
        "Rahmen, Preise, Eyebrows, CTA-Fläche — nie als Textfläche über 24px.",
    },
    {
      name: "Espresso",
      hex: "#16110D",
      role: "accent-contrast",
      usage: "Text auf Gold.",
    },
  ],
  type: {
    display: {
      family: "Playfair Display",
      weights: [500],
      fallback: "Georgia, serif",
      googleCss: "Playfair+Display:ital,wght@0,500;1,500",
    },
    body: {
      family: "Lato",
      weights: [300, 400],
      fallback: "system-ui, sans-serif",
      googleCss: "Lato:wght@300;400",
    },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.4rem, 5vw, 4.2rem)" },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "letterspaced-uppercase",
    density: "normal",
  },
  signature: {
    hero: "zentrierte Bühne im doppelten Goldrahmen + gesperrter Eyebrow + Diamant-Ornament-Divider + Menü-Vorschau mit Punktlinien + Teller-Kreis ragt über den Rahmen",
    decor: ["double-frame", "dotted-menu", "ornament-divider", "plate-overlap"],
    imageTreatment:
      "sehr dunkel (brightness .4), warm, als Bühnengrund oder im Teller-Kreis",
  },
  llmHints: {
    do: [
      "sinnliche, kurze Sätze",
      "italienische/regionale Begriffe sparsam und korrekt",
      'Preise im Format „16,5" ohne Euro-Zeichen',
    ],
    dont: ["Superlativ-Stapel", 'das Wort "lecker"', "Emojis"],
  },
};
