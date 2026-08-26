import { TRPCError } from "@trpc/server";
import type {
  ImagesPatch,
  OfferPatch,
  PagesPatch,
  TeamPatch,
  TextsPatch,
} from "../../shared/onboardingV2/patches";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import {
  PACK_IDS,
  type PackId,
  type DesignProfile,
  type SectionOf,
  type SectionType,
  type SectionV2,
  type SiteAddOns,
  type SiteFeatures,
  type WebsiteDataV2,
} from "../../shared/siteContract/types";
import { deriveDesignProfile } from "../../shared/siteContract/designProfile";
import { collectInlineTextTargets } from "../../shared/onboardingV2/inlineText";
import {
  ADDON_KEYS,
  FEATURE_ADDON_KEYS,
  SECTION_ADDON_KEYS,
  type AddOnFlags,
  type FeatureAddOnKey,
  type SectionAddOnKey,
} from "../../shared/pricing";

export function parsePackId(value: string): PackId {
  if ((PACK_IDS as readonly string[]).includes(value)) return value as PackId;
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: `Unbekannte Designrichtung: "${value}"`,
  });
}

/** Pure: neues, schema-validiertes Dokument mit anderem Pack; Inhalte bleiben 1:1. */
export function applyStylePack(
  doc: WebsiteDataV2,
  packId: PackId
): WebsiteDataV2 {
  const designProfile = deriveDesignProfile({
    stylePackId: packId,
    businessName: doc.businessName,
    businessCategory: doc.businessCategory,
    sections: doc.sections,
  });
  return WebsiteDataV2Schema.parse({
    ...doc,
    stylePackId: packId,
    designProfile,
  });
}

/**
 * Pure: Studio-Theme-Editor (2026-08-24) — Akzent-Override und/oder
 * kuratierte Schriftpaarung. `null` entfernt die jeweilige Wahl (zurück
 * zur Pack-Standardfarbe/-schrift), `undefined` lässt sie unangetastet.
 * Die fontPairId ist router-seitig bereits gegen FONT_PAIRS validiert.
 */
export function applyTheme(
  doc: WebsiteDataV2,
  patch: {
    accent?: string | null;
    fontPairId?: string | null;
    designProfile?: DesignProfile;
  }
): WebsiteDataV2 {
  const next: WebsiteDataV2 = { ...doc };
  if (patch.accent !== undefined) {
    const overrides = { ...(doc.colorOverrides ?? {}) };
    if (patch.accent === null) delete overrides.accent;
    else overrides.accent = patch.accent;
    if (Object.keys(overrides).length > 0) next.colorOverrides = overrides;
    else delete next.colorOverrides;
  }
  if (patch.fontPairId !== undefined) {
    if (patch.fontPairId === null) delete next.fontPairId;
    else next.fontPairId = patch.fontPairId;
  }
  if (patch.designProfile !== undefined) {
    next.designProfile = patch.designProfile;
  }
  return WebsiteDataV2Schema.parse(next);
}

/**
 * Direkte Vorschau-Bearbeitung: ausschließlich Pfade, die aus dem aktuellen
 * Dokument selbst als sichtbare Textziele abgeleitet wurden. Kein freier
 * JSON-Patch, keine URLs/SEO/Legal-Felder.
 */
export function applyInlineText(
  doc: WebsiteDataV2,
  path: string,
  rawValue: string
): WebsiteDataV2 {
  const target = collectInlineTextTargets(doc).find(item => item.path === path);
  if (!target) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Dieser Text kann nicht direkt bearbeitet werden.",
    });
  }
  const value = rawValue.trim();
  if (!value || value.length > target.maxLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Bitte gib einen Text mit maximal ${target.maxLength} Zeichen ein.`,
    });
  }

  const next = structuredClone(doc) as WebsiteDataV2;
  const segments = path.split(".");
  let cursor: any = next;
  for (let i = 0; i < segments.length - 1; i += 1) {
    cursor = cursor[segments[i]];
    if (cursor === undefined || cursor === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Textstelle nicht mehr vorhanden.",
      });
    }
  }
  cursor[segments[segments.length - 1]] = value;
  return WebsiteDataV2Schema.parse(next);
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
    // Wie applyOffer: eine leere/nur-Leerzeichen-Überschrift im Patch wird
    // nicht als Sektionswert übernommen, sonst würde `section.headline ??
    // FALLBACK_TITLES.team` (Pack-Renderer) sie nicht als "fehlt" erkennen
    // (`??` fällt nur bei null/undefined zurück, nicht bei "").
    const headline =
      p.headline !== undefined
        ? p.headline.trim() || undefined
        : existing?.headline;
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

/**
 * Pure: ersetzt die Unterseiten (`pages`) komplett — wie `applyTeam` für die
 * Team-Sektion, aber auf Dokument-Ebene statt einer Sektion: `pages: []`
 * entfernt das Feld (kein leeres Array im Dokument), sonst wird `pages`
 * 1:1 durch den Patch ersetzt (keine Merge-Logik je Page — das Studio
 * schickt immer den vollständigen Stand, siehe `PagesEditor`, Task 5).
 */
export function applyPages(doc: WebsiteDataV2, p: PagesPatch): WebsiteDataV2 {
  const { pages: _current, ...rest } = doc;
  const next: WebsiteDataV2 =
    p.pages.length > 0 ? { ...rest, pages: p.pages } : rest;
  return WebsiteDataV2Schema.parse(next);
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

/**
 * Pure: mergt Sektions-Add-ons (gallery/menu/pricelist/team/subpages) als
 * `addOns` ins Dokument — dieselbe Semantik wie `applyFeatures`: nur `true`
 * wird gespeichert, `false` entfernt den Key, ohne aktives Add-on verschwindet
 * das Objekt. Die zugehörigen Sektionen/`pages[]` bleiben unangetastet
 * (Plan B6 Task 6: ausblenden statt löschen — das Gating macht
 * `visibleSections`/`visiblePages` in client/src/components/site/engine.ts).
 */
export function applyAddOns(
  doc: WebsiteDataV2,
  patch: Partial<SiteAddOns>
): WebsiteDataV2 {
  const merged: SiteAddOns = { ...(doc.addOns ?? {}), ...patch };
  const active = Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value === true)
  ) as SiteAddOns;
  const { addOns: _currentAddOns, ...rest } = doc;
  const next: WebsiteDataV2 =
    Object.keys(active).length > 0 ? { ...rest, addOns: active } : rest;
  return WebsiteDataV2Schema.parse(next);
}

/**
 * Pure Umkehrung von `applyAddOnFlags`: liest alle acht Add-on-Flags aus dem
 * Dokument (`features` für FEATURE_ADDON_KEYS, `addOns` für
 * SECTION_ADDON_KEYS; subpages steht in beiden — true, sobald eines gesetzt
 * ist). Fehlende Keys → false. Genutzt von `buildState`, wenn nach dem
 * Checkout kein `subscriptions.addOns`-JSON vorliegt (Admin-/Test-
 * Freischaltung): dann ist das Dokument die Wahrheit (Spec B6 §2.2).
 */
export function addOnFlagsFromDoc(doc: WebsiteDataV2): Required<AddOnFlags> {
  const result = {} as Required<AddOnFlags>;
  for (const key of ADDON_KEYS) {
    const fromFeatures =
      (FEATURE_ADDON_KEYS as readonly string[]).includes(key) &&
      doc.features?.[key as FeatureAddOnKey] === true;
    const fromAddOns =
      (SECTION_ADDON_KEYS as readonly string[]).includes(key) &&
      doc.addOns?.[key as SectionAddOnKey] === true;
    result[key] = fromFeatures || fromAddOns;
  }
  return result;
}

/**
 * Pure: verteilt die acht Add-on-Flags (shared/pricing.ts) auf
 * `features` (FEATURE_ADDON_KEYS) und `addOns` (SECTION_ADDON_KEYS) — nur
 * tatsächlich übergebene Keys werden geschrieben. Eine Berechnung für alle
 * Schreibpfade (Studio-Extras, Checkout-Webhook, Subscription-Update,
 * Dashboard-Kauf), damit Dokument und Abrechnung denselben Stand zeigen.
 */
export function applyAddOnFlags(
  doc: WebsiteDataV2,
  flags: AddOnFlags
): WebsiteDataV2 {
  const features: SiteFeatures = {};
  for (const key of FEATURE_ADDON_KEYS) {
    if (flags[key] !== undefined) features[key] = flags[key];
  }
  const addOns: Partial<SiteAddOns> = {};
  for (const key of SECTION_ADDON_KEYS) {
    if (flags[key] !== undefined) addOns[key] = flags[key];
  }
  return applyAddOns(applyFeatures(doc, features), addOns);
}
