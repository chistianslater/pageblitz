/**
 * Stabile Layout-Haken in jedem Pack-DOM.
 *
 * Sektionslayouts setzt man in der Studio-Vorschau; `designProfile` liegt
 * als `data-pb-*` auf `.pb-site`. Die Packs bleiben visuell eigenständig,
 * markieren aber die Kompositions-Container mit `data-pb-slot`, damit
 * `DESIGN_PROFILE_CSS` in allen 14 Richtungen dieselben Varianten umsetzen
 * kann — ohne jedes Pack intern zu forken.
 */
export const LAYOUT_SLOT = {
  heroSplit: "hero-split",
  heroCopy: "hero-copy",
  heroMedia: "hero-media",
  servicesItems: "services-items",
  aboutGrid: "about-grid",
  aboutMedia: "about-media",
  galleryItems: "gallery-items",
  /**
   * Kontakt-Inhalts-Wrapper (Backlog 13c Rest): 18 Packs tragen den Slot;
   * karat/verve haben keinen Wrapper und laufen über den
   * `:not(:has(...))`-Fallback in DESIGN_PROFILE_CSS.
   */
  contactGrid: "contact-grid",
} as const;

export type LayoutSlot = (typeof LAYOUT_SLOT)[keyof typeof LAYOUT_SLOT];
