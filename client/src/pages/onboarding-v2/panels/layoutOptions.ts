import type {
  AboutLayout,
  DesignDensity,
  GalleryLayout,
  HeroLayout,
  ImageTreatment,
  ServicesLayout,
} from "@shared/siteContract/designProfile";

export type LayoutField =
  | "heroLayout"
  | "servicesLayout"
  | "aboutLayout"
  | "galleryLayout";

export const HERO_LAYOUT_OPTIONS: readonly {
  value: HeroLayout;
  label: string;
}[] = [
  { value: "split", label: "Bild & Text" },
  { value: "centered", label: "Zentriert" },
  { value: "compact", label: "Kompakt" },
];

export const SERVICES_LAYOUT_OPTIONS: readonly {
  value: ServicesLayout;
  label: string;
}[] = [
  { value: "list", label: "Liste" },
  { value: "grid", label: "Raster" },
  { value: "featured", label: "Hervorgehoben" },
];

export const ABOUT_LAYOUT_OPTIONS: readonly {
  value: AboutLayout;
  label: string;
}[] = [
  { value: "image-left", label: "Bild links" },
  { value: "image-right", label: "Bild rechts" },
];

export const GALLERY_LAYOUT_OPTIONS: readonly {
  value: GalleryLayout;
  label: string;
}[] = [
  { value: "grid", label: "Raster" },
  { value: "mosaic", label: "Mosaik" },
  { value: "filmstrip", label: "Filmstreifen" },
];

export const DENSITY_OPTIONS: readonly {
  value: DesignDensity;
  label: string;
}[] = [
  { value: "airy", label: "Großzügig" },
  { value: "compact", label: "Kompakt" },
];

export const IMAGE_TREATMENT_OPTIONS: readonly {
  value: ImageTreatment;
  label: string;
}[] = [
  { value: "natural", label: "Natürlich" },
  { value: "framed", label: "Gerahmt" },
  { value: "bleed", label: "Flächig" },
];

interface LayoutFieldMeta<T extends string> {
  label: string;
  hint: string;
  options: readonly { value: T; label: string }[];
}

export const LAYOUT_FIELDS: {
  heroLayout: LayoutFieldMeta<HeroLayout>;
  servicesLayout: LayoutFieldMeta<ServicesLayout>;
  aboutLayout: LayoutFieldMeta<AboutLayout>;
  galleryLayout: LayoutFieldMeta<GalleryLayout>;
} = {
  heroLayout: {
    label: "Hero-Layout",
    hint: "So sitzen Bild und Text oben auf der Seite.",
    options: HERO_LAYOUT_OPTIONS,
  },
  servicesLayout: {
    label: "Leistungen-Layout",
    hint: "Liste, Raster oder eine hervorgehobene Karte.",
    options: SERVICES_LAYOUT_OPTIONS,
  },
  aboutLayout: {
    label: "Über-uns-Layout",
    hint: "Auf welcher Seite das Foto sitzt.",
    options: ABOUT_LAYOUT_OPTIONS,
  },
  galleryLayout: {
    label: "Galerie-Layout",
    hint: "Raster, Mosaik oder Filmstreifen.",
    options: GALLERY_LAYOUT_OPTIONS,
  },
};
