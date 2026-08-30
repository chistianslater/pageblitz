import type { PackConstitution } from "./types";

export const SCHIMMER: PackConstitution = {
  id: "schimmer",
  name: "Lichtlabor",
  essence:
    "Editoriale Präzision, Makrofotografie und warmes Karmin — Beauty ohne Klischees.",
  industries: [
    "kosmetikstudio",
    "kosmetik",
    "nagelstudio",
    "wellness",
    "spa",
    "aesthetik",
    "wimpern",
    "sonnenstudio",
    "juwelier",
    "goldschmiede",
    "modegeschaeft",
    "modegeschäft",
    "hochzeitsplaner",
  ],
  theme: "light",
  palette: [
    {
      name: "Laborpapier",
      hex: "#F4F2EF",
      role: "canvas",
      usage: "Seitengrund.",
    },
    {
      name: "Porzellan",
      hex: "#FFFDFC",
      role: "surface",
      usage: "Karten, Glaskarte-Grundton.",
    },
    { name: "Graphit", hex: "#1C1B1A", role: "ink", usage: "Text." },
    {
      name: "Mineralgrau",
      hex: "#68635F",
      role: "muted",
      usage: "Sekundärtext.",
    },
    {
      name: "Kalklinie",
      hex: "#D8D3CE",
      role: "line",
      usage: "Hairlines, Ghost-Pill-Rahmen.",
    },
    {
      name: "Karmin",
      hex: "#A4493D",
      role: "accent",
      usage:
        "Präzise CTA-Fläche und editoriale Markierung; override-fähig für Studio-Farben.",
    },
    {
      name: "Oxid",
      hex: "#87372F",
      role: "accent-text",
      usage: "Akzentwort, Preis, Rubrik und Hover auf hellem Grund.",
    },
    {
      name: "Hautlicht",
      hex: "#D9B8A7",
      role: "accent-2",
      usage: "Warme Medienfläche und feine Markierungen — nie als Kleintext.",
    },
    {
      name: "Porzellan",
      hex: "#FFFDFC",
      role: "accent-contrast",
      usage: "Text auf Karmin (CTA, Insel-Buttons).",
    },
  ],
  type: {
    display: {
      family: "DM Serif Display",
      weights: [400],
      fallback: "Georgia, serif",
      googleCss: "DM+Serif+Display",
    },
    body: {
      family: "Manrope",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Manrope:wght@400;500;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.2,
      heroClamp: "clamp(3rem, 7.2vw, 6.8rem)",
    },
  },
  shape: {
    radiusCard: "2px",
    radiusButton: "999px",
    buttonStyle: "pill",
    density: "airy",
  },
  signature: {
    hero: "Editorialer Beauty-Hero aus monumentaler Serifentypografie, präzisem Laborindex und großem Makrobild; eine warme Karmin-Markierung setzt den Fokus.",
    decor: ["editorial-index", "macro-crop", "light-scan", "hairline-grid"],
    imageTreatment:
      "große, scharfe Makro-Crops von Haut, Textur, Material und Händen; warmes Seitenlicht statt Beauty-Stock und Weichzeichner",
  },
  llmHints: {
    do: [
      "warm, präzise und erwachsen statt verspielt",
      "Ich-Perspektive der Behandlung (was die Kundin erlebt)",
      "Behandlungsablauf, Dauer, Preis und verwendete Produkte konkret benennen",
    ],
    dont: [
      "Heilversprechen oder medizinische Wirkaussagen",
      "Vorher-Nachher-Übertreibungen",
      "Fachjargon ohne Erklärung",
      "Rosa-Wellness-Klischees, Perlmutt-Orbs oder Glassmorphism",
    ],
  },
};
