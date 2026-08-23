import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useEffect } from "react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import AgeGate from "@/components/AgeGate";
import CookieBanner from "@/components/CookieBanner";
import { Loader2, AlertCircle } from "lucide-react";
import { parseV2 } from "@/components/site/isV2";
import { pageForPathname } from "@/components/site/engine";
import { packFontHrefs } from "@/lib/packFonts";

interface SitePageProps {
  forceSlug?: string;
  /**
   * Slug einer Unterseite (`data.pages[]`) — Plan B6, Task 3. Kommt entweder
   * aus der Route `/site/:slug/:page` (Pfadform) oder aus dem
   * `:page?`-Segment der Subdomain-Route (App.tsx). `undefined` rendert die
   * Startseite (unverändertes Verhalten vor Task 3).
   */
  pageSlug?: string;
}

export default function SitePage({ forceSlug, pageSlug }: SitePageProps = {}) {
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

  // ── Pack-Fonts (CSR-Fallback) ────────────────────────────────────────────
  // `server/ssr/renderSite.tsx` baut den Fonts-<link> nur im SSR-Head. Wird
  // die Kundenseite stattdessen client-seitig innerhalb der SPA gerendert
  // (dieser Pfad hier), fehlen die Pack-Fonts sonst ganz — WebsiteRenderer/
  // SiteRenderer rendert nur Markup+CSS, keine <head>-Tags. Idempotent über
  // `data-pb-pack-font`, damit erneute Fetches (staleTime: 0) keine
  // Duplikate anlegen; kein Cleanup beim Unmount, damit Zurück-Navigation
  // nicht kurz auf den Fallback-Font zurückfällt.
  useEffect(() => {
    if (!data?.website) return;
    const v2 = parseV2(data.website.websiteData);
    if (!v2) return;
    for (const href of packFontHrefs(v2.stylePackId)) {
      if (document.querySelector(`link[data-pb-pack-font="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-pb-pack-font", href);
      document.head.appendChild(link);
    }
  }, [data?.website]);

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

  // Unterseiten-Add-on (Plan B6, Task 3): CSR-Fallback für /site/:slug/:page
  // bzw. die Subdomain-Form. `pageSlug` kommt aus der Route (App.tsx); ist
  // das Dokument ein gültiges v2-Dokument und hat KEINE Page mit diesem Slug,
  // rendert ein 404-Platzhalter statt der Startseite — sonst würde ein
  // Tippfehler in einem geteilten Link stillschweigend die Startseite zeigen.
  const pathname = pageSlug ? `/${pageSlug}` : undefined;
  const v2ForPageCheck = pageSlug ? parseV2(w.websiteData) : null;
  const pageExists =
    !pageSlug ||
    !v2ForPageCheck ||
    pageForPathname(v2ForPageCheck, pathname!) !== null;

  if (pageSlug && v2ForPageCheck && !pageExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-4 text-gray-900">
            Seite nicht gefunden
          </h1>
          <p className="text-gray-500 mt-2">
            Diese Unterseite existiert nicht (mehr).
          </p>
        </div>
      </div>
    );
  }

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
        pathname={pathname}
      />
      <CookieBanner slug={effectiveSlug} primaryColor={primaryColor} />
    </>
  );
}
