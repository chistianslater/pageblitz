import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";

/**
 * Zentrale Schreib-Invariante für v2-Websitedokumente (websiteData.version===2).
 *
 * v2-Dokumente werden strikt gegen WebsiteDataV2Schema validiert (siehe
 * shared/siteContract/schema.ts, `.strict()`). SSR-Rendering
 * (server/ssr/renderSite.tsx) und der Client (SiteRenderer) verlassen sich
 * darauf, dass jedes persistierte v2-Dokument diese Form exakt einhält —
 * insbesondere die SICHERHEITS-INVARIANTE für legal.impressumHtml/
 * datenschutzHtml (nur legalGenerator-Output, siehe schema.ts).
 *
 * Diese Funktion muss VOR jedem updateWebsite-Aufruf stehen, der
 * websiteData für eine potenziell v2-versionierte Website überschreibt.
 * Statt sieben Einzel-Löchern (jeder Schreiber prüft selbst) gibt es einen
 * einzigen Prüfpunkt: Ist das GESPEICHERTE Dokument v2, muss das NÄCHSTE
 * Dokument ebenfalls schema-valide sein — sonst wird der Write mit einer
 * verständlichen deutschen Fehlermeldung abgelehnt, statt das Dokument
 * still zu korrumpieren.
 *
 * Ist das gespeicherte Dokument KEIN v2-Dokument (version !== 2, inkl. v1
 * oder fehlend), greift die Prüfung nicht — v1-Schreibpfade bleiben
 * unverändert erlaubt.
 */
export function assertV2SafeWrite(
  storedWebsiteData: unknown,
  nextWebsiteData: unknown
): void {
  const storedVersion =
    storedWebsiteData && typeof storedWebsiteData === "object"
      ? (storedWebsiteData as Record<string, unknown>).version
      : undefined;

  if (storedVersion !== 2) return;

  const result = WebsiteDataV2Schema.safeParse(nextWebsiteData);
  if (!result.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Diese Funktion unterstützt das neue Website-Format noch nicht.",
    });
  }
}
