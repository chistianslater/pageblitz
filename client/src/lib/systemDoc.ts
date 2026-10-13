import { asSystemDoc } from "@shared/designSystems/apply";
import { WebsiteDataV2Schema } from "@shared/siteContract/schema";
import type { WebsiteDataV2 } from "@shared/siteContract/types";

/**
 * v2-Dokument als System-Dokument (Lesegrenze wie `parseV2`, aber ohne die
 * Render-Module zu laden — Rechtsseite und Admin-Liste brauchen nur Namen
 * und Farben). Kein gültiges v2-Dokument → null.
 */
export function systemDocOf(websiteData: unknown): WebsiteDataV2 | null {
  if (typeof websiteData !== "object" || websiteData === null) return null;
  if ((websiteData as { version?: unknown }).version !== 2) return null;
  const parsed = WebsiteDataV2Schema.safeParse(websiteData);
  return parsed.success ? asSystemDoc(parsed.data) : null;
}
