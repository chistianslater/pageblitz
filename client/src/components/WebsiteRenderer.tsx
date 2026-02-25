/**
 * WebsiteRenderer – Master dispatcher for all 5 layout personalities
 * Routes to the correct layout based on layoutStyle prop or inferred from websiteData
 */
import type { WebsiteData, ColorScheme } from "@shared/types";
import ElegantLayout from "./layouts/ElegantLayout";
import BoldLayout from "./layouts/BoldLayout";
import WarmLayout from "./layouts/WarmLayout";
import CleanLayout from "./layouts/CleanLayout";
import DynamicLayout from "./layouts/DynamicLayout";

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

// Default color schemes per layout personality
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
};

// Infer layout from business name / tagline
function inferLayout(websiteData: WebsiteData): string {
  const text = `${websiteData.businessName} ${websiteData.tagline || ""}`.toLowerCase();
  if (/friseur|salon|beauty|kosmetik|nails|spa|wellness|hair|pflege|ästhetik|barber|coiffeur/.test(text)) return "elegant";
  if (/bau|handwerk|dachdecker|elektriker|sanitär|maler|zimmermann|schreiner|klempner|heizung|roofing|contractor|construction|plumber/.test(text)) return "bold";
  if (/restaurant|café|cafe|bistro|bäckerei|konditorei|catering|essen|küche|food|pizza|sushi|gastronomie/.test(text)) return "warm";
  if (/arzt|zahnarzt|praxis|klinik|medizin|therapie|beratung|anwalt|steuer|versicherung|rechts|doctor|dental|medical|law|legal/.test(text)) return "clean";
  if (/fitness|sport|gym|yoga|training|personal|physiotherapie|kampfsport|tanzen|bewegung/.test(text)) return "dynamic";
  return "clean";
}

// Fallback hero images by layout
const FALLBACK_IMAGES: Record<string, string> = {
  elegant: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=85&fit=crop",
  bold: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=85&fit=crop",
  warm: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85&fit=crop",
  clean: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=85&fit=crop",
  dynamic: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
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
  // Determine effective layout – old "classic"/"minimal"/"magazine" values get re-inferred
  const rawLayout = layoutStyle || "";
  const effectiveLayout = ["elegant", "bold", "warm", "clean", "dynamic"].includes(rawLayout)
    ? rawLayout
    : inferLayout(websiteData);

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
    case "elegant":
      return <ElegantLayout {...sharedProps} />;
    case "bold":
      return <BoldLayout {...sharedProps} />;
    case "warm":
      return <WarmLayout {...sharedProps} />;
    case "clean":
      return <CleanLayout {...sharedProps} />;
    case "dynamic":
      return <DynamicLayout {...sharedProps} />;
    default:
      return <CleanLayout {...sharedProps} />;
  }
}
