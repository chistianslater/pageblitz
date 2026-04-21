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
  bold:     { headlineFont: "Space Grotesk",      bodyFont: "Plus Jakarta Sans", headlineCss: "'Space Grotesk', sans-serif",             bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  craft:    { headlineFont: "Bricolage Grotesque", bodyFont: "Instrument Sans", headlineCss: "'Bricolage Grotesque', 'Impact', sans-serif", bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  vibrant:  { headlineFont: "Bricolage Grotesque", bodyFont: "Plus Jakarta Sans", headlineCss: "'Bricolage Grotesque', sans-serif",      bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  dynamic:  { headlineFont: "Syne",              bodyFont: "Plus Jakarta Sans", headlineCss: "'Syne', Impact, sans-serif",              bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  fresh:    { headlineFont: "Plus Jakarta Sans", bodyFont: "Instrument Sans",  headlineCss: "'Plus Jakarta Sans', sans-serif",          bodyCss: "'Instrument Sans', 'Inter', sans-serif" },
  modern:   { headlineFont: "Plus Jakarta Sans", bodyFont: "Inter",            headlineCss: "'Plus Jakarta Sans', sans-serif",          bodyCss: "'Inter', system-ui, sans-serif" },
  trust:    { headlineFont: "Instrument Sans",   bodyFont: "Inter",            headlineCss: "'Instrument Sans', 'Inter', sans-serif",   bodyCss: "'Inter', system-ui, sans-serif" },
  clean:    { headlineFont: "Instrument Sans",   bodyFont: "Inter",            headlineCss: "'Instrument Sans', 'Inter', sans-serif",   bodyCss: "'Inter', system-ui, sans-serif" },
  eden:     { headlineFont: "DM Serif Display",  bodyFont: "DM Sans",          headlineCss: "'DM Serif Display', Georgia, serif",          bodyCss: "'DM Sans', 'Inter', sans-serif" },
  apex:     { headlineFont: "Bebas Neue",         bodyFont: "Inter",            headlineCss: "'Bebas Neue', Impact, sans-serif",             bodyCss: "'Inter', system-ui, sans-serif" },
  // New layouts (Phase 6)
  aurora:   { headlineFont: "Space Grotesk",      bodyFont: "Inter",            headlineCss: "'Space Grotesk', sans-serif",                  bodyCss: "'Inter', system-ui, sans-serif" },
  nexus:    { headlineFont: "Space Grotesk",      bodyFont: "Plus Jakarta Sans", headlineCss: "'Space Grotesk', sans-serif",                 bodyCss: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  clay:     { headlineFont: "Nunito",             bodyFont: "Outfit",            headlineCss: "'Nunito', 'Varela Round', sans-serif",         bodyCss: "'Outfit', 'Inter', sans-serif" },
  forge:    { headlineFont: "Cormorant Garamond", bodyFont: "Space Grotesk",     headlineCss: "'Cormorant Garamond', Georgia, serif",         bodyCss: "'Space Grotesk', sans-serif" },
  pulse:    { headlineFont: "Plus Jakarta Sans",  bodyFont: "Inter",             headlineCss: "'Plus Jakarta Sans', sans-serif",              bodyCss: "'Inter', system-ui, sans-serif" },
  flux:     { headlineFont: "Syne",               bodyFont: "Inter",             headlineCss: "'Syne', Impact, sans-serif",                   bodyCss: "'Inter', system-ui, sans-serif" },
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
 * Generates a random harmonious color scheme.
 * Uses color theory principles to ensure pleasing combinations.
 */
export function generateRandomColorScheme(): { id: string; label: string; description: string; colors: ColorScheme } {
  // Base hue for the primary color (0-360)
  const baseHue = Math.floor(Math.random() * 360);
  
  // Generate complementary or analogous colors based on color theory
  const schemes = ['complementary', 'analogous', 'triadic'] as const;
  const schemeType = schemes[Math.floor(Math.random() * schemes.length)];
  
  let secondaryHue: number;
  let accentHue: number;
  
  switch (schemeType) {
    case 'complementary':
      secondaryHue = (baseHue + 180) % 360;
      accentHue = (baseHue + 30) % 360;
      break;
    case 'analogous':
      secondaryHue = (baseHue + 30) % 360;
      accentHue = (baseHue - 30 + 360) % 360;
      break;
    case 'triadic':
      secondaryHue = (baseHue + 120) % 360;
      accentHue = (baseHue + 240) % 360;
      break;
    default:
      secondaryHue = (baseHue + 180) % 360;
      accentHue = (baseHue + 30) % 360;
  }
  
  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    const toRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(toRgb(p, q, h / 360 + 1/3) * 255);
    const g = Math.round(toRgb(p, q, h / 360) * 255);
    const b = Math.round(toRgb(p, q, h / 360 - 1/3) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Generate colors with good saturation and lightness for accessibility
  const primary = hslToHex(baseHue, 0.7, 0.35);
  const secondary = hslToHex(secondaryHue, 0.6, 0.25);
  const accent = hslToHex(accentHue, 0.5, 0.55);
  
  const colorNames = [
    'Ocean', 'Forest', 'Sunset', 'Berry', 'Stone', 'Amber', 
    'Lavender', 'Coral', 'Slate', 'Emerald', 'Rust', 'Mist'
  ];
  const randomName = colorNames[Math.floor(Math.random() * colorNames.length)];
  
  return {
    id: `random-${Date.now()}`,
    label: `Zufallsmix: ${randomName}`,
    description: `Harmonisch generierte Farben – einzigartig für dich kreiert.`,
    colors: withOnColors({
      primary,
      secondary,
      accent,
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1a1a1a",
      textLight: "#6b7280"
    })
  };
}

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
    textLight: "rgba(247,250,252,0.75)"
  }),

  // Deep forest with copper - Premium & Refined
  luxury:   withOnColors({ 
    primary: "#1c1917",      // Rich black
    secondary: "#292524",    // Warm black
    accent: "#b87333",       // Copper
    background: "#1c1917",     // Dark background
    surface: "#292524",          // Warm dark
    text: "#fafaf9",             // Stone 50
    textLight: "rgba(250,250,249,0.75)"
  }),

  // Warm stone with rust accent - Artisan & Crafted
  craft:    withOnColors({ 
    primary: "#78716c",      // Stone 500
    secondary: "#292524",    // Stone 900
    accent: "#a0522d",       // Sienna/rust
    background: "#1c1917",     // Dark stone
    surface: "#292524",          // Warm dark
    text: "#fafaf9",             // Stone 50
    textLight: "rgba(250,250,249,0.75)"
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
    textLight: "rgba(250,250,250,0.75)"
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
  // ── New layout defaults (Phase 6) ────────────────────────────────────────
  // Aurora: Deep space dark, indigo/cyan
  aurora:   withOnColors({
    primary: "#6366f1",      // Indigo
    secondary: "#4338ca",
    accent: "#22d3ee",       // Cyan
    background: "#080812",   // Near-black
    surface: "rgba(255,255,255,0.06)",
    text: "#f1f5f9",
    textLight: "rgba(241,245,249,0.65)"
  }),
  // Nexus: Clean white, bold navy
  nexus:    withOnColors({
    primary: "#0f172a",      // Deep navy
    secondary: "#1e293b",
    accent: "#6366f1",       // Indigo accent
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textLight: "#64748b"
  }),
  // Clay: Soft lavender-white, rose pink
  clay:     withOnColors({
    primary: "#db2777",      // Pink 600
    secondary: "#9d174d",
    accent: "#a78bfa",       // Violet 400
    background: "#fdf4ff",
    surface: "#fae8ff",
    text: "#2d2d44",
    textLight: "#6b6b8a"
  }),
  // Forge: Off-white, near-black, gold
  forge:    withOnColors({
    primary: "#0a0a0a",      // Near-black
    secondary: "#1a1a1a",
    accent: "#c4a000",       // Antique gold
    background: "#f8f7f4",   // Warm white
    surface: "#f0ede8",
    text: "#0a0a0a",
    textLight: "#5a5a5a"
  }),
  // Pulse: Neumorphic gray, blue/teal
  pulse:    withOnColors({
    primary: "#4f86c6",      // Medical blue
    secondary: "#2563eb",
    accent: "#5dbb9c",       // Teal
    background: "#e8ecf0",   // Neumorphic base
    surface: "#e8ecf0",
    text: "#2d3748",
    textLight: "#718096"
  }),
  // Flux: Deep dark, warm gold
  flux:     withOnColors({
    primary: "#d4a843",      // Warm gold
    secondary: "#b07d3a",    // Copper
    accent: "#c9a048",
    background: "#060608",   // Near-black
    surface: "#0e0e12",
    text: "#f5f0e8",
    textLight: "rgba(245,240,232,0.75)"
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
  // New layouts (Phase 6)
  aurora:  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=85&fit=crop",
  nexus:   "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600&q=85&fit=crop",
  clay:    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&q=85&fit=crop",
  forge:   "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=85&fit=crop",
  pulse:   "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85&fit=crop",
  flux:    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&q=85&fit=crop",
};
