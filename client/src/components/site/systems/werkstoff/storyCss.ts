import { GRID, step } from "./step";

/**
 * Über uns, Menschen, Werkbank-Raster, Stimme (Systemblatt 09, 11–15).
 * Fotos warm gradiert über `--sys-image-filter`, eckig, randlos am Handy
 * (Über uns). Werkbank-Raster nach Systemblatt: 2 bis 4 Fotos je Raster,
 * Mono-Zeile unter jedem Bild.
 */
const bench = (n: number, k: number) =>
  `.pb-werkstoff .ws-bench[data-n="${n}"]>li:nth-child(${k})`;

export const STORY_CSS = `/* Bildzeile (Mono) */
.pb-werkstoff .ws-caption{display:flex;flex-wrap:wrap;gap:0 var(--sys-space-xs);color:var(--sys-muted);padding-top:var(--sys-space-xs)}
.pb-werkstoff .ws-abb{color:var(--sys-ink)}

/* Über uns: Satz gedämpft in Lesebreite, Foto randlos (Handy) */
.pb-werkstoff .ws-about-grid{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-about-text{display:grid;gap:var(--sys-space-s);color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-werkstoff .ws-about-photo{margin-inline:calc(var(--sys-space-gutter) * -1);min-width:0}
.pb-werkstoff .ws-about-photo .ws-caption{padding-inline:var(--sys-space-gutter)}
.pb-werkstoff .ws-about-photo img,.pb-werkstoff .ws-faces img{width:100%;height:auto;object-fit:cover;filter:var(--sys-image-filter);background:var(--sys-rule)}
.pb-werkstoff .ws-about-photo img{aspect-ratio:4/3}

/* Menschen: Porträts nur mit echten Fotos, sonst Namenszeilen */
.pb-werkstoff .ws-faces{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-xs)}
.pb-werkstoff .ws-faces img{aspect-ratio:4/5}
.pb-werkstoff .ws-faces figcaption{display:grid;gap:var(--sys-space-2xs);padding-top:var(--sys-space-xs)}
.pb-werkstoff .ws-face-name,.pb-werkstoff .ws-people-name{${step("h3")};overflow-wrap:break-word}
.pb-werkstoff .ws-face-role,.pb-werkstoff .ws-people-role{color:var(--sys-muted)}
.pb-werkstoff .ws-people{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;border-bottom:1px solid var(--sys-ink)}
.pb-werkstoff .ws-people li{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--sys-space-2xs) var(--sys-space-s);padding:var(--sys-space-m) 0;border-top:1px solid var(--sys-ink)}

/* Werkbank-Raster */
.pb-werkstoff .ws-bench{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-xs)}
.pb-werkstoff .ws-bench+.ws-bench{margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-bench>li{min-width:0;display:grid}
.pb-werkstoff .ws-bench figure{display:grid;grid-template-rows:1fr auto;min-width:0}
.pb-werkstoff .ws-bench-frame{position:relative;overflow:hidden;width:100%;min-height:0;aspect-ratio:4/5;background:var(--sys-rule)}
.pb-werkstoff .ws-bench-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
${bench(1, 1)},${bench(3, 1)},${bench(4, 1)},${bench(4, 4)}{grid-column:1/-1}
${bench(1, 1)} .ws-bench-frame,${bench(3, 1)} .ws-bench-frame,${bench(4, 1)} .ws-bench-frame{aspect-ratio:4/3}
${bench(4, 4)} .ws-bench-frame{aspect-ratio:16/9}

/* Stimme: Google-Zeile in Mono, ein Zitat, Name in Slab */
.pb-werkstoff .ws-rating{color:var(--sys-muted)}
.pb-werkstoff .ws-quote-text{font-family:var(--sys-font-text);font-weight:600;font-size:calc(var(--sys-h2-size) * .68);line-height:1.16;letter-spacing:-.02em;max-width:24ch;margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-voice-who{margin-top:var(--sys-space-l);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule);}
.pb-werkstoff .ws-voice .ws-quote-text p{margin:0}
.pb-werkstoff .ws-voice-who{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--sys-space-2xs) var(--sys-space-s);max-width:calc(var(--sys-space-measure) * .9)}
.pb-werkstoff .ws-voice-name{font-family:var(--sys-font-display);font-weight:var(--sys-h3-weight)}
.pb-werkstoff .ws-voice-source{${step("small")};color:var(--sys-muted);font-family:var(--sys-font-text);font-weight:400}

@media (min-width:${GRID}){
  .pb-werkstoff .ws-about--photo .ws-about-grid{grid-template-columns:5fr 7fr;gap:var(--sys-space-2xl);align-items:start}
  .pb-werkstoff .ws-about-photo{margin-inline:0}
  .pb-werkstoff .ws-about-photo .ws-caption{padding-inline:0}
  .pb-werkstoff .ws-faces{grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}
  .pb-werkstoff .ws-bench[data-n="4"],.pb-werkstoff .ws-bench[data-n="3"]{grid-template-columns:2fr 1fr 1fr}
  ${bench(4, 1)},${bench(3, 1)}{grid-column:1;grid-row:1/3}
  ${bench(4, 1)} .ws-bench-frame,${bench(3, 1)} .ws-bench-frame{aspect-ratio:auto;height:100%}
  ${bench(4, 2)}{grid-column:2;grid-row:1}
  ${bench(4, 3)}{grid-column:3;grid-row:1}
  ${bench(4, 2)} .ws-bench-frame,${bench(4, 3)} .ws-bench-frame{aspect-ratio:1/1}
  ${bench(4, 4)}{grid-column:2/4;grid-row:2}
  ${bench(4, 4)} .ws-bench-frame{aspect-ratio:2/1}
  ${bench(3, 2)}{grid-column:2/4;grid-row:1}
  ${bench(3, 3)}{grid-column:2/4;grid-row:2}
  ${bench(3, 2)} .ws-bench-frame,${bench(3, 3)} .ws-bench-frame{aspect-ratio:2/1}
  ${bench(2, 1)} .ws-bench-frame,${bench(2, 2)} .ws-bench-frame{aspect-ratio:4/3}
  ${bench(1, 1)} .ws-bench-frame{aspect-ratio:16/9}
}
`;
