/**
 * Reine Helfer für die Admin-Websites-Liste (`WebsitesPage.tsx`), bewusst
 * ohne React/tRPC-Abhängigkeit gehalten, damit sie ohne Testharness
 * unit-testbar bleiben (Designrichtung + Studio-Link).
 */
import { getSystem } from "@shared/designSystems/registry";
import { getPalette } from "@shared/designSystems/palette";
import { systemDocOf } from "@/lib/systemDoc";

const FALLBACK_DESIGN_NAME = "—";

/**
 * Designrichtung einer Website: „System · Farbstimmung“ (z. B. „Raster ·
 * Papier“). Alte Dokumente laufen über `systemDocOf` und zeigen ihr
 * Hauptsystem; ohne gültiges v2-Dokument kommt der Fallback „—“.
 */
export function designNameFor(websiteData: unknown): string {
  const doc = systemDocOf(websiteData);
  const def = doc?.system ? getSystem(doc.system) : undefined;
  if (!doc || !def) return FALLBACK_DESIGN_NAME;
  return `${def.name} · ${getPalette(def, doc.palette).name}`;
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
