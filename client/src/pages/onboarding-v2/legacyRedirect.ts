/**
 * Reine Auflösungslogik für die Legacy-Route "/websites/:id/onboarding"
 * (LegacyWebsiteRedirect.tsx). Bewusst ohne React/trpc-Abhängigkeit
 * gehalten, damit sie ohne Testharness unit-testbar bleibt (siehe
 * studioUrl.ts für dasselbe Muster).
 *
 * `website.get` per id ist public und darf previewToken nicht mehr
 * zurückgeben (Token-Leak, Final-Review Befund 2) — die Auflösung läuft
 * daher über `customer.getMyWebsites` (protectedProcedure, bereits nach
 * ctx.user.id gefiltert), dessen Zeilen den previewToken enthalten dürfen,
 * weil nur die eingeloggte Eigentümerin/der Eigentümer sie sieht.
 */

export interface MyWebsiteRow {
  website: { id: number; previewToken?: string | null };
}

/**
 * Ergebnis der Auflösung:
 * - `null` → noch nicht entscheidbar (Daten laden noch), nicht navigieren.
 * - String → Zielroute, auf die sofort umgeleitet werden soll.
 */
export function resolveLegacyRedirectTarget(params: {
  id: number;
  idIsValid: boolean;
  hasError: boolean;
  data: MyWebsiteRow[] | undefined;
}): string | null {
  const { id, idIsValid, hasError, data } = params;
  if (!idIsValid || hasError) return "/my-website";
  if (!data) return null; // noch am Laden
  const match = data.find(row => row.website.id === id);
  const previewToken = match?.website.previewToken;
  return previewToken ? `/onboarding/${previewToken}` : "/my-website";
}
