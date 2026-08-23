import type { PackConstitution } from "./types";

export const SCHIMMER: PackConstitution = {
  id: "schimmer",
  name: "Schimmer",
  essence: "Perlmutt-Verläufe auf hellem Grund — leicht, modern, feminin.",
  industries: [
    "kosmetikstudio",
    "kosmetik",
    "nagelstudio",
    "wellness",
    "spa",
    "aesthetik",
    "wimpern",
    "sonnenstudio",
  ],
  theme: "light",
  palette: [
    {
      name: "Perlmutt",
      hex: "#FDF7FA",
      role: "canvas",
      usage: "Seitengrund.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "surface",
      usage: "Karten, Glaskarte-Grundton.",
    },
    { name: "Tinte", hex: "#241E2A", role: "ink", usage: "Text." },
    {
      name: "Rauchflieder",
      hex: "#6E6377",
      role: "muted",
      usage: "Sekundärtext.",
    },
    {
      name: "Puderrand",
      hex: "#E5D5DE",
      role: "line",
      usage: "Hairlines, Ghost-Pill-Rahmen.",
    },
    {
      name: "Rosé",
      // Original-Rosé (B6 Task 9 zurückgeholt, B4c hatte auf #A8517A
      // gedunkelt). Nur als FLÄCHE/RAND: CTA-Hintergrund (Tinte-Text darauf
      // 5,24:1), Hover-Rahmen — nie als Text auf Perlmutt/Weiß/Glaskarte
      // (dort nur 2,93:1/3,10:1/3,01:1 → `accent-text`). Override-fähig für
      // Studio-Farben (nicht locked).
      hex: "#D4749C",
      role: "accent",
      usage:
        "CTA-Fläche, Hover-Rahmen — nie als Text auf hellem Grund; override-fähig für Studio-Farben.",
    },
    {
      name: "Mauve",
      // Dunkler Rosé-Ton für Kleintext auf Perlmutt (4,82:1) / Weiß (5,09:1) /
      // Glaskarte (4,96:1): Hero-Akzentwort, Preis, Speisekarten-Rubrik, Hover.
      hex: "#A8517A",
      role: "accent-text",
      usage:
        "Rosé als Text auf hellem Grund (Akzentwort, Preis, Rubrik, Hover).",
    },
    {
      name: "Lilac",
      hex: "#8B6CE8",
      role: "accent-2",
      usage: "Orb-Töne, Zierring-Rahmen — nie als Textfläche.",
    },
    {
      name: "Tinte",
      // Text auf Rosé: Weiß erreichte nur 3,10:1, Tinte 5,24:1 — gilt für
      // den Hero-CTA und die Insel-Buttons (Kontaktformular, Chat, Buchung).
      hex: "#241E2A",
      role: "accent-contrast",
      usage: "Text auf Rosé (CTA, Insel-Buttons).",
    },
  ],
  type: {
    display: {
      family: "Outfit",
      weights: [300, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Outfit:wght@300;600",
    },
    body: {
      family: "Outfit",
      weights: [400],
      fallback: "system-ui, sans-serif",
      googleCss: "Outfit:wght@400",
    },
    scale: {
      basePx: 16,
      ratio: 1.2,
      heroClamp: "clamp(2.2rem, 4.8vw, 3.8rem)",
    },
  },
  shape: {
    radiusCard: "24px",
    radiusButton: "999px",
    buttonStyle: "pill",
    density: "airy",
  },
  signature: {
    hero: "Zwei Positionen flacher, konzentrischer Pastell-Orbs hinter dem Inhalt + dünner Lilac-Zierring + rotierter Glas-Chip mit der ersten Leistung + Glaskarte (Weiß-Transparenz, Blur, weicher Schatten) trägt Headline (Gewicht 300, Akzentwort Gewicht 600 solide Rosé), Fließtext und Pill-CTA + Ghost-Pill",
    decor: ["flat-orbs", "glass-card", "accent-ring", "glass-chip"],
    imageTreatment:
      "weich, hell, randlos in Bildkacheln — Tiefe kommt aus Orbs und Glaskarte, nicht aus Bildmasken",
  },
  llmHints: {
    do: [
      "leicht und einladend, wie eine Auszeit",
      "Ich-Perspektive der Behandlung (was die Kundin erlebt)",
      "konkrete Ergebnisse und Ablauf beschreiben statt Versprechen",
    ],
    dont: [
      "Heilversprechen oder medizinische Wirkaussagen",
      "Vorher-Nachher-Übertreibungen",
      "Fachjargon ohne Erklärung",
    ],
  },
};
