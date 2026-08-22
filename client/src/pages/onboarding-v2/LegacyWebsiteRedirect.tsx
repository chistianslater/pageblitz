import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { resolveLegacyRedirectTarget } from "./legacyRedirect";

/**
 * Löst die Legacy-Route "/websites/:id/onboarding" auf (früher: OnboardingChat
 * per Website-ID). Lädt die eigenen Websites der eingeloggten Kundin/des
 * Kunden per `customer.getMyWebsites` (protectedProcedure, Owner-Match bereits
 * server-seitig über ctx.user.id) und leitet auf das Studio-Onboarding um
 * (/onboarding/<previewToken>). Auflösungslogik in legacyRedirect.ts (pure,
 * unit-getestet).
 *
 * Nicht eingeloggt, Website nicht gefunden oder kein previewToken → /my-website
 * (Task 3, Cutover-Redirects, Plan B4a). `website.get` per id wird hier bewusst
 * NICHT mehr verwendet — der Endpunkt ist public und previewToken darf bei
 * Abfrage per id nicht mehr zurückgegeben werden (Token-Leak, Final-Review
 * Befund 2, Abschluss-Fixwelle B).
 */
export default function LegacyWebsiteRedirect({ id }: { id: number }) {
  const [, navigate] = useLocation();
  const idIsValid = Number.isFinite(id) && id > 0;
  const query = trpc.customer.getMyWebsites.useQuery(undefined, {
    enabled: idIsValid,
    retry: false,
  });

  useEffect(() => {
    const target = resolveLegacyRedirectTarget({
      id,
      idIsValid,
      hasError: !!query.error,
      data: query.data,
    });
    if (target) navigate(target, { replace: true });
  }, [id, idIsValid, query.data, query.error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 text-sm">Website wird geladen…</div>
    </div>
  );
}
