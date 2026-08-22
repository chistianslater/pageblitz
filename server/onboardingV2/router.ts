import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createGenerationJob,
  getBusinessById,
  getGenerationJobByWebsiteId,
} from "../db";
import { runWebsiteGenerationV2Job } from "../generationV2/runJob";
import { getConstitution } from "../../shared/stylePacks";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import { applyStylePack, parsePackId } from "./applyPatch";
import { loadStudioWebsite } from "./ownership";
import { withEnsureLock } from "./ensureLock";
import { buildState, persistDoc, requireDoc, tokenInput } from "./state";
import { contentProcedures } from "./routerContent";

const coreProcedures = {
  getState: publicProcedure.input(tokenInput).query(async ({ input, ctx }) => {
    const loaded = await loadStudioWebsite(input.token, ctx.user);
    return buildState(input.token, loaded);
  }),

  /**
   * Idempotent: v2-Dokument da → "completed" ohne neuen Job; v1-Dokument →
   * BAD_REQUEST (kein Überschreiben eines Legacy-Dokuments, Finding #3);
   * aktiver Job → zurückgeben; sonst neuen Job anlegen und den v2-Runner im
   * Hintergrund starten (Fehler landen im Job, nicht im Request). Der
   * Job-Anlegen-Zweig läuft hinter einem In-Flight-Lock pro websiteId, damit
   * zwei parallele Aufrufe nicht zwei Jobs erzeugen (Finding #4).
   */
  ensureGeneration: publicProcedure
    .input(tokenInput)
    .mutation(async ({ input, ctx }) => {
      const { website, doc, hasLegacyDoc } = await loadStudioWebsite(
        input.token,
        ctx.user
      );
      if (doc) return { jobId: null, status: "completed" as const };
      if (hasLegacyDoc) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Diese Website nutzt noch das alte Format und kann im Studio nicht bearbeitet werden.",
        });
      }
      return withEnsureLock(website.id, async () => {
        const existing = await getGenerationJobByWebsiteId(website.id);
        if (
          existing &&
          (existing.status === "pending" || existing.status === "processing")
        ) {
          return { jobId: existing.id, status: existing.status };
        }
        const jobId = await createGenerationJob({
          websiteId: website.id,
          status: "pending",
          progress: 0,
        });
        runWebsiteGenerationV2Job(jobId, website.id).catch(err =>
          console.error(
            `[onboardingV2] Job ${jobId} unerwartet abgebrochen:`,
            err
          )
        );
        return { jobId, status: "pending" as const };
      });
    }),

  getStyleCandidates: publicProcedure
    .input(tokenInput.extend({ round: z.number().int().min(0).default(0) }))
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const business = await getBusinessById(loaded.website.businessId);
      const category = loaded.doc?.businessCategory ?? business?.category ?? "";
      const candidates = getV2VariantCandidates(category, input.round).map(
        id => {
          const c = getConstitution(id);
          return { id, name: c.name, essence: c.essence };
        }
      );
      return { candidates };
    }),

  selectStylePack: publicProcedure
    .input(tokenInput.extend({ packId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const packId = parsePackId(input.packId);
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      const next = applyStylePack(doc, packId);
      // layoutStyle nur als Kompatibilitäts-Spiegel für Admin-Listen; v2-Renderer lesen stylePackId.
      return persistDoc(input.token, loaded, next, {
        progress: { styleConfirmed: true },
        extra: { layoutStyle: packId },
      });
    }),
};

export const onboardingV2Router = router({
  ...coreProcedures,
  ...contentProcedures,
});
