/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH – Layout Fonts & Design Defaults
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file is the ONLY place where layout-specific fonts and design defaults
 * are defined. All consumers (WebsiteRenderer, routers.ts LLM prompt,
 * sanitize logic) import from here.
 *
 * LAYOUT VERSIONING: Bump this when releasing breaking layout changes.
 * Existing websites keep their stored version; new websites get this value.
 */
export const CURRENT_LAYOUT_VERSION = 1;

/**
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
  elegant:  { headlineFont: "Playfair Display",     bodyFont: "Lora",             headlineCss: "'Playfair Display', Georgia, serif",          bodyCss: "'Lora', Georgia, serif" },
  luxury:   { headlineFont: "Cormorant Garamond",   bodyFont: "DM Sans",          headlineCss: "'Cormorant Garamond', Georgia, serif",       bodyCss: "'DM Sans', 'Inter', sans-serif" },
  warm:     { headlineFont: "Lora",                 bodyFont: "Barlow",           headlineCss: "'Lora', Georgia, serif",                      bodyCss: "'Barlow', 'Inter', sans-serif" },
  natural:  { headlineFont: "Libre Baskerville",    bodyFont: "Raleway",          headlineCss: "'Libre Baskerville', Georgia, serif",         bodyCss: "'Raleway', 'Inter', sans-serif" },
  bold:     { headlineFont: "Oswald",               bodyFont: "Outfit",           headlineCss: "'Oswald', Impact, sans-serif",                bodyCss: "'Outfit', 'Inter', sans-serif" },
  craft:    { headlineFont: "Bricolage Grotesque",  bodyFont: "Barlow",           headlineCss: "'Bricolage Grotesque', Impact, sans-serif",   bodyCss: "'Barlow', 'Inter', sans-serif" },
  vibrant:  { headlineFont: "Syne",                 bodyFont: "Nunito",           headlineCss: "'Syne', Impact, sans-serif",                  bodyCss: "'Nunito', 'Inter', sans-serif" },
  dynamic:  { headlineFont: "Bebas Neue",           bodyFont: "Jost",             headlineCss: "'Bebas Neue', Impact, sans-serif",            bodyCss: "'Jost', 'Inter', sans-serif" },
  fresh:    { headlineFont: "Fraunces",             bodyFont: "Outfit",           headlineCss: "'Fraunces', Georgia, serif",                  bodyCss: "'Outfit', 'Inter', sans-serif" },
  modern:   { headlineFont: "Space Grotesk",        bodyFont: "Raleway",          headlineCss: "'Space Grotesk', sans-serif",                 bodyCss: "'Raleway', 'Inter', sans-serif" },
  trust:    { headlineFont: "DM Serif Display",     bodyFont: "Inter",            headlineCss: "'DM Serif Display', Georgia, serif",          bodyCss: "'Inter', system-ui, sans-serif" },
  clean:    { headlineFont: "Jost",                 bodyFont: "Source Sans 3",    headlineCss: "'Jost', 'Inter', sans-serif",                 bodyCss: "'Source Sans 3', 'Inter', sans-serif" },
  eden:     { headlineFont: "DM Serif Display",     bodyFont: "DM Sans",          headlineCss: "'DM Serif Display', Georgia, serif",          bodyCss: "'DM Sans', 'Inter', sans-serif" },
  apex:     { headlineFont: "Bebas Neue",           bodyFont: "Barlow",           headlineCss: "'Bebas Neue', Impact, sans-serif",            bodyCss: "'Barlow', 'Inter', sans-serif" },
  aurora:   { headlineFont: "Space Grotesk",        bodyFont: "Nunito",           headlineCss: "'Space Grotesk', sans-serif",                 bodyCss: "'Nunito', 'Inter', sans-serif" },
  nexus:    { headlineFont: "Montserrat",           bodyFont: "Jost",             headlineCss: "'Montserrat', sans-serif",                    bodyCss: "'Jost', 'Inter', sans-serif" },
  clay:     { headlineFont: "Playfair Display",     bodyFont: "Nunito",           headlineCss: "'Playfair Display', Georgia, serif",          bodyCss: "'Nunito', 'Inter', sans-serif" },
  forge:    { headlineFont: "Cormorant Garamond",   bodyFont: "Space Grotesk",    headlineCss: "'Cormorant Garamond', Georgia, serif",       bodyCss: "'Space Grotesk', sans-serif" },
  pulse:    { headlineFont: "Plus Jakarta Sans",    bodyFont: "Outfit",           headlineCss: "'Plus Jakarta Sans', sans-serif",             bodyCss: "'Outfit', 'Inter', sans-serif" },
  flux:     { headlineFont: "Playfair Display",     bodyFont: "Jost",             headlineCss: "'Playfair Display', Georgia, serif",          bodyCss: "'Jost', 'Inter', sans-serif" },
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
 * Predefined Color Schemes for Onboarding.
 */
export const PREDEFINED_COLOR_SCHEMES: { id: string; label: string; description: string; colors: ColorScheme }[] = [
  {
    id: "trust",
    label: "Preußisch Blau",
    description: "Tiefes Marineblau mit warmem Goldakzent – Autorität, Kompetenz und zeitlose Seriosität.",
    colors: withOnColors({
      primary: "#1B3D6F",
      secondary: "#0D2140",
      accent: "#C9A43A",
      background: "#ffffff",
      surface: "#F7F9FC",
      text: "#0D1B2A",
      textLight: "#64748b"
    })
  },
  {
    id: "warm",
    label: "Terracotta",
    description: "Warmes Terracotta und Naturstein – handwerkliche Wärme und Erdverbundenheit.",
    colors: withOnColors({
      primary: "#B44D1F",
      secondary: "#3D1A0A",
      accent: "#9C6B3A",   // Fixed: darker for better contrast (was #C4956A ~2.8:1, now ~4.6:1)
      background: "#FEFCFA",
      surface: "#F5EDE0",
      text: "#1E1208",
      textLight: "#7A6A56"
    })
  },
  {
    id: "elegant",
    label: "Champagner",
    description: "Warmes Champagnergold und tiefes Anthrazit – für Luxus, Schönheit und hohe Ästhetik.",
    colors: withOnColors({
      primary: "#967B5C",
      secondary: "#1A1511",
      accent: "#C9A84C",   // Fixed: Classic gold, clearly visible (was #F0EBE3 near invisible)
      background: "#FDFBF8",
      surface: "#F7F3EE",
      text: "#1A1511",
      textLight: "#7A7065"
    })
  },
  {
    id: "modern",
    label: "Grafitmodern",
    description: "Dunkles Graphit mit elektrischem Akzent – präzise, fokussiert und zeitgemäß.",
    colors: withOnColors({
      primary: "#a3e635",
      secondary: "#0a0a0a",
      accent: "#ffffff",
      background: "#050505",
      surface: "#121212",
      text: "#ffffff",
      textLight: "rgba(255,255,255,0.75)"
    })
  },
  {
    id: "monochrome",
    label: "Klassik Schwarz-Weiß",
    description: "Zeitlose Eleganz in reinem Schwarz, Weiß und Grau – minimalistisch und professionell.",
    colors: withOnColors({
      primary: "#1a1a1a",
      secondary: "#000000",
      accent: "#666666",
      background: "#ffffff",
      surface: "#f5f5f5",
      text: "#1a1a1a",
      textLight: "#6b7280"
    })
  },
  // ── Phase 7: 8 neue branchenspezifische Schemata ─────────────────────────
  {
    id: "health",
    label: "Medical Blue",
    description: "Vertrauensbildendes Marineblau mit heilendem Grün – für Ärzte, Therapeuten und Praxen.",
    colors: withOnColors({
      primary: "#1E5FAD",   // Medical Blue – WCAG AA ✓
      secondary: "#0C3D73",
      accent: "#059669",    // Healing Green
      background: "#ffffff",
      surface: "#F0F7FF",
      text: "#0D1B2A",
      textLight: "#4B6178"
    })
  },
  {
    id: "eco",
    label: "Forest Green",
    description: "Tiefes Waldgrün mit frischem Lime – für Nachhaltigkeit, Bio und Naturbetriebe.",
    colors: withOnColors({
      primary: "#166534",   // Forest Green – WCAG AA ✓
      secondary: "#14532D",
      accent: "#65A30D",    // Lime
      background: "#F0FDF4",
      surface: "#DCFCE7",
      text: "#14532D",
      textLight: "#4D7C5A"
    })
  },
  {
    id: "tech",
    label: "Digital Blue",
    description: "Klares Digitalblau mit elektrischem Indigo – für Software, IT und Tech-Startups.",
    colors: withOnColors({
      primary: "#0369A1",   // Digital Blue – WCAG AA ✓
      secondary: "#0C4A6E",
      accent: "#4F46E5",    // Electric Indigo
      background: "#ffffff",
      surface: "#F0F9FF",
      text: "#0C1A2E",
      textLight: "#475569"
    })
  },
  {
    id: "food",
    label: "Appetit-Rot",
    description: "Warmes Appetitrot mit goldenem Orange – für Restaurants, Cafés und Gastronomie.",
    colors: withOnColors({
      primary: "#B91C1C",   // Appetit-Rot – WCAG AA ✓
      secondary: "#7F1D1D",
      accent: "#D97706",    // Warm Orange
      background: "#FFFBF5",
      surface: "#FEF3C7",
      text: "#1C0A0A",
      textLight: "#78350F"
    })
  },
  {
    id: "beauty",
    label: "Rose Gold",
    description: "Tiefes Rose mit Champagnergold – für Kosmetik, Mode und Beauty-Dienstleister.",
    colors: withOnColors({
      primary: "#9D174D",   // Deep Rose – WCAG AA ✓
      secondary: "#831843",
      accent: "#C9A84C",    // Champagne Gold
      background: "#FFF5F7",
      surface: "#FCE7EF",
      text: "#1A0510",
      textLight: "#6B4050"
    })
  },
  {
    id: "legal",
    label: "Charcoal Gold",
    description: "Tiefes Anthrazit mit traditionellem Gold – für Anwälte, Berater und Kanzleien.",
    colors: withOnColors({
      primary: "#1E293B",   // Charcoal – WCAG AA ✓
      secondary: "#0F172A",
      accent: "#B45309",    // Traditional Gold
      background: "#ffffff",
      surface: "#F8FAFC",
      text: "#0F172A",
      textLight: "#475569"
    })
  },
  {
    id: "creative",
    label: "Violet Sunset",
    description: "Tiefes Violett mit leuchtendem Orange – für Designer, Künstler und Kreativagenturen.",
    colors: withOnColors({
      primary: "#6D28D9",   // Deep Violet – WCAG AA ✓
      secondary: "#4C1D95",
      accent: "#EA580C",    // Sunset Orange
      background: "#ffffff",
      surface: "#F5F3FF",
      text: "#1E0A3A",
      textLight: "#5B4280"
    })
  },
  {
    id: "sport",
    label: "Energy Teal",
    description: "Dynamisches Orange mit aktivem Türkis – für Fitness-Studios, Yoga und Sport.",
    colors: withOnColors({
      primary: "#C2410C",   // Energy Orange – WCAG AA ✓
      secondary: "#9A3412",
      accent: "#0D9488",    // Active Teal
      background: "#ffffff",
      surface: "#FFF7ED",
      text: "#1C0A00",
      textLight: "#7C4A30"
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
  // Deep charcoal with peach accent — Editorial luxury
  elegant:  withOnColors({
    primary: "#2d1810",
    secondary: "#f8f5f0",
    accent: "#E8A878",
    background: "#fdfcfb",
    surface: "#f5f3f0",
    text: "#2d1810",
    textLight: "#7a6a5e"
  }),

  // Navy with vibrant gold — High-impact corporate
  bold:     withOnColors({
    primary: "#0D3B66",
    secondary: "#f5f5f5",
    accent: "#F4A460",
    background: "#ffffff",
    surface: "#f0f4f8",
    text: "#0D3B66",
    textLight: "#5a6d80"
  }),

  // Warm rust with sage — Heritage craft
  warm:     withOnColors({
    primary: "#A0522D",
    secondary: "#f5f3f0",
    accent: "#7A9B6A",
    background: "#faf9f7",
    surface: "#f0ede8",
    text: "#2c2420",
    textLight: "#6b5d55"
  }),

  // Slate with vibrant magenta — Modern contrast
  clean:    withOnColors({
    primary: "#334155",
    secondary: "#f1f5f9",
    accent: "#D946EF",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textLight: "#64748b"
  }),

  // Deep navy with electric teal — Tech energy
  dynamic:  withOnColors({
    primary: "#1A365D",
    secondary: "#0f1a2e",
    accent: "#14B8A6",
    background: "#0f1a2e",
    surface: "#1a2740",
    text: "#f1f5f9",
    textLight: "rgba(241,245,249,0.70)"
  }),

  // Mahogany with rose gold — Warm luxury
  luxury:   withOnColors({
    primary: "#5C2E1A",
    secondary: "#1c1410",
    accent: "#D4A574",
    background: "#1c1410",
    surface: "#2a1f18",
    text: "#faf5f0",
    textLight: "rgba(250,245,240,0.72)"
  }),

  // Charcoal with burnt orange — Bold artisan
  craft:    withOnColors({
    primary: "#3A3A3A",
    secondary: "#1a1a18",
    accent: "#CC5500",
    background: "#1a1a18",
    surface: "#282826",
    text: "#fafaf9",
    textLight: "rgba(250,250,249,0.72)"
  }),

  // Sage green with coral — Fresh + punchy
  fresh:    withOnColors({
    primary: "#3E9651",
    secondary: "#f0faf2",
    accent: "#FF6B6B",
    background: "#ffffff",
    surface: "#f0faf2",
    text: "#1a2e1e",
    textLight: "#5a7a60"
  }),

  // Deep blue with warm amber — Trustworthy yet warm
  trust:    withOnColors({
    primary: "#1E40AF",
    secondary: "#f0f4ff",
    accent: "#F59E0B",
    background: "#ffffff",
    surface: "#f0f4ff",
    text: "#0f172a",
    textLight: "#4b6078"
  }),

  // Slate with electric blue — Digital precision
  modern:   withOnColors({
    primary: "#1E293B",
    secondary: "#f5f5f5",
    accent: "#3B82F6",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1E293B",
    textLight: "#64748b"
  }),

  // Electric purple with lime — Creative energy
  vibrant:  withOnColors({
    primary: "#7C3AED",
    secondary: "#1e1040",
    accent: "#A3E635",
    background: "#0f0a1a",
    surface: "#1e1040",
    text: "#fafafa",
    textLight: "rgba(250,250,250,0.72)"
  }),

  // Deep forest with terracotta — Rich organic
  natural:  withOnColors({
    primary: "#2D5A3D",
    secondary: "#f5f5f4",
    accent: "#C76C45",
    background: "#fafaf9",
    surface: "#f0f5f2",
    text: "#1a2e20",
    textLight: "#5a7060"
  }),
  // Aurora: Rich indigo with bright cyan — Futuristic tech
  aurora:   withOnColors({
    primary: "#4338CA",
    secondary: "#312e81",
    accent: "#06B6D4",
    background: "#080812",
    surface: "rgba(255,255,255,0.06)",
    text: "#f1f5f9",
    textLight: "rgba(241,245,249,0.65)"
  }),
  // Nexus: Navy with neon blue — Connected modern
  nexus:    withOnColors({
    primary: "#0F172A",
    secondary: "#1e293b",
    accent: "#0EA5E9",
    background: "#ffffff",
    surface: "#f0f9ff",
    text: "#0f172a",
    textLight: "#4b6a88"
  }),
  // Clay: Bold rose with vibrant purple — Beauty/wellness
  clay:     withOnColors({
    primary: "#BE185D",
    secondary: "#9d174d",
    accent: "#A855F7",
    background: "#fdf4ff",
    surface: "#fae8ff",
    text: "#2d1530",
    textLight: "#6b4a72"
  }),
  // Forge: Charcoal with bright gold — Editorial luxury
  forge:    withOnColors({
    primary: "#292524",
    secondary: "#1c1917",
    accent: "#FCD34D",
    background: "#f8f7f4",
    surface: "#f0ede8",
    text: "#1c1917",
    textLight: "#57534e"
  }),
  // Pulse: Ocean blue with vibrant teal — Energetic healthcare
  pulse:    withOnColors({
    primary: "#0369A1",
    secondary: "#0c4a6e",
    accent: "#14B8A6",
    background: "#f0f9ff",
    surface: "#e0f2fe",
    text: "#0c2d48",
    textLight: "#4b7a9a"
  }),
  // Flux: Rich gold on deep dark — Cinematic luxury
  flux:     withOnColors({
    primary: "#B45309",
    secondary: "#92400e",
    accent: "#FCD34D",
    background: "#060608",
    surface: "#0e0e12",
    text: "#f5f0e8",
    textLight: "rgba(245,240,232,0.72)"
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
