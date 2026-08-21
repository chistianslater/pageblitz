import { WebsiteDataV2Schema } from "../../../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";

/**
 * Erkennt ein gültiges v2-Dokument UND stellt sicher, dass für die
 * enthaltene stylePackId auch ein Renderer-Modul registriert ist. Das
 * WebsiteDataV2Schema akzeptiert alle 14 PACK_IDS, aber nur ein Teil davon
 * hat ein Client-Modul in PACK_MODULES (siehe packs/index.ts). Ohne diesen
 * Guard würde SiteRenderer bei einer validen, aber unregistrierten
 * stylePackId werfen ("Pack-Modul nicht registriert") → weißer Screen im
 * SPA-Pfad. Fehlt das Modul, geben wir hier null zurück, damit der Aufrufer
 * auf den v1-Renderer zurückfällt.
 */
export function parseV2(data: unknown): WebsiteDataV2 | null {
  if (typeof data !== "object" || data === null) return null;
  if ((data as { version?: unknown }).version !== 2) return null;
  const parsed = WebsiteDataV2Schema.safeParse(data);
  if (!parsed.success) return null;
  if (!PACK_MODULES[parsed.data.stylePackId]) return null;
  return parsed.data;
}
