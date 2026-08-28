import { and, eq, lte, sql } from "drizzle-orm";
import { getDb, deleteWebsite } from "../db";
import { generatedWebsites } from "../../drizzle/schema";

/**
 * Vorschau-Websites ohne wiederauffindbare E-Mail (kein Magic-Link, kein
 * Dashboard) sollen das Backend nicht vollmüllen. Client-Popups
 * (`beforeunload`) sind best-effort — diese TTL ist die echte Garantie.
 *
 * Nur `status === "preview"` und ohne `paidAt`. Live/sold/active/inactive
 * bleiben unangetastet, auch wenn die E-Mail fehlt.
 */
export const ABANDONED_PREVIEW_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AbandonedPreviewCandidate {
  id: number;
  status: string;
  customerEmail: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export function isAbandonedPreviewWithoutEmail(
  site: AbandonedPreviewCandidate,
  now: Date,
  ttlMs = ABANDONED_PREVIEW_TTL_MS
): boolean {
  if (site.status !== "preview") return false;
  const email = site.customerEmail?.trim() ?? "";
  if (email.length > 0) return false;
  if (site.paidAt) return false;
  return now.getTime() - site.createdAt.getTime() >= ttlMs;
}

/**
 * Löscht abgelaufene Preview-Websites ohne E-Mail. Aufruf aus dem
 * Lifecycle-Worker (alle 5 min) — derselbe Haken, den ein Cron/Auto-Deploy
 * nutzen würde (`startLifecycleWorker` in server/_core/index.ts).
 */
export async function deleteAbandonedPreviewSites(
  now = new Date()
): Promise<{ processed: number; deleted: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, deleted: 0 };

  const cutoff = new Date(now.getTime() - ABANDONED_PREVIEW_TTL_MS);
  const rows = await db
    .select({
      id: generatedWebsites.id,
      status: generatedWebsites.status,
      customerEmail: generatedWebsites.customerEmail,
      paidAt: generatedWebsites.paidAt,
      createdAt: generatedWebsites.createdAt,
    })
    .from(generatedWebsites)
    .where(
      and(
        eq(generatedWebsites.status, "preview"),
        sql`(${generatedWebsites.customerEmail} IS NULL OR ${generatedWebsites.customerEmail} = '')`,
        sql`${generatedWebsites.paidAt} IS NULL`,
        lte(generatedWebsites.createdAt, cutoff)
      )
    )
    .limit(50);

  const doomed = rows.filter(row => isAbandonedPreviewWithoutEmail(row, now));
  let deleted = 0;
  for (const site of doomed) {
    try {
      await deleteWebsite(site.id);
      deleted += 1;
      console.log(
        `[Lifecycle] Abandoned preview ${site.id} deleted (no email, TTL)`
      );
    } catch (err) {
      console.error(
        `[Lifecycle] Failed to delete abandoned preview ${site.id}:`,
        err
      );
    }
  }
  return { processed: rows.length, deleted };
}
