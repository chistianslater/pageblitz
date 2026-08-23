import { z } from "zod";
import { SafeUrlSchema } from "../siteContract/schema";

/**
 * Patch-Schemas für die Onboarding-v2-Panels (Bilder, Texte, Angebot,
 * Rechtliches, Extras). Jedes Schema validiert ausschließlich die Eingabe
 * eines Panels — die Anwendung auf das WebsiteDataV2-Dokument übernehmen die
 * `apply*`-Funktionen in `server/onboardingV2/applyPatch.ts`, die ihrerseits
 * das Ergebnis erneut per `WebsiteDataV2Schema.parse` validieren.
 */

export const ImagesPatchSchema = z
  .object({
    hero: SafeUrlSchema.optional(),
    about: SafeUrlSchema.optional(),
    gallery: z
      .array(z.object({ url: SafeUrlSchema, alt: z.string().min(1) }).strict())
      .max(12)
      .optional(),
  })
  .strict();

export const TextsPatchSchema = z
  .object({
    headline: z.string().min(1).max(120).optional(),
    subheadline: z.string().max(240).optional(),
    ctaText: z.string().max(40).optional(),
    aboutHeadline: z.string().min(1).max(120).optional(),
    aboutBody: z.string().min(1).max(2000).optional(),
    seoTitle: z.string().min(1).max(70).optional(),
    seoDescription: z.string().min(1).max(170).optional(),
  })
  .strict();

export const OfferPatchSchema = z.discriminatedUnion("mode", [
  z
    .object({
      mode: z.literal("services"),
      headline: z.string().min(1).max(80),
      intro: z.string().max(300).optional(),
      items: z
        .array(
          z
            .object({
              title: z.string().min(1).max(80),
              description: z.string().max(240).optional(),
              price: z.string().max(40).optional(),
            })
            .strict()
        )
        .min(1)
        .max(12),
    })
    .strict(),
  z
    .object({
      mode: z.enum(["menu", "pricelist"]),
      headline: z.string().max(80).optional(),
      categories: z
        .array(
          z
            .object({
              name: z.string().min(1).max(60),
              items: z
                .array(
                  z
                    .object({
                      name: z.string().min(1).max(80),
                      description: z.string().max(200).optional(),
                      price: z.string().min(1).max(40),
                    })
                    .strict()
                )
                .min(1)
                .max(40),
            })
            .strict()
        )
        .min(1)
        .max(12),
    })
    .strict(),
]);

export const LegalPatchSchema = z
  .object({
    legalOwner: z.string().min(2).max(120),
    legalStreet: z.string().min(3).max(120),
    legalZip: z.string().regex(/^\d{5}$/),
    legalCity: z.string().min(2).max(80),
    legalEmail: z.string().email().max(320),
    legalPhone: z.string().min(5).max(40),
    legalVatId: z.string().max(20).optional(),
    openingHours: z
      .array(
        z
          .object({
            day: z.string().min(1).max(40),
            hours: z.string().min(1).max(60),
          })
          .strict()
      )
      .max(14)
      .optional(),
  })
  .strict();

export const TeamPatchSchema = z
  .object({
    headline: z.string().max(80).optional(),
    members: z
      .array(
        z
          .object({
            name: z.string().min(1).max(80),
            role: z.string().max(80).optional(),
            imageUrl: SafeUrlSchema.optional(),
          })
          .strict()
      )
      .max(12),
  })
  .strict();

export const AddonsPatchSchema = z
  .object({
    contactForm: z.boolean(),
    gallery: z.boolean(),
    menu: z.boolean(),
    pricelist: z.boolean(),
    aiChat: z.boolean(),
    booking: z.boolean(),
    team: z.boolean(),
  })
  .strict();

export type ImagesPatch = z.infer<typeof ImagesPatchSchema>;
export type TextsPatch = z.infer<typeof TextsPatchSchema>;
export type OfferPatch = z.infer<typeof OfferPatchSchema>;
export type LegalPatch = z.infer<typeof LegalPatchSchema>;
export type TeamPatch = z.infer<typeof TeamPatchSchema>;
export type AddonsPatch = z.infer<typeof AddonsPatchSchema>;
