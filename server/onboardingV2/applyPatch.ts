import { TRPCError } from "@trpc/server";
import { WORLD_ROLES } from "../../shared/stylePacks/colorWorlds";
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
    /**
     * Farbwelt (P10): vollständiges Grundrollen-Set aus getColorWorld —
     * `null` setzt auf Original zurück (Grundrollen löschen, accent bleibt).
     */
    worldOverrides?: Record<string, string> | null;
  }
): WebsiteDataV2 {
  const next: WebsiteDataV2 = { ...doc };
  if (patch.worldOverrides !== undefined) {
    const overrides = { ...(doc.colorOverrides ?? {}) };
    for (const role of WORLD_ROLES) delete overrides[role];
    if (patch.worldOverrides) {
      for (const [role, hex] of Object.entries(patch.worldOverrides)) {
        overrides[role] = hex;
      }
    }
    if (Object.keys(overrides).length > 0) next.colorOverrides = overrides;
    else delete next.colorOverrides;
  }
  if (patch.accent !== undefined) {
    const overrides = { ...(next.colorOverrides ?? {}) };
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
 * Firmenlogo (2026-08-31): alle 20 Packs rendern `doc.logo` seit jeher
 * (Bild-Marke statt Textmarke in Nav/Footer) — dies ist der erste
 * Schreibpfad dafür. `null` entfernt das Logo (zurück zur Textmarke).
 */
export function applyLogo(
  doc: WebsiteDataV2,
  logoUrl: string | null
): WebsiteDataV2 {
  const next: WebsiteDataV2 = { ...doc };
  if (logoUrl === null) delete next.logo;
  else next.logo = { kind: "image", url: logoUrl };
  return WebsiteDataV2Schema.parse(next);
}

/**
 * Partner/Zertifikate (2026-08-31): schreibt die partners-Sektion aus dem
 * Fotos-Panel — leere Liste entfernt sie, sonst wird sie ersetzt bzw. nach
 * den Bewertungen (Fallback: vor Kontakt) eingefügt.
 */
export function applyPartners(
  doc: WebsiteDataV2,
  patch: {
    headline?: string;
    items: { imageUrl: string; name: string; url?: string }[];
  }
): WebsiteDataV2 {
  let sections: SectionV2[];
  if (patch.items.length === 0) {
    sections = doc.sections.filter(s => s.type !== "partners");
  } else {
    const headline = patch.headline?.trim();
    const section: SectionV2 = {
      type: "partners",
      ...(headline ? { headline } : {}),
      items: patch.items,
    };
    const existingIdx = doc.sections.findIndex(s => s.type === "partners");
    sections =
      existingIdx >= 0
        ? doc.sections.map((s, i) => (i === existingIdx ? section : s))
        : insertAfter(doc.sections, "testimonials", section);
  }
  return WebsiteDataV2Schema.parse({ ...doc, sections });
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

export type AddonHeadingType = "contact" | "gallery" | "menu" | "pricelist";

/** Optionale Überschriften für bereits vorhandene Extra-/Kontaktsektionen. */
export function applyAddonHeadings(
  doc: WebsiteDataV2,
  headings: Partial<Record<AddonHeadingType, string>>
): WebsiteDataV2 {
  const sections = doc.sections.map(section => {
    if (
      section.type !== "contact" &&
      section.type !== "gallery" &&
      section.type !== "menu" &&
      section.type !== "pricelist"
    )
      return section;
    if (!(section.type in headings)) return section;
    const value = headings[section.type]?.trim();
    const next = { ...section };
    if (value) next.headline = value;
    else delete next.headline;
    return next;
  });
  return WebsiteDataV2Schema.parse({ ...doc, sections });
}

/** Angebots-Sektionstypen. Leistungen (Basis) und Extra-Speisekarte/Preisliste dürfen nebeneinander stehen. */
const OFFER_INSERT_AFTER: Record<
  "services" | "menu" | "pricelist",
  SectionType[]
> = {
  services: ["hero"],
  menu: ["services", "hero"],
  pricelist: ["menu", "services", "hero"],
};

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
  // Leere Strings/fehlende URLs dürfen vorhandene Platzhalter nicht
  // ausreißen — nur eine echte neue URL ersetzt Hero/About.
  if (patch.hero)
    sections = replaceSection(sections, "hero", s => ({
      ...s,
      imageUrl: patch.hero,
    }));
  if (patch.about)
    sections = replaceSection(sections, "about", s => ({
      ...s,
      imageUrl: patch.about,
    }));
  if (patch.gallery !== undefined || patch.galleryAlbums !== undefined) {
    const existing = sections.find(s => s.type === "gallery") as
      | SectionOf<"gallery">
      | undefined;
    const without = sections.filter(s => s.type !== "gallery");
    // Nicht mitgeschickte Teile bleiben erhalten — ein reiner Bild-Patch
    // darf bestehende Alben nicht verwerfen (und umgekehrt).
    const images = patch.gallery ?? existing?.images ?? [];
    const albums = (patch.galleryAlbums ?? existing?.albums ?? []).filter(
      album => album.images.length > 0
    );
    if (images.length === 0 && albums.length === 0) sections = without;
    else {
      const gallery: SectionOf<"gallery"> = {
        type: "gallery",
        headline: existing?.headline ?? "Einblicke",
        // Schema verlangt images.min(1): existiert nur ein Album, rückt
        // dessen erstes Bild als Hauptbild nach (Anzeige bleibt gleich —
        // die Website flacht ohnehin Hauptliste + Alben zusammen).
        images: images.length > 0 ? images : [albums[0]!.images[0]!],
        ...(albums.length > 0 ? { albums } : {}),
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
  // Story (Backlog 13e): replaceSection ist ohne story-Sektion ein No-op —
  // das Panel zeigt die Felder ohnehin nur, wenn die Sektion existiert.
  if (p.storyHeadline !== undefined || p.storyBody !== undefined)
    sections = replaceSection(sections, "story", s => ({
      ...s,
      ...(p.storyHeadline !== undefined ? { headline: p.storyHeadline } : {}),
      ...(p.storyBody !== undefined ? { body: p.storyBody } : {}),
    }));
  const seo = {
    title: p.seoTitle ?? doc.seo.title,
    description: p.seoDescription ?? doc.seo.description,
  };
  return WebsiteDataV2Schema.parse({ ...doc, sections, seo });
}

/** Pure: schreibt die Sektion des gewählten Typs. Andere Angebotstypen bleiben — Leistungen sind Basis, Speisekarte/Preisliste Extra. */
export function applyOffer(
  doc: WebsiteDataV2,
  offer: OfferPatch
): WebsiteDataV2 {
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
  const existingIdx = doc.sections.findIndex(s => s.type === section.type);
  let sections: SectionV2[];
  if (existingIdx >= 0) {
    sections = doc.sections.map((s, i) => (i === existingIdx ? section : s));
  } else {
    sections = doc.sections;
    let inserted = false;
    for (const afterType of OFFER_INSERT_AFTER[offer.mode]) {
      const idx = sections.findIndex(s => s.type === afterType);
      if (idx >= 0) {
        sections = [
          ...sections.slice(0, idx + 1),
          section,
          ...sections.slice(idx + 1),
        ];
        inserted = true;
        break;
      }
    }
    if (!inserted) sections = insertAfter(sections, null, section);
  }
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
