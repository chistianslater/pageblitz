import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createGenerationJob,
  getBusinessById,
  getGenerationJobByWebsiteId,
  updateBusiness,
} from "../db";
import {
  isInterimV2Doc,
  runWebsiteGenerationV2Job,
} from "../generationV2/runJob";
import { getConstitution } from "../../shared/stylePacks";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import { applyStylePack, parsePackId } from "./applyPatch";
import { loadStudioWebsite } from "./ownership";
import { withEnsureLock } from "./ensureLock";
import { buildState, persistDoc, requireDoc, tokenInput } from "./state";
import { contentProcedures } from "./routerContent";
import { commerceProcedures } from "./routerCommerce";
import { aiProcedures } from "./routerAi";
import { versionProcedures } from "./routerVersions";

/**
 * Legt den v2-Generierungs-Job an und startet den Runner im Hintergrund —
 * hinter dem In-Flight-Lock pro websiteId (Finding #4), ein bereits
 * laufender Job wird zurückgegeben statt doppelt gestartet. Geteilt von
 * ensureGeneration und setCategory (Plan B7 Task 5).
 */
function startGenerationJob(
  websiteId: number
): Promise<{ jobId: number; status: "pending" | "processing" }> {
  return withEnsureLock(websiteId, async () => {
    const existing = await getGenerationJobByWebsiteId(websiteId);
    if (
      existing &&
      (existing.status === "pending" || existing.status === "processing")
    ) {
      return { jobId: existing.id, status: existing.status };
    }
    const jobId = await createGenerationJob({
      websiteId,
      status: "pending",
      progress: 0,
    });
    runWebsiteGenerationV2Job(jobId, websiteId).catch(err =>
      console.error(`[onboardingV2] Job ${jobId} unerwartet abgebrochen:`, err)
    );
    return { jobId, status: "pending" as const };
  });
}

const coreProcedures = {
  getState: publicProcedure.input(tokenInput).query(async ({ input, ctx }) => {
    const loaded = await loadStudioWebsite(input.token, ctx.user);
    return buildState(input.token, loaded);
  }),

  /**
   * Idempotent: v2-Dokument da → "completed" ohne neuen Job; v1-Dokument
   * (legacy) ohne `force` → BAD_REQUEST (kein Überschreiben eines Legacy-
   * Dokuments, Finding #3). Mit `force: true` (Task 2, Legacy-Regenerierung
   * aus dem Studio) wird ein Legacy-Dokument neu (v2) generiert — aber nur
   * für Vorschauen (`status === "preview"`); eine bereits verkaufte Website
   * mit altem Dokument wird nicht automatisch überschrieben, das braucht
   * Support. Aktiver Job → wird zurückgegeben; sonst neuer Job + v2-Runner
   * im Hintergrund (Fehler landen im Job, nicht im Request). Der
   * Job-Anlegen-Zweig läuft hinter einem In-Flight-Lock pro websiteId, damit
   * zwei parallele Aufrufe nicht zwei Jobs erzeugen (Finding #4).
   */
  ensureGeneration: publicProcedure
    .input(tokenInput.extend({ force: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { website, doc, hasLegacyDoc } = await loadStudioWebsite(
        input.token,
        ctx.user
      );
      if (doc) {
        // Liegengebliebener Zwischenstand (Plan B7 Nachfix): Crashen Job
        // oder Restore zwischen Interim- und Final-Write, bleibt das
        // Platzhalter-Dokument liegen — ohne diese Prüfung meldete der
        // Retry "completed" und regenerierte nie. Nur die Kombination
        // failed Job + Interim-Marker startet neu; ein echtes Dokument
        // (auch neben einem alten failed Job) bleibt unangetastet.
        const job = await getGenerationJobByWebsiteId(website.id);
        if (job?.status === "failed" && isInterimV2Doc(doc)) {
          return startGenerationJob(website.id);
        }
        return { jobId: null, status: "completed" as const };
      }
      if (hasLegacyDoc) {
        if (!input.force) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Diese Website nutzt noch das alte Format und kann im Studio nicht bearbeitet werden.",
          });
        }
        if (website.status !== "preview") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Verkaufte Websites werden nicht automatisch neu erstellt — bitte Support kontaktieren.",
          });
        }
      }
      // Kategorie-Rückfrage (Plan B7 Task 5, Spec §2.1): Ohne belastbare
      // Branche startet die Generierung nicht automatisch — der Client zeigt
      // zuerst „Was macht dein Betrieb?" und setCategory startet den Job.
      // Nur für frische Previews ohne jedes Dokument; die Legacy-
      // Regenerierung (force) bleibt unberührt, dort fängt runJob den
      // Leerfall mit dem Fallback „Dienstleistung" ab.
      if (!hasLegacyDoc) {
        const business = await getBusinessById(website.businessId);
        if (!(business?.category ?? "").trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Bitte gib zuerst an, was dein Betrieb macht — dann erstellen wir deine Website.",
          });
        }
      }
      return startGenerationJob(website.id);
    }),

  /**
   * Kategorie-Rückfrage (Plan B7 Task 5, Spec §2.1): Liefert die GMB-Kette
   * (Task 1) keine belastbare Branche, bleibt `businesses.category` leer und
   * das Studio fragt vor der Generierung nach. Diese Mutation persistiert
   * die Antwort und startet anschließend denselben Job wie ensureGeneration
   * (idempotent, In-Flight-Lock). Ownership wie überall über
   * loadStudioWebsite.
   */
  setCategory: publicProcedure
    .input(tokenInput.extend({ category: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const category = input.category.trim();
      if (category.length < 2 || category.length > 60) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitte gib an, was dein Betrieb macht (2–60 Zeichen).",
        });
      }
      const { website, doc, hasLegacyDoc } = await loadStudioWebsite(
        input.token,
        ctx.user
      );
      if (doc || hasLegacyDoc) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Die Website wurde bereits erstellt — die Branche kannst du hier nicht mehr ändern.",
        });
      }
      await updateBusiness(website.businessId, { category });
      return startGenerationJob(website.id);
    }),

  getStyleCandidates: publicProcedure
    .input(
      tokenInput.extend({
        round: z.number().int().min(0).default(0),
        count: z
          .union([z.literal(2), z.literal(3)])
          .optional()
          .default(2),
      })
    )
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const business = await getBusinessById(loaded.website.businessId);
      const category = loaded.doc?.businessCategory ?? business?.category ?? "";
      const candidates = getV2VariantCandidates(
        category,
        input.round,
        input.count
      ).map(id => {
        const c = getConstitution(id);
        return { id, name: c.name, essence: c.essence };
      });
      return { candidates };
    }),

  selectStylePack: publicProcedure
    .input(
      tokenInput.extend({
        packId: z.string(),
        /** Erst „Passt so" bestätigt den Gate/Checklist-Schritt. */
        confirm: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const packId = parsePackId(input.packId);
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      const next = applyStylePack(doc, packId);
      return persistDoc(
        input.token,
        loaded,
        next,
        {
          trigger: "panel",
          label: `Designrichtung: ${getConstitution(packId).name}`,
        },
        input.confirm ? { progress: { styleConfirmed: true } } : undefined
      );
    }),
};

export const onboardingV2Router = router({
  ...coreProcedures,
  ...contentProcedures,
  ...commerceProcedures,
  ...aiProcedures,
  ...versionProcedures,
});
