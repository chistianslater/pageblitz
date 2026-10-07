/**
 * Fassungen der Abschnitte unter dem Einstieg (2026-10-07, Betreiber: „soll
 * nur nicht alles gleich aussehen"). Leistungen, Über uns und Bewertungen
 * haben je drei Fassungen; welche gilt, hängt an der Gestaltungsvariante
 * des Einstiegs — je Abschnitt versetzt, damit nicht alle Abschnitte
 * gleichzeitig „Fassung b" zeigen. Mit Bühne/Farbfläche ergibt das sechs
 * Seitenrhythmen, dazu Farben und Schriften der Packs.
 */
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import { entryVariantIndex } from "../../../../../shared/stylePacks/artDirection";

export type SectionLayout = "a" | "b" | "c";
export type LayoutSection = "services" | "about" | "reviews";

const LAYOUTS: readonly SectionLayout[] = ["a", "b", "c"];
const OFFSET: Record<LayoutSection, number> = {
  services: 0,
  about: 1,
  reviews: 2,
};

/** Fassung eines Abschnitts aus der Variante des Einstiegs. */
export function sectionLayout(
  data: WebsiteDataV2,
  section: LayoutSection
): SectionLayout {
  const variant = entryVariantIndex(
    data.stylePackId,
    data.designProfile?.entryVariant
  );
  return LAYOUTS[(variant + OFFSET[section]) % LAYOUTS.length];
}

/**
 * Fotos für Kacheln und Bildpaare: Galerie zuerst, ohne Titelbild und
 * Über-uns-Bild — mehr Fotos auf der Seite, keines doppelt.
 */
export function spareImages(
  data: WebsiteDataV2,
  exclude: (string | undefined)[]
): string[] {
  const skip = new Set(exclude.filter(Boolean));
  const gallery = data.sections.find(s => s.type === "gallery");
  const urls =
    gallery && gallery.type === "gallery"
      ? gallery.images.map(image => image.url)
      : [];
  return urls.filter(url => !skip.has(url));
}

const S = '.pb-site[data-pb-revision="2"]';

export const ENTRY_LAYOUTS_CSS = `
/* Leistungen b: Kacheln mit Foto */
${S} #leistungen.pb-entry-services[data-layout="b"]{display:block}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-head{position:static;margin-bottom:clamp(32px,4vw,56px)}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-list[data-pb-slot]{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;gap:clamp(16px,2vw,28px)!important;border:0!important}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-list[data-pb-slot]>li{display:flex!important;flex-direction:column;gap:0;padding:0 0 24px!important;border:0!important;border-radius:16px;overflow:hidden;background:var(--pb-surface)}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-tile-media{margin:0 0 6px;aspect-ratio:4/3;overflow:hidden}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-tile-media img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--pb-art-ease,ease)}
${S} #leistungen.pb-entry-services[data-layout="b"] li:hover .pb-entry-tile-media img{transform:scale(1.03)}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-index{display:block!important;padding:18px 24px 0}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-copy{padding:8px 24px 0}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-price{padding:12px 24px 0}
${S} #leistungen.pb-entry-services[data-layout="b"] .pb-entry-placeholder{margin-top:24px}

/* Leistungen c: große nummerierte Zeilen */
${S} #leistungen.pb-entry-services[data-layout="c"]{display:block}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-head{position:static;margin-bottom:clamp(32px,4vw,56px)}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-list[data-pb-slot]{display:block!important;border-top:2px solid var(--pb-ink)!important}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-list[data-pb-slot]>li{display:grid!important;grid-template-columns:minmax(72px,1fr) minmax(0,5fr) minmax(0,5fr)!important;gap:8px clamp(16px,3vw,48px)!important;align-items:baseline;padding:clamp(26px,3vw,40px) 0!important;border-bottom:1px solid var(--pb-line)!important}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-index{display:block!important;font:var(--pb-art-weight,600) clamp(2rem,3.4vw,3.4rem)/1 var(--pb-font-display);letter-spacing:-.03em;color:var(--pb-art-accent-text,var(--pb-accent))}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-copy{display:contents}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-copy h3{grid-column:2;font-size:clamp(1.6rem,2.8vw,2.6rem);line-height:1.05}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-copy p{grid-column:3;margin:0}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-price{grid-column:3}

/* Über uns b: breites Bildband, Text darunter zweispaltig */
${S} .pb-entry-about[data-layout="b"]{display:block}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-media{aspect-ratio:21/9;margin:0 0 clamp(32px,4vw,56px)}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);column-gap:clamp(32px,6vw,96px);align-items:start}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy .pb-entry-head{grid-row:1 / span 12}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy>p{grid-column:2;margin:0 0 18px}

/* Über uns c: großer Einleitungsabsatz, darunter zwei Bilder */
${S} .pb-entry-about[data-layout="c"]{display:block}
${S} .pb-entry-about[data-layout="c"] .pb-entry-about-copy{max-width:1040px}
${S} .pb-entry-about[data-layout="c"] .pb-entry-about-copy>p:first-of-type{max-width:34ch;font:var(--pb-art-weight,500) clamp(1.45rem,2.4vw,2.2rem)/1.3 var(--pb-font-display);letter-spacing:-.015em}
${S} .pb-entry-about[data-layout="c"] .pb-entry-about-copy>p:not(:first-of-type){max-width:62ch}
${S} .pb-entry-about-pair{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(14px,2vw,28px);margin-top:clamp(36px,5vw,72px);align-items:end}
${S} .pb-entry-about-pair figure{margin:0;overflow:hidden;border-radius:16px;aspect-ratio:4/3}
${S} .pb-entry-about-pair figure:nth-child(2){aspect-ratio:4/5}
${S} .pb-entry-about-pair img{display:block;width:100%;height:100%;object-fit:cover}

/* Bewertungen b: Note mittig, drei Stimmen nebeneinander */
${S} .pb-entry-reviews[data-layout="b"]{display:block}
${S} .pb-entry-reviews[data-layout="b"] .pb-entry-reviews-score{display:flex;flex-direction:column;align-items:center;text-align:center}
${S} .pb-entry-reviews[data-layout="b"] .pb-entry-score{justify-content:center}
${S} .pb-entry-reviews[data-layout="b"] .pb-entry-reviews-list{grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:clamp(24px,3vw,48px);margin-top:clamp(36px,4vw,64px)}
${S} #bewertungen.pb-entry-reviews[data-layout="b"] blockquote{border:0;border-top:2px solid var(--pb-ink);border-radius:0;background:transparent;padding:22px 0 0}

/* Bewertungen c: eine Stimme groß, die anderen daneben */
${S} .pb-entry-reviews[data-layout="c"] .pb-entry-reviews-list{grid-template-columns:minmax(0,7fr) minmax(0,5fr);align-items:stretch}
${S} #bewertungen.pb-entry-reviews[data-layout="c"] blockquote:first-child{grid-row:1 / span 2;display:flex;flex-direction:column;justify-content:space-between;background:var(--pb-ink);border-color:var(--pb-ink)}
${S} #bewertungen.pb-entry-reviews[data-layout="c"] blockquote:first-child p{font:var(--pb-art-weight,500) clamp(1.35rem,2.1vw,1.9rem)/1.3 var(--pb-font-display);letter-spacing:-.015em;color:var(--pb-canvas)}
${S} #bewertungen.pb-entry-reviews[data-layout="c"] blockquote:first-child footer{color:color-mix(in srgb,var(--pb-canvas) 70%,transparent)}

@media (max-width:760px){
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-list[data-pb-slot]>li{grid-template-columns:52px minmax(0,1fr)!important}
${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-copy :is(h3,p),${S} #leistungen.pb-entry-services[data-layout="c"] .pb-entry-price{grid-column:2}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-media{aspect-ratio:4/3}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy{grid-template-columns:1fr}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy>p{grid-column:1}
${S} .pb-entry-about[data-layout="b"] .pb-entry-about-copy .pb-entry-head{grid-row:auto;margin-bottom:18px}
${S} .pb-entry-about-pair{grid-template-columns:1fr 1fr}
${S} .pb-entry-reviews[data-layout="c"] .pb-entry-reviews-list{grid-template-columns:1fr}
${S} #bewertungen.pb-entry-reviews[data-layout="c"] blockquote:first-child{grid-row:auto}
}
`;
