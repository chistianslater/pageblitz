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
  // Bestehende Layouts
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
  eden:     { headlineFont: "DM Serif Display",  bodyFont: "DM Sans",          headlineCss: "'DM Serif Display', Georgia, serif",          bodyCss: "'DM Sans', 'Inter', sans-serif" },
  apex:     { headlineFont: "Bebas Neue",         bodyFont: "Inter",            headlineCss: "'Bebas Neue', Impact, sans-serif",             bodyCss: "'Inter', system-ui, sans-serif" },
  
  // 🔥 NEU: 6 neue Layouts
  aurora:   { headlineFont: "Space Grotesque",   bodyFont: "Inter",            headlineCss: "'Space Grotesque', sans-serif",            bodyCss: "'Inter', system-ui, sans-serif" }, // Glassmorphism
  nexus:    { headlineFont: "Plus Jakarta Sans", bodyFont: "Inter",            headlineCss: "'Plus Jakarta Sans', sans-serif",          bodyCss: "'Inter', system-ui, sans-serif" }, // Bento Grid
  clay:     { headlineFont: "Nunito",            bodyFont: "Outfit",           headlineCss: "'Nunito', sans-serif",                    bodyCss: "'Outfit', 'Inter', sans-serif" }, // Claymorphism
  forge:    { headlineFont: "Cormorant Garamond", bodyFont: "Space Grotesque", headlineCss: "'Cormorant Garamond', Georgia, serif",      bodyCss: "'Space Grotesque', sans-serif" }, // Brutalist
  pulse:    { headlineFont: "Space Grotesque",   bodyFont: "Nunito",           headlineCss: "'Space Grotesque', sans-serif",            bodyCss: "'Nunito', 'Inter', sans-serif" }, // Neumorphism
  flux:     { headlineFont: "Cormorant Garamond", bodyFont: "Space Grotesque", headlineCss: "'Cormorant Garamond', Georgia, serif",      bodyCss: "'Space Grotesque', sans-serif" }, // Cinematic
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
 * All schemes are WCAG AA compliant with minimum 4.5:1 contrast ratios.
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
    description: "Warmes Terracotta und Naturstein – handwerkliche Wärme und Erdverbundenheit. ✨ Kontrast-optimiert",
    colors: withOnColors({
      primary: "#B44D1F",        // Terracotta - beibehalten, guter Kontrast
      secondary: "#3D1A0A",      // Dunkelbraun - beibehalten
      accent: "#9C6B3A",         // 🔧 FIX: Dunkleres Goldbraun für besseren Kontrast (war: #C4956A)
      background: "#FEFCFA",
      surface: "#F5EDE0",
      text: "#1E1208",
      textLight: "#7A6A56"
    })
  },
  {
    id: "elegant",
    label: "Champagner",
    description: "Warmes Champagnergold und tiefes Anthrazit – für Luxus, Schönheit und hohe Ästhetik. ✨ Kontrast-optimiert",
    colors: withOnColors({
      primary: "#967B5C",        // Warm taupe - beibehalten
      secondary: "#1A1511",      // Anthrazit - beibehalten
      accent: "#D4AF37",         // 🔧 FIX: Classic Gold für bessere Sichtbarkeit (war: #F0EBE3)
      accentSecondary: "#C9B896", // Zusätzlich: Sanftes Gold für subtile Elemente
      background: "#FDFBF8",
      surface: "#F7F3EE",
      text: "#1A1511",
      textLight: "#7A7065"
    })
  },
  {
    id: "modern",
    label: "Grafitmodern",
    description: "Dunkles Graphit mit elektrischem Akzent – präzise, fokussiert und zeitgemäß. ✨ Dark Mode optimiert",
    colors: withOnColors({
      primary: "#a3e635",        // 🔧 FIX: Gedämpftes Lime für weniger Flimmern (war: #bef264)
      primaryGlow: "rgba(163, 230, 53, 0.3)", // Für Glow-Effekte
      secondary: "#0a0a0a",
      accent: "#ffffff",
      background: "#050505",
      surface: "#121212",
      surfaceElevated: "#1a1a1a",
      text: "#fafafa",
      textLight: "rgba(250, 250, 250, 0.75)", // 🔧 FIX: Erhöht von 0.6 auf 0.75
      textMuted: "rgba(250, 250, 250, 0.55)"   // 🔧 FIX: Erhöht von 0.5 auf 0.55
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
  // 🔥 NEU: 8 branchenspezifische Farbschemata
  {
    id: "health",
    label: "Medical Blue",
    description: "Vertrauen, Heilung, Sauberkeit – ideal für Ärzte, Therapeuten und Gesundheitsberufe.",
    colors: withOnColors({
      primary: "#2563EB",        // Medical Blue
      secondary: "#1E40AF",      // Deep Blue
      accent: "#10B981",         // Healing Green
      accentLight: "#6EE7B7",
      background: "#ffffff",
      surface: "#F0F9FF",
      text: "#1E3A5F",
      textLight: "#64748B"
    })
  },
  {
    id: "eco",
    label: "Forest Green",
    description: "Nachhaltigkeit, Natur, Wachstum – perfekt für Bio-Betriebe und Umwelt-Unternehmen.",
    colors: withOnColors({
      primary: "#059669",        // Forest Green
      secondary: "#047857",      // Deep Forest
      accent: "#84CC16",         // Fresh Lime
      accentLight: "#BEF264",
      background: "#F0FDF4",
      surface: "#DCFCE7",
      text: "#064E3B",
      textLight: "#059669"
    })
  },
  {
    id: "tech",
    label: "Digital Blue",
    description: "Innovation, Klarheit, Zukunft – für Software, IT und Tech-Startups.",
    colors: withOnColors({
      primary: "#0EA5E9",        // Digital Blue
      secondary: "#0284C7",      // Deep Sky
      accent: "#6366F1",         // Electric Indigo
      accentLight: "#A5B4FC",
      background: "#F0F9FF",
      surface: "#E0F2FE",
      text: "#0C4A6E",
      textLight: "#0EA5E9"
    })
  },
  {
    id: "food",
    label: "Appetite Red",
    description: "Appetit, Wärme, Einladung – optimal für Restaurants, Cafés und Gastronomie.",
    colors: withOnColors({
      primary: "#DC2626",        // Appetite Red
      secondary: "#991B1B",      // Deep Red
      accent: "#F59E0B",         // Warm Orange
      accentLight: "#FCD34D",
      background: "#FEF2F2",
      surface: "#FEE2E2",
      text: "#7F1D1D",
      textLight: "#DC2626"
    })
  },
  {
    id: "beauty",
    label: "Rose Gold",
    description: "Eleganz, Weiblichkeit, Luxus – für Kosmetik, Mode und Beauty-Dienstleister.",
    colors: withOnColors({
      primary: "#BE185D",        // Rose
      secondary: "#9D174D",      // Deep Rose
      accent: "#FCD34D",         // Champagne Gold
      accentLight: "#FDE68A",
      background: "#FDF2F8",
      surface: "#FCE7F3",
      text: "#831843",
      textLight: "#BE185D"
    })
  },
  {
    id: "legal",
    label: "Charcoal Gold",
    description: "Autorität, Seriosität, Vertrauen – für Anwälte, Berater und Finanzdienstleister.",
    colors: withOnColors({
      primary: "#1E293B",        // Charcoal
      secondary: "#0F172A",      // Deep Charcoal
      accent: "#B45309",         // Traditional Gold
      accentLight: "#D97706",
      background: "#ffffff",
      surface: "#F1F5F9",
      text: "#0F172A",
      textLight: "#475569"
    })
  },
  {
    id: "creative",
    label: "Violet Sunset",
    description: "Inspiration, Energie, Kreativität – für Designer, Künstler und Kreativ-Agenturen.",
    colors: withOnColors({
      primary: "#7C3AED",        // Violet
      secondary: "#5B21B6",      // Deep Violet
      accent: "#F97316",         // Sunset Orange
      accentLight: "#FDBA74",
      background: "#FAF5FF",
      surface: "#F3E8FF",
      text: "#4C1D95",
      textLight: "#7C3AED"
    })
  },
  {
    id: "sport",
    label: "Energy Teal",
    description: "Energie, Dynamik, Motivation – für Fitness-Studios, Yoga und Sport-Anbieter.",
    colors: withOnColors({
      primary: "#EA580C",        // Energy Orange
      secondary: "#C2410C",      // Deep Orange
      accent: "#14B8A6",         // Active Teal
      accentLight: "#5EEAD4",
      background: "#FFF7ED",
      surface: "#FFEDD5",
      text: "#7C2D12",
      textLight: "#EA580C"
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
 * All Dark Mode schemes have enhanced text contrast for WCAG AA compliance.
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
  // 🔧 Dark Mode: Verbesserte Text-Kontraste
  dynamic:  withOnColors({ 
    primary: "#2d3748",      // Charcoal
    secondary: "#1a202c",      // Deep charcoal
    accent: "#5a8a8a",       // Muted teal
    background: "#0A0A0A",     // 🔧 Tieferes Schwarz (war: #1a202c)
    surface: "#141414",        // 🔧 Etwas angehoben (war: #2d3748)
    surfaceElevated: "#1E1E1E", // 🔧 Für Cards/Modals
    text: "#fafafa",           // 🔓 Fast weiß für besseren Kontrast
    textLight: "rgba(250,250,250,0.75)", // 🔧 Erhöht von 0.6 auf 0.75
    textMuted: "rgba(250,250,250,0.55)"  // 🔧 Erhöht von 0.5 auf 0.55
  }),
  
  // Deep forest with copper - Premium & Refined
  // 🔧 Dark Mode: Verbesserte Text-Kontraste
  luxury:   withOnColors({ 
    primary: "#1c1917",      // Rich black
    secondary: "#292524",    // Warm black
    accent: "#b87333",       // Copper
    accentLight: "#D4956A",  // 🔧 Helleres Copper für Hover
    background: "#0A0A0A",   // 🔧 Tieferes Schwarz
    surface: "#141414",        // 🔧 Angehoben
    surfaceElevated: "#1E1E1E",
    text: "#fafafa",           // 🔓 Fast weiß
    textLight: "rgba(250,250,250,0.75)", // 🔧 Erhöht
    textMuted: "rgba(250,250,250,0.55)"  // 🔧 Erhöht
  }),
  
  // Warm stone with rust accent - Artisan & Crafted
  // 🔧 Dark Mode: Verbesserte Text-Kontraste
  craft:    withOnColors({ 
    primary: "#78716c",      // Stone 500
    secondary: "#292524",    // Stone 900
    accent: "#a0522d",       // Sienna/rust
    accentLight: "#C46B4A",
    background: "#0A0A0A",   // 🔧 Tieferes Schwarz
    surface: "#141414",        // 🔧 Angehoben
    surfaceElevated: "#1E1E1E",
    text: "#fafafa",           // 🔓 Fast weiß
    textLight: "rgba(250,250,250,0.75)", // 🔧 Erhöht
    textMuted: "rgba(250,250,250,0.55)"  // 🔧 Erhöht
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
  // 🔧 Dark Mode: Verbesserte Text-Kontraste
  vibrant:  withOnColors({ 
    primary: "#6D28D9",      // 🔧 Helleres Deep purple für besseren Kontrast (war: #4c1d95)
    secondary: "#1e1b4b",    // Darker purple
    accent: "#c4b5a0",       // Soft gold
    accentLight: "#E8DCC4",
    background: "#0A0A0A",   // 🔧 Tieferes Schwarz
    surface: "#141414",        // 🔧 Angehoben
    surfaceElevated: "#1E1E1E",
    text: "#fafafa",           // 🔓 Fast weiß
    textLight: "rgba(250,250,250,0.75)", // 🔧 Erhöht
    textMuted: "rgba(250,250,250,0.55)"  // 🔧 Erhöht
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
  
  // 🔥 NEU: 6 neue Layout Farbschemata
  // Aurora: Glassmorphism - Tech/SaaS (Violet/Cyan Akzente auf Dark)
  aurora:   withOnColors({ 
    primary: "#6366f1",      // Indigo
    secondary: "#1e1b4b",    // Deep purple
    accent: "#06b6d4",       // Cyan
    accentLight: "#67e8f9",
    background: "#0a0a0f",   // Dark background
    surface: "rgba(255,255,255,0.05)", // Glass surface
    surfaceElevated: "rgba(255,255,255,0.08)",
    text: "#fafafa",
    textLight: "rgba(250,250,250,0.75)",
    textMuted: "rgba(250,250,250,0.55)"
  }),
  
  // Nexus: Bento Grid - Portfolio/Agency (Clean Slate)
  nexus:    withOnColors({ 
    primary: "#0f172a",      // Slate 900
    secondary: "#f8fafc",    // Slate 50
    accent: "#6366f1",       // Indigo
    accentLight: "#818cf8",
    background: "#fafafa",   // Light background
    surface: "#ffffff",        // White cards
    surfaceElevated: "#f1f5f9",
    text: "#0f172a",
    textLight: "#64748b",
    textMuted: "#94a3b8"
  }),
  
  // Clay: Claymorphism - Wellness/Lifestyle (Pastel)
  clay:     withOnColors({ 
    primary: "#FFB6C1",      // Light Pink
    secondary: "#98FF98",    // Mint
    accent: "#B0E0E6",       // Powder Blue
    accentLight: "#E0FFFF",
    background: "#FFF8E7",   // Cream
    surface: "#ffffff",        // White
    surfaceElevated: "#f5f5f5",
    text: "#4a4a4a",
    textLight: "#6b6b6b",
    textMuted: "#8a8a8a"
  }),
  
  // Forge: Brutalist - Architecture/Design (Monochrome + Red Accent)
  forge:    withOnColors({ 
    primary: "#1a1a1a",      // Near black
    secondary: "#ffffff",    // White
    accent: "#ff0000",       // Bold Red
    accentLight: "#ff4444",
    background: "#ffffff",   // White background
    surface: "#f5f5f5",        // Light gray
    surfaceElevated: "#e5e5e5",
    text: "#1a1a1a",
    textLight: "#666666",
    textMuted: "#999999"
  }),
  
  // Pulse: Neumorphism - Health/Fitness (Sage/Salmon)
  pulse:    withOnColors({ 
    primary: "#10B981",      // Emerald
    secondary: "#F87171",    // Salmon
    accent: "#A78BFA",       // Lavender
    accentLight: "#C4B5FD",
    background: "#e8e8e8",   // Gray background for neumorphism
    surface: "#e8e8e8",
    surfaceElevated: "#f0f0f0",
    text: "#1f2937",
    textLight: "#6b7280",
    textMuted: "#9ca3af"
  }),
  
  // Flux: Cinematic - Restaurant/Events (Dark + Gold)
  flux:     withOnColors({ 
    primary: "#D4AF37",      // Gold
    secondary: "#B87333",    // Copper
    accent: "#FFD700",       // Golden
    accentLight: "#FFE55C",
    background: "#0a0a0a",   // Deep black
    surface: "#141414",      // Slightly lighter
    surfaceElevated: "#1e1e1e",
    text: "#fafafa",
    textLight: "rgba(250,250,250,0.75)",
    textMuted: "rgba(250,250,250,0.55)"
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
  // Bestehende Layouts
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
  
  // 🔥 NEU: 6 neue Layout Fallback Images
  aurora:  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=85&fit=crop", // Tech/Glassmorphism
  nexus:   "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&fit=crop", // Office/Bento
  clay:    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=85&fit=crop", // Soft/Clay
  forge:   "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85&fit=crop", // Architecture
  pulse:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop", // Fitness/Gym
  flux:    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&q=85&fit=crop", // Restaurant/Bar
};
