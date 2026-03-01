/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH – Layout Fonts & Design Defaults
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file is the ONLY place where layout-specific fonts and design defaults
 * are defined. All consumers (WebsiteRenderer, routers.ts LLM prompt,
 * sanitize logic) import from here.
 *
 * To update fonts for a layout: edit ONLY this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type ColorScheme } from "./types";
import { getContrastColor } from "./colorContrast";

/**
 * Calculates 'on' contrast colors for a color scheme.
 */
export function withOnColors(cs: Omit<ColorScheme, "onPrimary" | "onSecondary" | "onAccent" | "onSurface" | "onBackground">): ColorScheme {
  return {
    ...cs,
    onPrimary: getContrastColor(cs.primary),
    onSecondary: getContrastColor(cs.secondary),
    onAccent: getContrastColor(cs.accent),
    onSurface: getContrastColor(cs.surface),
    onBackground: getContrastColor(cs.background),
  };
}

export interface LayoutFontConfig {
  /** Exact Google Font name for headlines (no quotes, no fallbacks) */
  headlineFont: string;
  /** Exact Google Font name for body text (must be a sans-serif font) */
  bodyFont: string;
  /** CSS font-family string with fallbacks for headlines (used in WebsiteRenderer) */
  headlineCss: string;
  /** CSS font-family string with fallbacks for body (used in WebsiteRenderer) */
  bodyCss: string;
}

/**
 * Layout → Font mapping.
 * Keys must match the layoutStyle values used in the database.
 *
 * Rules:
 * - headlineFont: can be serif or display font
 * - bodyFont: MUST always be a sans-serif font
 */
export const LAYOUT_FONTS: Record<string, LayoutFontConfig> = {
  elegant:  { headlineFont: "Fraunces",           bodyFont: "Outfit",           headlineCss: "'Fraunces', Georgia, serif",               bodyCss: "'Outfit', 'Inter', sans-serif" },
  luxury:   { headlineFont: "Fraunces",           bodyFont: "Outfit",           headlineCss: "'Fraunces', Georgia, serif",               bodyCss: "'Outfit', 'Inter', sans-serif" },
  warm:     { headlineFont: "Fraunces",           bodyFont: "Instrument Sans",  headlineCss: "'Fraunces', Georgia, serif",               bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  natural:  { headlineFont: "Fraunces",           bodyFont: "Instrument Sans",  headlineCss: "'Fraunces', Georgia, serif",               bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  bold:     { headlineFont: "Space Grotesque",    bodyFont: "Plus Jakarta Sans", headlineCss: "'Space Grotesque', sans-serif",           bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  craft:    { headlineFont: "Bricolage Grotesque", bodyFont: "Instrument Sans", headlineCss: "'Bricolage Grotesque', 'Impact', sans-serif", bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  vibrant:  { headlineFont: "Bricolage Grotesque", bodyFont: "Plus Jakarta Sans", headlineCss: "'Bricolage Grotesque', sans-serif",      bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  dynamic:  { headlineFont: "Syne",              bodyFont: "Plus Jakarta Sans", headlineCss: "'Syne', Impact, sans-serif",              bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  fresh:    { headlineFont: "Plus Jakarta Sans", bodyFont: "Instrument Sans",  headlineCss: "'Plus Jakarta Sans', sans-serif",          bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  modern:   { headlineFont: "Plus Jakarta Sans", bodyFont: "Inter",            headlineCss: "'Plus Jakarta Sans', sans-serif",          bodyCss: "'Inter', system-ui, sans-serif" },
  trust:    { headlineFont: "Instrument Sans",   bodyFont: "Inter",            headlineCss: "'Instrument Sans', 'Inter', sans-serif",   bodyCss: "'Inter', system-ui, sans-serif" },
  clean:    { headlineFont: "Instrument Sans",   bodyFont: "Inter",            headlineCss: "'Instrument Sans', 'Inter', sans-serif",   bodyCss: "'Inter', system-ui, sans-serif" },
};

/** Fallback config used when layoutStyle is unknown */
export const LAYOUT_FONTS_DEFAULT: LayoutFontConfig = LAYOUT_FONTS.clean;

/**
 * Returns the font config for a given layout, with fallback to clean.
 */
export function getLayoutFonts(layoutStyle: string): LayoutFontConfig {
  return LAYOUT_FONTS[layoutStyle] ?? LAYOUT_FONTS_DEFAULT;
}

/**
 * Generates the headlineFont instruction for the LLM prompt dynamically.
 * This ensures the prompt always reflects the current font configuration.
 */
export function getLLMFontPrompt(): { headlineFont: string; bodyFont: string } {
  const entries = Object.entries(LAYOUT_FONTS);
  const headlineRules = entries
    .map(([layout, cfg]) => `${layout}=${cfg.headlineFont}`)
    .join("; ");
  const bodyRules = entries
    .map(([layout, cfg]) => `${layout}=${cfg.bodyFont}`)
    .join("; ");
  const allowedBodyFonts = Array.from(new Set(entries.map(([, cfg]) => cfg.bodyFont))).join(", ");

  return {
    headlineFont: `[PFLICHT: Exakter Google Font Name für Überschriften. Aktuelle Zuordnung: ${headlineRules}]`,
    bodyFont: `[PFLICHT: Exakter Google Font Name für Fließtext. WICHTIG: bodyFont MUSS IMMER eine serifenlose Schrift sein! Erlaubt: ${allowedBodyFonts}, Nunito, DM Sans, Open Sans, Raleway. VERBOTEN als bodyFont: Lora, Playfair Display, Merriweather, Georgia, Cormorant, Fraunces, DM Serif, Crimson Text (diese nur für headlineFont!). Empfehlung je Layout: ${bodyRules}]`,
  };
}

/**
 * List of serif/display fonts that must NEVER be used as bodyFont.
 * Derived from LAYOUT_FONTS headline fonts + common serifs.
 */
export const FORBIDDEN_BODY_FONTS: string[] = Array.from(new Set([
  ...Object.values(LAYOUT_FONTS)
    .map(cfg => cfg.headlineFont.toLowerCase())
    .filter(f => !Object.values(LAYOUT_FONTS).some(cfg => cfg.bodyFont.toLowerCase() === f)),
  "lora", "playfair", "merriweather", "georgia", "cormorant", "fraunces",
  "dm serif", "crimson", "garamond", "times", "palatino", "baskerville", "didot",
]));

/**
 * Industry categories that should avoid serif fonts.
 * "tech" = Tech, Digital, Agency
 * "craft" = Handwerk, Bau
 * "auto" = Automotive
 * "fitness" = Sport, Fitness
 * "medical" = Medical, Health
 * "clean" = Reinigung, Service
 */
export const SANS_ONLY_INDUSTRIES = [
  "tech", "construction", "automotive", "fitness", "medical", "cleaning", "education", "legal", "nature", "fastfood"
];

/**
 * Checks if a given industry category should avoid serif fonts.
 */
export function prefersSansSerif(category: string): boolean {
  const s = category.toLowerCase();
  const sansRegex = /tech|software|digital|agency|it|web|app|computer|marketing|seo|branding|startup|handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|construction|auto|kfz|car|garage|mechanic|werkstatt|tuning|fahrzeug|fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|reinigung|cleaning|facility|gebäude|hausmeister|security|arzt|zahnarzt|medizin|doctor|dental|medical|health|clinic|pharmacy|apotheke|schule|school|bildung|education|coaching/i;
  return sansRegex.test(s);
}

/**
 * Global Font Options for user selection in Onboarding.
 */
export const FONT_OPTIONS = {
  serif: [
    { font: "Fraunces", label: "Fraunces – Markant & Hochwertig" },
    { font: "Cormorant Garamond", label: "Cormorant – Zeitlos & Edel" },
    { font: "Libre Baskerville", label: "Baskerville – Traditionell & Sicher" },
  ],
  sans: [
    { font: "Instrument Sans", label: "Instrument – Präzise & Modern" },
    { font: "Plus Jakarta Sans", label: "Jakarta – Progressiv & Frisch" },
    { font: "Outfit", label: "Outfit – Clean & Geometrisch" },
    { font: "Bricolage Grotesque", label: "Bricolage – Einzigartig & Kühn" },
    { font: "Space Grotesque", label: "Space – Direkt & Stark" },
  ]
};

/**
 * Global Logo Font Options for user selection in Onboarding.
 */
export const LOGO_FONT_OPTIONS = [
  { font: "Playfair Display", label: "Elegant & Klassisch", style: { fontFamily: "'Playfair Display', serif", fontWeight: 700 } },
  { font: "Oswald", label: "Stark & Modern", style: { fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const } },
  { font: "Montserrat", label: "Sauber & Professionell", style: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "0.02em" } },
];

/**
 * Predefined Color Schemes for Onboarding.
 */
export const PREDEFINED_COLOR_SCHEMES: { id: string; label: string; description: string; colors: ColorScheme }[] = [
  {
    id: "trust",
    label: "Professional Trust",
    description: "Tiefes Mitternachtsblau und Schiefer – seriös, kompetent und zeitlos.",
    colors: withOnColors({
      primary: "#1e3a8a",
      secondary: "#0f172a",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textLight: "#64748b"
    })
  },
  {
    id: "warm",
    label: "Heritage Warmth",
    description: "Edles Terracotta und Sandtöne – ideal für exzellente Gastronomie.",
    colors: withOnColors({
      primary: "#9a3412",
      secondary: "#431407",
      accent: "#b3966a",
      background: "#fffcfb",
      surface: "#fef2f2",
      text: "#1e1b1b",
      textLight: "#71717a"
    })
  },
  {
    id: "elegant",
    label: "Pure Elegance",
    description: "Champagner und weiches Anthrazit – für Luxus und Ästhetik.",
    colors: withOnColors({
      primary: "#bfa37e",
      secondary: "#1a1a1a",
      accent: "#f2f2f2",
      background: "#ffffff",
      surface: "#faf9f6",
      text: "#0f172a",
      textLight: "#64748b"
    })
  },
  {
    id: "modern",
    label: "Contemporary Dark",
    description: "Scharfes Graphit und klares Weiß – puristisch und fokussiert.",
    colors: withOnColors({
      primary: "#bef264",
      secondary: "#0a0a0a",
      accent: "#ffffff",
      background: "#050505",
      surface: "#121212",
      text: "#ffffff",
      textLight: "rgba(255,255,255,0.6)"
    })
  }
];

/**
 * Default Color Schemes per Layout Style.
 */
export const DEFAULT_LAYOUT_COLOR_SCHEMES: Record<string, ColorScheme> = {
  elegant:  withOnColors({ primary: "#b8860b", secondary: "#f5f0e8", accent: "#d4a843", background: "#fefcf8", surface: "#f5f0e8", text: "#1a1208", textLight: "#6b5c3e" }),
  bold:     withOnColors({ primary: "#e85d04", secondary: "#1a1a1a", accent: "#ff6b1a", background: "#f5f5f5", surface: "#ebebeb", text: "#1a1a1a", textLight: "#555" }),
  warm:     withOnColors({ primary: "#c45c26", secondary: "#fdf6ee", accent: "#e07b3c", background: "#fffaf5", surface: "#fdf6ee", text: "#2d1a0e", textLight: "#7a5c42" }),
  clean:    withOnColors({ primary: "#2563eb", secondary: "#eff6ff", accent: "#3b82f6", background: "#f8fafc", surface: "#fff", text: "#0f172a", textLight: "#64748b" }),
  dynamic:  withOnColors({ primary: "#22c55e", secondary: "#0a0a0a", accent: "#16a34a", background: "#0a0a0a", surface: "#111", text: "#fff", textLight: "rgba(255,255,255,0.6)" }),
  luxury:   withOnColors({ primary: "#c9a84c", secondary: "#0a0a0a", accent: "#e8c87a", background: "#0a0a0a", surface: "#111", text: "#fff", textLight: "rgba(255,255,255,0.6)" }),
  craft:    withOnColors({ primary: "#f97316", secondary: "#1a1a1a", accent: "#fb923c", background: "#111", surface: "#1a1a1a", text: "#fff", textLight: "rgba(255,255,255,0.6)" }),
  fresh:    withOnColors({ primary: "#0ea5e9", secondary: "#fafaf8", accent: "#38bdf8", background: "#fafaf8", surface: "#fff", text: "#1a1a1a", textLight: "#666" }),
  trust:    withOnColors({ primary: "#1d4ed8", secondary: "#f8fafc", accent: "#3b82f6", background: "#fff", surface: "#f8fafc", text: "#1a2332", textLight: "#5a6a7e" }),
  modern:   withOnColors({ primary: "#0a0a0a", secondary: "#f8f8f8", accent: "#e11d48", background: "#fff", surface: "#f8f8f8", text: "#0a0a0a", textLight: "#666" }),
  vibrant:  withOnColors({ primary: "#f59e0b", secondary: "#0d0d0d", accent: "#fbbf24", background: "#0d0d0d", surface: "#161616", text: "#fff", textLight: "rgba(255,255,255,0.6)" }),
  natural:  withOnColors({ primary: "#65a30d", secondary: "#f0ece4", accent: "#84cc16", background: "#faf8f4", surface: "#f0ece4", text: "#2a2018", textLight: "#7a6a5a" }),
};

/**
 * Valid Design Token Enum Values.
 * Centralized for sanitization and UI consistency.
 */
export const DESIGN_TOKEN_CONFIG = {
  radius: ["none", "sm", "md", "lg", "full"] as const,
  shadow: ["none", "flat", "soft", "dramatic", "glow"] as const,
  spacing: ["tight", "normal", "spacious", "ultra"] as const,
  button: ["filled", "outline", "ghost", "pill"] as const,
};

/**
 * Fallback Hero Images per Layout Style.
 */
export const LAYOUT_FALLBACK_IMAGES: Record<string, string> = {
  elegant: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=85&fit=crop",
  bold:    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=85&fit=crop",
  warm:    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85&fit=crop",
  clean:   "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=85&fit=crop",
  dynamic: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
  luxury:  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=85&fit=crop",
  craft:   "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=85&fit=crop",
  fresh:   "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=85&fit=crop",
  trust:   "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=85&fit=crop",
  modern:  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&fit=crop",
  vibrant: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
  natural: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=85&fit=crop",
};
