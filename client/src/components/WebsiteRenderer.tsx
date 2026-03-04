import type { WebsiteData, ColorScheme } from "@shared/types";
import { 
  BoldLayoutV2, ElegantLayoutV2, CleanLayoutV2, CraftLayoutV2,
  DynamicLayoutV2, FreshLayoutV2, LuxuryLayoutV2, ModernLayoutV2,
  NaturalLayoutV2, PremiumLayoutV2
} from "./layouts/PremiumLayoutsV2";

interface WebsiteRendererProps {
  websiteData: WebsiteData;
  colorScheme?: ColorScheme;
  heroImageUrl?: string | null;
  aboutImageUrl?: string | null;
  businessCategory?: string | null;
  isLoading?: boolean;
}

function getLayoutComponent(category: string = ""): any {
  const cat = category.toLowerCase();
  if (cat.includes('bau') || cat.includes('industrie')) return BoldLayoutV2;
  if (cat.includes('friseur') || cat.includes('beauty')) return ElegantLayoutV2;
  if (cat.includes('arzt') || cat.includes('praxis')) return CleanLayoutV2;
  if (cat.includes('tischler') || cat.includes('handwerk')) return CraftLayoutV2;
  if (cat.includes('fitness') || cat.includes('sport')) return DynamicLayoutV2;
  if (cat.includes('café') || cat.includes('restaurant')) return FreshLayoutV2;
  if (cat.includes('auto') || cat.includes('fahrzeug')) return LuxuryLayoutV2;
  if (cat.includes('agentur') || cat.includes('it')) return ModernLayoutV2;
  if (cat.includes('natur') || cat.includes('bio')) return NaturalLayoutV2;
  return PremiumLayoutV2;
}

export default function WebsiteRenderer({ websiteData, colorScheme, heroImageUrl, aboutImageUrl, isLoading = false, businessCategory }: WebsiteRendererProps) {
  const cs = colorScheme || websiteData?.colorScheme || { primary: '#3b82f6' };
  const heroImg = heroImageUrl || websiteData?.heroImage || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200";
  // Patch aboutImageUrl into websiteData if provided externally (published websites)
  const wd = aboutImageUrl ? { ...websiteData, aboutImageUrl } as any : websiteData;
  const LayoutComponent = getLayoutComponent(businessCategory || websiteData?.business?.category);
  return <LayoutComponent websiteData={wd} cs={cs} heroImageUrl={heroImg} isLoading={isLoading} />;
}
