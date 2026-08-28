/**
 * Packübergreifende Kompositionsvarianten aus dem Studio-Seitenaufbau.
 *
 * Pack-CSS bleibt die Designrichtung. Diese Schicht greift über
 * `data-pb-slot` (siehe layoutSlots.ts) und die SECTION_ANCHORS.
 *
 * Desktop (`data-pb-hero` …) und Mobil (`data-pb-hero-mobile` …) sind
 * getrennt kuratierbar. Fehlt das Mobil-Attribut, gilt die Desktop-Wahl
 * auch auf dem Smartphone (bestehende Profile bleiben unverändert).
 *
 * `compact` am Hero bleibt als Legacy-CSS gültig, der Picker bietet es
 * nicht mehr — das war nur kleinere Typo, keine eigene Komposition.
 */

import { packLayoutRules } from "./packLayoutCss";

const SLOT = {
  heroSplit: '[data-pb-slot="hero-split"]',
  heroCopy: '[data-pb-slot="hero-copy"]',
  heroMedia: '[data-pb-slot="hero-media"]',
  servicesItems: '[data-pb-slot="services-items"]',
  aboutGrid: '[data-pb-slot="about-grid"]',
  aboutMedia: '[data-pb-slot="about-media"]',
  galleryItems: '[data-pb-slot="gallery-items"]',
} as const;

type AttrKind = "hero" | "services" | "about" | "gallery";
type ViewportMode = "desktop" | "mobile";

const ATTR: Record<AttrKind, string> = {
  hero: "data-pb-hero",
  services: "data-pb-services",
  about: "data-pb-about",
  gallery: "data-pb-gallery",
};

const ATTR_MOBILE: Record<AttrKind, string> = {
  hero: "data-pb-hero-mobile",
  services: "data-pb-services-mobile",
  about: "data-pb-about-mobile",
  gallery: "data-pb-gallery-mobile",
};

function sel(
  kind: AttrKind,
  attr: Record<AttrKind, string>,
  unless?: string
): string {
  const not = unless ? `:not([${unless}])` : "";
  return `.pb-site${not}[${attr[kind]}`;
}

function heroMediaInFlow(
  h: (k: AttrKind) => string,
  variant: string,
  order: string,
  maxWidth: string
): string {
  return `
${h("hero")}="${variant}"] #start ${SLOT.heroMedia},
${h("hero")}="${variant}"] #start ${SLOT.heroMedia} img{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;left:auto!important;bottom:auto!important;width:${maxWidth}!important;max-width:100%!important;height:auto!important;max-height:min(32rem,62vh)!important;order:${order}!important;clip-path:none!important;margin:0!important}
`;
}

function layoutRules(
  attr: Record<AttrKind, string>,
  unless?: Record<AttrKind, string>,
  mode: ViewportMode = "desktop"
): string {
  const h = (k: AttrKind) => sel(k, attr, unless?.[k]);
  const galleryCols =
    mode === "mobile"
      ? "repeat(2,minmax(0,1fr))"
      : "repeat(auto-fit,minmax(220px,1fr))";
  const mosaicCols =
    mode === "mobile" ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))";
  const filmCols = mode === "mobile" ? "82%" : "minmax(240px,42%)";
  const splitHero =
    mode === "desktop"
      ? `
${h("hero")}="split"] #start ${SLOT.heroSplit}{display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)!important;align-items:center!important;gap:clamp(1.5rem,4vw,3.5rem)!important}
`
      : `
${h("hero")}="split"] #start ${SLOT.heroSplit}{display:flex!important;flex-direction:column!important;grid-template-columns:1fr!important}
`;

  return `
${splitHero}
${h("hero")}="centered"] #start{text-align:center!important}
${h("hero")}="centered"] #start ${SLOT.heroSplit}{display:flex!important;flex-direction:column!important;align-items:center!important;grid-template-columns:1fr!important;text-align:center!important;gap:clamp(1.5rem,4vw,2.75rem)!important}
${h("hero")}="centered"] #start ${SLOT.heroCopy}{text-align:center!important;margin-inline:auto!important;max-width:46rem;order:1!important}
${h("hero")}="centered"] #start :is(h1,p,a,.pb-pa-cta,.pb-wb-cta,.pb-gu-cta,.pb-lg-cta,.pb-sc-cta,.pb-kz-link,.pb-kw-hero-cta,.pb-ml-cta,.pb-fd-cta,.pb-vv-cta,.pb-zf-cta,.pb-mp-cta,.pb-sn-cta,.pb-at-lnk){margin-left:auto!important;margin-right:auto!important}
${heroMediaInFlow(h, "centered", "2", "min(100%,42rem)")}
${h("hero")}="centered"] #start ${SLOT.heroMedia}{margin-inline:auto!important}

${h("hero")}="image-first"] #start{display:flex!important;flex-direction:column!important;min-height:auto!important;text-align:left!important;overflow:visible!important}
${h("hero")}="image-first"] #start ${SLOT.heroSplit}{display:flex!important;flex-direction:column!important;align-items:stretch!important;grid-template-columns:1fr!important;text-align:left!important;gap:clamp(1.25rem,3vw,2.25rem)!important}
${h("hero")}="image-first"] #start ${SLOT.heroCopy}{text-align:left!important;margin-inline:0!important;order:2!important;max-width:none}
${heroMediaInFlow(h, "image-first", "-1", "100%")}

${h("hero")}="compact"] #start{min-height:auto!important;padding-top:clamp(2.5rem,6vw,5rem)!important;padding-bottom:clamp(2.5rem,6vw,5rem)!important}
${h("hero")}="compact"] #start h1{font-size:clamp(2rem,6.5vw,4.6rem)!important;max-width:14ch}

${h("services")}="list"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:flex!important;flex-direction:column!important;grid-template-columns:1fr!important;gap:clamp(.75rem,1.5vw,1.25rem)!important}
${h("services")}="list"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>*{grid-column:auto!important;width:100%!important}
${h("services")}="grid"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
${h("services")}="grid"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>*{grid-column:auto!important}
${h("services")}="featured"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
${h("services")}="featured"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>:first-child{grid-column:1/-1!important}
${h("services")}="grid"] #leistungen:not(:has(${SLOT.servicesItems})){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
${h("services")}="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>h2,
${h("services")}="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>header,
${h("services")}="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>p{grid-column:1/-1}
${h("services")}="featured"] #leistungen:not(:has(${SLOT.servicesItems})){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
${h("services")}="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>h2,
${h("services")}="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>header,
${h("services")}="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>p{grid-column:1/-1}

${h("about")}] ${SLOT.aboutGrid}{display:grid!important;grid-template-columns:${
    mode === "mobile" ? "1fr" : "repeat(2,minmax(0,1fr))"
  }!important;align-items:${mode === "mobile" ? "stretch" : "center"}!important;gap:clamp(1.5rem,4vw,4rem)!important}
${h("about")}="image-left"] ${SLOT.aboutMedia}{order:-1!important}
${h("about")}="image-right"] ${SLOT.aboutMedia}{order:2!important}

${h("gallery")}="grid"] ${SLOT.galleryItems}{display:grid!important;grid-template-columns:${galleryCols}!important;grid-auto-flow:row!important;gap:clamp(.5rem,1.5vw,1.25rem)!important;overflow:visible!important}
${h("gallery")}="grid"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;width:100%!important;max-width:none!important;height:auto!important}
${h("gallery")}="grid"] ${SLOT.galleryItems} img{width:100%!important;height:clamp(180px,28vw,280px)!important;object-fit:cover!important}
${h("gallery")}="mosaic"] ${SLOT.galleryItems}{display:grid!important;grid-template-columns:${mosaicCols}!important;grid-auto-flow:row!important;gap:clamp(.4rem,1vw,1rem)!important;overflow:visible!important}
${h("gallery")}="mosaic"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;width:100%!important}
${h("gallery")}="mosaic"] ${SLOT.galleryItems}>:first-child{grid-column:span 2!important;grid-row:${
    mode === "mobile" ? "auto" : "span 2"
  }!important}
${h("gallery")}="mosaic"] ${SLOT.galleryItems} img{width:100%!important;height:100%!important;min-height:160px!important;object-fit:cover!important}
${h("gallery")}="filmstrip"] ${SLOT.galleryItems}{display:grid!important;grid-auto-flow:column!important;grid-auto-columns:${filmCols}!important;grid-template-columns:none!important;overflow-x:auto!important;overscroll-behavior-inline:contain;scroll-snap-type:inline mandatory;gap:clamp(.5rem,1.5vw,1.25rem)!important;padding-bottom:.5rem}
${h("gallery")}="filmstrip"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;scroll-snap-align:start;width:auto!important}
${h("gallery")}="filmstrip"] ${SLOT.galleryItems} img{width:100%!important;height:clamp(200px,32vw,320px)!important;object-fit:cover!important}
`;
}

export const DESIGN_PROFILE_CSS = `
/* Dichte + Bildwirkung gelten auf allen Viewports */
.pb-site[data-pb-density="compact"] section{padding-top:clamp(2.5rem,5vw,4.5rem)!important;padding-bottom:clamp(2.5rem,5vw,4.5rem)!important}
.pb-site[data-pb-density="compact"] #start{min-height:auto!important}
.pb-site[data-pb-image="framed"] :is(#start,#ueber-uns,#galerie) img{border:1px solid var(--pb-line)!important;border-radius:clamp(8px,1.5vw,18px)!important;padding:clamp(3px,.5vw,7px)!important;background:var(--pb-surface)!important}
.pb-site[data-pb-image="bleed"] :is(#start,#ueber-uns,#galerie) img{border-radius:0!important}

@media(min-width:721px){
${layoutRules(ATTR, undefined, "desktop")}
${packLayoutRules("desktop")}
}

@media(max-width:720px){
${layoutRules(ATTR_MOBILE, undefined, "mobile")}
${layoutRules(ATTR, ATTR_MOBILE, "mobile")}
${packLayoutRules("mobile")}
}
`;
