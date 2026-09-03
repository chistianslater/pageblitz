import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import { crawlSiteBranding } from "../gmb/siteCrawl";
import { uploadLogoFromUrl } from "../onboardingUpload";
import { buildBrandSuggestion } from "../../shared/onboardingV2/brandImport";
import { getFontPair } from "../../shared/stylePacks";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { applyLogo, applyTheme } from "./applyPatch";
import { loadStudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput } from "./state";

/**
 * Marken-Import (2026-09-03, Punkt 3 Scheibe 1): Logo, Markenfarbe und
 * Schriftpaar aus der bestehenden Betriebs-Website (URL aus dem
 * Google-Profil). Deterministisch, ohne LLM. Die Vorschau schreibt nichts;
 * beim Übernehmen wird bewusst erneut gecrawlt, damit die Werte vom Server
 * stammen und nicht vom Client kommen.
 */
export const brandProcedures = {
  brandImportPreview: publicProcedure
    .input(tokenInput)
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const business = await getBusinessById(loaded.website.businessId);
      const website = business?.website?.trim();
      if (!website) return { available: false as const };
      const signals = await crawlSiteBranding(website);
      if (!signals) return { available: false as const };
      return {
        available: true as const,
        suggestion: buildBrandSuggestion(signals),
      };
    }),

  applyBrandImport: publicProcedure
    .input(
      tokenInput.extend({
        logo: z.boolean(),
        accent: z.boolean(),
        fontPair: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.logo && !input.accent && !input.fontPair) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Wähle mindestens einen Teil deiner Marke aus.",
        });
      }
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      const business = await getBusinessById(loaded.website.businessId);
      const website = business?.website?.trim();
      const signals = website ? await crawlSiteBranding(website) : null;
      if (!signals) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Die Website des Betriebs war gerade nicht erreichbar — bitte später erneut versuchen.",
        });
      }
      const suggestion = buildBrandSuggestion(signals);

      let next: WebsiteDataV2 = doc;
      const applied: string[] = [];

      if (input.logo && suggestion.logoUrl) {
        // Fehlgeschlagener Logo-Abruf darf den Rest nicht verhindern.
        const uploaded = await uploadLogoFromUrl(
          suggestion.logoUrl,
          loaded.website.id
        );
        if (uploaded) {
          next = applyLogo(next, uploaded.url);
          applied.push("Logo");
        }
      }

      const themePatch: { accent?: string; fontPairId?: string } = {};
      if (input.accent && suggestion.accent) {
        themePatch.accent = suggestion.accent;
        applied.push("Farbe");
      }
      // Unbekannte Paar-ID (Registry geändert) lieber weglassen als speichern.
      if (
        input.fontPair &&
        suggestion.fontPairId &&
        getFontPair(suggestion.fontPairId)
      ) {
        themePatch.fontPairId = suggestion.fontPairId;
        applied.push("Schrift");
      }
      if (themePatch.accent || themePatch.fontPairId) {
        next = applyTheme(next, themePatch);
      }

      if (applied.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aus dieser Website ließ sich nichts übernehmen.",
        });
      }
      return persistDoc(input.token, loaded, next, {
        trigger: "panel",
        label: `Marke übernommen: ${applied.join(", ")}`,
      });
    }),
};
