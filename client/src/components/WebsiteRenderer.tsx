/**
 * WebsiteRenderer – Master dispatcher for 12 layout personalities
 *
 * Design Token Injection:
 * When websiteData.designTokens is present (AI-generated), those tokens are
 * injected as CSS custom properties on the root wrapper. Every layout reads
 * these variables, giving each website a unique visual identity:
 *   --site-font-headline, --site-font-body
 *   --site-color-accent, --site-color-bg, --site-color-text, --site-color-card
 *   --site-radius, --site-shadow, --site-spacing-section
 *   --site-headline-weight, --site-headline-ls, --site-body-lh
 *
 * Industry-to-template-pool mapping:
 * Each industry maps to 2-4 visually distinct layouts.
 * A deterministic hash of the business name picks one layout from the pool,
 * ensuring maximum variance within the same industry.
 */
import { useEffect } from "react";
import type { WebsiteData, ColorScheme, DesignTokens } from "@shared/types";
import { getSafeHeadingColor, getContrastColor, isLightColor, getLuminance, hexToRgb } from "@shared/colorContrast";
import { LAYOUT_FONTS, LAYOUT_FONTS_DEFAULT, DEFAULT_LAYOUT_COLOR_SCHEMES, LAYOUT_FALLBACK_IMAGES, withOnColors } from "@shared/layoutConfig";
import ElegantLayout from "./layouts/ElegantLayout";
import BoldLayout from "./layouts/BoldLayout";
import WarmLayout from "./layouts/WarmLayout";
import CleanLayout from "./layouts/CleanLayout";
import DynamicLayout from "./layouts/DynamicLayout";
import LuxuryLayout from "./layouts/LuxuryLayout";
import CraftLayout from "./layouts/CraftLayout";
import FreshLayout from "./layouts/FreshLayout";
import TrustLayout from "./layouts/TrustLayout";
import ModernLayout from "./layouts/ModernLayout";
import VibrantLayout from "./layouts/VibrantLayout";
import NaturalLayout from "./layouts/NaturalLayout";

interface WebsiteRendererProps {
  websiteData: WebsiteData;
  colorScheme?: ColorScheme;
  layoutStyle?: string | null;
  heroImageUrl?: string | null;
  /** Optional second image for About/Info sections (defaults to heroImageUrl if not set) */
  aboutImageUrl?: string | null;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
  slug?: string | null;
  /** When true, the contact section is shown as locked/upsell overlay */
  contactFormLocked?: boolean;
  /** Optional font override for the logo (e.g. 'Montserrat', 'Oswald') */
  logoFont?: string;
  /** Real-time headline font override during onboarding (e.g. 'Georgia', 'Poppins') */
  headlineFontOverride?: string;
  /** Business category/industry for industry-specific stats and content */
  businessCategory?: string | null;
}

// ── Industry → Layout Pool ────────────────────────────────────────────────────
const INDUSTRY_POOLS: Array<{ keywords: RegExp; pool: string[] }> = [
  // Beauty/Friseur: [0] dark luxury | [1] light elegant serif | [2] fresh/airy
  { keywords: /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading/i, pool: ["luxury", "elegant", "fresh"] },
  // Restaurant/Food: [0] warm earthy | [1] fresh modern | [2] dark craft
  { keywords: /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|burger|gastronomie|bakery|patisserie|confectionery/i, pool: ["warm", "fresh", "craft"] },
  // Handwerk/Bau: [0] dark bold | [1] light trust/professional | [2] minimal modern
  { keywords: /handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|roofing|plumber|carpenter|painter|construction|renovation|installation|tischler|fliesenleger|bodenleger|trockenbauer/i, pool: ["bold", "trust", "modern"] },
  // Auto/KFZ: [0] dark luxury | [1] dark craft | [2] light clean
  { keywords: /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire/i, pool: ["luxury", "craft", "clean"] },
  // Fitness/Sport: [0] dark vibrant | [1] dark dynamic | [2] light fresh
  { keywords: /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance/i, pool: ["vibrant", "dynamic", "fresh"] },
  // Medizin/Gesundheit: [0] light trust | [1] light clean | [2] warm natural
  { keywords: /arzt|zahnarzt|medizin|doctor|dental|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker/i, pool: ["trust", "clean", "natural"] },
  // Recht/Finanzen/Beratung: [0] light trust | [1] dark luxury | [2] minimal modern
  { keywords: /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|tax|finanz|wirtschaft|unternehmensberatung|notariat|immobilien|makler|real.?estate/i, pool: ["trust", "luxury", "modern"] },
  // Bio/Natur/Garten: [0] light natural | [1] warm earthy | [2] fresh airy
  { keywords: /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable/i, pool: ["natural", "warm", "fresh"] },
  // Reinigung/Service/Security: [0] dark bold | [1] light trust | [2] minimal clean
  { keywords: /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving/i, pool: ["bold", "trust", "clean"] },
  // Tech/Digital/Agency: [0] minimal modern | [1] dark dynamic | [2] vibrant
  { keywords: /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup/i, pool: ["modern", "dynamic", "vibrant"] },
  // Bildung/Coaching: [0] light trust | [1] fresh airy | [2] warm natural
  { keywords: /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung/i, pool: ["trust", "fresh", "natural"] },
  // Hotel/Event/Reise: [0] dark luxury | [1] warm elegant | [2] light fresh
  { keywords: /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel|tour/i, pool: ["luxury", "warm", "elegant"] },
];

const ALL_LAYOUTS = ["elegant", "bold", "warm", "clean", "dynamic", "luxury", "craft", "fresh", "trust", "modern", "vibrant", "natural"];
const DEFAULT_POOL = ["clean", "modern", "trust", "fresh"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function pickLayout(websiteData: WebsiteData, layoutStyleOverride?: string | null): string {
  if (layoutStyleOverride && ALL_LAYOUTS.includes(layoutStyleOverride)) return layoutStyleOverride;
  const text = `${websiteData.businessName} ${websiteData.tagline || ""}`;
  const lower = text.toLowerCase();
  let pool: string[] = DEFAULT_POOL;
  for (const entry of INDUSTRY_POOLS) {
    if (entry.keywords.test(lower)) { pool = entry.pool; break; }
  }
  const seed = websiteData.businessName || "default";
  return pool[hashString(seed) % pool.length];
}

// ── Layout-specific font defaults – sourced from shared/layoutConfig (single source of truth) ────────
const DEFAULT_COLOR_SCHEMES = DEFAULT_LAYOUT_COLOR_SCHEMES;
const FALLBACK_IMAGES = LAYOUT_FALLBACK_IMAGES;

const LAYOUT_FONT_DEFAULTS: Record<string, { headline: string; body: string }> = Object.fromEntries(
  Object.entries(LAYOUT_FONTS).map(([k, v]) => [k, { headline: v.headlineCss, body: v.bodyCss }])
);
LAYOUT_FONT_DEFAULTS._default = { headline: LAYOUT_FONTS_DEFAULT.headlineCss, body: LAYOUT_FONTS_DEFAULT.bodyCss };

// ── CSS Custom Property maps ──────────────────────────────────────────────────
const RADIUS_MAP: Record<string, string> = {
  none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px",
};
const SHADOW_MAP: Record<string, string> = {
  none: "none",
  flat: "2px 2px 0px rgba(0,0,0,0.15)",
  soft: "0 4px 24px rgba(0,0,0,0.08)",
  dramatic: "0 20px 60px rgba(0,0,0,0.25)",
  glow: "0 0 30px rgba(var(--site-accent-rgb, 255,255,255),0.35)",
};
const SPACING_MAP: Record<string, string> = {
  tight: "4rem", normal: "6rem", spacious: "8rem", ultra: "12rem",
};

/**
 * Build a Google Fonts URL for the given font names.
 */
function buildGoogleFontsUrl(fonts: string[]): string {
  const unique = Array.from(new Set(fonts.filter(Boolean)));
  if (unique.length === 0) return "";
  const families = unique
    .map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800;900`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Convert design tokens to a CSS custom properties string.
 */
function buildTokenStyles(tokens: DesignTokens, cs: ColorScheme): string {
  const radius = RADIUS_MAP[tokens.borderRadius] || RADIUS_MAP.md;
  const shadow = SHADOW_MAP[tokens.shadowStyle] || SHADOW_MAP.soft;
  const spacing = SPACING_MAP[tokens.sectionSpacing] || SPACING_MAP.normal;
  const accent = tokens.accentColor || cs.accent;
  const bg = tokens.backgroundColor || cs.background;
  const text = tokens.textColor || cs.text;
  const card = tokens.cardBackground || cs.surface;

  return `
    --site-font-headline: '${tokens.headlineFont}', serif;
    --site-font-body: '${tokens.bodyFont}', sans-serif;
    --site-headline-weight: ${tokens.headlineFontWeight || "700"};
    --site-headline-ls: ${tokens.headlineLetterSpacing || "-0.02em"};
    --site-body-lh: ${tokens.bodyLineHeight || "1.75"};
    --site-color-primary: ${cs.primary};
    --site-color-secondary: ${cs.secondary};
    --site-color-accent: ${accent};
    --site-color-bg: ${bg};
    --site-color-text: ${text};
    --site-color-card: ${card};
    --site-radius: ${radius};
    --site-shadow: ${shadow};
    --site-spacing-section: ${spacing};
    --site-btn-radius: ${tokens.buttonStyle === "pill" ? "9999px" : tokens.buttonStyle === "filled" ? radius : radius};
    --site-btn-style: ${tokens.buttonStyle || "filled"};
    --site-section-bg-1: ${tokens.sectionBackgrounds?.[0] || bg};
    --site-section-bg-2: ${tokens.sectionBackgrounds?.[1] || cs.surface};
    --site-section-bg-3: ${tokens.sectionBackgrounds?.[2] || bg};
  `.trim();
}

export default function WebsiteRenderer({
  websiteData,
  colorScheme,
  layoutStyle,
  heroImageUrl,
  aboutImageUrl,
  showActivateButton,
  onActivate,
  businessPhone,
  businessAddress,
  businessEmail,
  openingHours = [],
  slug,
  contactFormLocked = false,
  logoFont,
  headlineFontOverride,
  businessCategory,
}: WebsiteRendererProps) {
  const effectiveLayout = pickLayout(websiteData, layoutStyle);
  const defaultCs = DEFAULT_COLOR_SCHEMES[effectiveLayout] || DEFAULT_COLOR_SCHEMES.clean;
  // Merge DB colorScheme with defaults so surface/background/textLight are always defined.
  // User-chosen brandSecondaryColor is stored as colorScheme.secondary → also map to surface
  // so section backgrounds update in real-time during onboarding.
  // Determine if the user has explicitly chosen a secondary color (not just the DB default).
  // The user-chosen secondary should be used as the surface/section-background color.
  // We detect a user override when colorScheme.secondary differs from the defaultCs.secondary.
  const userSecondary = colorScheme?.secondary && colorScheme.secondary !== defaultCs.secondary
    ? colorScheme.secondary
    : null;
  const mergedCs = colorScheme && colorScheme.primary
    ? {
        ...defaultCs,
        ...colorScheme,
        // Map user-chosen secondary to surface so ALL layouts that use cs.surface
        // immediately reflect the user's color choice.
        surface: userSecondary || colorScheme.secondary || defaultCs.surface,
      }
    : defaultCs;

  // Recalculate on-colors to ensure contrast is correct even if user changed base colors
  const rawCs = withOnColors(mergedCs);

  // ─── Enforce contrast: text must always be readable on background ───────────────
  // If the AI or DB produced a text color with insufficient contrast against the
  // background (e.g. light text on light bg), replace it with a safe fallback.
  const bgColor = rawCs.background || "#ffffff";
  const surfaceColor = rawCs.surface || "#f5f5f5";

  // Safe text color on background
  const safeText = (() => {
    const lum = getLuminance(bgColor);
    const textLum = getLuminance(rawCs.text || "#000000");
    const lighter = Math.max(lum, textLum);
    const darker = Math.min(lum, textLum);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    if (ratio >= 3.0) return rawCs.text; // sufficient contrast → keep
    return isLightColor(bgColor) ? "#0f172a" : "#f8fafc";
  })();

  // Safe textLight color on background
  const safeTextLight = (() => {
    const lum = getLuminance(bgColor);
    const textLum = getLuminance(rawCs.textLight || "#666666");
    const lighter = Math.max(lum, textLum);
    const darker = Math.min(lum, textLum);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    if (ratio >= 2.5) return rawCs.textLight;
    return isLightColor(bgColor) ? "#64748b" : "rgba(248, 250, 252, 0.65)";
  })();

  // Safe primary color on background (for headings that use cs.primary as text color)
  const safePrimaryOnBg = getSafeHeadingColor(bgColor, rawCs.primary);
  // Safe primary on surface (for headings in surface-colored sections)
  const safePrimaryOnSurface = getSafeHeadingColor(surfaceColor, rawCs.primary);
  // Safe primary on white background (for white buttons)
  const safePrimaryOnWhite = getSafeHeadingColor("#ffffff", rawCs.primary);

  // ─── Derivation of a "Deep" version of the secondary color ───────────────────
  // This is used for icons/accents in sections that use the secondary color as bg.
  // It creates a high-end monochromatic look.
  const deepSecondary = (() => {
    const isLight = isLightColor(surfaceColor);
    const rgb = hexToRgb(surfaceColor);
    if (!rgb) return rawCs.primary;
    
    // If background is light, we need a very dark version for icons
    // If background is dark, we need a very light version
    const factor = isLight ? 0.35 : 1.6; 
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.floor(v * factor)));
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(clamp(rgb.r))}${toHex(clamp(rgb.g))}${toHex(clamp(rgb.b))}`;
  })();

  // Use the primary color as the default icon color, 
  // but if the primary doesn't contrast well enough, 
  // use the deep secondary instead of just falling back to black/white.
  const accentOnSurface = (() => {
    const primaryOnSurface = getSafeHeadingColor(surfaceColor, rawCs.primary);
    // If primaryOnSurface is a generic fallback (black/white), try deepSecondary
    if (primaryOnSurface === "#1a1a1a" || primaryOnSurface === "#f5f5f5" || primaryOnSurface === "#000000" || primaryOnSurface === "#ffffff") {
      const secondaryOnSurface = getSafeHeadingColor(surfaceColor, deepSecondary);
      return secondaryOnSurface;
    }
    return primaryOnSurface;
  })();

  const cs: ColorScheme = {
    ...rawCs,
    text: safeText,
    textLight: safeTextLight,
  };
  const effectiveHeroImage = heroImageUrl || FALLBACK_IMAGES[effectiveLayout] || FALLBACK_IMAGES.clean;

  const tokens = websiteData.designTokens;
  const fontDefaults = LAYOUT_FONT_DEFAULTS[effectiveLayout] || LAYOUT_FONT_DEFAULTS.clean;

  // Determine which fonts to load via Google Fonts
  const fontsToLoad = tokens
    ? [tokens.headlineFont, tokens.bodyFont].filter(Boolean) as string[]
    : [];
  
  if (headlineFontOverride) {
    fontsToLoad.push(headlineFontOverride);
  }

  // Inject logoFont as CSS variable for real-time logo preview during onboarding
  // Accepts both the direct prop and the legacy _logoFont/_brandLogoFont from websiteData
  const effectiveLogoFont = logoFont
    || (websiteData as any)?._logoFont as string | undefined
    || (websiteData as any)?._brandLogoFont as string | undefined;
  
  if (effectiveLogoFont && !fontsToLoad.includes(effectiveLogoFont)) {
    fontsToLoad.push(effectiveLogoFont);
  }

  // Also load default layout fonts if they are not system fonts
  if (!tokens) {
    const defaultHeadline = fontDefaults.headline.split(',')[0].replace(/'/g, '').trim();
    const defaultBody = fontDefaults.body.split(',')[0].replace(/'/g, '').trim();
    const genericFonts = ['serif', 'sans-serif', 'monospace', 'system-ui', 'cursive', 'fantasy', 'Georgia', 'Impact', 'Arial', 'Helvetica', 'Times New Roman'];
    if (!genericFonts.includes(defaultHeadline) && !fontsToLoad.includes(defaultHeadline)) fontsToLoad.push(defaultHeadline);
    if (!genericFonts.includes(defaultBody) && !fontsToLoad.includes(defaultBody)) fontsToLoad.push(defaultBody);
  }
  // Logo image URL (uploaded custom logo)
  const effectiveLogoUrl = (websiteData as any)?._brandLogoUrl as string | undefined
    || (websiteData as any)?._logoUrl as string | undefined;
  useEffect(() => {
    if (effectiveLogoFont) {
      document.documentElement.style.setProperty('--logo-font', `'${effectiveLogoFont}', sans-serif`);
    } else {
      document.documentElement.style.removeProperty('--logo-font');
    }
    return () => { document.documentElement.style.removeProperty('--logo-font'); };
  }, [effectiveLogoFont]);

  // Inject Google Fonts dynamically
  useEffect(() => {
    if (fontsToLoad.length === 0) return;
    const url = buildGoogleFontsUrl(fontsToLoad);
    if (!url) return;
    const id = "site-google-fonts";
    document.getElementById(id)?.remove(); // Remove old to force refresh
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
    return () => { document.getElementById(id)?.remove(); };
  }, [fontsToLoad.join(",")]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Show all sections including AI-generated testimonials (they are always in German)
  const effectiveAboutImage = aboutImageUrl || effectiveHeroImage;

  const sharedProps = {
    websiteData,
    cs,
    heroImageUrl: effectiveHeroImage,
    aboutImageUrl: effectiveAboutImage,
    showActivateButton,
    onActivate,
    businessPhone,
    businessAddress,
    businessEmail,
    openingHours,
    slug,
    contactFormLocked,
    businessCategory,
    logoUrl: effectiveLogoUrl,
  };

  // Build CSS custom properties string – always set at least the font defaults
  let tokenStyle = tokens
    ? buildTokenStyles(tokens, cs)
    : `--site-font-headline: ${fontDefaults.headline}; --site-font-body: ${fontDefaults.body};`;

  // Always inject the surface color as --site-color-surface so layouts without designTokens
  // can also pick it up. Also override --site-section-bg-2 with the user secondary.
  tokenStyle += `; --site-color-surface: ${cs.surface}; --site-section-bg-2: ${cs.surface};`;
  if (userSecondary) {
    // Explicit user-chosen secondary: also override section-bg-2 for layouts that use it
    tokenStyle += `; --site-user-secondary: ${userSecondary};`;
  }

  // ─── Contrast-safe text colors ───────────────────────────────────────────────
  // Ensure headings and nav/logo text are always readable against their backgrounds.
  // --site-heading-on-bg: safe heading color on the main background
  // --site-heading-on-surface: safe heading color on surface/section-bg-2
  // --site-nav-text: safe nav/logo text color on the primary-colored navbar
  const headingOnBg = getSafeHeadingColor(cs.background || "#ffffff", cs.primary);
  const headingOnSurface = getSafeHeadingColor(cs.surface || "#f5f5f5", cs.primary);
  const navTextColor = getContrastColor(cs.primary);
  // On very light primary (e.g. cream/white), the nav bg is often white → use dark text
  const navBgIsLight = isLightColor(cs.primary);
  // Muted text on primary background (for subtitles in CTA sections)
  const navTextMuted = navBgIsLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.75)";
  
  // Create a subtle version of the accent color (for icon backgrounds etc.)
  const accentOnSurfaceSubtle = `${accentOnSurface}15`;
  
  // Use the accentOnSurface for icons and small labels on surface backgrounds
  tokenStyle += `; --site-heading-on-bg: ${headingOnBg}; --site-heading-on-surface: ${headingOnSurface}; --site-nav-text: ${navTextColor}; --site-nav-text-muted: ${navTextMuted}; --site-nav-bg-is-light: ${navBgIsLight ? "1" : "0"}; --site-primary-on-bg: ${safePrimaryOnBg}; --site-primary-on-surface: ${accentOnSurface}; --site-primary-on-surface-subtle: ${accentOnSurfaceSubtle}; --site-primary-on-white: ${safePrimaryOnWhite};`;

  // Real-time headline font override (from onboarding chat selection)
  if (headlineFontOverride) {
    tokenStyle += `; --site-font-headline: '${headlineFontOverride}', serif;`;
  }

  const layout = (() => {
    switch (effectiveLayout) {
      case "elegant":  return <ElegantLayout {...sharedProps} />;
      case "bold":     return <BoldLayout {...sharedProps} />;
      case "warm":     return <WarmLayout {...sharedProps} />;
      case "clean":    return <CleanLayout {...sharedProps} />;
      case "dynamic":  return <DynamicLayout {...sharedProps} />;
      case "luxury":   return <LuxuryLayout {...sharedProps} />;
      case "craft":    return <CraftLayout {...sharedProps} />;
      case "fresh":    return <FreshLayout {...sharedProps} />;
      case "trust":    return <TrustLayout {...sharedProps} />;
      case "modern":   return <ModernLayout {...sharedProps} />;
      case "vibrant":  return <VibrantLayout {...sharedProps} />;
      case "natural":  return <NaturalLayout {...sharedProps} />;
      default:         return <CleanLayout {...sharedProps} />;
    }
  })();

  // Wrap with a real block div (NOT display:contents) so CSS custom properties
  // are properly inherited by all child elements. The div itself is invisible.
  return (
    <div
      ref={(el) => {
        if (el) el.setAttribute("style", tokenStyle);
      }}
      style={{ display: "block", minHeight: "100vh", position: "relative" }}
    >
      {layout}

    </div>
  );
}
