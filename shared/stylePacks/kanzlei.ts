import type { PackConstitution } from "./types";

export const KANZLEI: PackConstitution = {
  id: "kanzlei",
  name: "Kanzlei",
  essence: "Weißraum, Hairlines und ein tiefes Blau — Ordnung als Ästhetik.",
  industries: [
    "steuerberater",
    "rechtsanwalt",
    "anwalt",
    "notar",
    "unternehmensberatung",
    "finanzberater",
    "wirtschaftspruefer",
    "buchhaltung",
  ],
  theme: "light",
  palette: [
    {
      name: "Papier",
      hex: "#F7F7F4",
      role: "canvas",
      usage: "Seitengrund — warmes Fast-Weiß.",
    },
    {
      name: "Bogen",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten, Hervorhebungsflächen.",
    },
    {
      name: "Tinte",
      hex: "#101012",
      role: "ink",
      usage: "Text, harte 1px-Linien.",
    },
    {
      name: "Grau",
      hex: "#54544E",
      role: "muted",
      usage: "Sekundärtext, Bildunterschriften.",
    },
    {
      name: "Hairline",
      hex: "#D8D8D2",
      role: "line",
      usage: "Rasterlinien, Spalten-Trenner.",
    },
    {
      name: "Royal",
      hex: "#1D3FBF",
      role: "accent",
      locked: true,
      usage: "Mono-Etiketten, Links, Unterstreichungen — nie als Fläche.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Royal.",
    },
  ],
  type: {
    display: {
      family: "Inter Tight",
      weights: [600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter+Tight:wght@600;700",
    },
    body: {
      family: "Inter Tight",
      weights: [400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter+Tight:wght@400;500",
    },
    utility: {
      family: "IBM Plex Mono",
      weights: [400, 500],
      fallback: "monospace",
      googleCss: "IBM+Plex+Mono:wght@400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.4rem, 5.4vw, 4.4rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "hairline-underline",
    density: "airy",
  },
  signature: {
    hero: "sichtbares Spaltenraster + Mono-Eyebrow + zweifarbige Display-Headline + Seiten-Index rechts oben + §-Wasserzeichen",
    decor: ["column-grid", "mono-index", "paragraph-watermark", "facts-rule"],
    imageTreatment: "entsättigt, kühl, in Hairline-Rahmen, nie randlos",
  },
  llmHints: {
    do: [
      "präzise, nüchterne Sprache",
      "Zahlen und Fakten nach vorn",
      "kurze Substantiv-Headlines (2–3 Wörter)",
    ],
    dont: ["Superlative", "Emotionalisierung", "Emojis oder Ausrufezeichen"],
  },
};
