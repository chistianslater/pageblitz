import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useEffect } from "react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import AgeGate from "@/components/AgeGate";
import CookieBanner from "@/components/CookieBanner";
import { Loader2, AlertCircle } from "lucide-react";
import { parseV2 } from "@/components/site/isV2";

export default function SitePage({ forceSlug }: { forceSlug?: string } = {}) {
  const params = useParams<{ slug: string }>();
  const effectiveSlug = forceSlug ?? params.slug ?? "";

  const { data, isLoading, error } = trpc.website.get.useQuery(
    { slug: effectiveSlug },
    { enabled: !!effectiveSlug, staleTime: 0, refetchOnMount: "always" }
  );

  const umamiWebsiteId = (data?.website as any)?.umamiWebsiteId as
    | string
    | null
    | undefined;
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

  // ── SEO meta tags ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data?.website) return;
    const v2 = parseV2(data.website.websiteData);
    const biz = data.business;
    const businessName = v2?.businessName || biz?.name || "";
    const city = biz?.address?.split(",")?.pop()?.trim() || "";
    const category = (biz as any)?.category || "";

    // Title: custom → fallback auto-generated
    const title =
      v2?.seo?.title ||
      (businessName && category && city
        ? `${businessName} – ${category} in ${city}`
        : businessName
          ? `${businessName} – Offizielle Website`
          : "Website");

    // Description: custom → tagline → fallback
    const description =
      v2?.seo?.description ||
      v2?.tagline ||
      `${businessName} – Professionelle Website mit Infos zu Leistungen, Kontakt und mehr.`;

    document.title = title;

    // Helper: upsert a <meta> tag
    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr.split("=")[0], attr.split("=")[1] ?? attr);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', "name=description", description);
    setMeta('meta[property="og:title"]', "property=og:title", title);
    setMeta(
      'meta[property="og:description"]',
      "property=og:description",
      description
    );
    setMeta('meta[property="og:type"]', "property=og:type", "website");
    const heroSection = v2?.sections.find(s => s.type === "hero") as
      | { imageUrl?: string }
      | undefined;
    if (heroSection?.imageUrl) {
      setMeta(
        'meta[property="og:image"]',
        "property=og:image",
        heroSection.imageUrl
      );
    }

    return () => {
      // Restore on unmount (navigation away)
      document.title = "Pageblitz";
    };
  }, [data]);

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
          <h1 className="text-xl font-bold mt-4 text-gray-900">
            Website nicht gefunden
          </h1>
          <p className="text-gray-500 mt-2">
            Diese Website existiert nicht oder wurde deaktiviert.
          </p>
        </div>
      </div>
    );
  }

  const w = data.website as {
    requiresAgeGate?: boolean | null;
    websiteData: unknown;
    chatWelcomeMessage?: string | null;
  };
  const business = data.business;
  const primaryColor = "#111111";

  return (
    <>
      {/* FSK-18 Age-Gate: Self-Declaration vor dem Site-Content, wenn die
          Branche Adult/Alkohol/Glücksspiel ist. Rendert nur wenn Flag aktiv
          und Besucher noch nicht bestätigt hat (localStorage, 30 Tage). */}
      {w.requiresAgeGate && (
        <AgeGate slug={effectiveSlug} businessName={business?.name} />
      )}
      <WebsiteRenderer
        websiteData={w.websiteData}
        slug={effectiveSlug}
        islandsMode="live"
        site={{ chatWelcomeMessage: w.chatWelcomeMessage ?? null }}
      />
      <CookieBanner slug={effectiveSlug} primaryColor={primaryColor} />
    </>
  );
}
