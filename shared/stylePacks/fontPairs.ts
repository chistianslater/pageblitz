import type { FontSpec } from "./types";

/**
 * Kuratierte Schriftpaare für den Studio-Theme-Editor (User-Entscheid
 * 2026-08-24: „Kuratierte Schriftpaare" statt freier Wahl). Jede Paarung
 * ist 1:1 aus dem Font-Pool der 14 Pack-Verfassungen übernommen — die
 * `googleCss`-Familien sind also bereits erprobt und über den bestehenden
 * Lade-Mechanismus (buildFontsUrl / packFontHrefs) abrufbar.
 *
 * Ein Kunde wählt eine Paarung per `id` (WebsiteDataV2.fontPairId); die
 * Auflösung zu FontSpecs passiert ausschließlich über getFontPair — die id
 * landet nie als Wert im CSS (kein Injection-Vektor).
 */
export interface FontPair {
  id: string;
  /** Anzeigename im Studio (z. B. „Modern & klar"). */
  label: string;
  /** Ein Wort Charakter für den Chip-Untertitel. */
  vibe: string;
  display: FontSpec;
  body: FontSpec;
}

export const FONT_PAIRS: readonly FontPair[] = [
  {
    id: "modern",
    label: "Modern & klar",
    vibe: "sachlich",
    display: {
      family: "Space Grotesk",
      weights: [500, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Space+Grotesk:wght@500;700",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500;600",
    },
  },
  {
    id: "kraftvoll",
    label: "Kraftvoll & direkt",
    vibe: "handwerklich",
    display: {
      family: "Archivo Black",
      weights: [400],
      fallback: "'Arial Black', sans-serif",
      googleCss: "Archivo+Black",
    },
    body: {
      family: "Inter",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;600;700",
    },
  },
  {
    id: "freundlich",
    label: "Freundlich & weich",
    vibe: "nahbar",
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
  },
  {
    id: "elegant",
    label: "Elegant & fein",
    vibe: "gehoben",
    display: {
      family: "Playfair Display",
      weights: [500],
      fallback: "Georgia, serif",
      googleCss: "Playfair+Display:ital,wght@0,500;1,500",
    },
    body: {
      family: "Lato",
      weights: [300, 400],
      fallback: "system-ui, sans-serif",
      googleCss: "Lato:wght@300;400",
    },
  },
  {
    id: "klassisch",
    label: "Klassisch & warm",
    vibe: "traditionell",
    display: {
      family: "Lora",
      weights: [500],
      fallback: "Georgia, serif",
      googleCss: "Lora:ital,wght@0,500;1,500",
    },
    body: {
      family: "Karla",
      weights: [400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Karla:wght@400;500",
    },
  },
  {
    id: "luxurioes",
    label: "Luxuriös & ruhig",
    vibe: "exklusiv",
    display: {
      family: "Cormorant Garamond",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600",
    },
    body: {
      family: "Jost",
      weights: [300, 400, 500],
      fallback: "system-ui, sans-serif",
      googleCss: "Jost:wght@300;400;500",
    },
  },
  {
    id: "markant",
    label: "Markant & laut",
    vibe: "plakativ",
    display: {
      family: "Bebas Neue",
      weights: [400],
      fallback: "'Arial Narrow', sans-serif",
      googleCss: "Bebas+Neue",
    },
    body: {
      family: "Inter",
      weights: [400, 600, 700],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;600;700",
    },
  },
  {
    id: "serioes",
    label: "Seriös & sicher",
    vibe: "vertrauensvoll",
    display: {
      family: "Source Serif 4",
      weights: [500, 600],
      fallback: "Georgia, serif",
      googleCss: "Source+Serif+4:ital,wght@0,500;0,600;1,500",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      fallback: "system-ui, sans-serif",
      googleCss: "Inter:wght@400;500;600",
    },
  },
];

const BY_ID = new Map(FONT_PAIRS.map(p => [p.id, p]));

/** Löst eine gespeicherte fontPairId auf; unbekannte/undefined → null. */
export function getFontPair(id: string | undefined | null): FontPair | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
