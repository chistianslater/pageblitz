import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import { Loader2, AlertCircle } from "lucide-react";
import type { WebsiteData, ColorScheme } from "@shared/types";

export default function SitePage() {
  const params = useParams<{ slug: string }>();

  const { data, isLoading, error } = trpc.website.get.useQuery(
    { slug: params.slug },
    { enabled: !!params.slug }
  );

  if (isLoading) {
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
  const business = data.business;

  return (
    <WebsiteRenderer
      websiteData={websiteData}
      colorScheme={colorScheme}
      businessPhone={business?.phone || undefined}
      businessAddress={business?.address || undefined}
      businessEmail={business?.email || undefined}
      openingHours={business?.openingHours as string[] | undefined}
    />
  );
}
