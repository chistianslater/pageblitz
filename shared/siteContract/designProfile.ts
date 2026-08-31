/**
 * Persistiertes Designprofil einer v2-Website.
 *
 * Eine `stylePackId` ist nur noch die kuratierte Designrichtung
 * (Typografie-/Farb-/Formsprache). Das Profil variiert die Komposition
 * innerhalb dieser Richtung. Bestehende Dokumente ohne Profil rendern mit
 * DEFAULT_DESIGN_PROFILE exakt wie bisher (Rückwärtskompatibilität).
 */

export const HERO_LAYOUTS = [
  "split",
  "centered",
  "compact",
  "image-first",
  // Collage (2026-08-30, „3 Fotos im Hero"): Hauptbild + bis zu zwei
  // Galerie-Bilder als gestapelte Karten (heroCollage.tsx). Bewusst NICHT
  // in HERO_LAYOUT_CHOICES — der Generator wählt sie nie zufällig, nur
  // Kunde/KI-Chat schalten sie aktiv.
  "collage",
] as const;
/** Picker und Generator: compact bleibt nur für bestehende Profile gültig. */
export const HERO_LAYOUT_CHOICES = [
  "split",
  "centered",
  "image-first",
] as const;
export const SERVICES_LAYOUTS = ["list", "grid", "featured"] as const;
export const ABOUT_LAYOUTS = ["image-left", "image-right"] as const;
export const GALLERY_LAYOUTS = ["grid", "mosaic", "filmstrip"] as const;
export const DESIGN_DENSITIES = ["airy", "compact"] as const;
export const IMAGE_TREATMENTS = ["natural", "framed", "bleed"] as const;
/** Schmuck-Illustrationen (`pb-deco`-Elemente): "off" blendet sie aus. */
export const DECORATION_MODES = ["on", "off"] as const;
/**
 * Deko granular (Backlog 13d, 2026-08-31): semantische Gruppen der
 * pb-deco-Elemente, einzeln ausblendbar (`data-pb-deco-off`-Attribut) —
 * blobs = organische Farbflächen (ernte/morgenlicht), dots = Punktraster
 * (ernte), sprigs = Zweig-Illustrationen (ernte), ornaments =
 * Trennornamente/Bordüren (gusto/marktplatz/zunft). `decorations: "off"`
 * bleibt der Alles-aus-Schalter.
 */
export const DECORATION_GROUPS = [
  "blobs",
  "dots",
  "sprigs",
  "ornaments",
] as const;
export type DecorationGroup = (typeof DECORATION_GROUPS)[number];
/**
 * Einzeln ausblendbare Sektions-Elemente (2026-08-31, „Bild weg, Text wird
 * breiter"): das Layout passt sich zentral an (DESIGN_PROFILE_CSS,
 * `data-pb-he`-Attribut). Nicht-destruktiv — die Bild-URLs bleiben im
 * Dokument, Wiedereinblenden bringt alles zurück.
 */
export const HIDEABLE_ELEMENTS = ["hero-media", "about-media"] as const;
export type HideableElement = (typeof HIDEABLE_ELEMENTS)[number];

export type HeroLayout = (typeof HERO_LAYOUTS)[number];
export type ServicesLayout = (typeof SERVICES_LAYOUTS)[number];
export type AboutLayout = (typeof ABOUT_LAYOUTS)[number];
export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number];
export type DesignDensity = (typeof DESIGN_DENSITIES)[number];
export type ImageTreatment = (typeof IMAGE_TREATMENTS)[number];

export interface DesignProfile {
  version: 1;
  heroLayout: HeroLayout;
  servicesLayout: ServicesLayout;
  aboutLayout: AboutLayout;
  galleryLayout: GalleryLayout;
  density: DesignDensity;
  imageTreatment: ImageTreatment;
  /** Mobil-Layouts; fehlen sie, gilt die Desktop-Wahl auch auf dem Smartphone. */
  heroLayoutMobile?: HeroLayout;
  servicesLayoutMobile?: ServicesLayout;
  aboutLayoutMobile?: AboutLayout;
  galleryLayoutMobile?: GalleryLayout;
  /** Schmuck-Illustrationen aus-/einblenden; fehlt das Feld, gilt "on". */
  decorations?: (typeof DECORATION_MODES)[number];
  /** Einzeln ausgeblendete Sektions-Elemente (Hero-/Über-uns-Bild). */
  hiddenElements?: HideableElement[];
  /** Einzeln ausgeblendete Deko-Gruppen (granular statt Alles-aus). */
  hiddenDecorations?: DecorationGroup[];
  /** Deterministischer Salt für Kollisionsschutz und spätere Varianten. */
  seed: number;
}

export type LayoutViewport = "desktop" | "mobile";

export type SectionLayoutField =
  | "heroLayout"
  | "servicesLayout"
  | "aboutLayout"
  | "galleryLayout";

export type LayoutOverlay = Partial<Record<SectionLayoutField, string>>;

export const MOBILE_LAYOUT_FIELD: Record<
  SectionLayoutField,
  | "heroLayoutMobile"
  | "servicesLayoutMobile"
  | "aboutLayoutMobile"
  | "galleryLayoutMobile"
> = {
  heroLayout: "heroLayoutMobile",
  servicesLayout: "servicesLayoutMobile",
  aboutLayout: "aboutLayoutMobile",
  galleryLayout: "galleryLayoutMobile",
};

export const DEFAULT_DESIGN_PROFILE: DesignProfile = {
  version: 1,
  heroLayout: "split",
  servicesLayout: "list",
  aboutLayout: "image-right",
  galleryLayout: "grid",
  density: "airy",
  imageTreatment: "natural",
  seed: 0,
};

interface ProfileSection {
  type: string;
  headline?: string;
  imageUrl?: string;
  items?: unknown[];
  images?: unknown[];
}

export interface DesignProfileInput {
  stylePackId?: string;
  businessName: string;
  businessCategory?: string;
  sections: ProfileSection[];
}

/** Stabiler 32-Bit-FNV-1a-Hash, identisch in Node und Browser. */
export function designSeed(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pick<T>(values: readonly T[], seed: number, offset: number): T {
  return values[(seed + offset * 2654435761) % values.length];
}

/**
 * Inhaltsbasierte, deterministische Ableitung:
 * - kein Hero-Foto → centered; sehr lange Headline → compact
 * - viele Leistungen → grid; wenige → featured
 * - Galeriegröße steuert grid/mosaic/filmstrip
 * - viele Sektionen/Leistungen → compact
 * - Bildbehandlung variiert deterministisch, aber nur wenn Bilder existieren
 *
 * `salt` wird vom Kollisionsschutz erhöht, wenn eine visuell identische
 * Kombination in derselben Branche bereits existiert.
 */
export function deriveDesignProfile(
  input: DesignProfileInput,
  salt = 0
): DesignProfile {
  const hero = input.sections.find(s => s.type === "hero");
  const services = input.sections.find(s => s.type === "services");
  const about = input.sections.find(s => s.type === "about");
  const gallery = input.sections.find(s => s.type === "gallery");
  const serviceCount = services?.items?.length ?? 0;
  const galleryCount = gallery?.images?.length ?? 0;
  const hasImages = Boolean(
    hero?.imageUrl || about?.imageUrl || galleryCount > 0
  );
  const seed = designSeed(
    `${input.stylePackId ?? ""}|${input.businessName}|${input.businessCategory ?? ""}|${salt}`
  );

  const heroLayout: HeroLayout = !hero?.imageUrl
    ? "centered"
    : pick(HERO_LAYOUT_CHOICES, seed, 1);
  const servicesLayout: ServicesLayout =
    serviceCount >= 5
      ? "grid"
      : serviceCount > 0 && serviceCount <= 3
        ? "featured"
        : pick(SERVICES_LAYOUTS, seed, 2);
  const galleryLayout: GalleryLayout =
    galleryCount >= 5
      ? "mosaic"
      : galleryCount > 0 && galleryCount <= 3
        ? "filmstrip"
        : pick(GALLERY_LAYOUTS, seed, 3);

  return {
    version: 1,
    heroLayout,
    servicesLayout,
    aboutLayout: pick(ABOUT_LAYOUTS, seed, 4),
    galleryLayout,
    density:
      input.sections.length >= 7 || serviceCount >= 6 ? "compact" : "airy",
    imageTreatment: hasImages ? pick(IMAGE_TREATMENTS, seed, 5) : "natural",
    seed,
  };
}

/**
 * Sichtbarer Fingerprint (Pack + Profil + Theme). `seed` zählt absichtlich
 * nicht separat: zwei Profile mit identischer Darstellung sind eine
 * Kollision, auch wenn sie durch verschiedene Seeds entstanden.
 */
export function designFingerprint(input: {
  stylePackId: string;
  profile: DesignProfile;
  fontPairId?: string | null;
  accent?: string | null;
}): string {
  const p = input.profile;
  return [
    input.stylePackId,
    p.heroLayout,
    p.servicesLayout,
    p.aboutLayout,
    p.galleryLayout,
    p.heroLayoutMobile ?? "",
    p.servicesLayoutMobile ?? "",
    p.aboutLayoutMobile ?? "",
    p.galleryLayoutMobile ?? "",
    p.density,
    p.imageTreatment,
    input.fontPairId ?? "pack-font",
    input.accent?.toLowerCase() ?? "pack-accent",
  ].join("|");
}

/**
 * Probiert deterministisch weitere Salts, bis kein belegter Fingerprint mehr
 * getroffen wird. Nach 32 Versuchen ist die endliche Variantenmenge
 * ausgeschöpft; dann bleibt die letzte deterministische Kombination.
 */
export function deriveDistinctDesignProfile(
  input: DesignProfileInput & {
    stylePackId: string;
    fontPairId?: string | null;
    accent?: string | null;
  },
  occupied: ReadonlySet<string>
): DesignProfile {
  let profile = deriveDesignProfile(input, 0);
  for (let salt = 0; salt < 32; salt += 1) {
    profile = deriveDesignProfile(input, salt);
    const fingerprint = designFingerprint({
      stylePackId: input.stylePackId,
      profile,
      fontPairId: input.fontPairId,
      accent: input.accent,
    });
    if (!occupied.has(fingerprint)) return profile;
  }
  return profile;
}
