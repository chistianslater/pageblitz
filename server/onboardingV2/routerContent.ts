import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import {
  createOnboarding,
  getBusinessById,
  getOnboardingByWebsiteId,
  updateOnboarding,
} from "../db";
import { mirrorGmbPhotosToR2 } from "../gmbPhotos";
import { getIndustryImages } from "../industryImages";
import { uploadPhoto as uploadPhotoToStorage } from "../onboardingUpload";
import {
  ImagesPatchSchema,
  OfferPatchSchema,
  PagesPatchSchema,
  TextsPatchSchema,
} from "../../shared/onboardingV2/patches";
import {
  applyAddOnFlags,
  applyImages,
  applyOffer,
  applyPages,
  applyTexts,
  applyTheme,
} from "./applyPatch";
import { getFontPair } from "../../shared/stylePacks";
import { commitAddOnFlags } from "./addOnFlags";
import { loadStudioWebsite } from "./ownership";
import { persistDoc, requireDoc, tokenInput, upsertOnboarding } from "./state";
import {
  assertSuggestQuota,
  suggestOffer as suggestOfferVariants,
  suggestTextVariants,
} from "./suggest";
import type { SectionOf } from "../../shared/siteContract/types";

/**
 * Präfixe synthetischer placeIds (Businesses ohne echten Google-Places-
 * Eintrag, z. B. selbst angelegt oder per E-Mail-Outreach importiert) — für
 * diese darf kein GMB-Foto-Abruf versucht werden.
 */
const SYNTHETIC_PLACE_ID_PREFIXES = ["self-", "email-"];

/** Obergrenze für eigene Fotouploads pro Website (Finding I4) — verhindert unbegrenztes Storage-Wachstum über einen einzelnen Onboarding-Token. */
const MAX_UPLOADED_PHOTOS = 30;

function isRealPlaceId(placeId: string | null | undefined): placeId is string {
  return (
    !!placeId &&
    !SYNTHETIC_PLACE_ID_PREFIXES.some(prefix => placeId.startsWith(prefix))
  );
}

function readPhotoUrls(
  onboarding: { photoUrls?: unknown } | undefined
): string[] {
  return Array.isArray(onboarding?.photoUrls)
    ? (onboarding.photoUrls as string[])
    : [];
}

/**
 * Bereits nach R2 gespiegelte GMB-Fotos aus dem Dokument (Key-Muster
 * `website-<id>/gmb-…`, siehe r2Upload.ts/gmbPhotos.ts) — Cache fürs
 * Fotos-Panel: was die Generierung schon gespiegelt hat, wird nicht erneut
 * heruntergeladen und doppelt nach R2 hochgeladen. Reihenfolge = Dokument-
 * Reihenfolge (Hero zuerst, wie von resolveV2Images geschrieben).
 */
function collectMirroredGmbPhotos(doc: unknown, websiteId: number): string[] {
  const marker = `/website-${websiteId}/gmb-`;
  const found: string[] = [];
  const seen = new Set<string>();
  const walk = (value: unknown): void => {
    if (typeof value === "string") {
      if (value.includes(marker) && !seen.has(value)) {
        seen.add(value);
        found.push(value);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };
  walk(doc);
  return found;
}

/** Stadt für Vorschlags-Prompts — steht (wie readOpeningHours in state.ts) in der contact-Sektion des Dokuments. */
function readCity(doc: { sections: { type: string }[] }): string | undefined {
  const contact = doc.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  return contact?.city;
}

const TextFieldSchema = z.enum([
  "headline",
  "subheadline",
  "aboutBody",
  "seoTitle",
  "seoDescription",
]);

const OfferModeSchema = z.enum(["services", "menu", "pricelist"]);

export const contentProcedures = {
  /**
   * Fotoquellen für das Bilder-Panel: Google-My-Business, kuratierte
   * Stockbilder, bereits hochgeladene Fotos. GMB-Fotos kommen NIE als rohe
   * Google-Photo-URL (die trägt den Places-API-Key als `key=`-Parameter und
   * würde über einen Bilder-Patch im Dokument landen — Key-Leak, Plan B7
   * Task 3): bereits gespiegelte R2-URLs aus dem Dokument werden
   * wiederverwendet, sonst wird bei Bedarf über `mirrorGmbPhotosToR2`
   * gespiegelt; scheitert die Spiegelung eines Fotos, entfällt das Foto.
   */
  getPhotoSources: publicProcedure
    .input(tokenInput)
    .query(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const [business, onboarding] = await Promise.all([
        getBusinessById(loaded.website.businessId),
        getOnboardingByWebsiteId(loaded.website.id),
      ]);
      const mirroredInDoc = collectMirroredGmbPhotos(
        loaded.doc,
        loaded.website.id
      );
      const gmb =
        mirroredInDoc.length > 0
          ? mirroredInDoc
          : isRealPlaceId(business?.placeId)
            ? await mirrorGmbPhotosToR2(business.placeId, loaded.website.id, 7)
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
      if (uploaded.length >= MAX_UPLOADED_PHOTOS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximal 30 eigene Fotos pro Website.",
        });
      }
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
      const doc = await requireDoc(loaded);
      return persistDoc(input.token, loaded, applyImages(doc, input.patch));
    }),

  updateTexts: publicProcedure
    .input(tokenInput.extend({ patch: TextsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(input.token, loaded, applyTexts(doc, input.patch), {
        progress: { textsReviewed: true },
      });
    }),

  /**
   * Studio-Theme-Editor (2026-08-24): Akzentfarbe und/oder kuratierte
   * Schriftpaarung. `null` setzt die jeweilige Wahl auf den Pack-Standard
   * zurück, Weglassen lässt sie unverändert. fontPairId ist gegen die
   * kuratierte Liste (shared/stylePacks/fontPairs.ts) validiert, accent
   * gegen das Hex-Format (Schema-Invariante: nur Hex, kein CSS-Freitext).
   */
  updateTheme: publicProcedure
    .input(
      tokenInput.extend({
        accent: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .nullish(),
        fontPairId: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(40)
          .nullish()
          .refine(id => id == null || getFontPair(id) != null, {
            message: "Unbekannte Schriftpaarung.",
          }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyTheme(doc, { accent: input.accent, fontPairId: input.fontPairId })
      );
    }),

  updateOffer: publicProcedure
    .input(tokenInput.extend({ offer: OfferPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(input.token, loaded, applyOffer(doc, input.offer));
    }),

  /**
   * Speichert die Unterseiten (Add-on `subpages`, Extras-Panel-Unterbereich
   * „Unterseiten", Task 5). Wie `updateTeam` (routerCommerce.ts): Flag folgt
   * Inhalt — sobald tatsächlich mindestens eine Page gespeichert wird und
   * `addOns.subpages` noch nicht gebucht ist, ziehen wir das Flag mit
   * (`commitAddOnFlags`: onboarding_responses, nach dem Checkout Stripe +
   * subscriptions.addOns — Fehler → BAD_REQUEST ohne Dokument-Write) und
   * schreiben `addOns.subpages`/`features.subpages` + Spalte `addOnSubpages`
   * im selben persistDoc-Write — sonst wären die neuen Seiten unsichtbar
   * (Gating in engine.ts `visiblePages`, Task 6). Das Abschalten läuft
   * ausschließlich über `updateAddons` (routerCommerce.ts).
   */
  updatePages: publicProcedure
    .input(tokenInput.extend({ patch: PagesPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      let base = doc;
      let extra: { addOnSubpages?: boolean } = {};
      if (input.patch.pages.length > 0 && doc.addOns?.subpages !== true) {
        await commitAddOnFlags(loaded, { subpages: true });
        base = applyAddOnFlags(doc, { subpages: true });
        extra = { addOnSubpages: true };
      }
      return persistDoc(input.token, loaded, applyPages(base, input.patch), {
        extra,
      });
    }),

  /** KI-Vorschlag für ein Textfeld — persistiert nichts, der User bestätigt über updateTexts. */
  suggestTexts: publicProcedure
    .input(tokenInput.extend({ field: TextFieldSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      assertSuggestQuota(loaded.website.id);
      const business = await getBusinessById(loaded.website.businessId);
      const variants = await suggestTextVariants({
        field: input.field,
        doc,
        businessName: doc.businessName,
        category: doc.businessCategory ?? business?.category ?? "",
        city: readCity(doc),
      });
      return { variants };
    }),

  /** KI-Vorschlag für das Angebot — persistiert nichts, der User bestätigt über updateOffer. */
  suggestOffer: publicProcedure
    .input(tokenInput.extend({ mode: OfferModeSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      assertSuggestQuota(loaded.website.id);
      const business = await getBusinessById(loaded.website.businessId);
      const offer = await suggestOfferVariants({
        mode: input.mode,
        businessName: doc.businessName,
        category: doc.businessCategory ?? business?.category ?? "",
      });
      return { offer };
    }),
};
