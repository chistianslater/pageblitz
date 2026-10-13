/**
 * Reine Helfer für die Admin-Websites-Liste (`WebsitesPage.tsx`), bewusst
 * ohne React/tRPC-Abhängigkeit gehalten, damit sie ohne Testharness
 * unit-testbar bleiben (Designrichtung + Studio-Link).
 */
import { getSystem } from "@shared/designSystems/registry";
import { getPalette } from "@shared/designSystems/palette";
import { DESIGN_SYSTEM_IDS } from "@shared/designSystems/types";
import type { DesignSystemId } from "@shared/designSystems/types";

const FALLBACK_DESIGN_NAME = "—";

/**
 * Designrichtung einer Website: „System · Farbstimmung“ (z. B. „Raster ·
 * Papier“). Liest `system`/`palette` direkt aus dem Dokument (keine
 * Schema-Prüfung je Zeile, die Liste kann hunderte Zeilen haben). Seiten
 * ohne System (kein v2-Dokument) zeigen den Fallback „—“.
 */
export function designNameFor(websiteData: unknown): string {
  if (!websiteData || typeof websiteData !== "object")
    return FALLBACK_DESIGN_NAME;
  const { system, palette } = websiteData as {
    system?: unknown;
    palette?: unknown;
  };
  if (
    typeof system !== "string" ||
    !(DESIGN_SYSTEM_IDS as readonly string[]).includes(system)
  )
    return FALLBACK_DESIGN_NAME;
  const def = getSystem(system as DesignSystemId);
  if (!def) return FALLBACK_DESIGN_NAME;
  return `${def.name} · ${getPalette(def, typeof palette === "string" ? palette : undefined).name}`;
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
