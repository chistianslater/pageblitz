import type { PackConstitution } from "./types";

export const MORGENLICHT: PackConstitution = {
  id: "morgenlicht",
  name: "Morgenlicht",
  essence:
    "Helles Salbeigrün, runde Formen, viel Luft — beruhigend wie ein guter Empfang.",
  industries: [
    "zahnarzt",
    "arzt",
    "physiotherapie",
    "ergotherapie",
    "logopaedie",
    "psychotherapie",
    "hebamme",
    "pflege",
    "tierarzt",
    "apotheke",
  ],
  theme: "light",
  palette: [
    { name: "Morgen", hex: "#F4F8F7", role: "canvas", usage: "Seitengrund." },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten, Pillen-Nav.",
    },
    { name: "Tanne", hex: "#1C2B29", role: "ink", usage: "Text." },
    { name: "Nebel", hex: "#5C6E6B", role: "muted", usage: "Sekundärtext." },
    {
      name: "Lind",
      hex: "#DCEAE7",
      role: "line",
      usage: "Bänder, sanfte Flächen, Chips.",
    },
    {
      name: "Salbei",
      // Als FLÄCHE/CTA unkritisch; als KLEINTEXT auf Morgen nur 4,49:1 →
      // dafür gibt es den dunkleren Textton `accent-text` (Tiefsalbei).
      hex: "#2E7E78",
      role: "accent",
      usage: "CTA, Akzentwort, Chips-Text — override-fähig für Praxisfarben.",
    },
    {
      name: "Tiefsalbei",
      // Dunkleres Salbei für Kleintext (B6-`accent-text`-System wie
      // werkbank/marktplatz/schimmer): 5,90:1 auf Morgen, 6,32:1 auf Weiß,
      // 5,10:1 auf Lind — überall ≥ 4,5:1 (u. a. „Öffnungszeiten"-h3 im
      // Kontakt-Block, Welle-0-Kontrastfix systematisiert).
      hex: "#256A64",
      role: "accent-text",
      usage: "Salbei als Text auf hellem Grund (Mikro-Überschriften).",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Salbei.",
    },
  ],
  type: {
    display: {
      family: "Plus Jakarta Sans",
      weights: [800],
      fallback: "system-ui, sans-serif",
      googleCss: "Plus+Jakarta+Sans:wght@800",
    },
    body: {
      family: "Plus Jakarta Sans",
      weights: [400, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Plus+Jakarta+Sans:wght@400;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.2,
      heroClamp: "clamp(2.2rem, 4.8vw, 3.6rem)",
    },
  },
  shape: {
    radiusCard: "18px",
    radiusButton: "999px",
    buttonStyle: "pill",
    density: "airy",
  },
  signature: {
    hero: "Pillen-Nav als schwebende Leiste + organischer Bild-Blob rechts + 2 schwebende Info-Karten (Öffnungszeiten, Google-Rating) + Wellen-Übergang in Lind-Band mit Leistungs-Chips",
    decor: ["pill-nav", "image-blob", "float-cards", "wave-divider"],
    imageTreatment:
      "weich, hell, im Blob (border-radius:58% 42% 55% 45%/55% 48% 52% 45%)",
  },
  llmHints: {
    do: [
      "warm und beruhigend",
      "Patienten-Perspektive (Sie-Form)",
      "konkrete Entlastung benennen (Angst nehmen, erklären, Zeit)",
    ],
    dont: [
      "Fachjargon ohne Erklärung",
      "Dringlichkeit oder Druck",
      "Heilversprechen",
    ],
  },
};
