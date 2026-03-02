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
export type { ColorScheme };

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
/**
 * Refined, professional color schemes inspired by high-end design.
 * Each palette uses the 60-30-10 rule for balanced composition.
 */
export const DEFAULT_LAYOUT_COLOR_SCHEMES: Record<string, ColorScheme> = {
  // Warm neutral with soft terracotta - Sophisticated & Approachable
  elegant:  withOnColors({ 
    primary: "#9a8b7a",    // Warm taupe
    secondary: "#f8f6f3",  // Cream white
    accent: "#c4a882",     // Soft gold
    background: "#fdfcfb",   // Warm white
    surface: "#f5f3f0",      // Light cream
    text: "#2d2a26",         // Dark charcoal
    textLight: "#7a756e"     // Medium gray
  }),
  
  // Deep navy with warm gold - Corporate & Trustworthy
  bold:     withOnColors({ 
    primary: "#1e3a5f",     // Deep navy
    secondary: "#f5f5f5",    // Light gray
    accent: "#c9a227",       // Antique gold
    background: "#ffffff",     // Pure white
    surface: "#f8f9fa",        // Off-white
    text: "#1a1a1a",           // Near black
    textLight: "#6b7280"       // Cool gray
  }),
  
  // Sage green with cream - Natural & Calming
  warm:     withOnColors({ 
    primary: "#5c6b5c",      // Sage green
    secondary: "#f5f3f0",    // Warm cream
    accent: "#8b9a7d",       // Moss green
    background: "#faf9f7",     // Ivory
    surface: "#f0ede8",        // Light beige
    text: "#2c2c2a",           // Soft black
    textLight: "#6b6b69"       // Warm gray
  }),
  
  // Clean slate with dusty rose - Modern & Fresh
  clean:    withOnColors({ 
    primary: "#475569",      // Slate gray
    secondary: "#f1f5f9",    // Slate 100
    accent: "#be7c7c",       // Dusty rose
    background: "#ffffff",     // Pure white
    surface: "#f8fafc",        // Slate 50
    text: "#0f172a",           // Slate 900
    textLight: "#64748b"       // Slate 500
  }),
  
  // Charcoal with soft teal - Tech & Sophisticated
  dynamic:  withOnColors({ 
    primary: "#2d3748",      // Charcoal
    secondary: "#1a202c",      // Deep charcoal
    accent: "#5a8a8a",       // Muted teal
    background: "#1a202c",     // Dark background
    surface: "#2d3748",          // Slightly lighter
    text: "#f7fafc",             // Off-white
    textLight: "rgba(247,250,252,0.6)"
  }),
  
  // Deep forest with copper - Premium & Refined
  luxury:   withOnColors({ 
    primary: "#1c1917",      // Rich black
    secondary: "#292524",    // Warm black
    accent: "#b87333",       // Copper
    background: "#1c1917",     // Dark background
    surface: "#292524",          // Warm dark
    text: "#fafaf9",             // Stone 50
    textLight: "rgba(250,250,249,0.6)"
  }),
  
  // Warm stone with rust accent - Artisan & Crafted
  craft:    withOnColors({ 
    primary: "#78716c",      // Stone 500
    secondary: "#292524",    // Stone 900
    accent: "#a0522d",       // Sienna/rust
    background: "#1c1917",     // Dark stone
    surface: "#292524",          // Warm dark
    text: "#fafaf9",             // Stone 50
    textLight: "rgba(250,250,249,0.6)"
  }),
  
  // Soft blue-gray with peach - Friendly & Light
  fresh:    withOnColors({ 
    primary: "#64748b",      // Blue-gray
    secondary: "#f8fafc",    // Light blue-gray
    accent: "#d4a574",       // Soft peach
    background: "#ffffff",     // Pure white
    surface: "#f8fafc",          // Very light
    text: "#334155",             // Slate 700
    textLight: "#64748b"         // Slate 500
  }),
  
  // Classic blue with warm gray - Professional & Reliable
  trust:    withOnColors({ 
    primary: "#334155",      // Slate 700
    secondary: "#f1f5f9",    // Slate 100
    accent: "#6366f1",       // Indigo
    background: "#ffffff",     // Pure white
    surface: "#f8fafc",          // Slate 50
    text: "#0f172a",             // Slate 900
    textLight: "#64748b"         // Slate 500
  }),
  
  // Pure monochrome with subtle accent - Minimal & Sharp
  modern:   withOnColors({ 
    primary: "#171717",      // Neutral 900
    secondary: "#f5f5f5",    // Neutral 100
    accent: "#525252",       // Neutral 600
    background: "#ffffff",     // Pure white
    surface: "#fafafa",          // Neutral 50
    text: "#171717",             // Neutral 900
    textLight: "#737373"         // Neutral 500
  }),
  
  // Deep purple with soft gold - Creative & Bold
  vibrant:  withOnColors({ 
    primary: "#4c1d95",      // Deep purple
    secondary: "#1e1b4b",    // Darker purple
    accent: "#c4b5a0",       // Soft gold
    background: "#0f0a1a",     // Very dark purple
    surface: "#1e1b4b",          // Dark purple
    text: "#fafafa",             // Neutral 50
    textLight: "rgba(250,250,250,0.6)"
  }),
  
  // Olive with warm sand - Organic & Earthy
  natural:  withOnColors({ 
    primary: "#57534e",      // Warm gray
    secondary: "#f5f5f4",    // Stone 100
    accent: "#a8a29e",       // Stone 400
    background: "#fafaf9",     // Stone 50
    surface: "#f5f5f4",          // Stone 100
    text: "#292524",             // Stone 800
    textLight: "#78716c"         // Stone 500
  }),
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
