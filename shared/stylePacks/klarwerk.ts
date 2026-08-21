import type { PackConstitution } from "./types";

export const KLARWERK: PackConstitution = {
  id: "klarwerk",
  name: "Klarwerk",
  essence: "Weiß, Geometrie und ein elektrisches Blau — aufgeräumt wie gutes Werkzeug.",
  industries: [
    "it-service",
    "edv",
    "softwareentwicklung",
    "webdesign",
    "agentur",
    "ingenieurbuero",
    "dienstleistung",
    "hausmeisterservice",
    "umzug",
  ],
  theme: "light",
  palette: [
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "canvas",
      usage: "Seitengrund — reines Weiß.",
    },
    {
      name: "Nebel",
      hex: "#F2F4F7",
      role: "surface",
      usage: "Bento-Zellen, dezente Flächen.",
    },
    {
      name: "Tinte",
      hex: "#14171C",
      role: "ink",
      usage: "Text, Terminal-Zellen-Grund.",
    },
    {
      name: "Grau",
      hex: "#5B6472",
      role: "muted",
      usage: "Sekundärtext, Terminal-Prompt-Dimming.",
    },
    {
      name: "Trennlinie",
      hex: "#E3E7ED",
      role: "line",
      usage: "Hairlines, Rahmen.",
    },
    {
      name: "Elektroblau",
      hex: "#3B5BFD",
      role: "accent",
      usage: "Nav-Button, Akzentwort, Bento-Highlight — override-fähig.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Elektroblau.",
    },
  ],
  type: {
    display: {
      family: "Space Grotesk",
      weights: [500, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Space+Grotesk:wght@500;700",
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
      heroClamp: "clamp(2.4rem, 5.6vw, 4.5rem)",
    },
  },
  shape: {
    radiusCard: "14px",
    radiusButton: "8px",
    buttonStyle: "filled-accent",
    density: "normal",
  },
  signature: {
    hero: "Nav mit gefülltem Accent-Button + Headline mit Akzentwort, gefolgt von unregelmäßigem Bento (hohe Terminal-Zelle mit $-Prompts/→-Ergebnissen, Accent-Kennzahl-Zelle, kleine Zelle, breite Status-Zelle mit grünem Punkt)",
    decor: ["irregular-bento", "terminal-cell", "status-dot", "accent-headline"],
    imageTreatment: "flache, gradientenfreie Blau-/Grau-Geometrie — nie Fotos im Bento",
  },
  llmHints: {
    do: [
      "klare, funktionale Sprache wie eine Produkt-UI",
      "konkrete Kennzahlen und Zeitangaben",
      "kurze, aktive Sätze",
    ],
    dont: [
      "Marketing-Superlative",
      "verspielte Emojis",
      "lange Schachtelsätze",
    ],
  },
};
