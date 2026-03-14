import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useEffect } from "react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import CookieBanner from "@/components/CookieBanner";
import { Loader2, AlertCircle } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { convertOpeningHoursToGerman } from "@shared/hours";

export default function SitePage({ forceSlug }: { forceSlug?: string } = {}) {
  const params = useParams<{ slug: string }>();
  const effectiveSlug = forceSlug ?? params.slug ?? "";

  const { data, isLoading, error } = trpc.website.get.useQuery(
    { slug: effectiveSlug },
    { enabled: !!effectiveSlug, staleTime: 0, refetchOnMount: "always" }
  );

  // ── useEffect MUSS vor allen Early-Returns stehen (Rules of Hooks) ───────
  const umamiWebsiteId = (data?.website as any)?.umamiWebsiteId as string | null | undefined;
  useEffect(() => {
    if (!umamiWebsiteId) return;
    if (document.getElementById("pb-umami-script")) return;
    const s = document.createElement("script");
    s.id = "pb-umami-script";
    s.async = true;
    s.defer = true;
    s.src = "https://analytics.pageblitz.de/script.js";
    s.setAttribute("data-website-id", umamiWebsiteId);
    document.head.appendChild(s);
  }, [umamiWebsiteId]);

  // Redirect if the slug was a former (old preview) slug
  useEffect(() => {
    if (data?.redirectToSlug) {
      window.location.replace(`/site/${data.redirectToSlug}`);
    }
  }, [data?.redirectToSlug]);

  // Also show spinner while slug isn't resolved yet (wouter params timing)
  if (!effectiveSlug || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Website wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-4 text-gray-900">Website nicht gefunden</h1>
          <p className="text-gray-500 mt-2">Diese Website existiert nicht oder wurde deaktiviert.</p>
        </div>
      </div>
    );
  }

  const websiteData = data.website.websiteData as WebsiteData;
  const colorScheme = data.website.colorScheme as ColorScheme;
  const heroImageUrl = (data.website as any).heroImageUrl as string | null | undefined;
  const layoutStyle = (data.website as any).layoutStyle as string | null | undefined;
  const business = data.business;

  return (
    <>
      <WebsiteRenderer
        websiteData={websiteData}
        colorScheme={colorScheme}
        heroImageUrl={heroImageUrl}
        layoutStyle={layoutStyle}
        businessPhone={business?.phone || undefined}
        businessAddress={business?.address || undefined}
        businessEmail={business?.email || undefined}
        openingHours={business?.openingHours ? convertOpeningHoursToGerman(business.openingHours as string[]) : undefined}
        slug={effectiveSlug}
      />
      <CookieBanner slug={effectiveSlug} primaryColor={colorScheme.primary} />
    </>
  );
}
