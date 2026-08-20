import { z } from "zod";

export const PACK_IDS = [
  "werkbank", "patina", "kanzlei", "salon-noir", "morgenlicht", "marktplatz",
  "gusto", "landgut", "atelier", "klarwerk", "verve", "zunft", "schimmer", "fundament",
] as const;

export const SECTION_TYPES = [
  "hero", "services", "about", "gallery", "testimonials",
  "contact", "faq", "menu", "pricelist", "team", "cta",
] as const;

const PackIdSchema = z.enum(PACK_IDS);
const SectionTypeSchema = z.enum(SECTION_TYPES);

const HeroSchema = z.object({ type: z.literal("hero"), headline: z.string().min(1),
  subheadline: z.string().optional(), ctaText: z.string().optional(),
  ctaHref: z.string().optional(), imageUrl: z.string().optional() }).strict();
const ServicesSchema = z.object({ type: z.literal("services"), headline: z.string(),
  intro: z.string().optional(),
  items: z.array(z.object({ title: z.string(), description: z.string().optional(),
    price: z.string().optional() }).strict()).min(1) }).strict();
const AboutSchema = z.object({ type: z.literal("about"), headline: z.string(),
  body: z.string(), imageUrl: z.string().optional() }).strict();
const GallerySchema = z.object({ type: z.literal("gallery"), headline: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string() }).strict()).min(1) }).strict();
const TestimonialsSchema = z.object({ type: z.literal("testimonials"),
  headline: z.string().optional(),
  items: z.array(z.object({ author: z.string(), text: z.string(),
    rating: z.number().min(1).max(5).optional() }).strict()).min(1) }).strict();
const OpeningHoursSchema = z.object({ day: z.string(), hours: z.string() }).strict();
const ContactSchema = z.object({ type: z.literal("contact"), headline: z.string().optional(),
  phone: z.string().optional(), email: z.string().optional(), street: z.string().optional(),
  zip: z.string().optional(), city: z.string().optional(),
  openingHours: z.array(OpeningHoursSchema).optional() }).strict();
const FaqSchema = z.object({ type: z.literal("faq"), headline: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() }).strict()).min(1) }).strict();
const PricedItemSchema = z.object({ name: z.string(), description: z.string().optional(),
  price: z.string() }).strict();
const PricedCategorySchema = z.object({ name: z.string(),
  items: z.array(PricedItemSchema).min(1) }).strict();
const MenuSchema = z.object({ type: z.literal("menu"), headline: z.string().optional(),
  categories: z.array(PricedCategorySchema).min(1) }).strict();
const PricelistSchema = z.object({ type: z.literal("pricelist"), headline: z.string().optional(),
  categories: z.array(PricedCategorySchema).min(1) }).strict();
const TeamSchema = z.object({ type: z.literal("team"), headline: z.string().optional(),
  members: z.array(z.object({ name: z.string(), role: z.string().optional(),
    imageUrl: z.string().optional() }).strict()).min(1) }).strict();
const CtaSchema = z.object({ type: z.literal("cta"), headline: z.string(),
  ctaText: z.string(), ctaHref: z.string().optional() }).strict();

export const SectionV2Schema = z.discriminatedUnion("type", [
  HeroSchema, ServicesSchema, AboutSchema, GallerySchema, TestimonialsSchema,
  ContactSchema, FaqSchema, MenuSchema, PricelistSchema, TeamSchema, CtaSchema,
]);

export const WebsiteDataV2Schema = z.object({
  version: z.literal(2),
  stylePackId: PackIdSchema,
  businessName: z.string().min(1),
  slug: z.string().optional(),
  businessCategory: z.string().optional(),
  tagline: z.string().optional(),
  logo: z.union([
    z.object({ kind: z.literal("font"), font: z.string() }).strict(),
    z.object({ kind: z.literal("image"), url: z.string() }).strict(),
  ]).optional(),
  sections: z.array(SectionV2Schema).min(1),
  sectionOrder: z.array(SectionTypeSchema).optional(),
  hiddenSections: z.array(SectionTypeSchema).optional(),
  seo: z.object({ title: z.string(), description: z.string() }).strict(),
  footerNote: z.string().optional(),
  google: z.object({ rating: z.number(), reviewCount: z.number() }).strict().optional(),
  legal: z.object({ impressumHtml: z.string().optional(),
    datenschutzHtml: z.string().optional() }).strict().optional(),
  colorOverrides: z.record(z.string(), z.string()).optional(),
}).strict();
