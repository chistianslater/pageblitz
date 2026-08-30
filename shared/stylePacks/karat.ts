import type { PackConstitution } from "./types";

export const KARAT: PackConstitution = {
  id: "karat",
  name: "Karat",
  essence:
    "Onyx, Champagner-Gold und hohe Serifen — Vitrinenlicht auf dunklem Samt.",
  industries: [
    "juwelier",
    "goldschmiede",
    "goldschmiedin",
    "uhrmacher",
    "uhren",
    "schmuck",
    "trauringe",
    "luxushotel",
    "boutique-hotel",
    "weinhandlung",
    "parfuemerie",
    "parfümerie",
  ],
  theme: "dark",
  palette: [
    {
      name: "Onyx",
      hex: "#101014",
      role: "canvas",
      usage: "Seitengrund — fast schwarz, minimal blaustichig.",
    },
    {
      name: "Samt",
      hex: "#1A1A21",
      role: "surface",
      usage: "Karten, Vitrinenflächen.",
    },
    {
      name: "Elfenbein",
      hex: "#F2EEE5",
      role: "ink",
      usage: "Text — warmes Weiß, nie reines #fff.",
    },
    {
      name: "Rauch",
      hex: "#A6A296",
      role: "muted",
      usage: "Sekundärtext, Meta, Bildunterschriften.",
    },
    {
      name: "Messinglinie",
      hex: "#33323B",
      role: "line",
      usage: "Haarlinien, Rahmen — dezent, nicht gold.",
    },
    {
      name: "Champagner",
      hex: "#CBA35C",
      role: "accent",
      locked: true,
      usage:
        "Goldene Haarlinien-Rahmen, Kicker, Preisziffern — sparsam wie Blattgold.",
    },
    {
      name: "Tiefbraun",
      hex: "#14100A",
      role: "accent-contrast",
      usage: "Text auf Champagner-Flächen (CTA).",
    },
  ],
  type: {
    display: {
      family: "Cormorant Garamond",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Cormorant+Garamond:ital,wght@0,500;0,600;1,500",
    },
    body: {
      family: "Jost",
      weights: [300, 400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Jost:wght@300;400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.3,
      heroClamp: "clamp(2.6rem, 6vw, 5rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "hairline-gold",
    density: "airy",
  },
  signature: {
    hero: "zentrierte Vitrine: Kicker in gesperrten Kapitälchen zwischen zwei Goldlinien, hohe Serifen-Headline, darunter das Foto in doppeltem Haarlinien-Rahmen mit Gold-Ecke",
    decor: ["hairline-frame", "gold-rule", "tracked-kicker", "double-border"],
    imageTreatment:
      "leicht abgedunkelt (brightness .92), doppelter Haarlinien-Rahmen mit Abstand — nie randlos",
  },
  llmHints: {
    do: [
      "leise, präzise Sprache — Material und Handwerk benennen",
      "Maßarbeit, Termine nach Vereinbarung, Beratung betonen",
      "kurze, getragene Headlines",
    ],
    dont: ["Rabatt-Sprache", "Ausrufezeichen", "Emojis"],
  },
};
