import type { PackConstitution } from "./types";

export const RIVIERA: PackConstitution = {
  id: "riviera",
  name: "Riviera",
  essence:
    "Sonnenweiß, Meerblau und Arkadenbögen — Mittagslicht an einer Uferpromenade.",
  industries: [
    "ferienwohnung",
    "ferienhaus",
    "apartments",
    "pension",
    "hotel",
    "gaestehaus",
    "gästehaus",
    "strandbar",
    "beachclub",
    "eiscafe",
    "eiscafé",
    "eisdiele",
    "segelschule",
    "surfschule",
    "bootsverleih",
    "reiseveranstalter",
  ],
  theme: "light",
  palette: [
    {
      name: "Sonnenweiß",
      hex: "#FBF7EE",
      role: "canvas",
      usage: "Seitengrund — warmes, helles Kalkweiß.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten, Bögen-Flächen.",
    },
    {
      name: "Meerblau",
      hex: "#173B4C",
      role: "ink",
      usage: "Text — tiefes, entsättigtes Blau.",
    },
    {
      name: "Dunst",
      hex: "#54707E",
      role: "muted",
      usage: "Sekundärtext, Meta.",
    },
    {
      name: "Sandlinie",
      hex: "#E5DCC8",
      role: "line",
      usage: "Trennlinien, Rahmen — sandfarben.",
    },
    {
      name: "Azur",
      hex: "#0E7898",
      role: "accent",
      locked: true,
      usage: "Kursive Akzente, Bögen-Ränder, CTA-Fläche.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Azur.",
    },
  ],
  type: {
    display: {
      family: "Marcellus",
      weights: [400],
      fallback: "Georgia, serif",
      googleCss: "Marcellus",
    },
    body: {
      family: "Karla",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Karla:wght@400;500;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.28,
      heroClamp: "clamp(2.4rem, 5.4vw, 4.4rem)",
    },
  },
  shape: {
    radiusCard: "14px",
    radiusButton: "999px",
    buttonStyle: "pill-azure",
    density: "airy",
  },
  signature: {
    hero: "Promenade: Kapitälchen-Kicker mit Wellenlinie, Marcellus-Headline, Foto im Arkadenbogen (oben halbrund) rechts, Sandstreifen als Fußlinie der Bühne",
    decor: ["arch-window", "wave-rule", "sand-band", "small-caps-kicker"],
    imageTreatment:
      "im Arkadenbogen beschnitten (border-radius oben 999px), leicht warm — wie durch ein Fenster zum Meer",
  },
  llmHints: {
    do: [
      "leichte, einladende Sprache — Licht, Lage, Ruhe",
      "konkrete Ausstattung und Umgebung nennen",
      "Gastfreundschaft ohne Kitsch",
    ],
    dont: ["Paradies-Floskeln", "Emojis", "Superlative wie traumhaft"],
  },
};
