/**
 * Packübergreifende Kompositionsvarianten.
 *
 * Die 14 Pack-CSS-Dateien definieren weiterhin die Designrichtung. Diese
 * letzte CSS-Schicht variiert nur sichere, semantische Strukturen über die
 * stabilen SECTION_ANCHORS (`#start`, `#leistungen`, `#ueber-uns`,
 * `#galerie`). `:has()` ist auf allen unterstützten Browsern verfügbar.
 *
 * Zwei DOM-Formen werden berücksichtigt:
 * 1. Items liegen direkt unter der Sektion (z. B. Werkbank-Services).
 * 2. Ein einzelner Wrapper enthält alle Items (mehrere andere Packs).
 */
export const DESIGN_PROFILE_CSS = `
/* Dichte: ein echter globaler Rhythmusunterschied innerhalb derselben Richtung. */
.pb-site[data-pb-density="compact"] section{padding-top:clamp(2.5rem,5vw,4.5rem)!important;padding-bottom:clamp(2.5rem,5vw,4.5rem)!important}
.pb-site[data-pb-density="compact"] #start{min-height:auto!important}

/* Hero-Kompositionen. Bilder bleiben pack-spezifisch positioniert; Textachse,
   Breite und vertikaler Rhythmus variieren ohne das Pack zu zerbrechen. */
.pb-site[data-pb-hero="centered"] #start{text-align:center!important}
.pb-site[data-pb-hero="centered"] #start h1,
.pb-site[data-pb-hero="centered"] #start>p{margin-left:auto!important;margin-right:auto!important;text-align:center!important}
.pb-site[data-pb-hero="centered"] #start>a{align-self:center}
.pb-site[data-pb-hero="compact"] #start{min-height:auto!important;padding-top:clamp(3rem,7vw,6rem)!important;padding-bottom:clamp(3rem,7vw,6rem)!important}
.pb-site[data-pb-hero="compact"] #start h1{font-size:clamp(2rem,7vw,5rem)!important;max-width:12ch}
.pb-site[data-pb-hero="compact"] #start>p{max-width:42ch}

/* Leistungen: direkte Items oder ein einzelner Items-Wrapper. */
.pb-site[data-pb-services="grid"] #leistungen{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="grid"] #leistungen>h2{grid-column:1/-1}
.pb-site[data-pb-services="grid"] #leistungen>div:only-of-type{grid-column:1/-1;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="featured"] #leistungen{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="featured"] #leistungen>h2{grid-column:1/-1}
.pb-site[data-pb-services="featured"] #leistungen>:not(h2):first-of-type{grid-column:1/-1}
.pb-site[data-pb-services="featured"] #leistungen>div:only-of-type{grid-column:1/-1;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(1rem,2vw,1.75rem)!important}
.pb-site[data-pb-services="featured"] #leistungen>div:only-of-type>:first-child{grid-column:1/-1}

/* Über uns: Bild-/Text-Reihenfolge, unabhängig vom Pack-Präfix. */
.pb-site #ueber-uns>div:has(img){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:center!important;gap:clamp(1.5rem,4vw,4rem)!important}
.pb-site[data-pb-about="image-left"] #ueber-uns>div:has(img) img{order:-1}
.pb-site[data-pb-about="image-right"] #ueber-uns>div:has(img) img{order:2}
.pb-site[data-pb-about="image-left"] #ueber-uns:has(>img){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:center!important;gap:clamp(1.5rem,4vw,4rem)!important}
.pb-site[data-pb-about="image-left"] #ueber-uns>img{order:-1}

/* Galerie: Grid, redaktionelles Mosaik oder horizontale Filmspur. */
.pb-site[data-pb-gallery="grid"] #galerie>div:has(img),
.pb-site[data-pb-gallery="grid"] #galerie>ul:has(img){display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:clamp(.5rem,1.5vw,1.25rem)!important}
.pb-site[data-pb-gallery="mosaic"] #galerie>div:has(img),
.pb-site[data-pb-gallery="mosaic"] #galerie>ul:has(img){display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:clamp(.4rem,1vw,1rem)!important}
.pb-site[data-pb-gallery="mosaic"] #galerie>div:has(img)>:first-child,
.pb-site[data-pb-gallery="mosaic"] #galerie>ul:has(img)>:first-child{grid-column:span 2;grid-row:span 2}
.pb-site[data-pb-gallery="filmstrip"] #galerie>div:has(img),
.pb-site[data-pb-gallery="filmstrip"] #galerie>ul:has(img){display:grid!important;grid-auto-flow:column!important;grid-auto-columns:minmax(240px,45%)!important;grid-template-columns:none!important;overflow-x:auto!important;overscroll-behavior-inline:contain;scroll-snap-type:inline mandatory;gap:clamp(.5rem,1.5vw,1.25rem)!important;padding-bottom:.5rem}
.pb-site[data-pb-gallery="filmstrip"] #galerie>div:has(img)>*,
.pb-site[data-pb-gallery="filmstrip"] #galerie>ul:has(img)>*{scroll-snap-align:start}

/* Bildbehandlung: markenunabhängiger, aber deutlich sichtbarer Feinschliff. */
.pb-site[data-pb-image="framed"] :is(#start,#ueber-uns,#galerie) img{border:1px solid var(--pb-line)!important;border-radius:clamp(8px,1.5vw,18px)!important;padding:clamp(3px,.5vw,7px)!important;background:var(--pb-surface)!important}
.pb-site[data-pb-image="bleed"] :is(#start,#ueber-uns,#galerie) img{border-radius:0!important}

@media(max-width:720px){
.pb-site[data-pb-services="grid"] #leistungen,
.pb-site[data-pb-services="featured"] #leistungen,
.pb-site[data-pb-services="grid"] #leistungen>div:only-of-type,
.pb-site[data-pb-services="featured"] #leistungen>div:only-of-type,
.pb-site #ueber-uns>div:has(img),
.pb-site[data-pb-about="image-left"] #ueber-uns:has(>img){grid-template-columns:1fr!important}
.pb-site[data-pb-gallery="mosaic"] #galerie>div:has(img),
.pb-site[data-pb-gallery="mosaic"] #galerie>ul:has(img){grid-template-columns:repeat(2,minmax(0,1fr))!important}
.pb-site[data-pb-gallery="filmstrip"] #galerie>div:has(img),
.pb-site[data-pb-gallery="filmstrip"] #galerie>ul:has(img){grid-auto-columns:82%!important}
}
`;
