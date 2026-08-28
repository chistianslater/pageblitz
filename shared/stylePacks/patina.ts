import type { PackConstitution } from "./types";

export const PATINA: PackConstitution = {
  id: "patina",
  name: "Patina",
  essence:
    "Pergament, Terrakotta und Serifenkursive — wie ein gut gealtertes Journal.",
  industries: [
    "heilpraktiker",
    "naturheilkunde",
    "osteopathie",
    "yoga",
    "massage",
    "hofladen",
    "naturkosmetik",
    "pilates",
    "hotel",
    "boutique-hotel",
    "boutiquehotel",
    "boardinghouse",
    "lodging",
    "resort",
    "unterkunft",
    "lodge",
  ],
  theme: "light",
  palette: [
    {
      name: "Pergament",
      hex: "#FBF4E7",
      role: "canvas",
      usage: "Seitengrund — warmes Pergament.",
    },
    {
      name: "Aged Paper",
      hex: "#EFE5D2",
      role: "surface",
      usage: "Karten, Hervorhebungsflächen.",
    },
    {
      name: "Tinte",
      hex: "#2B2620",
      role: "ink",
      usage: "Text, Initial-Wasserzeichen-Basis.",
    },
    {
      name: "Sepia",
      hex: "#6B5F4E",
      role: "muted",
      usage: "Sekundärtext, Randnotiz.",
    },
    {
      name: "Falzlinie",
      hex: "#E0D3B8",
      role: "line",
      usage: "Hairlines, gestrichelte Trenner.",
    },
    {
      name: "Terrakotta",
      // War #B05A36 — Kontrast gegen Pergament-Canvas nur 4,4:1 (axe
      // color-contrast, B4c Task 7 a11y-Pass), knapp unter 4,5:1. #A8532F
      // ist minimal dunkler, gleiche Terrakotta-Identität, ≥4,5:1.
      hex: "#A8532F",
      role: "accent",
      locked: true,
      usage:
        "Eyebrow, Akzentwort, CTA-Fläche, ·-Separatoren — nie flächig über 24px hinaus.",
    },
    {
      name: "Pergament",
      hex: "#FBF4E7",
      role: "accent-contrast",
      usage: "Text auf Terrakotta.",
    },
  ],
  type: {
    display: {
      family: "Fraunces",
      weights: [400, 600],
      fallback: "Georgia, serif",
      googleCss: "Fraunces:ital,wght@0,400;0,600;1,400;1,600",
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
      heroClamp: "clamp(2.3rem, 5vw, 3.8rem)",
    },
  },
  shape: {
    radiusCard: "14px",
    radiusButton: "999px",
    buttonStyle: "pill-fill",
    density: "airy",
  },
  signature: {
    hero: "riesiges kursives Initial-Wasserzeichen hinter dem Hero + Eyebrow letterspaced Terrakotta + Headline mit kursivem Terrakotta-Akzentwort + Leistungs-Titel als Punkt-Zeile + zwei überlappende Bogen-Bilder + handschriftliche Randnotiz",
    decor: ["initial-watermark", "arch-images", "margin-note", "service-line"],
    imageTreatment:
      "warm, natürlich gesättigt, in doppelten Bogenformen (border-radius 200px 200px 14px 14px) überlappend gerahmt, nie randlos rechteckig",
  },
  llmHints: {
    do: [
      "warme, einladende Sprache in der Sie-Form",
      "sinnliche, konkrete Bezüge zu Ort, Material und Atmosphäre statt Marketing-Floskeln",
      "kurze, ruhige Sätze wie ein persönliches Journal",
      "Wortwahl an die tatsächliche Kategorie koppeln (Hotel, Pension, Praxis, Hofladen, Wellness)",
    ],
    dont: [
      "Heilversprechen oder medizinische Diagnosen",
      "Superlative und Ausrufezeichen",
      "Emojis",
      "Heilpraktiker, Osteopathie, Massagepraxis — außer die Kategorie ist tatsächlich Heilkunde oder Wellness",
    ],
  },
};
