import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import { getConstitution } from "../../shared/stylePacks";
import {
  assertAiEditQuota,
  proposeAiEdit,
  storeProposal,
  takeProposal,
} from "./aiEdit";
import { loadStudioWebsite } from "./ownership";
import {
  assertNotGenerating,
  persistDoc,
  requireDoc,
  tokenInput,
} from "./state";

const PROPOSAL_EXPIRED_MESSAGE =
  "Der Vorschlag ist abgelaufen — bitte erneut anfragen.";

/**
 * KI-Chat-Prozeduren des Studios ("Was soll anders sein?", Spec §5).
 * `aiEdit` persistiert NIE selbst — bei einem Inhalts-Vorschlag wird das neue
 * Dokument nur server-seitig zwischengespeichert (TTL 10 min, siehe
 * `./aiEdit`) und erst durch den expliziten `applyAiEdit`-Aufruf über
 * `persistDoc` geschrieben.
 */
export const aiProcedures = {
  aiEdit: publicProcedure
    .input(
      tokenInput.extend({
        message: z.string().min(3).max(500),
        // Unterseiten-Scope (Plan B6 Task 5): Slug der gerade in der
        // Vorschau gewählten Unterseite — Format wie PageSchema.slug; ob die
        // Seite existiert, prüft proposeAiEdit (BAD_REQUEST).
        pageSlug: z
          .string()
          .regex(/^[a-z0-9-]{2,40}$/)
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      assertAiEditQuota(loaded.website.id);

      const business = await getBusinessById(loaded.website.businessId);
      const category = doc.businessCategory ?? business?.category ?? "";

      const result = await proposeAiEdit({
        doc,
        message: input.message,
        category,
        ...(input.pageSlug !== undefined ? { pageSlug: input.pageSlug } : {}),
      });

      if (result.kind === "content") {
        const proposalId = storeProposal(loaded.website.id, result.next);
        return {
          kind: "content" as const,
          proposalId,
          diff: result.diff,
        };
      }
      if (result.kind === "style") {
        return {
          kind: "style" as const,
          packId: result.packId,
          name: getConstitution(result.packId).name,
          reason: result.reason,
        };
      }
      return { kind: "reject" as const, reason: result.reason };
    }),

  /** Übernimmt einen zuvor per aiEdit vorgeschlagenen Inhalt — Write-Guard über persistDoc, wie jede andere Studio-Mutation. */
  applyAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      // Gleiche Sperre wie requireDoc (aiEdit): kein Übernehmen in ein
      // Dokument, das der laufende Generierungs-Job gleich überschreibt.
      await assertNotGenerating(loaded.website.id);
      const next = takeProposal(input.proposalId, loaded.website.id);
      if (!next) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: PROPOSAL_EXPIRED_MESSAGE,
        });
      }
      return persistDoc(input.token, loaded, next);
    }),

  /** Verwirft einen Vorschlag explizit (z. B. Klick auf "Verwerfen") — idempotent, kein Fehler bei bereits abgelaufenem/unbekanntem Vorschlag. */
  discardAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      takeProposal(input.proposalId, loaded.website.id);
      return { ok: true as const };
    }),
};
