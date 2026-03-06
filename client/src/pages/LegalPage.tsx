import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function LegalPage() {
  const [location] = useLocation();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
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
        if (result.regenerated) {
          refetch();
        }
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
  const impressumHtml = websiteData?.impressumHtml;
  const datenschutzHtml = websiteData?.datenschutzHtml;

  const html = isImpressum ? impressumHtml : isDatenschutz ? datenschutzHtml : null;

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="max-w-lg text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            {isImpressum ? "Impressum" : "Datenschutzerklärung"}
          </h1>
          <p className="text-gray-600 mb-4">
            Diese Seite wurde noch nicht generiert. Dies kann passieren, wenn:
          </p>
          <ul className="text-gray-500 text-sm mb-6 text-left list-disc pl-6 space-y-1">
            <li>Das Onboarding noch nicht abgeschlossen wurde</li>
            <li>Die rechtlichen Daten (Eigentümer, E-Mail) fehlen</li>
            <li>Es ein technischer Fehler aufgetreten ist</li>
          </ul>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRegenerating ? "Wird regeneriert..." : "Seite jetzt generieren"}
            </button>
            <a 
              href={`/site/${slug}`} 
              className="text-blue-600 hover:underline text-sm"
            >
              ← Zurück zur Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render the generated HTML directly
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="legal-page"
    />
  );
}
