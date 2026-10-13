import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import {
  getBusinessById,
  getWebsiteVersion,
  listWebsiteVersions,
} from "../db";
import {
  SECTION_TYPES,
  WebsiteDataV2Schema,
} from "../../shared/siteContract/schema";
import {
  INSERT_META,
  INSERTABLE_SECTION_TYPES,
  orderWithInsert,
} from "../../shared/onboardingV2/sectionInsert";
import {
  removalRule,
  withRestoredSection,
  withoutSection,
} from "../../shared/onboardingV2/sectionRemoval";
import { SECTION_LABELS } from "../../shared/onboardingV2/aiEdit";
import type { SectionType, WebsiteDataV2 } from "../../shared/siteContract/types";
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
/** Wie weit „Rückgängig" im Verlauf nach dem entfernten Abschnitt sucht. */
const RESTORE_LOOKBACK = 10;

/** Jüngster Stand, der den Abschnitt noch enthält (der Stand vor dem Entfernen). */
async function findSectionInHistory(
  websiteId: number,
  type: SectionType
): Promise<WebsiteDataV2 | null> {
  const versions = (await listWebsiteVersions(websiteId)).slice(
    0,
    RESTORE_LOOKBACK
  );
  for (const meta of versions) {
    const row = await getWebsiteVersion(websiteId, meta.id);
    const parsed = WebsiteDataV2Schema.safeParse(row?.doc);
    if (parsed.success && parsed.data.sections.some(s => s.type === type)) {
      return parsed.data;
    }
  }
  return null;
}

function badRequest(error: unknown): TRPCError {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: error instanceof Error ? error.message : String(error),
  });
}

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

  /**
   * Abschnitt entfernen (2026-10-13): löscht den Abschnitt aus der
   * Startseite (Struktur-Panel, Hinweis nach dem Einfügen). Einstieg und
   * Kontakt bleiben Pflicht; ein gebuchtes Extra bleibt gebucht
   * (`addonNote`). Wird ein eigener Verlaufsstand — Rückweg über
   * restoreSection oder den Verlauf.
   */
  removeSection: publicProcedure
    .input(tokenInput.extend({ type: z.enum(SECTION_TYPES) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      const rule = removalRule(input.type, doc.addOns ?? {});
      if (!rule.allowed) {
        throw new TRPCError({ code: "BAD_REQUEST", message: rule.reason });
      }
      let next: WebsiteDataV2;
      try {
        next = WebsiteDataV2Schema.parse(withoutSection(doc, input.type));
      } catch (error) {
        throw badRequest(error);
      }
      const state = await persistDoc(input.token, loaded, next, {
        trigger: "panel",
        label: `Abschnitt „${SECTION_LABELS[input.type]}“ entfernt`,
      });
      return { state, addonNote: rule.addonNote };
    }),

  /**
   * „Rückgängig" nach dem Entfernen: holt nur diesen Abschnitt aus dem
   * jüngsten Stand zurück, der ihn noch enthält — spätere Änderungen an
   * anderen Stellen bleiben erhalten (anders als undoLast).
   */
  restoreSection: publicProcedure
    .input(tokenInput.extend({ type: z.enum(SECTION_TYPES) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      const label = SECTION_LABELS[input.type];
      if (doc.sections.some(s => s.type === input.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `„${label}“ ist schon auf der Seite.`,
        });
      }
      const old = await findSectionInHistory(loaded.website.id, input.type);
      if (!old) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `„${label}“ lässt sich nicht mehr zurückholen — schau im Verlauf nach einem früheren Stand.`,
        });
      }
      let next: WebsiteDataV2;
      try {
        next = WebsiteDataV2Schema.parse(
          withRestoredSection(doc, old, input.type)
        );
      } catch (error) {
        throw badRequest(error);
      }
      return persistDoc(input.token, loaded, next, {
        trigger: "panel",
        label: `Abschnitt „${label}“ wiederhergestellt`,
      });
    }),
};
