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
import {
  uploadPhoto as uploadPhotoToStorage,
  uploadLogo as uploadLogoToStorage,
} from "../onboardingUpload";
import {
  buildCustomWorldOverrides,
  getColorWorld,
} from "../../shared/stylePacks/colorWorlds";
import type { PackId } from "../../shared/siteContract/types";
import {
  AI_IMAGES_PER_HOUR,
  consumeAiImageQuota,
  generateAiImage,
  isAiImagesConfigured,
} from "../_core/aiImages";
import {
  ImagesPatchSchema,
  OfferPatchSchema,
  PagesPatchSchema,
  TextsPatchSchema,
} from "../../shared/onboardingV2/patches";
import {
  applyAddOnFlags,
  applyAddonHeadings,
  applyImages,
  applyLogo,
  applyPartners,
  applyStructure,
  applyInlineText,
  applyOffer,
  applyPages,
  applyTexts,
  applyTheme,
} from "./applyPatch";
import { getFontPair } from "../../shared/stylePacks";
import {
  DesignProfileSchema,
  SafeUrlSchema,
  SECTION_TYPES,
} from "../../shared/siteContract/schema";
import { HIDEABLE_SECTION_TYPES } from "../../shared/onboardingV2/aiEdit";
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
  "storyBody",
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

  /**
   * KI-Bild über Cloudflare Workers AI (Flux-1-schnell, server/_core/
   * aiImages.ts) generieren und wie ein Upload behandeln: nach R2
   * komprimieren/hochladen und an photoUrls anhängen — damit taucht es
   * auch unter „Hochladen" auf und zählt in das 30-Fotos-Limit.
   * Rate-Limit: 10 Generierungen pro Website und Stunde (Public-Token!).
   */
  generateAiPhoto: publicProcedure
    .input(tokenInput.extend({ prompt: z.string().trim().min(3).max(300) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      if (!isAiImagesConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "KI-Bilder sind noch nicht eingerichtet — nutze solange Stockbilder oder eigene Fotos.",
        });
      }
      if (!consumeAiImageQuota(loaded.website.id)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Maximal ${AI_IMAGES_PER_HOUR} KI-Bilder pro Stunde — bitte kurz warten.`,
        });
      }
      const onboarding = await getOnboardingByWebsiteId(loaded.website.id);
      const uploaded = readPhotoUrls(onboarding);
      if (uploaded.length >= MAX_UPLOADED_PHOTOS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximal 30 eigene Fotos pro Website.",
        });
      }
      const imageBase64 = await generateAiImage(input.prompt);
      if (!imageBase64) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Das Bild konnte gerade nicht generiert werden — bitte versuch es noch einmal.",
        });
      }
      const { url } = await uploadPhotoToStorage(
        imageBase64,
        "image/jpeg",
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
      // Wie updateTeam/updatePages: Flag folgt Inhalt, sonst bleibt die
      // Galerie unsichtbar (engine.ts `visibleSections`), bis jemand in
      // der Extras-Übersicht extra „Speichern" klickt.
      let base = doc;
      if (
        input.patch.gallery &&
        input.patch.gallery.length > 0 &&
        doc.addOns?.gallery !== true
      ) {
        await commitAddOnFlags(loaded, { gallery: true });
        base = applyAddOnFlags(doc, { gallery: true });
      }
      return persistDoc(input.token, loaded, applyImages(base, input.patch), {
        trigger: "panel",
        label: "Fotos geändert",
      });
    }),

  /**
   * Firmenlogo (2026-08-31): lädt ein Logo hoch (WebP mit Transparenz,
   * onboardingUpload.uploadLogo) und setzt doc.logo — bzw. entfernt es
   * (remove) zurück zur Textmarke. Alle 20 Packs rendern doc.logo bereits.
   */
  updateLogo: publicProcedure
    .input(
      tokenInput.extend({
        imageData: z.string().min(10).max(8_000_000).optional(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
        remove: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      if (input.remove) {
        return persistDoc(input.token, loaded, applyLogo(doc, null), {
          trigger: "panel",
          label: "Logo entfernt",
        });
      }
      if (!input.imageData || !input.mimeType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitte wähle eine Logo-Datei aus.",
        });
      }
      const { url } = await uploadLogoToStorage(
        input.imageData,
        input.mimeType,
        loaded.website.id
      );
      return persistDoc(input.token, loaded, applyLogo(doc, url), {
        trigger: "panel",
        label: "Logo hochgeladen",
      });
    }),

  /**
   * Partner-Logo hochladen (2026-08-31): reiner Upload (WebP mit
   * Transparenz) — schreibt anders als updateLogo NICHT ins Dokument;
   * die URL geht in updatePartners-Items.
   */
  uploadPartnerLogo: publicProcedure
    .input(
      tokenInput.extend({
        imageData: z.string().min(10).max(8_000_000),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const { url } = await uploadLogoToStorage(
        input.imageData,
        input.mimeType,
        loaded.website.id
      );
      return { url };
    }),

  /**
   * Partner/Zertifikate-Sektion schreiben (Fotos-Panel): vollständige
   * Item-Liste — [] entfernt die Sektion. Logos entstehen nur über
   * uploadPartnerLogo, die KI legt die Sektion nie an.
   */
  updatePartners: publicProcedure
    .input(
      tokenInput.extend({
        headline: z.string().max(80).optional(),
        items: z
          .array(
            z
              .object({
                imageUrl: SafeUrlSchema,
                name: z.string().min(1).max(60),
                url: SafeUrlSchema.optional(),
              })
              .strict()
          )
          .max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyPartners(doc, { headline: input.headline, items: input.items }),
        { trigger: "panel", label: "Partner-Logos geändert" }
      );
    }),

  /**
   * Struktur-Editor (Backlog 21b): Sektionen verschieben/ausblenden per
   * Anfasser-UI — gleiche Ersatzlisten-Semantik wie der KI-Chat.
   */
  updateStructure: publicProcedure
    .input(
      tokenInput.extend({
        hiddenSections: z
          .array(z.enum(HIDEABLE_SECTION_TYPES))
          .max(16)
          .optional(),
        sectionOrder: z.array(z.enum(SECTION_TYPES)).max(20).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyStructure(doc, {
          hiddenSections: input.hiddenSections,
          sectionOrder: input.sectionOrder,
        }),
        { trigger: "panel", label: "Struktur geändert" }
      );
    }),

  updateTexts: publicProcedure
    .input(tokenInput.extend({ patch: TextsPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyTexts(doc, input.patch),
        { trigger: "panel", label: "Texte geändert" },
        { progress: { textsReviewed: true } }
      );
    }),

  updateInlineText: publicProcedure
    .input(
      tokenInput.extend({
        path: z
          .string()
          .regex(/^sections\.\d+\.[a-zA-Z0-9.]+$/)
          .max(160),
        value: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyInlineText(doc, input.path, input.value),
        { trigger: "inline", label: "Text direkt bearbeitet" }
      );
    }),

  updateAddonSettings: publicProcedure
    .input(
      tokenInput.extend({
        headings: z
          .object({
            contact: z.string().max(120).optional(),
            gallery: z.string().max(120).optional(),
            menu: z.string().max(120).optional(),
            pricelist: z.string().max(120).optional(),
          })
          .strict()
          .optional(),
        chatWelcomeMessage: z.string().max(512).nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      const next = input.headings
        ? applyAddonHeadings(doc, input.headings)
        : doc;
      return persistDoc(
        input.token,
        loaded,
        next,
        { trigger: "panel", label: "Extras-Einstellungen geändert" },
        {
          extra:
            input.chatWelcomeMessage !== undefined
              ? {
                  chatWelcomeMessage: input.chatWelcomeMessage?.trim() || null,
                }
              : undefined,
        }
      );
    }),

  /**
   * Studio-Design-Editor: Akzentfarbe, kuratierte Schriftpaarung und/oder
   * Kompositionsprofil. `null` setzt Farbe/Schrift auf den Richtungsstandard
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
        designProfile: DesignProfileSchema.optional(),
        /**
         * Farbwelt (P10): kuratierte Grundstimmung per ID — der Server löst
         * sie gegen getColorWorld(pack) auf und schreibt die Grundrollen als
         * colorOverrides. `null`/"original" setzt auf das Pack zurück.
         */
        colorWorldId: z
          .string()
          .regex(/^[a-z-]+$/)
          .max(24)
          .nullish(),
        /**
         * Eigene Grundfarbe statt kuratierter Welt: der Server rechnet
         * daraus ein vollständiges kontrastgeführtes Rollen-Set
         * (buildCustomWorldOverrides). Gewinnt gegenüber colorWorldId.
         */
        colorWorldBase: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      let worldOverrides: Record<string, string> | null | undefined;
      if (input.colorWorldBase !== undefined) {
        worldOverrides = buildCustomWorldOverrides(
          doc.stylePackId as PackId,
          input.colorWorldBase
        );
      } else if (input.colorWorldId !== undefined) {
        if (input.colorWorldId === null || input.colorWorldId === "original") {
          worldOverrides = null;
        } else {
          const world = getColorWorld(
            doc.stylePackId as PackId,
            input.colorWorldId
          );
          if (!world) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Unbekannte Farbwelt.",
            });
          }
          worldOverrides = world.overrides;
        }
      }
      return persistDoc(
        input.token,
        loaded,
        applyTheme(doc, {
          accent: input.accent,
          fontPairId: input.fontPairId,
          designProfile: input.designProfile,
          worldOverrides,
        }),
        { trigger: "panel", label: "Design angepasst" }
      );
    }),

  updateOffer: publicProcedure
    .input(tokenInput.extend({ offer: OfferPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      // Speisekarte/Preisliste sind Add-on-Sektionen (engine.ts). Ohne
      // `addOns.menu`/`addOns.pricelist` blendet die Vorschau sie aus —
      // Speichern im Extra-Editor muss das Flag mitziehen, analog zu
      // updateTeam/updatePages. Leistungen (`services`) bleiben frei.
      let base = doc;
      if (input.offer.mode === "menu" || input.offer.mode === "pricelist") {
        const key = input.offer.mode;
        if (doc.addOns?.[key] !== true) {
          await commitAddOnFlags(loaded, { [key]: true });
          base = applyAddOnFlags(doc, { [key]: true });
        }
      }
      return persistDoc(input.token, loaded, applyOffer(base, input.offer), {
        trigger: "panel",
        label: "Angebot geändert",
      });
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
      return persistDoc(
        input.token,
        loaded,
        applyPages(base, input.patch),
        { trigger: "panel", label: "Unterseiten geändert" },
        {
          extra,
        }
      );
    }),

  /** KI-Vorschlag für ein Textfeld — persistiert nichts, der User bestätigt über updateTexts. */
  suggestTexts: publicProcedure
    .input(
      tokenInput.extend({
        field: TextFieldSchema,
        /** Kontext des Kunden („Was willst du sagen?“) — fließt in den Prompt. */
        hint: z.string().trim().max(200).optional(),
      })
    )
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
        ...(input.hint ? { hint: input.hint } : {}),
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
