import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Löst die Legacy-Route "/websites/:id/onboarding" auf (früher: OnboardingChat
 * per Website-ID). Lädt die Website per ID und leitet auf ihr Studio-
 * Onboarding um (/onboarding/<previewToken>). Kein Token gefunden oder Fehler
 * beim Laden → /my-website (Task 3, Cutover-Redirects, Plan B4a).
 */
export default function LegacyWebsiteRedirect({ id }: { id: number }) {
  const [, navigate] = useLocation();
  const idIsValid = Number.isFinite(id) && id > 0;
  const query = trpc.website.get.useQuery(
    { id },
    { enabled: idIsValid, retry: false }
  );

  useEffect(() => {
    if (!idIsValid || query.error) {
      navigate("/my-website", { replace: true });
      return;
    }
    if (!query.data) return; // noch am Laden
    const previewToken = query.data.website.previewToken;
    navigate(previewToken ? `/onboarding/${previewToken}` : "/my-website", {
      replace: true,
    });
  }, [idIsValid, query.data, query.error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 text-sm">Website wird geladen…</div>
    </div>
  );
}
