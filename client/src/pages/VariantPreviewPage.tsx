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
      .min-h-screen { min-height: auto !important; }
      .min-h-\\[100vh\\] { min-height: auto !important; }
      .h-screen { height: auto !important; min-height: 600px !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const { data, isLoading } = trpc.website.get.useQuery(
    { id: websiteId },
    { enabled: websiteId > 0, staleTime: 0 },
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

  return (
    <WebsiteRenderer
      websiteData={website.websiteData ?? website}
      colorScheme={cs ?? website.colorScheme}
      heroImageUrl={website.heroImageUrl}
      aboutImageUrl={website.aboutImageUrl}
      layoutStyle={layout}
      isLoading={false}
    />
  );
}
