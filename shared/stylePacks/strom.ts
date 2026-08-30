import type { PackConstitution } from "./types";

export const STROM: PackConstitution = {
  id: "strom",
  name: "Strom",
  essence:
    "Nachtblau, Elektro-Cyan und Mono-Labels — Kontrollraumlicht mit leisem Glühen.",
  industries: [
    "it-service",
    "it-dienstleistung",
    "softwareentwicklung",
    "webentwicklung",
    "systemhaus",
    "elektrotechnik",
    "elektroinstallation",
    "photovoltaik",
    "solaranlagen",
    "solartechnik",
    "smarthome",
    "ladeinfrastruktur",
    "netzwerktechnik",
  ],
  theme: "dark",
  palette: [
    {
      name: "Nachtblau",
      hex: "#0A0F1E",
      role: "canvas",
      usage: "Seitengrund — tiefes, kühles Blau.",
    },
    {
      name: "Konsole",
      hex: "#121B33",
      role: "surface",
      usage: "Karten, Terminal-Flächen.",
    },
    {
      name: "Signalweiß",
      hex: "#E9EDF7",
      role: "ink",
      usage: "Text — kühles Weiß.",
    },
    {
      name: "Nebel",
      hex: "#9AA6C0",
      role: "muted",
      usage: "Sekundärtext, Mono-Labels.",
    },
    {
      name: "Leiterbahn",
      hex: "#273353",
      role: "line",
      usage: "Rahmen, Raster — wie Platinenbahnen.",
    },
    {
      name: "Elektro-Cyan",
      hex: "#3BE0C4",
      role: "accent",
      locked: true,
      usage: "Statuspunkte, Glow, CTA — das Licht im Raum.",
    },
    {
      name: "Tiefgrün",
      hex: "#04211B",
      role: "accent-contrast",
      usage: "Text auf Cyan-Flächen.",
    },
  ],
  type: {
    display: {
      family: "Sora",
      weights: [500, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Sora:wght@500;600;700",
    },
    body: {
      family: "IBM Plex Sans",
      weights: [400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "IBM+Plex+Sans:wght@400;500",
    },
    utility: {
      family: "IBM Plex Mono",
      weights: [400, 500],
      fallback: "ui-monospace, monospace",
      googleCss: "IBM+Plex+Mono:wght@400;500",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.3rem, 5vw, 4.2rem)",
    },
  },
  shape: {
    radiusCard: "10px",
    radiusButton: "8px",
    buttonStyle: "glow-solid",
    density: "normal",
  },
  signature: {
    hero: "Kontrollraum: Mono-Statuszeile (● SYSTEME BEREIT) über der Headline, Aurora-Glow hinter der rechten Bildkarte, Kennzahlen-Terminal mit Leiterbahn-Rahmen unter dem CTA",
    decor: ["aurora-glow", "mono-status", "circuit-frame", "terminal-stats"],
    imageTreatment:
      "in einer Konsolen-Karte mit Leiterbahn-Rahmen und Statuszeile — leicht abgedunkelt, kühle Temperatur",
  },
  llmHints: {
    do: [
      "klare, technische Sprache ohne Buzzword-Dichte",
      "Reaktionszeiten, Wartung, Sicherheit konkret machen",
      "kurze Substantiv-Headlines",
    ],
    dont: ["Web3/KI-Buzzwords ohne Substanz", "Emojis", "Superlative"],
  },
};
