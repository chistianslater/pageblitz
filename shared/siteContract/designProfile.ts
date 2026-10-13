/**
 * Persistiertes Designprofil einer v2-Website (Schema-Felder).
 *
 * Seit den Designsystemen (rev 3) lesen die Seiten davon nur noch
 * `composition === "stage"` und `hiddenElements`; neue Seiten bekommen
 * `DEFAULT_DESIGN_PROFILE` + Einstieg (shared/designSystems/entry.ts). Die
 * übrigen Felder bleiben im Schema, damit gespeicherte Stände parsebar
 * bleiben.
 */

export const HERO_LAYOUTS = [
  "split",
  "centered",
  "compact",
  "image-first",
  // Collage (2026-08-30) und Banner (2026-08-31): Pack-Zeit, nur noch für
  // gespeicherte Profile gültig.
  "collage",
  "banner",
] as const;
export const SERVICES_LAYOUTS = ["list", "grid", "featured"] as const;
export const ABOUT_LAYOUTS = ["image-left", "image-right"] as const;
export const GALLERY_LAYOUTS = [
  "grid",
  "mosaic",
  "filmstrip",
  // Masonry (Backlog 13c): Pack-Zeit, nur für gespeicherte Profile.
  "masonry",
] as const;
/**
 * Backlog 13c Rest (2026-08-31): Bewertungen- und Kontakt-Layout. Beide
 * Felder sind OPTIONAL — fehlt der Wert, bleibt der handgestaltete
 * Pack-Look ("stack" = untereinander/Pack-Default erzwungen als Variante).
 * Der Generator wählt sie nie; nur Picker/KI-Chat setzen sie aktiv.
 */
export const TESTIMONIALS_LAYOUTS = ["stack", "grid", "carousel"] as const;
export const CONTACT_LAYOUTS = ["stack", "split"] as const;
export type TestimonialsLayout = (typeof TESTIMONIALS_LAYOUTS)[number];
export type ContactLayout = (typeof CONTACT_LAYOUTS)[number];
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
  /** Curated whole-page recipe, used only by design revision 2. */
  composition?:
    | "editorial"
    | "portrait"
    | "panorama"
    | "statement"
    | "stage"
    | "colorfield";
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
  /** Bewertungen-Layout (13c); fehlt es, gilt der Pack-Look. */
  testimonialsLayout?: TestimonialsLayout;
  testimonialsLayoutMobile?: TestimonialsLayout;
  /** Kontakt-Layout (13c); fehlt es, gilt der Pack-Look. */
  contactLayout?: ContactLayout;
  contactLayoutMobile?: ContactLayout;
  /**
   * Bilder der Hero-Collage (2026-09-03, Betreiber: „beim Stil Collage kann
   * ich die weiteren Fotos nicht auswählen"). Fehlt das Feld, wählt
   * `heroCollageImages()` wie bisher automatisch (Galerie, dann Über uns).
   * Eine leere Liste heißt bewusst „keine Karten".
   */
  heroCollageImages?: string[];
  /**
   * Fassung des Einstiegs (Bühne: split/center/bottom, Farbfläche:
   * arch/stack/duo als 0/1/2). Fehlt das Feld, gilt die Fassung des Packs.
   * Gesetzt von der Design-Auswahl, damit jede Alternative anders aussieht.
   */
  entryVariant?: 0 | 1 | 2;
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

/** Stabiler 32-Bit-FNV-1a-Hash, identisch in Node und Browser. */
export function designSeed(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
