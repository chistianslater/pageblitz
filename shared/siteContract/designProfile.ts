/**
 * Persistiertes Designprofil einer v2-Website.
 *
 * Eine `stylePackId` ist nur noch die kuratierte Designrichtung
 * (Typografie-/Farb-/Formsprache). Das Profil variiert die Komposition
 * innerhalb dieser Richtung. Bestehende Dokumente ohne Profil rendern mit
 * DEFAULT_DESIGN_PROFILE exakt wie bisher (Rückwärtskompatibilität).
 */

export const HERO_LAYOUTS = ["split", "centered", "compact"] as const;
export const SERVICES_LAYOUTS = ["list", "grid", "featured"] as const;
export const ABOUT_LAYOUTS = ["image-left", "image-right"] as const;
export const GALLERY_LAYOUTS = ["grid", "mosaic", "filmstrip"] as const;
export const DESIGN_DENSITIES = ["airy", "compact"] as const;
export const IMAGE_TREATMENTS = ["natural", "framed", "bleed"] as const;

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
  /** Deterministischer Salt für Kollisionsschutz und spätere Varianten. */
  seed: number;
}

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
    : (hero.headline?.length ?? 0) > 48
      ? "compact"
      : pick(HERO_LAYOUTS, seed, 1);
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
    imageTreatment: hasImages
      ? pick(IMAGE_TREATMENTS, seed, 5)
      : "natural",
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
