import type { PackConstitution } from "./types";

export const ZUNFT: PackConstitution = {
  id: "zunft",
  name: "Zunft",
  essence:
    "Tiefes Bordeaux, Siegel-Gold, klassische Serifen — Tradition, die man schmeckt.",
  industries: [
    "baeckerei",
    "konditorei",
    "metzgerei",
    "fleischerei",
    "brauerei",
    "weingut",
    "brennerei",
    "hofkaese",
    "schuhmacher",
    "aenderungsschneiderei",
    "änderungsschneiderei",
    "schneiderei",
  ],
  // Gastro-Pack (Bäckerei/Konditorei/Metzgerei — Produkte über Theke/
  // Vitrine) — Angebot-Panel startet im Speisekarten-Modus (B4c Task 7,
  // siehe PackConstitution.prefersMenu).
  prefersMenu: true,
  theme: "light",
  palette: [
    {
      name: "Mehlweiß",
      hex: "#F5EFE2",
      role: "canvas",
      usage: "Seitengrund — helles Mehlweiß.",
    },
    {
      name: "Leinensack",
      hex: "#EDE3CE",
      role: "surface",
      usage: "Karten, Preistafel-Fläche.",
    },
    {
      name: "Ofenschwarz",
      hex: "#2A2118",
      role: "ink",
      usage: "Text, Doppel-Linien-Ornament.",
    },
    {
      name: "Kornstaub",
      // War #7A6A52 — Sekundärtext auf der Leinensack-Fläche (Preistafel)
      // lag bei nur 4,1:1 (axe color-contrast, B4c Task 7 a11y-Pass).
      // #6C5C46 ist minimal dunkler, ≥4,5:1.
      hex: "#6C5C46",
      role: "muted",
      usage: "Sekundärtext, Nav-Links.",
    },
    {
      name: "Mehlstaub",
      hex: "#D9C9A8",
      role: "line",
      usage: "Hairlines, Kartenrahmen.",
    },
    {
      name: "Bordeaux",
      hex: "#5E1F22",
      role: "accent",
      locked: true,
      usage:
        "Logo, Jahres-Stempel, Akzentwort, CTA-Fläche — nie flächig über 24px hinaus.",
    },
    {
      name: "Siegelgold",
      // War #B98A2F — als Preis-Textfarbe in .pb-zf-price (siehe usage
      // unten) lag der Kontrast gegen die Leinensack-Fläche bei nur 2,7:1
      // (axe color-contrast, B4c Task 7 a11y-Pass). #7A5818 (dunkleres,
      // gedeckteres Gold) erreicht ≥4,5:1.
      hex: "#7A5818",
      role: "accent-2",
      usage:
        "Ornament-Bordüre, Preis-Textfarbe in der Preistafel (.pb-zf-price) — sonst nie als große Textfläche.",
    },
    {
      name: "Mehlweiß",
      hex: "#F5EFE2",
      role: "accent-contrast",
      usage: "Text auf Bordeaux.",
    },
  ],
  type: {
    display: {
      family: "Crimson Pro",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Crimson+Pro:ital,wght@0,500;0,600;1,500;1,600",
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
      heroClamp: "clamp(2.3rem, 5vw, 3.9rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "letterspaced-uppercase",
    density: "normal",
  },
  signature: {
    hero: "Ornament-Bordüre in Siegelgold über allem + zentrierte Nav mit Serifen-Logo in Bordeaux + Doppel-Linien-Ornament unter der Nav + Headline mit kursivem Bordeaux-Akzentwort + runder Jahres-Stempel kippt rotate(12°) in die Headline-Ecke + Punktlinien-Preisvorschau mit Gold-Preisen",
    decor: [
      "ornament-border",
      "tilted-stamp",
      "double-rule",
      "dotted-pricetable",
    ],
    imageTreatment:
      "warm, natürlich gesättigt, mit dünnem Mehlstaub-Rahmen (1px) rechteckig gefasst, nie randlos",
  },
  llmHints: {
    do: [
      "traditionsbewusste, konkrete Sprache (Zutaten, Handwerkstechnik, Generationen)",
      "kurze, stolze Sätze wie ein Zunftbrief",
      "regionale und handwerkliche Begriffe korrekt verwenden",
    ],
    dont: [
      "Superlative und Ausrufezeichen",
      "Emojis",
      "Bio- oder Gesundheits-Heilsversprechen ohne Beleg",
    ],
  },
};
