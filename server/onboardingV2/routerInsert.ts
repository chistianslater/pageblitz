import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import {
  SECTION_TYPES,
  WebsiteDataV2Schema,
} from "../../shared/siteContract/schema";
import {
  INSERT_META,
  INSERTABLE_SECTION_TYPES,
  orderWithInsert,
} from "../../shared/onboardingV2/sectionInsert";
import { assertAiEditQuota } from "./aiEdit";
import { generateInsertSection } from "./insertSectionAi";
import { applyStructure } from "./applyPatch";
import { loadStudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput } from "./state";

/**
 * Plus-Zonen (2026-09-03): Sektion an einer bestimmten Stelle der Startseite
 * einfügen. Seit 2026-09-18 schreibt die KI nur die eine neue Sektion
 * (insertSectionAi.ts) statt über den Chat die ganze Website neu auszugeben —
 * vorher dauerte das bis zu Minuten. Die Position setzt der Server
 * deterministisch über `sectionOrder`. Wird sofort persistiert — Rücknahme
 * über den Verlauf (Rückgängig-Knopf).
 */
export const insertProcedures = {
  insertSection: publicProcedure
    .input(
      tokenInput.extend({
        type: z.enum(INSERTABLE_SECTION_TYPES),
        afterType: z.enum(SECTION_TYPES),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      if (doc.sections.some(s => s.type === input.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `„${INSERT_META[input.type].label}“ gibt es auf der Seite schon.`,
        });
      }
      const order = orderWithInsert(doc, input.type, input.afterType);
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An dieser Stelle lässt sich keine Sektion einfügen.",
        });
      }
      assertAiEditQuota(loaded.website.id);
      const business = await getBusinessById(loaded.website.businessId);
      const category = doc.businessCategory ?? business?.category ?? "";
      const result = await generateInsertSection({
        doc,
        type: input.type,
        category,
      });
      if (result.kind === "reject") {
        return { kind: "reject" as const, reason: result.reason };
      }
      const withSection = WebsiteDataV2Schema.parse({
        ...doc,
        sections: [...doc.sections, result.section],
      });
      const next = applyStructure(withSection, { sectionOrder: order });
      const state = await persistDoc(input.token, loaded, next, {
        trigger: "chat",
        label: `Sektion „${INSERT_META[input.type].label}“ eingefügt`,
      });
      return { kind: "inserted" as const, state };
    }),
};
