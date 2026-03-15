import type { WebsiteData, ColorScheme } from "@shared/types";
import {
  BoldLayoutV2, ElegantLayoutV2, CleanLayoutV2, CraftLayoutV2,
  DynamicLayoutV2, FreshLayoutV2, LuxuryLayoutV2, ModernLayoutV2,
  NaturalLayoutV2, PremiumLayoutV2, EdenLayoutV2, ApexLayoutV2,
  AuroraLayoutV2, NexusLayoutV2, ClayLayoutV2, ForgeLayoutV2,
  PulseLayoutV2, FluxLayoutV2,
} from "./layouts/PremiumLayoutsV2";

interface WebsiteRendererProps {
  websiteData: WebsiteData;
  colorScheme?: ColorScheme;
  heroImageUrl?: string | null;
  aboutImageUrl?: string | null;
  businessCategory?: string | null;
  layoutStyle?: string | null;
  isLoading?: boolean;
  headlineSize?: 'large' | 'medium' | 'small';
  headlineFontOverride?: string;
  slug?: string;
}

function getLayoutComponent(category: string = "", layoutStyle?: string | null): any {
  // If explicit layoutStyle is provided (from admin/dashboard), use it directly
  if (layoutStyle) {
    const style = layoutStyle.toLowerCase();
    if (style.includes('bold')) return BoldLayoutV2;
    if (style.includes('elegant')) return ElegantLayoutV2;
    if (style.includes('clean')) return CleanLayoutV2;
    if (style.includes('craft')) return CraftLayoutV2;
    if (style.includes('dynamic')) return DynamicLayoutV2;
    if (style.includes('fresh')) return FreshLayoutV2;
    if (style.includes('luxury')) return LuxuryLayoutV2;
    if (style.includes('modern')) return ModernLayoutV2;
    if (style.includes('natural')) return NaturalLayoutV2;
  if (style.includes('eden')) return EdenLayoutV2;
  if (style.includes('apex')) return ApexLayoutV2;
  if (style.includes('aurora')) return AuroraLayoutV2;
  if (style.includes('nexus')) return NexusLayoutV2;
  if (style.includes('clay')) return ClayLayoutV2;
  if (style.includes('forge')) return ForgeLayoutV2;
  if (style.includes('pulse')) return PulseLayoutV2;
  if (style.includes('flux')) return FluxLayoutV2;
  }
  
  // Fallback: determine by business category
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

export default function WebsiteRenderer({ websiteData, colorScheme, heroImageUrl, aboutImageUrl, isLoading = false, businessCategory, layoutStyle, headlineSize, headlineFontOverride, slug }: WebsiteRendererProps) {
  const cs = colorScheme || websiteData?.colorScheme || { primary: '#3b82f6' };
  const heroImg = heroImageUrl || websiteData?.heroImage || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200";
  
  // Patch aboutImageUrl and headlineFont into websiteData if provided externally
  // Also filter out hidden sections
  let wd = websiteData as any;
  const hiddenSections = (websiteData as any)?.hiddenSections || [];
  
  if (aboutImageUrl || headlineFontOverride || hiddenSections.length > 0 || slug) {
    wd = { ...websiteData } as any;
    if (aboutImageUrl) wd.aboutImageUrl = aboutImageUrl;
    if (headlineFontOverride) {
      wd.designTokens = { ...(wd.designTokens || {}), headlineFont: headlineFontOverride };
    }
    // Filter out hidden sections
    if (Array.isArray(wd.sections) && hiddenSections.length > 0) {
      wd.sections = wd.sections.filter((s: any) => !hiddenSections.includes(s.type));
    }
    // Pass slug so ContactSection can submit forms
    if (slug) wd.slug = slug;
  }
  
  // Use layoutStyle if provided (from admin/dashboard), otherwise fall back to businessCategory
  const LayoutComponent = getLayoutComponent(
    businessCategory || websiteData?.business?.category,
    layoutStyle || (websiteData as any)?.layoutStyle
  );
  return <LayoutComponent websiteData={wd} cs={cs} heroImageUrl={heroImg} isLoading={isLoading} headlineSize={headlineSize} />;
}
