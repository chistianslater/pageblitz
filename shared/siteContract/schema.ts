import { z } from "zod";

export const PACK_IDS = [
  "werkbank",
  "patina",
  "kanzlei",
  "salon-noir",
  "morgenlicht",
  "marktplatz",
  "gusto",
  "landgut",
  "atelier",
  "klarwerk",
  "verve",
  "zunft",
  "schimmer",
  "fundament",
] as const;

export const SECTION_TYPES = [
  "hero",
  "services",
  "about",
  "gallery",
  "testimonials",
  "contact",
  "faq",
  "menu",
  "pricelist",
  "team",
  "cta",
] as const;

const PackIdSchema = z.enum(PACK_IDS);
const SectionTypeSchema = z.enum(SECTION_TYPES);

/**
 * Erlaubt nur http(s)-URLs, root-relative Pfade ("/...") oder Anker ("#...").
 * Blockiert insbesondere "javascript:"- und andere unsichere URL-Schemata in
 * allen Link-/Bild-Feldern des Vertrags.
 */
export const SafeUrlSchema = z
  .string()
  .regex(/^(https?:\/\/|\/|#)/, "unsichere URL");

/**
 * Bezahlte Zusatzfunktionen (Add-ons), die nach Zahlung im Dokument aktiviert
 * werden. Additiv und strikt: neue Keys müssen hier UND im Webhook ergänzt
 * werden, damit fremde Felder weiter abgelehnt werden.
 */
export const FeaturesSchema = z
  .object({
    contactForm: z.boolean().optional(),
    aiChat: z.boolean().optional(),
    booking: z.boolean().optional(),
  })
  .strict();

const HeroSchema = z
  .object({
    type: z.literal("hero"),
    headline: z.string().min(1),
    subheadline: z.string().optional(),
    ctaText: z.string().optional(),
    ctaHref: SafeUrlSchema.optional(),
    imageUrl: SafeUrlSchema.optional(),
  })
  .strict();
const ServicesSchema = z
  .object({
    type: z.literal("services"),
    headline: z.string(),
    intro: z.string().optional(),
    items: z
      .array(
        z
          .object({
            title: z.string(),
            description: z.string().optional(),
            price: z.string().optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
const AboutSchema = z
  .object({
    type: z.literal("about"),
    headline: z.string(),
    body: z.string(),
    imageUrl: SafeUrlSchema.optional(),
  })
  .strict();
const GallerySchema = z
  .object({
    type: z.literal("gallery"),
    headline: z.string().optional(),
    images: z
      .array(z.object({ url: SafeUrlSchema, alt: z.string() }).strict())
      .min(1),
  })
  .strict();
const TestimonialsSchema = z
  .object({
    type: z.literal("testimonials"),
    headline: z.string().optional(),
    items: z
      .array(
        z
          .object({
            author: z.string(),
            text: z.string(),
            rating: z.number().min(1).max(5).optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
const OpeningHoursSchema = z
  .object({ day: z.string(), hours: z.string() })
  .strict();
const ContactSchema = z
  .object({
    type: z.literal("contact"),
    headline: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    street: z.string().optional(),
    zip: z.string().optional(),
    city: z.string().optional(),
    openingHours: z.array(OpeningHoursSchema).optional(),
  })
  .strict();
const FaqSchema = z
  .object({
    type: z.literal("faq"),
    headline: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }).strict())
      .min(1),
  })
  .strict();
const PricedItemSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    price: z.string(),
  })
  .strict();
const PricedCategorySchema = z
  .object({ name: z.string(), items: z.array(PricedItemSchema).min(1) })
  .strict();
const MenuSchema = z
  .object({
    type: z.literal("menu"),
    headline: z.string().optional(),
    categories: z.array(PricedCategorySchema).min(1),
  })
  .strict();
const PricelistSchema = z
  .object({
    type: z.literal("pricelist"),
    headline: z.string().optional(),
    categories: z.array(PricedCategorySchema).min(1),
  })
  .strict();
const TeamSchema = z
  .object({
    type: z.literal("team"),
    headline: z.string().optional(),
    members: z
      .array(
        z
          .object({
            name: z.string(),
            role: z.string().optional(),
            imageUrl: SafeUrlSchema.optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
const CtaSchema = z
  .object({
    type: z.literal("cta"),
    headline: z.string(),
    ctaText: z.string(),
    ctaHref: SafeUrlSchema.optional(),
  })
  .strict();

export const SectionV2Schema = z.discriminatedUnion("type", [
  HeroSchema,
  ServicesSchema,
  AboutSchema,
  GallerySchema,
  TestimonialsSchema,
  ContactSchema,
  FaqSchema,
  MenuSchema,
  PricelistSchema,
  TeamSchema,
  CtaSchema,
]);

export const WebsiteDataV2Schema = z
  .object({
    version: z.literal(2),
    stylePackId: PackIdSchema,
    businessName: z.string().min(1),
    slug: z.string().optional(),
    businessCategory: z.string().optional(),
    tagline: z.string().optional(),
    logo: z
      .union([
        z.object({ kind: z.literal("font"), font: z.string() }).strict(),
        z.object({ kind: z.literal("image"), url: SafeUrlSchema }).strict(),
      ])
      .optional(),
    sections: z.array(SectionV2Schema).min(1),
    sectionOrder: z.array(SectionTypeSchema).optional(),
    hiddenSections: z.array(SectionTypeSchema).optional(),
    seo: z.object({ title: z.string(), description: z.string() }).strict(),
    footerNote: z.string().optional(),
    google: z
      .object({ rating: z.number(), reviewCount: z.number() })
      .strict()
      .optional(),
    // SICHERHEITS-INVARIANTE: impressumHtml/datenschutzHtml werden beim SSR
    // (server/ssr/renderSite.tsx) bewusst UNESCAPED gerendert und sind
    // same-origin mit dem Admin-Panel. In diese Felder darf ausschließlich
    // systemgenerierter Output des legalGenerator gelangen, niemals rohe
    // Nutzereingabe — sonst ist es Stored-XSS auf der Kundenseite.
    legal: z
      .object({
        impressumHtml: z.string().optional(),
        datenschutzHtml: z.string().optional(),
      })
      .strict()
      .optional(),
    // SICHERHEITS-INVARIANTE: colorOverrides-Werte landen unescaped als
    // Inline-Style-Variablen (siehe client/src/components/site/SiteRenderer.tsx,
    // toCssVars). Ohne Formatzwang könnte ein Wert wie "red;background:url(x)"
    // CSS-Injection auf der Kundenseite ermöglichen — daher nur Hex-Farben.
    colorOverrides: z
      .record(z.string(), z.string().regex(/^#[0-9a-fA-F]{3,8}$/))
      .optional(),
    features: FeaturesSchema.optional(),
  })
  .strict();
