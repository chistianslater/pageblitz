import { WebsiteDataV2Schema } from "../../../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { asSystemDoc } from "../../../../shared/designSystems/apply";
import { SYSTEM_MODULES } from "./systems/registry";

/**
 * Erkennt ein gültiges v2-Dokument, wandelt es in ein System-Dokument (rev 3,
 * Lesegrenze wie SSR) und stellt sicher, dass für dessen Designsystem ein
 * Render-Modul registriert ist. Ohne diesen Guard würde SiteRenderer bei
 * einem valide gespeicherten, aber (noch) nicht gebauten System werfen
 * ("System-Modul nicht registriert") → weißer Screen im SPA-Pfad. Fehlt das
 * Modul, geben wir hier null zurück, damit der Aufrufer den Platzhalter zeigt.
 */
export function parseV2(data: unknown): WebsiteDataV2 | null {
  if (typeof data !== "object" || data === null) return null;
  if ((data as { version?: unknown }).version !== 2) return null;
  const parsed = WebsiteDataV2Schema.safeParse(data);
  if (!parsed.success) return null;
  const doc = asSystemDoc(parsed.data);
  if (!doc.system || !SYSTEM_MODULES[doc.system]) return null;
  return doc;
}
