/**
 * WebsiteRenderer – Master dispatcher for 12 layout personalities
 *
 * Industry-to-template-pool mapping:
 * Each industry maps to 2-4 visually distinct layouts.
 * A deterministic hash of the business name picks one layout from the pool,
 * ensuring maximum variance within the same industry.
 *
 * Layout inventory:
 *   elegant   – Gold/cream luxury (hair, beauty, spa, jewelry, fashion)
 *   bold      – Dark/yellow trades (electrician, construction, automotive)
 *   warm      – Terracotta/wood (restaurant, café, bakery, catering)
 *   clean     – White/blue professional (medical, legal, consulting)
 *   dynamic   – Dark/green energetic (fitness, sport, gym)
 *   luxury    – Black/gold premium (car detailing, luxury retail, high-end)
 *   craft     – Dark/orange industrial (plumber, HVAC, pest control)
 *   fresh     – Light/pastel artisanal (organic café, florist, wellness)
 *   trust     – White/blue authoritative (medical, insurance, finance)
 *   modern    – Black/white asymmetric (agency, tech, real estate)
 *   vibrant   – Dark/accent energetic (gym, fitness, crossfit)
 *   natural   – Earthy/green organic (eco shop, garden, naturopath)
 */
import type { WebsiteData, ColorScheme } from "@shared/types";
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
// Each entry: [keyword-matcher, layout-pool[]]
// The pool contains 2-4 structurally different layouts for the same industry.
// A hash of the business name deterministically picks one.

const INDUSTRY_POOLS: Array<{ keywords: RegExp; pool: string[] }> = [
  // Hair & Beauty
  {
    keywords: /friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading/i,
    pool: ["elegant", "fresh", "luxury"],
  },
  // Restaurant, Café, Food
  {
    keywords: /restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|burger|gastronomie|bakery|patisserie|confectionery/i,
    pool: ["warm", "fresh", "modern"],
  },
  // Construction, Trades (Handwerk)
  {
    keywords: /handwerk|bau|elektriker|dachdecker|sanitär|maler|zimmermann|schreiner|klempner|heizung|contractor|roofing|plumber|carpenter|painter|construction|renovation|installation|tischler|fliesenleger|bodenleger|trockenbauer/i,
    pool: ["bold", "craft", "modern"],
  },
  // Automotive
  {
    keywords: /auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice|tire/i,
    pool: ["luxury", "bold", "craft"],
  },
  // Fitness & Sport
  {
    keywords: /fitness|sport|gym|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing|kickbox|dance/i,
    pool: ["vibrant", "dynamic", "modern"],
  },
  // Medical & Health
  {
    keywords: /arzt|zahnarzt|medizin|doctor|dental|medical|health|clinic|pharmacy|apotheke|praxis|klinik|hospital|chiropractor|osteopath|heilpraktiker/i,
    pool: ["trust", "clean", "modern"],
  },
  // Legal, Finance, Consulting
  {
    keywords: /rechtsanwalt|anwalt|steuer|versicherung|beratung|law|legal|consulting|accountant|tax|finanz|wirtschaft|unternehmensberatung|notariat|immobilien|makler|real.?estate/i,
    pool: ["trust", "clean", "modern"],
  },
  // Organic, Eco, Garden, Nature
  {
    keywords: /bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable/i,
    pool: ["natural", "fresh", "warm"],
  },
  // Pest Control, Cleaning, Facility
  {
    keywords: /schädling|pest|control|reinigung|cleaning|facility|gebäude|hausmeister|security|bewachung|entsorgung|waste|umzug|moving/i,
    pool: ["craft", "trust", "bold"],
  },
  // Tech, Agency, Digital
  {
    keywords: /tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup/i,
    pool: ["modern", "vibrant", "dynamic"],
  },
  // Education, Coaching, Training
  {
    keywords: /schule|school|bildung|education|coaching|coach|nachhilfe|tutor|kurs|course|akademie|academy|seminar|workshop|weiterbildung/i,
    pool: ["trust", "clean", "fresh"],
  },
  // Hotel, Tourism, Events
  {
    keywords: /hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|catering|reise|travel|tour/i,
    pool: ["luxury", "elegant", "warm"],
  },
];

// All valid layout names
const ALL_LAYOUTS = ["elegant", "bold", "warm", "clean", "dynamic", "luxury", "craft", "fresh", "trust", "modern", "vibrant", "natural"];

// Default fallback pool (varied)
const DEFAULT_POOL = ["clean", "modern", "trust", "fresh"];

/**
 * Deterministic hash of a string → integer.
 * Same input always returns the same number.
 */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

/**
 * Pick a layout from the industry pool using the business name as seed.
 * Same business → same layout. Different businesses in same industry → different layouts.
 */
function pickLayout(websiteData: WebsiteData, layoutStyleOverride?: string | null): string {
  // If an explicit valid layout is passed, use it directly
  if (layoutStyleOverride && ALL_LAYOUTS.includes(layoutStyleOverride)) {
    return layoutStyleOverride;
  }

  const text = `${websiteData.businessName} ${websiteData.tagline || ""}`;
  const lower = text.toLowerCase();

  // Find matching industry pool
  let pool: string[] = DEFAULT_POOL;
  for (const entry of INDUSTRY_POOLS) {
    if (entry.keywords.test(lower)) {
      pool = entry.pool;
      break;
    }
  }

  // Use business name as seed for deterministic but varied selection
  const seed = websiteData.businessName || "default";
  const idx = hashString(seed) % pool.length;
  return pool[idx];
}

// ── Default Color Schemes per Layout ─────────────────────────────────────────
const DEFAULT_COLOR_SCHEMES: Record<string, ColorScheme> = {
  elegant: {
    primary: "#b8860b",
    secondary: "#f5f0e8",
    accent: "#d4a843",
    background: "#fefcf8",
    surface: "#f5f0e8",
    text: "#1a1208",
    textLight: "#6b5c3e",
  },
  bold: {
    primary: "#e85d04",
    secondary: "#1a1a1a",
    accent: "#ff6b1a",
    background: "#f5f5f5",
    surface: "#ebebeb",
    text: "#1a1a1a",
    textLight: "#555",
  },
  warm: {
    primary: "#c45c26",
    secondary: "#fdf6ee",
    accent: "#e07b3c",
    background: "#fffaf5",
    surface: "#fdf6ee",
    text: "#2d1a0e",
    textLight: "#7a5c42",
  },
  clean: {
    primary: "#2563eb",
    secondary: "#eff6ff",
    accent: "#3b82f6",
    background: "#f8fafc",
    surface: "#fff",
    text: "#0f172a",
    textLight: "#64748b",
  },
  dynamic: {
    primary: "#22c55e",
    secondary: "#0a0a0a",
    accent: "#16a34a",
    background: "#0a0a0a",
    surface: "#111",
    text: "#fff",
    textLight: "rgba(255,255,255,0.6)",
  },
  luxury: {
    primary: "#c9a84c",
    secondary: "#0a0a0a",
    accent: "#e8c87a",
    background: "#0a0a0a",
    surface: "#111",
    text: "#fff",
    textLight: "rgba(255,255,255,0.6)",
  },
  craft: {
    primary: "#f97316",
    secondary: "#1a1a1a",
    accent: "#fb923c",
    background: "#111",
    surface: "#1a1a1a",
    text: "#fff",
    textLight: "rgba(255,255,255,0.6)",
  },
  fresh: {
    primary: "#0ea5e9",
    secondary: "#fafaf8",
    accent: "#38bdf8",
    background: "#fafaf8",
    surface: "#fff",
    text: "#1a1a1a",
    textLight: "#666",
  },
  trust: {
    primary: "#1d4ed8",
    secondary: "#f8fafc",
    accent: "#3b82f6",
    background: "#fff",
    surface: "#f8fafc",
    text: "#1a2332",
    textLight: "#5a6a7e",
  },
  modern: {
    primary: "#0a0a0a",
    secondary: "#f8f8f8",
    accent: "#e11d48",
    background: "#fff",
    surface: "#f8f8f8",
    text: "#0a0a0a",
    textLight: "#666",
  },
  vibrant: {
    primary: "#f59e0b",
    secondary: "#0d0d0d",
    accent: "#fbbf24",
    background: "#0d0d0d",
    surface: "#161616",
    text: "#fff",
    textLight: "rgba(255,255,255,0.6)",
  },
  natural: {
    primary: "#65a30d",
    secondary: "#f0ece4",
    accent: "#84cc16",
    background: "#faf8f4",
    surface: "#f0ece4",
    text: "#2a2018",
    textLight: "#7a6a5a",
  },
};

// Fallback hero images by layout
const FALLBACK_IMAGES: Record<string, string> = {
  elegant: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=85&fit=crop",
  bold: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=85&fit=crop",
  warm: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85&fit=crop",
  clean: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=85&fit=crop",
  dynamic: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
  luxury: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=85&fit=crop",
  craft: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=85&fit=crop",
  fresh: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=85&fit=crop",
  trust: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=85&fit=crop",
  modern: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&fit=crop",
  vibrant: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
  natural: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=85&fit=crop",
};

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
  // Determine effective layout
  const effectiveLayout = pickLayout(websiteData, layoutStyle);

  // Determine effective color scheme
  const cs: ColorScheme = colorScheme && colorScheme.primary
    ? colorScheme
    : DEFAULT_COLOR_SCHEMES[effectiveLayout] || DEFAULT_COLOR_SCHEMES.clean;

  // Determine effective hero image
  const effectiveHeroImage = heroImageUrl || FALLBACK_IMAGES[effectiveLayout] || FALLBACK_IMAGES.clean;

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

  switch (effectiveLayout) {
    case "elegant":   return <ElegantLayout {...sharedProps} />;
    case "bold":      return <BoldLayout {...sharedProps} />;
    case "warm":      return <WarmLayout {...sharedProps} />;
    case "clean":     return <CleanLayout {...sharedProps} />;
    case "dynamic":   return <DynamicLayout {...sharedProps} />;
    case "luxury":    return <LuxuryLayout {...sharedProps} />;
    case "craft":     return <CraftLayout {...sharedProps} />;
    case "fresh":     return <FreshLayout {...sharedProps} />;
    case "trust":     return <TrustLayout {...sharedProps} />;
    case "modern":    return <ModernLayout {...sharedProps} />;
    case "vibrant":   return <VibrantLayout {...sharedProps} />;
    case "natural":   return <NaturalLayout {...sharedProps} />;
    default:          return <CleanLayout {...sharedProps} />;
  }
}
