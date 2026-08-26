// Deutsche zod-Fehlermeldungen global aktivieren, BEVOR irgendein Schema
// dieses Moduls validiert — seit B6 Task 8 hier statt in client/src/main.tsx
// (dort zog der Import zod in den Entry-Chunk jeder Route, auch "/", das
// kein zod braucht). Server-Einstiege importieren zodLocale zusätzlich
// selbst; z.config ist idempotent.
import "../zodLocale";
import { z } from "zod";
import { PACK_IDS } from "./packIds";
import {
  ABOUT_LAYOUTS,
  DESIGN_DENSITIES,
  GALLERY_LAYOUTS,
  HERO_LAYOUTS,
  IMAGE_TREATMENTS,
  SERVICES_LAYOUTS,
} from "./designProfile";

export { PACK_IDS };

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
  // Nur innerhalb von Page.sections gültig (siehe PageSectionSchema) — NICHT
  // Teil von SectionV2Schema (Startseiten-Sektionen), damit die
  // Exhaustiveness-Checks ("const exhaustive: never = section") in den 14
  // Pack-Renderern (client/src/components/site/packs/*/index.tsx) unverändert
  // bleiben. Trotzdem Teil von SECTION_TYPES/SectionType, weil mehrere
  // Record<SectionType, …>-Karten (SECTION_ANCHORS, SECTION_FIELD_DOC,
  // SECTION_LABELS) exhaustiv über SectionType sind und Task 3/4/5 diesen
  // Wert dort brauchen.
  "pageHeader",
] as const;

/**
 * Slugs, die eine Unterseite NICHT belegen darf — Kollisionen mit
 * bestehenden Routen (Legal-Seiten, System-/Admin-Pfade, reservierte
 * Subdomain-Segmente). Siehe server/ssr/routes.ts (Task 3) für die
 * tatsächliche Routenauflösung.
 */
export const RESERVED_PAGE_SLUGS = [
  "impressum",
  "datenschutz",
  "start",
  "api",
  "preview",
  "preview-ssr",
  "onboarding",
  "demo",
  "site",
  "admin",
  "my-website",
  "my-account",
  "login",
  "dev",
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
    subpages: z.boolean().optional(),
  })
  .strict();

/**
 * Sektions-Add-ons (Gating-Quelle für Task 6, `visibleSections` in
 * client/src/components/site/engine.ts): steuert, ob eine bereits im
 * Dokument vorhandene Sektion/Page tatsächlich gerendert wird. Getrennt von
 * `FeaturesSchema`, weil diese Add-ons an Inhalt (Sektionen/`pages`) hängen,
 * nicht an reine Verhaltens-Flags (Kontaktformular, KI-Chat, Buchung).
 */
export const SiteAddOnsSchema = z
  .object({
    gallery: z.boolean().optional(),
    menu: z.boolean().optional(),
    pricelist: z.boolean().optional(),
    team: z.boolean().optional(),
    subpages: z.boolean().optional(),
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

/**
 * Kopfzeile einer Unterseite (Titel + Einleitung, ohne CTA) — nur innerhalb
 * von `Page.sections` gültig, siehe PageSectionSchema. Bewusst NICHT Teil
 * von SectionV2Schema (Startseiten-Sektionen), siehe Kommentar bei
 * SECTION_TYPES.
 */
const PageHeaderSchema = z
  .object({
    type: z.literal("pageHeader"),
    title: z.string().min(1).max(60),
    intro: z.string().max(300).optional(),
  })
  .strict();

/**
 * Erlaubte Sektionstypen innerhalb einer Unterseite (`Page.sections`) — eine
 * Teilmenge von SectionV2Schema (ohne hero/team/cta, die auf der Startseite
 * bleiben) plus die neue Kopfzeile `pageHeader`. Referenziert dieselben
 * Sektions-Schemas wie SectionV2Schema, damit Inhalte identisch validiert
 * werden — nur die Menge der erlaubten Typen unterscheidet sich.
 */
export const PageSectionSchema = z.discriminatedUnion("type", [
  PageHeaderSchema,
  ServicesSchema,
  AboutSchema,
  GallerySchema,
  FaqSchema,
  ContactSchema,
  TestimonialsSchema,
  PricelistSchema,
  MenuSchema,
]);

/**
 * Eine Unterseite des Add-ons `subpages` (Spec §2.1): eigene Route im SSR
 * (`/<slug>`), eigene SEO-Metadaten, 1–8 Sektionen aus PageSectionSchema.
 * `slug` ist reserviert-geprüft hier (Einzel-Slug); Eindeutigkeit über alle
 * Pages eines Dokuments prüft WebsiteDataV2Schema (Refine unten).
 */
export const PageSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9-]{2,40}$/, "ungültiger Slug")
      .refine(
        slug => !(RESERVED_PAGE_SLUGS as readonly string[]).includes(slug),
        { message: "Dieser Slug ist reserviert." }
      ),
    title: z.string().min(1).max(60),
    navLabel: z.string().max(24).optional(),
    seo: z
      .object({
        title: z.string().max(70),
        description: z.string().max(160),
      })
      .strict(),
    sections: z.array(PageSectionSchema).min(1).max(8),
  })
  .strict();

/** Kompositionsprofil innerhalb einer kuratierten Designrichtung. */
export const DesignProfileSchema = z
  .object({
    version: z.literal(1),
    heroLayout: z.enum(HERO_LAYOUTS),
    servicesLayout: z.enum(SERVICES_LAYOUTS),
    aboutLayout: z.enum(ABOUT_LAYOUTS),
    galleryLayout: z.enum(GALLERY_LAYOUTS),
    density: z.enum(DESIGN_DENSITIES),
    imageTreatment: z.enum(IMAGE_TREATMENTS),
    seed: z.number().int().min(0).max(0xffffffff),
  })
  .strict();

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
    // Unterseiten-Add-on (Spec §2.1): max. 5 Pages, Slugs müssen eindeutig
    // sein (Refine unten) — Schreiben nur über PagesPatchSchema/applyPages.
    pages: z.array(PageSchema).max(5).optional(),
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
    // Studio-Theme-Editor (2026-08-24): kuratierte Schriftpaar-ID aus
    // shared/stylePacks/fontPairs.ts. SICHERHEIT: Der Wert ist nur ein
    // Lookup-Key (getFontPair) und landet nie als CSS-Wert im Dokument —
    // trotzdem enges Format, damit kein Freitext in die DB wandert.
    fontPairId: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(40)
      .optional(),
    // Optional für vollständige Rückwärtskompatibilität: bestehende Websites
    // ohne Profil rendern über DEFAULT_DESIGN_PROFILE unverändert. Neu
    // generierte/angepasste Websites persistieren das Profil.
    designProfile: DesignProfileSchema.optional(),
    features: FeaturesSchema.optional(),
    addOns: SiteAddOnsSchema.optional(),
  })
  .strict()
  .refine(
    doc => {
      if (!doc.pages) return true;
      const slugs = doc.pages.map(p => p.slug);
      return new Set(slugs).size === slugs.length;
    },
    { message: "Seiten-Slugs müssen eindeutig sein.", path: ["pages"] }
  );
