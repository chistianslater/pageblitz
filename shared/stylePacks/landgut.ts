import type { PackConstitution } from "./types";

export const LANDGUT: PackConstitution = {
  id: "landgut",
  name: "Landgut",
  essence: "Leinen, Blattgrün und organische Formen — geerdet und lebendig.",
  industries: [
    "gaertnerei",
    "gartenbau",
    "landschaftsbau",
    "florist",
    "blumen",
    "ferienhof",
    "imkerei",
    "baumschule",
    "pension",
    "gaestehaus",
    "unterkunft",
    "hostel",
    "motel",
    "ferienwohnung",
    "gasthof",
    "gasthaus",
    "herberge",
    "lodge",
    "bb",
    "bnb",
    "bedbreakfast",
    "bedandbreakfast",
    "tierpension",
  ],
  theme: "light",
  palette: [
    {
      name: "Leinen",
      hex: "#F6F3EA",
      role: "canvas",
      usage: "Seitengrund — warmes Leinen.",
    },
    {
      name: "Beet",
      hex: "#EDE8D9",
      role: "surface",
      usage: "Karten, Hervorhebungsflächen.",
    },
    {
      name: "Erde",
      hex: "#2E2A20",
      role: "ink",
      usage: "Text.",
    },
    {
      name: "Ton",
      hex: "#6D6656",
      role: "muted",
      usage: "Sekundärtext, Beschreibungen.",
    },
    {
      name: "Furche",
      hex: "#DCD3BC",
      role: "line",
      usage: "Hairlines, Trenner.",
    },
    {
      name: "Blattgrün",
      hex: "#4A6741",
      role: "accent",
      usage:
        "Eyebrow, Akzentwort, CTA-Fläche, Saison-Ticker-Grund — override-fähig für Betriebsfarben.",
    },
    {
      name: "Leinen",
      hex: "#F6F3EA",
      role: "accent-contrast",
      usage: "Text auf Blattgrün.",
    },
  ],
  type: {
    display: {
      family: "Lora",
      weights: [500],
      fallback: "Georgia, serif",
      googleCss: "Lora:ital,wght@0,500;1,500",
    },
    body: {
      family: "Karla",
      weights: [400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Karla:wght@400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.3rem, 4.8vw, 3.7rem)",
    },
  },
  shape: {
    radiusCard: "16px",
    radiusButton: "999px",
    buttonStyle: "pill-fill",
    density: "normal",
  },
  signature: {
    hero: "Eyebrow letterspaced Grün + Serifen-Headline mit kursivem Grün-Akzentwort + drei Pflanzreihen-Bögen unterschiedlicher Höhe rechts (der höchste mit Versal-Label) + Saison-Ticker volle Breite direkt unter dem Hero",
    decor: [
      "plant-row-arches",
      "season-ticker",
      "arch-image-mask",
      "italic-accent-word",
    ],
    imageTreatment:
      "natürlich, erdig gesättigt, in Bogen-Maske (border-radius 120px 120px 16px 16px) — nie randlos rechteckig.",
  },
  llmHints: {
    do: [
      "geerdete, konkrete Sprache mit Orts- und Materialbezug",
      "kurze, ruhige Sätze wie eine Gartenbeschreibung oder Hausprospekt",
      "Wortwahl an die tatsächliche Kategorie koppeln (Garten, Floristik, Pension, Gästehaus)",
    ],
    dont: [
      "Superlative und Ausrufezeichen",
      "Marketing-Floskeln ohne Bezug zur Sache",
      "Emojis",
      "Beet, Pflanzung, Floristik — außer die Kategorie ist Garten, Blumen oder Landschaftsbau",
    ],
  },
};
