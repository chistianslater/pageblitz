/**
 * Reine Helfer für die Admin-Websites-Liste (`WebsitesPage.tsx`), bewusst
 * ohne React/tRPC-Abhängigkeit gehalten, damit sie ohne Testharness
 * unit-testbar bleiben (B5 Task 3: Pack-Anzeige + Studio-Link statt
 * veraltetem 79-€-CheckoutDialog).
 */
import { STYLE_PACKS } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

const FALLBACK_PACK_NAME = "—";

function isPackId(value: string): value is PackId {
  return value in STYLE_PACKS;
}

/**
 * Liest `stylePackId` aus `websiteData` (v2) und liefert den Pack-Namen.
 * v1-Websites (kein `stylePackId`) oder unbekannte/nicht mehr registrierte
 * Packs liefern den Fallback "—" statt abzustürzen.
 */
export function packNameFor(websiteData: unknown): string {
  if (!websiteData || typeof websiteData !== "object") {
    return FALLBACK_PACK_NAME;
  }
  const stylePackId = (websiteData as { stylePackId?: unknown }).stylePackId;
  if (typeof stylePackId !== "string" || !isPackId(stylePackId)) {
    return FALLBACK_PACK_NAME;
  }
  return STYLE_PACKS[stylePackId]?.name ?? FALLBACK_PACK_NAME;
}

/**
 * Baut den Link "Im Studio öffnen" (`/onboarding/<previewToken>`).
 * Ohne Token (z. B. Website noch nicht generiert) → null, Aufrufer
 * rendert dann keinen Link.
 */
export function studioHrefFor(
  previewToken: string | null | undefined
): string | null {
  if (!previewToken) return null;
  return `/onboarding/${previewToken}`;
}
