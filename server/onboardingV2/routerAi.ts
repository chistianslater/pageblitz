import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import { getConstitution, getFontPair } from "../../shared/stylePacks";
import {
  buildCustomWorldOverrides,
  getColorWorld,
  getColorWorlds,
} from "../../shared/stylePacks/colorWorlds";
import {
  deriveDesignProfile,
  type DesignProfile,
} from "../../shared/siteContract/designProfile";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import type { AiThemePatch } from "../../shared/onboardingV2/aiEdit";
import { applyTheme } from "./applyPatch";
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

/**
 * Wendet einen Theme-Patch des KI-Assistenten über dieselben Mechaniken an
 * wie der Theme-Editor (applyTheme) und liefert eine deutsche
 * Änderungsliste für die Chat-Karte. Unbekannte Farbwelt/Schriftpaar-IDs
 * werden übersprungen statt den ganzen Patch zu verwerfen.
 */
export function applyAiTheme(
  doc: WebsiteDataV2,
  theme: AiThemePatch
): { next: WebsiteDataV2; summary: string[] } {
  const summary: string[] = [];
  const packId = doc.stylePackId as PackId;

  let worldOverrides: Record<string, string> | null | undefined;
  if (theme.colorWorldBase !== undefined) {
    worldOverrides = buildCustomWorldOverrides(packId, theme.colorWorldBase);
    summary.push(`Grundfarbe auf ${theme.colorWorldBase} gestellt`);
  } else if (theme.colorWorldId !== undefined) {
    if (theme.colorWorldId === null || theme.colorWorldId === "original") {
      worldOverrides = null;
      summary.push("Farbwelt auf Original zurückgesetzt");
    } else {
      const world = getColorWorld(packId, theme.colorWorldId);
      if (world) {
        worldOverrides = world.overrides;
        summary.push(`Farbwelt „${world.name}“ aktiviert`);
      }
    }
  }

  let fontPairId: string | null | undefined;
  if (theme.fontPairId !== undefined) {
    if (theme.fontPairId === null) {
      fontPairId = null;
      summary.push("Schriften auf die Richtungs-Standards zurückgesetzt");
    } else {
      const pair = getFontPair(theme.fontPairId);
      if (pair) {
        fontPairId = pair.id;
        summary.push(`Schriftpaar „${pair.label}“ gewählt`);
      }
    }
  }

  if (theme.accent !== undefined) {
    summary.push(
      theme.accent === null
        ? "Akzentfarbe auf die Richtungsfarbe zurückgesetzt"
        : `Akzentfarbe auf ${theme.accent} gestellt`
    );
  }

  const layoutKeys = [
    "heroLayout",
    "servicesLayout",
    "aboutLayout",
    "galleryLayout",
    "density",
    "imageTreatment",
  ] as const;
  const layoutLabels: Record<(typeof layoutKeys)[number], string> = {
    heroLayout: "Hero-Layout",
    servicesLayout: "Leistungen-Layout",
    aboutLayout: "Über-uns-Layout",
    galleryLayout: "Galerie-Layout",
    density: "Abstände",
    imageTreatment: "Bildwirkung",
  };
  const wantsProfileChange = layoutKeys.some(key => theme[key] !== undefined);
  let designProfile: DesignProfile | undefined;
  if (wantsProfileChange) {
    const base =
      doc.designProfile ??
      deriveDesignProfile({
        stylePackId: packId,
        businessName: doc.businessName,
        businessCategory: doc.businessCategory,
        sections: doc.sections,
      });
    const merged: DesignProfile = { ...base };
    for (const key of layoutKeys) {
      const value = theme[key];
      if (value !== undefined) {
        (merged as unknown as Record<string, unknown>)[key] = value;
        summary.push(`${layoutLabels[key]}: ${value}`);
      }
    }
    designProfile = merged;
  }

  const next = applyTheme(doc, {
    accent: theme.accent,
    fontPairId,
    designProfile,
    worldOverrides,
  });
  return { next, summary };
}

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
      if (result.kind === "theme") {
        // Design-Patches werden SOFORT angewandt: jede Stellschraube ist im
        // Stil-Panel mit einem Klick revidierbar — ein Bestätigen-Zwang
        // würde den „KI passt es an“-Fluss nur bremsen.
        const { next, summary } = applyAiTheme(doc, result.theme);
        if (summary.length === 0) {
          return {
            kind: "reject" as const,
            reason:
              "Diesen Design-Wunsch konnte ich keiner Einstellung zuordnen — probiere es im Stil-Panel.",
          };
        }
        await persistDoc(input.token, loaded, next);
        return {
          kind: "theme" as const,
          reason: result.reason,
          summary,
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
