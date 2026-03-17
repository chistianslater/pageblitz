import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function LegalPage({ forceSlug }: { forceSlug?: string } = {}) {
  const [location] = useLocation();
  const params = useParams<{ slug: string }>();
  const slug = forceSlug ?? params.slug;
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isImpressum = location.endsWith("/impressum");
  const isDatenschutz = location.endsWith("/datenschutz");

  const { data, isLoading, refetch } = trpc.website.get.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const website = data?.website;

  const regenerateMutation = trpc.onboarding.regenerateLegalPages.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.regenerated
          ? "Seite erfolgreich regeneriert!"
          : "Rechtliche Daten unvollständig - Impressum/Datenschutz konnten nicht generiert werden."
        );
        if (result.regenerated) refetch();
      } else {
        toast.error(result.error || "Regenerierung fehlgeschlagen");
      }
      setIsRegenerating(false);
    },
    onError: (error) => {
      toast.error("Fehler beim Regenerieren: " + error.message);
      setIsRegenerating(false);
    },
  });

  const handleRegenerate = async () => {
    if (!website?.id) return;
    setIsRegenerating(true);
    await regenerateMutation.mutateAsync({ websiteId: Number(website.id) });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Website nicht gefunden.</p>
      </div>
    );
  }

  const websiteData = website.websiteData as any;
  const colorScheme = (website as any).colorScheme as any;
  const primaryColor = colorScheme?.primary || "#2563eb";
  const businessName = websiteData?.businessName || (data as any)?.business?.name || "";

  // Back link: subdomain → "/" , /site/:slug/* → "/site/:slug"
  const isSubdomain = /^[a-z0-9][a-z0-9-]*\.pageblitz\.de$/.test(window.location.hostname);
  const backHref = isSubdomain ? "/" : `/site/${slug}`;

  // Determine if text on primary is light or dark
  const isLightPrimary = parseInt(primaryColor.replace("#", "").slice(0, 2), 16) > 180;
  const textOnPrimary = isLightPrimary ? "#1e293b" : "#ffffff";

  const impressumHtml = websiteData?.impressumHtml;
  const datenschutzHtml = websiteData?.datenschutzHtml;
  const html = isImpressum ? impressumHtml : isDatenschutz ? datenschutzHtml : null;
  const pageTitle = isImpressum ? "Impressum" : "Datenschutzerklärung";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Site-matching header */}
      <header
        className="w-full shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Business name */}
          <span
            className="text-lg font-bold tracking-tight truncate"
            style={{ color: textOnPrimary }}
          >
            {businessName}
          </span>

          {/* Back link */}
          <a
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-medium shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            style={{ color: textOnPrimary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Website
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {!html ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mb-3">
              Diese Seite wurde noch nicht generiert. Dies kann passieren, wenn:
            </p>
            <ul className="text-gray-500 text-sm mb-6 text-left list-disc pl-6 space-y-1">
              <li>Das Onboarding noch nicht abgeschlossen wurde</li>
              <li>Die rechtlichen Daten (Eigentümer, E-Mail) fehlen</li>
              <li>Es ein technischer Fehler aufgetreten ist</li>
            </ul>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isRegenerating ? "Wird generiert..." : "Seite jetzt generieren"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <style>{`
              .legal-content {
                padding: 2.5rem 2rem;
                font-family: system-ui, -apple-system, sans-serif;
                color: #1a1a1a;
                line-height: 1.8;
                font-size: 0.95rem;
              }
              .legal-content h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid ${primaryColor}; padding-bottom: 0.75rem; }
              .legal-content h2 { font-size: 1.15rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.6rem; color: #222; }
              .legal-content h3 { font-size: 1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.4rem; color: #333; }
              .legal-content p  { margin-bottom: 0.75rem; }
              .legal-content a  { color: ${primaryColor}; text-decoration: underline; }
              .legal-content a:hover { opacity: 0.8; }
              .legal-content ul { margin-left: 1.5rem; margin-bottom: 0.75rem; list-style: disc; }
              @media (max-width: 640px) {
                .legal-content { padding: 1.5rem 1rem; }
              }
            `}</style>
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              className="legal-content"
            />
          </div>
        )}
      </main>

      {/* Simple footer */}
      <footer
        className="w-full py-4 mt-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-2 text-xs"
          style={{ color: textOnPrimary, opacity: 0.8 }}
        >
          <span>© {new Date().getFullYear()} {businessName}</span>
          <div className="flex gap-4">
            {isImpressum ? null : (
              <a href={isSubdomain ? "/impressum" : `/site/${slug}/impressum`} className="hover:underline" style={{ color: textOnPrimary }}>
                Impressum
              </a>
            )}
            {isDatenschutz ? null : (
              <a href={isSubdomain ? "/datenschutz" : `/site/${slug}/datenschutz`} className="hover:underline" style={{ color: textOnPrimary }}>
                Datenschutz
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
