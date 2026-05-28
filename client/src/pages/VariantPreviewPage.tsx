/**
 * Standalone variant preview – renders a real generated website in a specific layout.
 * Route: /variant-preview?websiteId=123&layout=ELEGANT
 *
 * Used by VariantPickerScreen iframes so every preview has its own 1280 px
 * viewport. That means Tailwind responsive breakpoints (md:, lg:) fire
 * correctly and the preview looks like a genuine desktop site scaled down –
 * not like a squished mobile layout.
 */

import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import { DEFAULT_LAYOUT_COLOR_SCHEMES } from "@shared/layoutConfig";

export default function VariantPreviewPage() {
  const params = new URLSearchParams(window.location.search);
  const websiteId = parseInt(params.get("websiteId") || "0", 10);
  const layout    = (params.get("layout") || "ELEGANT").toUpperCase();

  // Override min-h-screen so the hero doesn't fill the entire iframe viewport.
  // Without this, 100vh = iframe height (2400px) and only the hero is visible.
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      [class*="min-h-screen"] { min-height: 700px !important; }
      [class*="h-screen"] { height: 700px !important; }
      .min-h-\\[100vh\\] { min-height: 700px !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const { data, isLoading } = trpc.website.get.useQuery(
    { id: websiteId },
    { enabled: websiteId > 0, staleTime: 0 },
  );

  // Placeholder-Bilder per Kategorie laden, falls die Kundin noch kein Foto
  // ausgewählt hat (Variant-Picker kommt vor dem heroPhoto-Step). Sonst
  // zeigen die Previews leere Gradients statt eine echte Website.
  const category = (data as any)?.business?.category || "";
  const { data: photoSuggestions } = trpc.onboarding.getPhotoSuggestions.useQuery(
    { category },
    { enabled: !!category },
  );

  const cs = (DEFAULT_LAYOUT_COLOR_SCHEMES as Record<string, any>)[layout];

  if (!websiteId || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!data?.website) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  const { website } = data as any;
  const suggestions = photoSuggestions?.suggestions || [];
  // Echte URLs falls vorhanden, sonst Kategorie-passender Stock-Fallback.
  const heroImageUrl = website.heroImageUrl || suggestions[0]?.url;
  const aboutImageUrl = website.aboutImageUrl || suggestions[1]?.url || suggestions[0]?.url;

  return (
    <WebsiteRenderer
      websiteData={website.websiteData ?? website}
      colorScheme={cs ?? website.colorScheme}
      heroImageUrl={heroImageUrl}
      aboutImageUrl={aboutImageUrl}
      layoutStyle={layout}
      isLoading={false}
    />
  );
}
