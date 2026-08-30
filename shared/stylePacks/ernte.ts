import type { PackConstitution } from "./types";

export const ERNTE: PackConstitution = {
  id: "ernte",
  name: "Ernte",
  essence:
    "Cremepapier, tiefes Indigo und Honig-Formen — ein handgezeichnetes Kochbuch im Food-Magazin.",
  industries: [
    "feinkost",
    "delikatessen",
    "manufaktur",
    "naturkost",
    "bioladen",
    "unverpackt",
    "kaffeeroesterei",
    "kaffeerösterei",
    "roesterei",
    "rösterei",
    "imkerei",
    "honig",
    "teeladen",
    "confiserie",
    "schokoladenmanufaktur",
    "marmeladenmanufaktur",
    "senfmanufaktur",
    "brennerei",
  ],
  prefersMenu: true,
  theme: "light",
  palette: [
    {
      name: "Cremepapier",
      hex: "#FBF9F6",
      role: "canvas",
      usage: "Seitengrund — warm, papierähnlich.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten — geschichtet auf Creme.",
    },
    {
      name: "Druckschwarz",
      hex: "#191817",
      role: "ink",
      usage: "Fließtext, Haarlinien.",
    },
    {
      name: "Steingrau",
      hex: "#66625B",
      role: "muted",
      usage: "Sekundärtext, Meta.",
    },
    {
      name: "Papierkante",
      hex: "#E8E2D6",
      role: "line",
      usage: "Trennlinien, Kartenränder.",
    },
    {
      name: "Tiefindigo",
      hex: "#234386",
      role: "accent",
      locked: true,
      usage:
        "DIE Strukturfarbe: Headlines, Links, gefüllte Pill-Buttons — nie für Deko-Flächen.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Indigo.",
    },
    {
      name: "Honiggold",
      hex: "#FFC400",
      role: "accent-2",
      usage: "NUR organische Blob-Formen und Illustrations-Washes — nie Buttons, nie Text.",
    },
  ],
  type: {
    display: {
      family: "Bebas Neue",
      weights: [400],
      fallback: "Oswald, Impact, sans-serif",
      googleCss: "Bebas+Neue",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500;600",
    },
    utility: {
      family: "Caveat",
      weights: [500, 600],
      fallback: "cursive",
      googleCss: "Caveat:wght@500;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.2,
      heroClamp: "clamp(2.8rem, 6.5vw, 5.2rem)",
    },
  },
  shape: {
    radiusCard: "8px",
    radiusButton: "32px",
    buttonStyle: "indigo-pill",
    density: "normal",
  },
  signature: {
    hero: "Kochbuch-Split: Caveat-Script-Tagline in Indigo über der Bebas-Versal-Headline, Produktfoto rechts auf organischem Honig-Blob (SVG, solid), Pill-CTA in Indigo, Mint-Blob als Sektionsübergang",
    decor: ["honey-blob", "script-tagline", "indigo-pill", "botanical-line"],
    imageTreatment:
      "freigestellt wirkend auf organischem Solid-Blob (Honig/Mint) — nie hart gerahmt, weiche Karten-Schatten nur auf Cards",
  },
  llmHints: {
    do: [
      "warme, appetitliche Sprache mit Handwerksstolz",
      "Herkunft, Zutaten und kleine Chargen konkret benennen",
      "kurze Versal-Headlines plus eine emotionale Script-Zeile",
    ],
    dont: ["Industrie-Sprache", "Superlative", "Emojis"],
  },
};
