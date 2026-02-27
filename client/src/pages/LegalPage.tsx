import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function LegalPage() {
  const [location] = useLocation();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const isImpressum = location.endsWith("/impressum");
  const isDatenschutz = location.endsWith("/datenschutz");

  const { data, isLoading } = trpc.website.get.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const website = data?.website;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4">
            {isImpressum ? "Impressum" : "Datenschutzerklärung"}
          </h1>
          <p className="text-gray-500 mb-6">
            Diese Seite wird nach Abschluss des Onboardings automatisch generiert.
          </p>
          <a href={`/site/${slug}`} className="text-blue-600 hover:underline">
            ← Zurück zur Website
          </a>
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
