/**
 * Packübergreifende Kompositionsvarianten aus dem Studio-Seitenaufbau.
 *
 * Pack-CSS bleibt die Designrichtung. Diese Schicht greift über
 * `data-pb-slot` (siehe layoutSlots.ts) und die SECTION_ANCHORS
 * (`#start`, `#leistungen`, `#speisekarte`, `#ueber-uns`, `#galerie`).
 * Jede Wahl über die Layout-Buttons in der Studio-Vorschau muss in allen
 * 14 Packs sichtbar sein — auch in den früher ausgenommenen, handkuratierten Packs.
 */

const SLOT = {
  heroSplit: '[data-pb-slot="hero-split"]',
  heroCopy: '[data-pb-slot="hero-copy"]',
  heroMedia: '[data-pb-slot="hero-media"]',
  servicesItems: '[data-pb-slot="services-items"]',
  aboutGrid: '[data-pb-slot="about-grid"]',
  aboutMedia: '[data-pb-slot="about-media"]',
  galleryItems: '[data-pb-slot="gallery-items"]',
} as const;

export const DESIGN_PROFILE_CSS = `
/* Dichte */
.pb-site[data-pb-density="compact"] section{padding-top:clamp(2.5rem,5vw,4.5rem)!important;padding-bottom:clamp(2.5rem,5vw,4.5rem)!important}
.pb-site[data-pb-density="compact"] #start{min-height:auto!important}

/* Hero: split = Pack-Default. centered stapelt und zentriert. compact staucht. */
.pb-site[data-pb-hero="centered"] #start{text-align:center!important}
.pb-site[data-pb-hero="centered"] #start ${SLOT.heroSplit}{display:flex!important;flex-direction:column!important;align-items:center!important;grid-template-columns:1fr!important;text-align:center!important;gap:clamp(1.5rem,4vw,2.75rem)!important}
.pb-site[data-pb-hero="centered"] #start ${SLOT.heroCopy}{text-align:center!important;margin-inline:auto!important;max-width:46rem}
.pb-site[data-pb-hero="centered"] #start :is(h1,p,a,.pb-pa-cta,.pb-wb-cta,.pb-gu-cta,.pb-lg-cta,.pb-sc-cta,.pb-kz-link,.pb-kw-hero-cta,.pb-ml-cta,.pb-fd-cta,.pb-vv-cta,.pb-zf-cta,.pb-mp-cta,.pb-sn-cta,.pb-at-lnk){margin-left:auto!important;margin-right:auto!important}
.pb-site[data-pb-hero="centered"] #start ${SLOT.heroMedia},
.pb-site[data-pb-hero="centered"] #start ${SLOT.heroMedia} img{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;left:auto!important;bottom:auto!important;width:min(100%,42rem)!important;max-width:100%!important;height:auto!important;max-height:min(28rem,55vh)!important;order:2!important;clip-path:none!important;margin-inline:auto!important}
.pb-site[data-pb-hero="compact"] #start{min-height:auto!important;padding-top:clamp(2.5rem,6vw,5rem)!important;padding-bottom:clamp(2.5rem,6vw,5rem)!important}
.pb-site[data-pb-hero="compact"] #start h1{font-size:clamp(2rem,6.5vw,4.6rem)!important;max-width:14ch}

/* Leistungen + Speisekarte: Liste, Raster, erste Karte hervorgehoben. */
.pb-site[data-pb-services="list"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:flex!important;flex-direction:column!important;grid-template-columns:1fr!important;gap:clamp(.75rem,1.5vw,1.25rem)!important}
.pb-site[data-pb-services="list"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>*{grid-column:auto!important;width:100%!important}
.pb-site[data-pb-services="grid"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="grid"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>*{grid-column:auto!important}
.pb-site[data-pb-services="featured"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="featured"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems}>:first-child{grid-column:1/-1!important}

/* Fallback, falls ein Pack den Slot noch nicht setzt (Items direkt unter der Sektion). */
.pb-site[data-pb-services="grid"] #leistungen:not(:has(${SLOT.servicesItems})){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>h2,
.pb-site[data-pb-services="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>header,
.pb-site[data-pb-services="grid"] #leistungen:not(:has(${SLOT.servicesItems}))>p{grid-column:1/-1}
.pb-site[data-pb-services="featured"] #leistungen:not(:has(${SLOT.servicesItems})){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>h2,
.pb-site[data-pb-services="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>header,
.pb-site[data-pb-services="featured"] #leistungen:not(:has(${SLOT.servicesItems}))>p{grid-column:1/-1}

/* Über uns: Bild links/rechts über order am Media-Slot. */
.pb-site ${SLOT.aboutGrid}{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:center!important;gap:clamp(1.5rem,4vw,4rem)!important}
.pb-site[data-pb-about="image-left"] ${SLOT.aboutMedia}{order:-1!important}
.pb-site[data-pb-about="image-right"] ${SLOT.aboutMedia}{order:2!important}

/* Galerie: Raster, Mosaik, Filmstreifen — Pack-nth-child-Spans zurücksetzen. */
.pb-site[data-pb-gallery="grid"] ${SLOT.galleryItems}{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;grid-auto-flow:row!important;gap:clamp(.5rem,1.5vw,1.25rem)!important;overflow:visible!important}
.pb-site[data-pb-gallery="grid"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;width:100%!important;max-width:none!important;height:auto!important}
.pb-site[data-pb-gallery="grid"] ${SLOT.galleryItems} img{width:100%!important;height:clamp(180px,28vw,280px)!important;object-fit:cover!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems}{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:row!important;gap:clamp(.4rem,1vw,1rem)!important;overflow:visible!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;width:100%!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems}>:first-child{grid-column:span 2!important;grid-row:span 2!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems} img{width:100%!important;height:100%!important;min-height:160px!important;object-fit:cover!important}
.pb-site[data-pb-gallery="filmstrip"] ${SLOT.galleryItems}{display:grid!important;grid-auto-flow:column!important;grid-auto-columns:minmax(240px,42%)!important;grid-template-columns:none!important;overflow-x:auto!important;overscroll-behavior-inline:contain;scroll-snap-type:inline mandatory;gap:clamp(.5rem,1.5vw,1.25rem)!important;padding-bottom:.5rem}
.pb-site[data-pb-gallery="filmstrip"] ${SLOT.galleryItems}>*{grid-column:auto!important;grid-row:auto!important;margin-top:0!important;scroll-snap-align:start;width:auto!important}
.pb-site[data-pb-gallery="filmstrip"] ${SLOT.galleryItems} img{width:100%!important;height:clamp(200px,32vw,320px)!important;object-fit:cover!important}

/* Bildwirkung */
.pb-site[data-pb-image="framed"] :is(#start,#ueber-uns,#galerie) img{border:1px solid var(--pb-line)!important;border-radius:clamp(8px,1.5vw,18px)!important;padding:clamp(3px,.5vw,7px)!important;background:var(--pb-surface)!important}
.pb-site[data-pb-image="bleed"] :is(#start,#ueber-uns,#galerie) img{border-radius:0!important}

@media(max-width:720px){
.pb-site[data-pb-services="grid"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems},
.pb-site[data-pb-services="featured"] :is(#leistungen,#speisekarte) ${SLOT.servicesItems},
.pb-site ${SLOT.aboutGrid}{grid-template-columns:1fr!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems}{grid-template-columns:repeat(2,minmax(0,1fr))!important}
.pb-site[data-pb-gallery="mosaic"] ${SLOT.galleryItems}>:first-child{grid-column:span 2!important;grid-row:auto!important}
.pb-site[data-pb-gallery="filmstrip"] ${SLOT.galleryItems}{grid-auto-columns:82%!important}
}
`;
