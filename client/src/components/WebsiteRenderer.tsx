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
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
}

// ── Industry → Layout Pool ────────────────────────────────────────────────────
const INDUSTRY_POOLS: Array<{ keywords: RegExp; pool: string[] }> = [
  { keywords: /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading/i, pool: ["elegant", "fresh", "luxury"] },
  { keywords: /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|burger|gastronomie|bakery|patisserie|confectionery/i, pool: ["warm", "fresh", "modern"] },
  { keywords: /handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|roofing|plumber|carpenter|painter|construction|renovation|installation|tischler|fliesenleger|bodenleger|trockenbauer/i, pool: ["bold", "craft", "modern"] },
  { keywords: /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire/i, pool: ["luxury", "bold", "craft"] },
  { keywords: /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance/i, pool: ["vibrant", "dynamic", "modern"] },
  { keywords: /arzt|zahnarzt|medizin|doctor|dental|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker/i, pool: ["trust", "clean", "modern"] },
  { keywords: /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|tax|finanz|wirtschaft|unternehmensberatung|notariat|immobilien|makler|real.?estate/i, pool: ["trust", "clean", "modern"] },
  { keywords: /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable/i, pool: ["natural", "fresh", "warm"] },
  { keywords: /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving/i, pool: ["craft", "trust", "bold"] },
  { keywords: /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup/i, pool: ["modern", "vibrant", "dynamic"] },
  { keywords: /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung/i, pool: ["trust", "clean", "fresh"] },
  { keywords: /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel|tour/i, pool: ["luxury", "elegant", "warm"] },
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

// ── Default Color Schemes per Layout ─────────────────────────────────────────
const DEFAULT_COLOR_SCHEMES: Record<string, ColorScheme> = {
  elegant:  { primary: "#b8860b", secondary: "#f5f0e8", accent: "#d4a843", background: "#fefcf8", surface: "#f5f0e8", text: "#1a1208", textLight: "#6b5c3e" },
  bold:     { primary: "#e85d04", secondary: "#1a1a1a", accent: "#ff6b1a", background: "#f5f5f5", surface: "#ebebeb", text: "#1a1a1a", textLight: "#555" },
  warm:     { primary: "#c45c26", secondary: "#fdf6ee", accent: "#e07b3c", background: "#fffaf5", surface: "#fdf6ee", text: "#2d1a0e", textLight: "#7a5c42" },
  clean:    { primary: "#2563eb", secondary: "#eff6ff", accent: "#3b82f6", background: "#f8fafc", surface: "#fff", text: "#0f172a", textLight: "#64748b" },
  dynamic:  { primary: "#22c55e", secondary: "#0a0a0a", accent: "#16a34a", background: "#0a0a0a", surface: "#111", text: "#fff", textLight: "rgba(255,255,255,0.6)" },
  luxury:   { primary: "#c9a84c", secondary: "#0a0a0a", accent: "#e8c87a", background: "#0a0a0a", surface: "#111", text: "#fff", textLight: "rgba(255,255,255,0.6)" },
  craft:    { primary: "#f97316", secondary: "#1a1a1a", accent: "#fb923c", background: "#111", surface: "#1a1a1a", text: "#fff", textLight: "rgba(255,255,255,0.6)" },
  fresh:    { primary: "#0ea5e9", secondary: "#fafaf8", accent: "#38bdf8", background: "#fafaf8", surface: "#fff", text: "#1a1a1a", textLight: "#666" },
  trust:    { primary: "#1d4ed8", secondary: "#f8fafc", accent: "#3b82f6", background: "#fff", surface: "#f8fafc", text: "#1a2332", textLight: "#5a6a7e" },
  modern:   { primary: "#0a0a0a", secondary: "#f8f8f8", accent: "#e11d48", background: "#fff", surface: "#f8f8f8", text: "#0a0a0a", textLight: "#666" },
  vibrant:  { primary: "#f59e0b", secondary: "#0d0d0d", accent: "#fbbf24", background: "#0d0d0d", surface: "#161616", text: "#fff", textLight: "rgba(255,255,255,0.6)" },
  natural:  { primary: "#65a30d", secondary: "#f0ece4", accent: "#84cc16", background: "#faf8f4", surface: "#f0ece4", text: "#2a2018", textLight: "#7a6a5a" },
};

const FALLBACK_IMAGES: Record<string, string> = {
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
 * Build a <style> tag that loads Google Fonts for the given design tokens.
 */
function buildGoogleFontsUrl(tokens: DesignTokens): string {
  const fonts = new Set<string>();
  if (tokens.headlineFont) fonts.add(tokens.headlineFont);
  if (tokens.bodyFont) fonts.add(tokens.bodyFont);
  if (fonts.size === 0) return "";
  const families = Array.from(fonts)
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
  showActivateButton,
  onActivate,
  businessPhone,
  businessAddress,
  businessEmail,
  openingHours = [],
}: WebsiteRendererProps) {
  const effectiveLayout = pickLayout(websiteData, layoutStyle);
  const cs: ColorScheme = colorScheme && colorScheme.primary
    ? colorScheme
    : DEFAULT_COLOR_SCHEMES[effectiveLayout] || DEFAULT_COLOR_SCHEMES.clean;
  const effectiveHeroImage = heroImageUrl || FALLBACK_IMAGES[effectiveLayout] || FALLBACK_IMAGES.clean;

  const tokens = websiteData.designTokens;

  // Inject Google Fonts dynamically when design tokens are present
  useEffect(() => {
    if (!tokens?.headlineFont) return;
    const url = buildGoogleFontsUrl(tokens);
    if (!url) return;
    const id = "site-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
    return () => { document.getElementById(id)?.remove(); };
  }, [tokens?.headlineFont, tokens?.bodyFont]);

  const sharedProps = {
    websiteData,
    cs,
    heroImageUrl: effectiveHeroImage,
    showActivateButton,
    onActivate,
    businessPhone,
    businessAddress,
    businessEmail,
    openingHours,
  };

  // Build wrapper style with CSS custom properties from design tokens
  const wrapperStyle: React.CSSProperties = tokens
    ? ({ cssText: buildTokenStyles(tokens, cs) } as unknown as React.CSSProperties)
    : {};

  // Use a div wrapper with inline CSS vars so all child layouts inherit them
  const tokenStyle = tokens ? buildTokenStyles(tokens, cs) : "";

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

  if (!tokenStyle) return layout;

  // Wrap with a div that sets the CSS custom properties
  return (
    <div
      style={{ all: "unset", display: "contents" } as React.CSSProperties}
      ref={(el) => {
        if (el && tokenStyle) {
          el.setAttribute("style", tokenStyle);
        }
      }}
    >
      {layout}
    </div>
  );
}
