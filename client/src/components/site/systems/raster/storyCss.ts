import { GRID, step } from "./step";

/**
 * Über uns, Einblicke, Team-Porträts und Stimme (Systemblatt 7–9).
 * Fotos S/W über den Raster-Filter (Blatt 07, wie die Bildtafel im
 * Einstieg), Bildunterschrift mit Haarlinie und „Abb. n" in ink. Nur
 * `--sys-*`; feste Werte nur Haarlinien.
 */
export const PHOTO_FILTER = "grayscale(1) contrast(1.1) brightness(1.02)";

export const STORY_CSS = `/* Abbildungen: S/W, Haarlinie über der Unterschrift */
.pb-raster .rs-figure{margin:0;display:grid;gap:var(--sys-space-xs);min-width:0}
.pb-raster .rs-figure img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;filter:${PHOTO_FILTER};background:var(--sys-rule)}
.pb-raster .rs-figcap{${step("small")};display:flex;gap:.5em;border-top:1px solid var(--sys-rule);padding-top:var(--sys-space-xs)}
.pb-raster .rs-abb{flex:none;color:var(--sys-ink);font-variant-numeric:tabular-nums}
.pb-raster .rs-figcap-text{color:var(--sys-muted);min-width:0}

/* Über uns: Aussage groß, Text gedämpft, Bild im Raster */
.pb-raster .rs-about-grid{display:grid;gap:var(--sys-space-l)}
.pb-raster .rs-about-text{display:grid;gap:var(--sys-space-s);align-content:start;max-width:var(--sys-space-measure);color:var(--sys-muted)}
.pb-raster .rs-about-text>p:first-child:not(.rs-about-lede){${step("h3")}}
.pb-raster .rs-about-lede{${step("lede")};color:var(--sys-ink);max-width:16em;margin-bottom:var(--sys-space-xs)}
.pb-raster .rs-about-photo img{aspect-ratio:4/5}
@media (min-width:${GRID}){
  .pb-raster .rs-about--photo .rs-about-grid{grid-template-columns:repeat(9,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-raster .rs-about--photo .rs-about-text{grid-column:1/6}
  .pb-raster .rs-about--photo .rs-about-photo{grid-column:7/10}
}

/* Einblicke: Bildzeilen, Handy eine Spalte, Desktop zwei (ungerade: erstes breit) */
.pb-raster .rs-shots{list-style:none;margin:0;padding:0;display:grid;gap:var(--sys-space-l) var(--sys-space-m)}
@media (min-width:${GRID}){
  .pb-raster .rs-shots{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pb-raster .rs-shots[data-odd]>li:first-child{grid-column:1/-1}
  .pb-raster .rs-shots[data-odd]>li:first-child img{aspect-ratio:2/1}
}

/* Team mit Porträts */
.pb-raster .rs-faces{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}
.pb-raster .rs-faces img{aspect-ratio:4/5}
.pb-raster .rs-face-cap{${step("small")};display:grid;border-top:1px solid var(--sys-rule);padding-top:var(--sys-space-xs)}
.pb-raster .rs-face-name{color:var(--sys-ink)}
.pb-raster .rs-face-role{color:var(--sys-muted)}
@media (min-width:${GRID}){.pb-raster .rs-faces{grid-template-columns:repeat(4,minmax(0,1fr))}}

/* Stimme: ein Zitat in lede, hängende Anführung, Name mit Haarlinie */
.pb-raster .rs-quote-figure{margin:0;display:grid;gap:var(--sys-space-l)}
.pb-raster .rs-quote{margin:0}
.pb-raster .rs-quote p{${step("lede")};text-indent:-.4em;max-width:20em;hyphens:manual}
.pb-raster .rs-quote-cap{${step("small")};display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-2xs) .6em}
.pb-raster .rs-quote-cap::before{content:"";flex:none;width:var(--sys-space-m);height:1px;background:var(--sys-ink)}
.pb-raster .rs-quote-who{color:var(--sys-ink)}
.pb-raster .rs-quote-source{color:var(--sys-muted)}
.pb-raster .rs-stars{${step("kicker")};color:var(--sys-ink);letter-spacing:.12em}
`;
