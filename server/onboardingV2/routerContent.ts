import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import {
  createOnboarding,
  getBusinessById,
  getOnboardingByWebsiteId,
  updateOnboarding,
} from "../db";
import { getGmbPhotos } from "../gmbPhotos";
import { getIndustryImages } from "../industryImages";
import { uploadPhoto as uploadPhotoToStorage } from "../onboardingUpload";
import {
  ImagesPatchSchema,
  OfferPatchSchema,
  TextsPatchSchema,
} from "../../shared/onboardingV2/patches";
import { applyImages, applyOffer, applyTexts } from "./applyPatch";
import { loadStudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput } from "./state";

/**
 * Präfixe synthetischer placeIds (Businesses ohne echten Google-Places-
 * Eintrag, z. B. selbst angelegt oder per E-Mail-Outreach importiert) — für
 * diese darf kein GMB-Foto-Abruf versucht werden.
 */
const SYNTHETIC_PLACE_ID_PREFIXES = ["self-", "email-"];

function isRealPlaceId(placeId: string | null | undefined): placeId is string {
  return (
    !!placeId && !SYNTHETIC_PLACE_ID_PREFIXES.some(prefix => placeId.startsWith(prefix))
  );
}

function readPhotoUrls(onboarding: { photoUrls?: unknown } | undefined): string[] {
  return Array.isArray(onboarding?.photoUrls) ? (onboarding.photoUrls as string[]) : [];
}

export const contentProcedures = {
  /** Fotoquellen für das Bilder-Panel: Google-My-Business, kuratierte Stockbilder, bereits hochgeladene Fotos. */
  getPhotoSources: publicProcedure
    .input(tokenInput)
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const [business, onboarding] = await Promise.all([
        getBusinessById(loaded.website.businessId),
        getOnboardingByWebsiteId(loaded.website.id),
      ]);
      const gmb = isRealPlaceId(business?.placeId)
        ? await getGmbPhotos(business.placeId, 7)
        : [];
      const { hero, gallery } = getIndustryImages(
        business?.category ?? "",
        business?.name ?? ""
      );
      const stock = Array.from(
        new Set([...hero.slice(0, 6), ...(gallery ?? []).slice(0, 6)])
      );
      return { gmb, stock, uploaded: readPhotoUrls(onboarding) };
    }),

  /** Lädt ein Foto hoch (komprimiert/konvertiert in onboardingUpload) und hängt die URL an photoUrls an. */
  uploadPhoto: publicProcedure
    .input(
      tokenInput.extend({
        imageData: z.string().min(10).max(8_000_000),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const onboarding = await getOnboardingByWebsiteId(loaded.website.id);
      const uploaded = readPhotoUrls(onboarding);
      const { url } = await uploadPhotoToStorage(
        input.imageData,
        input.mimeType,
        loaded.website.id,
        uploaded.length
      );
      const next = [...uploaded, url];
      if (onboarding) {
        await updateOnboarding(loaded.website.id, {
          photoUrls: next,
          updatedAt: Date.now(),
        });
      } else {
        await createOnboarding({
          websiteId: loaded.website.id,
          status: "in_progress",
          stepCurrent: 0,
          photoUrls: next,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      return { url, uploaded: next };
    }),

  setImages: publicProcedure
    .input(tokenInput.extend({ patch: ImagesPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      return persistDoc(input.token, loaded, applyImages(doc, input.patch));
    }),

  updateTexts: publicProcedure
    .input(tokenInput.extend({ patch: TextsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      return persistDoc(input.token, loaded, applyTexts(doc, input.patch), {
        progress: { textsReviewed: true },
      });
    }),

  updateOffer: publicProcedure
    .input(tokenInput.extend({ offer: OfferPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = requireDoc(loaded);
      return persistDoc(input.token, loaded, applyOffer(doc, input.offer));
    }),
};
