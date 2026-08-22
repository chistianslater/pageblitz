import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createGenerationJob,
  createOnboarding,
  getBusinessById,
  getGenerationJobByWebsiteId,
  getOnboardingByWebsiteId,
  updateOnboarding,
  updateWebsite,
} from "../db";
import { runWebsiteGenerationV2Job } from "../generationV2/runJob";
import { invalidateSsrCache } from "../ssr/routes";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { getConstitution } from "../../shared/stylePacks";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import {
  deriveChecklistState,
  isCheckoutReady,
  parseStudioProgress,
  type ChecklistItem,
  type StudioProgress,
} from "../../shared/onboardingV2/checklist";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import { applyStylePack, parsePackId } from "./applyPatch";
import { loadStudioWebsite, type StudioWebsite } from "./ownership";
import { withEnsureLock } from "./ensureLock";

export interface StudioJob {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error: string | null;
}

export interface StudioState {
  websiteId: number;
  token: string;
  businessName: string;
  category: string;
  stylePackId: PackId | null;
  doc: WebsiteDataV2 | null;
  /** true = websiteData ist ein v1-Dokument; Studio zeigt eine Meldung statt Generierungs-Screen (Finding #3). */
  legacy: boolean;
  job: StudioJob | null;
  checklist: ChecklistItem[];
  checkoutReady: boolean;
  customerEmail: string | null;
}

const tokenInput = z.object({ token: z.string().min(1) });

/**
 * Baut den vollständigen Studio-Zustand — eine Quelle der Wahrheit für Client-Reloads (Spec §6).
 *
 * `progressOverride` erlaubt es Aufrufern, die gerade erst geschriebenen
 * studioProgress-Werte direkt zu übergeben, statt sie per Extra-Query neu zu
 * lesen (vermeidet einen unnötigen Read-after-Write und macht den Rückgabewert
 * unabhängig davon, ob die DB den Write bereits sichtbar committed hat).
 */
async function buildState(
  token: string,
  loaded: StudioWebsite,
  progressOverride?: StudioProgress
): Promise<StudioState> {
  const { website, doc, hasLegacyDoc } = loaded;
  const [business, onboarding, job] = await Promise.all([
    getBusinessById(website.businessId),
    getOnboardingByWebsiteId(website.id),
    getGenerationJobByWebsiteId(website.id),
  ]);
  const checklist = deriveChecklistState(doc, {
    legalOwner: onboarding?.legalOwner,
    legalEmail: onboarding?.legalEmail,
    legalStreet: onboarding?.legalStreet,
    legalZip: onboarding?.legalZip,
    legalCity: onboarding?.legalCity,
    legalPhone: onboarding?.legalPhone,
    studioProgress:
      progressOverride ?? parseStudioProgress(onboarding?.studioProgress),
  });
  return {
    websiteId: website.id,
    token,
    businessName: doc?.businessName ?? business?.name ?? "Dein Unternehmen",
    category: doc?.businessCategory ?? business?.category ?? "",
    stylePackId: doc?.stylePackId ?? null,
    doc,
    legacy: hasLegacyDoc,
    job: job
      ? {
          id: job.id,
          status: job.status,
          progress: job.progress,
          error: job.error ?? null,
        }
      : null,
    checklist,
    checkoutReady: isCheckoutReady(checklist, !!website.customerEmail),
    customerEmail: website.customerEmail ?? null,
  };
}

function requireDoc(loaded: StudioWebsite): WebsiteDataV2 {
  if (!loaded.doc) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Die Website wurde noch nicht erstellt — bitte die Generierung abwarten.",
    });
  }
  return loaded.doc;
}

/**
 * Websites ohne onboarding_responses-Zeile (z. B. per Admin/Outreach
 * angelegt) hätten sonst kein Ziel für das UPDATE und würden den Haken beim
 * nächsten Laden wieder verlieren (Finding #5) — deshalb bei fehlender Zeile
 * eine anlegen statt nur zu updaten.
 */
async function mergeStudioProgress(
  websiteId: number,
  patch: StudioProgress
): Promise<StudioProgress> {
  const onboarding = await getOnboardingByWebsiteId(websiteId);
  const next = { ...parseStudioProgress(onboarding?.studioProgress), ...patch };
  if (onboarding) {
    await updateOnboarding(websiteId, {
      studioProgress: next,
      updatedAt: Date.now(),
    });
  } else {
    await createOnboarding({
      websiteId,
      status: "in_progress",
      stepCurrent: 0,
      studioProgress: next,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  return next;
}

export const onboardingV2Router = router({
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
      assertV2SafeWrite(loaded.website.websiteData, next);
      // layoutStyle nur als Kompatibilitäts-Spiegel für Admin-Listen; v2-Renderer lesen stylePackId.
      await updateWebsite(loaded.website.id, {
        websiteData: next as any,
        layoutStyle: packId,
      });
      const mergedProgress = await mergeStudioProgress(loaded.website.id, {
        styleConfirmed: true,
      });
      invalidateSsrCache(loaded.website.slug);
      return buildState(
        input.token,
        {
          website: { ...loaded.website, websiteData: next as any },
          doc: next,
          hasLegacyDoc: false,
        },
        mergedProgress
      );
    }),
});
