import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import {
  TONE_LEVELS,
  TONES,
  toneRewriteMessage,
} from "../../shared/onboardingV2/tone";
import { diffDocuments } from "../../shared/onboardingV2/aiEdit";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { assertAiEditQuota, proposeAiEdit, storeProposal } from "./aiEdit";
import { loadStudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput } from "./state";

/**
 * Tonalität (2026-09-03): Regler im Texte-Panel. `updateTone` speichert die
 * Stufe (wirkt ab sofort auf KI-Chat und KI-Vorschläge), `rewriteForTone`
 * lässt die bestehenden Startseiten-Texte als Vorschlag umschreiben — über
 * denselben Pfad wie ein Chat-Wunsch (proposeAiEdit → Diff → applyAiEdit),
 * damit Fakten-Restauration, Whitelist und Retry identisch bleiben.
 */
/**
 * Kundenbewertungen sind echte Google-Stimmen (facts.ts, Spec §2.2) — eine
 * Tonalitäts-Umschreibung darf sie nicht anfassen. Deterministisch statt
 * per Prompt-Bitte: die testimonials-Sektion des Originals ersetzt die des
 * Vorschlags, der Diff wird danach neu berechnet.
 */
export function preserveTestimonials(
  original: WebsiteDataV2,
  next: WebsiteDataV2
): WebsiteDataV2 {
  const originalReviews = original.sections.find(
    s => s.type === "testimonials"
  );
  if (!originalReviews) return next;
  return {
    ...next,
    sections: next.sections.map(s =>
      s.type === "testimonials" ? originalReviews : s
    ),
  };
}

export const toneProcedures = {
  updateTone: publicProcedure
    .input(tokenInput.extend({ tone: z.enum(TONE_LEVELS) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        { ...doc, tone: input.tone },
        { trigger: "panel", label: `Tonalität: ${TONES[input.tone].label}` }
      );
    }),

  rewriteForTone: publicProcedure
    .input(tokenInput)
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      if (!doc.tone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Wähle zuerst eine Tonalität.",
        });
      }
      assertAiEditQuota(loaded.website.id);
      const business = await getBusinessById(loaded.website.businessId);
      const category = doc.businessCategory ?? business?.category ?? "";
      const result = await proposeAiEdit({
        doc,
        message: toneRewriteMessage(doc.tone),
        category,
      });
      if (result.kind === "content") {
        const next = preserveTestimonials(doc, result.next);
        const proposalId = storeProposal(loaded.website.id, next, {
          label: `Texte an Tonalität „${TONES[doc.tone].label}“ angepasst`,
        });
        return {
          kind: "content" as const,
          proposalId,
          diff: diffDocuments(doc, next),
        };
      }
      if (result.kind === "reject") {
        return { kind: "reject" as const, reason: result.reason };
      }
      // Frage/Design/Stil sind bei einem festen Umschreib-Wunsch nicht
      // sinnvoll — als freundliche Absage durchreichen statt zu werfen.
      return {
        kind: "reject" as const,
        reason:
          "Die Texte konnten gerade nicht umgeschrieben werden — bitte noch einmal versuchen.",
      };
    }),
};
