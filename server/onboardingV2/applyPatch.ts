import { TRPCError } from "@trpc/server";
import type {
  ImagesPatch,
  OfferPatch,
  TeamPatch,
  TextsPatch,
} from "../../shared/onboardingV2/patches";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import {
  PACK_IDS,
  type PackId,
  type SectionOf,
  type SectionType,
  type SectionV2,
  type SiteFeatures,
  type WebsiteDataV2,
} from "../../shared/siteContract/types";

export function parsePackId(value: string): PackId {
  if ((PACK_IDS as readonly string[]).includes(value)) return value as PackId;
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: `Unbekanntes Style-Pack: "${value}"`,
  });
}

/** Pure: neues, schema-validiertes Dokument mit anderem Pack; Inhalte bleiben 1:1. */
export function applyStylePack(
  doc: WebsiteDataV2,
  packId: PackId
): WebsiteDataV2 {
  return WebsiteDataV2Schema.parse({ ...doc, stylePackId: packId });
}

/** Angebots-Sektionstypen: es darf immer nur eine davon existieren. */
const OFFER_TYPES = new Set<SectionType>(["services", "menu", "pricelist"]);

/** Ersetzt jede Sektion vom Typ `type` durch das Ergebnis von `map`; andere Sektionen bleiben unverändert. */
function replaceSection<T extends SectionType>(
  sections: SectionV2[],
  type: T,
  map: (s: SectionOf<T>) => SectionOf<T>
): SectionV2[] {
  return sections.map(s => (s.type === type ? map(s as SectionOf<T>) : s));
}

/**
 * Fügt `section` direkt nach der ersten Sektion vom Typ `afterType` ein.
 * Ohne Treffer: vor der ersten `contact`-Sektion, sonst ans Ende.
 */
function insertAfter(
  sections: SectionV2[],
  afterType: SectionType | null,
  section: SectionV2
): SectionV2[] {
  const idx = afterType ? sections.findIndex(s => s.type === afterType) : -1;
  if (idx >= 0)
    return [...sections.slice(0, idx + 1), section, ...sections.slice(idx + 1)];
  const contactIdx = sections.findIndex(s => s.type === "contact");
  if (contactIdx >= 0)
    return [
      ...sections.slice(0, contactIdx),
      section,
      ...sections.slice(contactIdx),
    ];
  return [...sections, section];
}

/** Pure: setzt hero-/about-Bild (nur wenn Sektion existiert) und verwaltet die Galerie-Sektion. */
export function applyImages(
  doc: WebsiteDataV2,
  patch: ImagesPatch
): WebsiteDataV2 {
  let sections = doc.sections;
  if (patch.hero !== undefined)
    sections = replaceSection(sections, "hero", s => ({
      ...s,
      imageUrl: patch.hero,
    }));
  if (patch.about !== undefined)
    sections = replaceSection(sections, "about", s => ({
      ...s,
      imageUrl: patch.about,
    }));
  if (patch.gallery !== undefined) {
    const existing = sections.find(s => s.type === "gallery") as
      | SectionOf<"gallery">
      | undefined;
    const without = sections.filter(s => s.type !== "gallery");
    if (patch.gallery.length === 0) sections = without;
    else {
      const gallery: SectionOf<"gallery"> = {
        type: "gallery",
        headline: existing?.headline ?? "Einblicke",
        images: patch.gallery,
      };
      sections = existing
        ? sections.map(s => (s.type === "gallery" ? gallery : s))
        : insertAfter(
            without,
            without.some(s => s.type === "about") ? "about" : null,
            gallery
          );
    }
  }
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}

/**
 * Pure: verwaltet die Team-Sektion (analog zur Galerie in `applyImages`).
 * `members: []` entfernt eine vorhandene Sektion; sonst wird sie ersetzt
 * (Position bleibt) oder neu angelegt (nach "about", sonst vor "contact",
 * sonst ans Ende — siehe `insertAfter`).
 */
export function applyTeam(doc: WebsiteDataV2, p: TeamPatch): WebsiteDataV2 {
  const existing = doc.sections.find(s => s.type === "team") as
    | SectionOf<"team">
    | undefined;
  const without = doc.sections.filter(s => s.type !== "team");
  let sections: SectionV2[];
  if (p.members.length === 0) sections = without;
  else {
    const headline = p.headline !== undefined ? p.headline : existing?.headline;
    const team: SectionOf<"team"> = {
      type: "team",
      ...(headline !== undefined ? { headline } : {}),
      members: p.members,
    };
    sections = existing
      ? doc.sections.map(s => (s.type === "team" ? team : s))
      : insertAfter(
          without,
          without.some(s => s.type === "about") ? "about" : null,
          team
        );
  }
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}

/** Pure: aktualisiert Hero-/About-Texte und die SEO-Metadaten (nur übergebene Felder). */
export function applyTexts(doc: WebsiteDataV2, p: TextsPatch): WebsiteDataV2 {
  let sections = doc.sections;
  if (
    p.headline !== undefined ||
    p.subheadline !== undefined ||
    p.ctaText !== undefined
  )
    sections = replaceSection(sections, "hero", s => ({
      ...s,
      ...(p.headline !== undefined ? { headline: p.headline } : {}),
      ...(p.subheadline !== undefined ? { subheadline: p.subheadline } : {}),
      ...(p.ctaText !== undefined ? { ctaText: p.ctaText } : {}),
    }));
  if (p.aboutHeadline !== undefined || p.aboutBody !== undefined)
    sections = replaceSection(sections, "about", s => ({
      ...s,
      ...(p.aboutHeadline !== undefined ? { headline: p.aboutHeadline } : {}),
      ...(p.aboutBody !== undefined ? { body: p.aboutBody } : {}),
    }));
  const seo = {
    title: p.seoTitle ?? doc.seo.title,
    description: p.seoDescription ?? doc.seo.description,
  };
  return WebsiteDataV2Schema.parse({ ...doc, sections, seo });
}

/** Pure: ersetzt alle Angebots-Sektionen (services/menu/pricelist) durch genau eine neue an derselben Position. */
export function applyOffer(
  doc: WebsiteDataV2,
  offer: OfferPatch
): WebsiteDataV2 {
  const firstIdx = doc.sections.findIndex(s => OFFER_TYPES.has(s.type));
  const without = doc.sections.filter(s => !OFFER_TYPES.has(s.type));
  const section: SectionV2 =
    offer.mode === "services"
      ? {
          type: "services",
          headline: offer.headline,
          ...(offer.intro ? { intro: offer.intro } : {}),
          items: offer.items,
        }
      : {
          type: offer.mode,
          ...(offer.headline ? { headline: offer.headline } : {}),
          categories: offer.categories,
        };
  let sections: SectionV2[];
  if (firstIdx >= 0) {
    const removedBefore = doc.sections
      .slice(0, firstIdx)
      .filter(s => OFFER_TYPES.has(s.type)).length;
    const at = firstIdx - removedBefore;
    sections = [...without.slice(0, at), section, ...without.slice(at)];
  } else sections = insertAfter(without, "hero", section);
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}

/**
 * Pure: mergt Feature-Flags (contactForm/aiChat/booking) ins Dokument.
 * `patch` überschreibt vorhandene Keys; Keys mit Wert `false` werden nicht
 * gespeichert (kein `false` im Dokument). Bleibt kein aktives (`true`) Feature
 * übrig, wird das gesamte `features`-Objekt entfernt statt leer/false zu
 * persistieren.
 */
export function applyFeatures(
  doc: WebsiteDataV2,
  patch: SiteFeatures
): WebsiteDataV2 {
  const merged: SiteFeatures = { ...(doc.features ?? {}), ...patch };
  const active = Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value === true)
  ) as SiteFeatures;
  const { features: _currentFeatures, ...rest } = doc;
  const next: WebsiteDataV2 =
    Object.keys(active).length > 0 ? { ...rest, features: active } : rest;
  return WebsiteDataV2Schema.parse(next);
}
