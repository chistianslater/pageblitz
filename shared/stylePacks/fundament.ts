import type { PackConstitution } from "./types";

export const FUNDAMENT: PackConstitution = {
  id: "fundament",
  name: "Fundament",
  essence: "Tiefes Marineblau gegen Weiß — Substanz, Seriosität, klare Kante.",
  industries: [
    "immobilien",
    "immobilienmakler",
    "makler",
    "hausverwaltung",
    "versicherung",
    "finanzberatung",
    "vermoegensberatung",
    "notariat",
  ],
  theme: "light",
  palette: [
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "canvas",
      usage: "Seitengrund — reines Weiß.",
    },
    {
      name: "Nebelgrau",
      hex: "#F0F2F5",
      role: "surface",
      usage: "Karten, helle Flächen.",
    },
    {
      name: "Marine",
      hex: "#14263F",
      role: "ink",
      usage: "Text, Panel-Grund, CTA-Fläche.",
    },
    {
      name: "Stahlblau",
      hex: "#5A6A80",
      role: "muted",
      usage: "Sekundärtext, Meta, Stats-Label im Panel.",
    },
    {
      name: "Fuge",
      hex: "#D5DBE3",
      role: "line",
      usage: "Trennlinien, Rahmen.",
    },
    {
      name: "Messing",
      hex: "#A8894C",
      role: "accent",
      locked: true,
      usage:
        "Kursives Akzentwort, Zitatstrich, Fenster-Akzente — nie als Fläche.",
    },
    {
      name: "Weiß",
      hex: "#FFFFFF",
      role: "accent-contrast",
      usage: "Text auf Marine.",
    },
  ],
  type: {
    display: {
      family: "Source Serif 4",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss:
        "Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,500",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500;600",
    },
    scale: {
      basePx: 16,
      ratio: 1.25,
      heroClamp: "clamp(2.2rem, 4.6vw, 4rem)",
    },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "solid-block",
    density: "normal",
  },
  signature: {
    hero: "geteilte Bühne: rechtes Marine-Panel (~42% Breite, volle Hero-Höhe) mit Katasterraster + Serifen-Headline links mit kursivem Messing-Akzentwort + Objektfoto überschreitet die Panel-Grenze + Stats unten rechts im Panel + Marine-CTA links",
    decor: [
      "cadastral-grid",
      "boundary-crossing",
      "panel-stats",
      "brass-italic",
    ],
    imageTreatment:
      "Flat-SVG, hartkantiger Schatten, sitzt auf der Panel-Grenze — kein Gradient/Filter auf dem Bild selbst",
  },
  llmHints: {
    do: [
      "sachliche, vertrauensbildende Sprache",
      "konkrete Zahlen (Objekte, Jahre, Erfolgsquote)",
      "kurze Substantiv-Headlines (2–3 Wörter)",
    ],
    dont: ["Superlative", "Emojis", "lockere Umgangssprache"],
  },
};
