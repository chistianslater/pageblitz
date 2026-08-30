import type { PackConstitution } from "./types";

export const MORGENLICHT: PackConstitution = {
  id: "morgenlicht",
  name: "Morgenlicht",
  essence:
    "Warmes Morgenlicht, Naturmaterialien und ruhige Serifentypografie — Praxisgefühl wie Premium-Wellness.",
  industries: [
    "zahnarzt",
    "arzt",
    "physiotherapie",
    // GMB/SEO-Kategorie heißt „Physiotherapeut" — ohne diesen Eintrag fiel
    // die Branche in den Fallback-Pool (Abgleich 2026-08-29).
    "physiotherapeut",
    "ergotherapie",
    "logopaedie",
    "psychotherapie",
    "hebamme",
    "pflege",
    "tierarzt",
    "apotheke",
    "optiker",
    "hoerakustiker",
    "hörakustiker",
    "sanitaetshaus",
    "sanitätshaus",
    "podologie",
    "zahntechnik",
    "tagesmutter",
    "tagespflege",
  ],
  theme: "light",
  palette: [
    {
      name: "Elfenbein",
      hex: "#F5F0E8",
      role: "canvas",
      usage: "Seitengrund.",
    },
    {
      name: "Porzellan",
      hex: "#FFFCF7",
      role: "surface",
      usage: "Karten, Pillen-Nav.",
    },
    { name: "Espresso", hex: "#2C2722", role: "ink", usage: "Text." },
    { name: "Taupe", hex: "#74695F", role: "muted", usage: "Sekundärtext." },
    {
      name: "Leinen",
      hex: "#DED2C3",
      role: "line",
      usage: "Bänder, sanfte Flächen, Chips.",
    },
    {
      name: "Bronze",
      hex: "#76664C",
      role: "accent",
      usage: "CTA, Akzentwort und feine Metalltöne.",
    },
    {
      name: "Dunkelbronze",
      hex: "#625239",
      role: "accent-text",
      usage: "Bronze als barrierefreier Kleintext auf hellem Grund.",
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
      family: "Cormorant Garamond",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Cormorant+Garamond:wght@500;600",
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
      heroClamp: "clamp(3.4rem, 7vw, 7.2rem)",
    },
  },
  shape: {
    radiusCard: "8px",
    radiusButton: "999px",
    buttonStyle: "pill",
    density: "airy",
  },
  signature: {
    hero: "Transluzente Pillen-Nav + bildfüllende Wellness-Fotografie rechts + großzügige Serifentypografie + zwei zurückhaltende Praxis-Karten",
    decor: ["pill-nav", "wellness-photo", "serif-editorial", "float-cards"],
    imageTreatment:
      "warmes Tageslicht, Naturmaterialien, entsättigt und ruhig; große asymmetrische Bögen statt verspielter Blobs",
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
