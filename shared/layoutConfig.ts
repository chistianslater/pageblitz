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
