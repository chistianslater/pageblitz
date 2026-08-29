import type { PackConstitution } from "./types";

export const KANZLEI: PackConstitution = {
  id: "kanzlei",
  name: "Kanzlei",
  essence:
    "Pergament, Kieferngrün und eine ruhige Serife — eine Kammer, kein Raster.",
  industries: [
    "steuerberater",
    "rechtsanwalt",
    "anwalt",
    "notar",
    "unternehmensberatung",
    "finanzberater",
    "wirtschaftspruefer",
    "buchhaltung",
    "anlageservice",
    "anlageberatung",
    "treuhand",
    "wirtschaftsberatung",
    "beratung",
  ],
  theme: "light",
  palette: [
    {
      name: "Pergament",
      hex: "#F4EFE6",
      role: "canvas",
      usage: "Seitengrund — warmes Papier.",
    },
    {
      name: "Mappe",
      hex: "#E7DFD0",
      role: "surface",
      usage: "Karten, Foto-Passepartout.",
    },
    {
      name: "Tinte",
      hex: "#1A1714",
      role: "ink",
      usage: "Text, Lederlinien, Folio.",
    },
    {
      name: "Sepia",
      hex: "#6A6156",
      role: "muted",
      usage: "Sekundärtext, Bildunterschriften.",
    },
    {
      name: "Faden",
      hex: "#C8B8A2",
      role: "line",
      usage: "Lederlinien, Rahmen.",
    },
    {
      name: "Kiefer",
      hex: "#3F5C47",
      role: "accent",
      locked: true,
      usage: "CTA, Folio, Akzentwort — nie als volle Fläche hinter Text.",
    },
    {
      name: "Pergament",
      hex: "#F4EFE6",
      role: "accent-contrast",
      usage: "Text auf Kiefer.",
    },
  ],
  type: {
    display: {
      family: "Newsreader",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Newsreader:ital,wght@0,500;0,600;1,500;1,600",
    },
    body: {
      family: "Source Sans 3",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Source+Sans+3:wght@400;500;600",
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
      heroClamp: "clamp(2.8rem, 6.2vw, 5.4rem)",
    },
  },
  shape: {
    radiusCard: "2px",
    radiusButton: "2px",
    buttonStyle: "filled-accent",
    density: "airy",
  },
  signature: {
    hero: "Dossier-Split: große Serifen-Headline links, gerahmtes Foto rechts, Folio-Stempel auf dem Passepartout, doppelte Lederlinie unter der Nav",
    decor: ["dossier-split", "folio-stamp", "leather-rule", "ledger-services"],
    imageTreatment: "warm entsättigt, Passepartout mit Lederlinie, nie randlos",
  },
  llmHints: {
    do: [
      "präzise, nüchterne Sprache",
      "Zahlen und Fakten nach vorn",
      "kurze Substantiv-Headlines (2–3 Wörter)",
      "Vertrauen, Klarheit, Verbindlichkeit — seriöse Beratung, nicht Gerichtssaal",
      "Wortwahl an die tatsächliche Kategorie koppeln (Anlage, Steuer, Recht, Unternehmensberatung)",
    ],
    dont: [
      "Superlative",
      "Emotionalisierung",
      "Emojis oder Ausrufezeichen",
      "Anwalt, Klage, Mandant, Kanzlei, Rechtsgebiet, Prozess — außer die Kategorie ist tatsächlich eine Rechts- oder Steuerkanzlei",
    ],
  },
};
