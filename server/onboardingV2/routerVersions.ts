import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getWebsiteVersion, listWebsiteVersions } from "../db";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { loadStudioWebsite, type StudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput, type StudioState } from "./state";
import {
  restoreDoc,
  undoTarget,
  VERSION_TRIGGERS,
  type VersionMeta,
  type VersionTrigger,
} from "./versions";

/**
 * Verlauf (2026-09-03): Liste der Stände, Wiederherstellen und Rückgängig.
 * Alle Schreibpfade laufen über `persistDoc` — ein Restore wird damit selbst
 * ein Stand (trigger "restore"), sodass „Rückgängig" nach einem Restore
 * automatisch als Redo wirkt.
 */

function toMeta(row: {
  id: number;
  trigger: string;
  label: string;
  createdAt: Date;
}): VersionMeta {
  const trigger = (VERSION_TRIGGERS as readonly string[]).includes(row.trigger)
    ? (row.trigger as VersionTrigger)
    : "panel";
  return { id: row.id, trigger, label: row.label, createdAt: row.createdAt };
}

async function restoreById(
  token: string,
  loaded: StudioWebsite,
  current: WebsiteDataV2,
  versionId: number,
  /** Label des neuen Restore-Stands, abhängig vom Ziel-Stand. */
  label: (target: { label: string }) => string
): Promise<StudioState> {
  const row = await getWebsiteVersion(loaded.website.id, versionId);
  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Dieser Stand ist nicht mehr vorhanden.",
    });
  }
  const parsed = WebsiteDataV2Schema.safeParse(row.doc);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Dieser Stand lässt sich nicht mehr wiederherstellen.",
    });
  }
  return persistDoc(token, loaded, restoreDoc(current, parsed.data), {
    trigger: "restore",
    label: label(row),
  });
}

export const versionProcedures = {
  /** Metadaten aller Stände, jüngster zuerst — bewusst ohne Dokument. */
  listVersions: publicProcedure
    .input(tokenInput)
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const versions = (await listWebsiteVersions(loaded.website.id)).map(
        toMeta
      );
      return { versions, canUndo: undoTarget(versions) !== null };
    }),

  restoreVersion: publicProcedure
    .input(tokenInput.extend({ versionId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const current = await requireDoc(loaded);
      return restoreById(
        input.token,
        loaded,
        current,
        input.versionId,
        target => `Wiederhergestellt: ${target.label}`
      );
    }),

  /** Holt den vorletzten Stand zurück (der letzte ist der aktuelle). */
  undoLast: publicProcedure
    .input(tokenInput)
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const current = await requireDoc(loaded);
      const versions = (await listWebsiteVersions(loaded.website.id)).map(
        toMeta
      );
      const target = undoTarget(versions);
      if (!target) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Es gibt noch keinen früheren Stand.",
        });
      }
      return restoreById(
        input.token,
        loaded,
        current,
        target.id,
        () => `Rückgängig: ${versions[0].label}`
      );
    }),
};
