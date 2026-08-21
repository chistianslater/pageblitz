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
      hex: "#D4749C",
      role: "accent",
      usage:
        "Akzentwort, CTA-Fläche, Zierring-Detail — override-fähig für Studio-Farben.",
    },
    {
      name: "Lilac",
      hex: "#8B6CE8",
      role: "accent-2",
      usage: "Orb-Töne, Zierring-Rahmen — nie als Textfläche.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Rosé.",
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
