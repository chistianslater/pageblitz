import { FONT_PAIRS } from "../stylePacks/fontPairs";

/**
 * Marken-Import (2026-09-03, Punkt 3 der Altprojekt-Übernahme, Scheibe 1):
 * ordnet die aus der bestehenden Website erkannten Signale den kuratierten
 * Studio-Werten zu. Rein und ohne I/O — die Erkennung liegt in
 * `server/gmb/siteBranding.ts`.
 */

/** Kuratierte Akzentfarben (Spiegel von client themeChoices.ts — nur für die Benennung). */
const ACCENT_NAMES: readonly { hex: string; name: string }[] = [
  { hex: "#1D3FBF", name: "Royal" },
  { hex: "#2E7E78", name: "Teal" },
  { hex: "#4A6741", name: "Blattgrün" },
  { hex: "#5E1F22", name: "Bordeaux" },
  { hex: "#E0301E", name: "Signalrot" },
  { hex: "#FF4D00", name: "Orange" },
  { hex: "#A8532F", name: "Terrakotta" },
  { hex: "#C99B4A", name: "Gold" },
  { hex: "#D4749C", name: "Rosa" },
  { hex: "#7A5F2E", name: "Bronze" },
];

const SERIF_HINT = /serif|garamond|georgia|playfair|bodoni|times|lora|baskerv/i;

function rgbOf(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Name der nächstgelegenen kuratierten Farbe — nur zur Anzeige, gespeichert wird der echte Hex. */
export function nearestAccentName(hex: string): string {
  const [r, g, b] = rgbOf(hex.toLowerCase());
  let best = ACCENT_NAMES[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of ACCENT_NAMES) {
    const [cr, cg, cb] = rgbOf(candidate.hex.toLowerCase());
    const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best.name;
}

/**
 * Schriftpaar zu den erkannten Familien: erst exakter Familienname (Display
 * zählt doppelt), sonst grob nach Serif/Sans. Ohne Schriften kein Vorschlag.
 */
export function matchFontPair(fonts: readonly string[]): string | null {
  if (fonts.length === 0) return null;
  const wanted = fonts.map(font => font.toLowerCase());
  let best: { id: string; score: number } | null = null;
  for (const pair of FONT_PAIRS) {
    const display = pair.display.family.toLowerCase();
    const body = pair.body.family.toLowerCase();
    let score = 0;
    if (wanted.includes(display)) score += 2;
    if (wanted.includes(body)) score += 1;
    if (score > 0 && (!best || score > best.score)) {
      best = { id: pair.id, score };
    }
  }
  if (best) return best.id;
  const wantsSerif = fonts.some(font => SERIF_HINT.test(font));
  const fallback = FONT_PAIRS.find(pair =>
    wantsSerif
      ? SERIF_HINT.test(pair.display.family)
      : !SERIF_HINT.test(pair.display.family)
  );
  return fallback?.id ?? null;
}

export interface BrandSuggestion {
  domain: string;
  logoUrl: string | null;
  accent: string | null;
  accentName: string | null;
  fontPairId: string | null;
  fonts: string[];
  /** Mindestens ein übernehmbarer Vorschlag — sonst zeigt das Studio keine Karte. */
  hasAnything: boolean;
}

export function buildBrandSuggestion(args: {
  origin: string;
  logoUrl: string | null;
  accent: string | null;
  fonts: string[];
}): BrandSuggestion {
  let domain = args.origin;
  try {
    domain = new URL(args.origin).hostname.replace(/^www\./, "");
  } catch {
    /* Origin bleibt wie geliefert — nur Anzeige. */
  }
  const fontPairId = matchFontPair(args.fonts);
  return {
    domain,
    logoUrl: args.logoUrl,
    accent: args.accent,
    accentName: args.accent ? nearestAccentName(args.accent) : null,
    fontPairId,
    fonts: args.fonts,
    hasAnything: Boolean(args.logoUrl || args.accent || fontPairId),
  };
}
