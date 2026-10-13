import {
  CLOUD,
  CLOUD_WIDE,
  DOT,
  NAV,
  PILL_H,
  WIDE,
  step,
} from "./step";

/** Schatten unter Fotos und Pillen: Tinte, weich (Systemblatt 7). */
export const PHOTO_SHADOW =
  "0 calc(var(--sys-space-m) * .9) calc(var(--sys-space-l) * 1) calc(var(--sys-space-m) * -1) color-mix(in srgb,var(--sys-ink) 45%,transparent)";
const PILL_SHADOW =
  "0 var(--sys-space-xs) calc(var(--sys-space-s) * 1.125) calc(var(--sys-space-s) * -.625) color-mix(in srgb,var(--sys-ink) 50%,transparent)";
/** Weißer Rand ums kleine Foto: 6 px. */
const RING = "calc(var(--sys-space-2xs) * 1.5)";

/**
 * Einstieg nach Systemblatt 6/10/16/18. photo: Satz zentriert, ein Foto im
 * weichen Rahmen (Ecke 28, 4:3 Handy, 16:9 ab Desktop, −1,5° erst ab
 * Desktop), Faktenpillen über der Unterkante, Wolkenkante in Bandfarbe.
 * tint (small/plain): Pastell 1, Satz links, Pillen in Pastell 2–4, kleines
 * Foto (≤ 58 %, Ecke 20, weißer Rand, +1,5° ab Desktop). Text auf Pastell
 * immer in der Tinte des Pastells.
 */
export const ENTRY_CSS = `
/* Wolkenkante: zwei versetzte Kreisreihen in der Farbe der nächsten Fläche */
.pb-freundlich .fr-cloud{--fr-ch:${CLOUD};position:absolute;left:0;right:0;bottom:0;height:var(--fr-ch);pointer-events:none;z-index:0;
  background:
  radial-gradient(circle at 50% 100%,var(--fr-cc) 0 calc(var(--fr-ch) * .6),transparent calc(var(--fr-ch) * .6 + .5px)) 0 100%/calc(var(--fr-ch) * 1.75) 100% repeat-x,
  radial-gradient(circle at 50% 100%,var(--fr-cc) 0 calc(var(--fr-ch) * .9),transparent calc(var(--fr-ch) * .9 + .5px)) calc(var(--fr-ch) * .8) 100%/calc(var(--fr-ch) * 2.7) 100% repeat-x}
.pb-freundlich .fr-cloud--band{--fr-cc:var(--sys-band)}
.pb-freundlich .fr-cloud--paper{--fr-cc:var(--sys-paper)}
.pb-freundlich .fr-cloud--deep{--fr-cc:var(--sys-deep)}
@media (min-width:${NAV}){.pb-freundlich .fr-cloud{--fr-ch:${CLOUD_WIDE}}}

/* Pille: Kopfzeile über dem Satz und Faktenpillen */
.pb-freundlich .fr-pill{${step("kicker")};display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${PILL_H};max-width:100%;
  padding:calc(var(--sys-space-xs) * .75) calc(var(--sys-space-s) * .9375);border-radius:var(--sys-radius-pill);background:var(--fr-pbg,var(--sys-surface));color:var(--sys-ink)}
.pb-freundlich .fr-pill .fr-ic{width:1.15em;height:1.15em}
.pb-freundlich .fr-dot{flex:none;width:${DOT};height:${DOT};border-radius:var(--sys-radius-pill);background:var(--sys-signal)}
.pb-freundlich .fr-pill-text{min-width:0;overflow-wrap:anywhere;text-align:left}
.pb-freundlich .fr-top-name{display:inline;font:inherit;letter-spacing:inherit;font-weight:600}
.pb-freundlich .fr-nameline{${step("kicker")};color:var(--fr-text-muted,var(--sys-muted));overflow-wrap:anywhere}
.pb-freundlich .fr-nameline .fr-top-name{color:var(--fr-text,var(--sys-ink))}
.pb-freundlich .fr-facts{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-xs)}
.pb-freundlich .fr-fact{white-space:normal}

/* Satz */
.pb-freundlich .fr-entry{position:relative;isolation:isolate}
.pb-freundlich .fr-entry-in{position:relative;z-index:1}
.pb-freundlich .fr-display{${step("display")};margin-top:var(--sys-space-m);color:var(--fr-text,var(--sys-ink));overflow-wrap:break-word;hyphens:manual}
/* Längstes Wort passt: Größe höchstens Breite / (Zeichen × 0,6 em) */
.pb-freundlich .fr-display{font-size:min(var(--sys-display-size),calc((100vw - var(--sys-space-gutter) * 2) / (var(--fr-word,8) * .6)))}
.pb-freundlich .fr-acc{color:var(--sys-accent)}
.pb-freundlich .fr-lede{${step("lede")};margin-top:var(--sys-space-m);max-width:calc(var(--sys-space-measure) * .85);color:var(--fr-text-muted,var(--sys-muted))}
.pb-freundlich .fr-ctas{display:flex;flex-wrap:wrap;gap:calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * .75);margin-top:var(--sys-space-l)}

/* photo: gutes Foto */
.pb-freundlich .fr-entry--photo{padding:var(--sys-space-m) 0 calc(var(--sys-space-xl) + ${CLOUD});text-align:center}
.pb-freundlich .fr-entry--photo .fr-display{max-width:14ch;margin-inline:auto}
.pb-freundlich .fr-entry--photo .fr-lede{margin-inline:auto}
.pb-freundlich .fr-entry--photo .fr-ctas{justify-content:center}
.pb-freundlich .fr-heroimg{position:relative;margin:var(--sys-space-xl) auto 0;max-width:calc(var(--sys-space-max) * .55)}
.pb-freundlich .fr-frame{margin:0;aspect-ratio:4/3;border-radius:var(--sys-radius-l);overflow:hidden;box-shadow:${PHOTO_SHADOW};background:var(--sys-band)}
.pb-freundlich .fr-frame img,.pb-freundlich .fr-smallpic img{width:100%;height:100%;object-fit:cover}
.pb-freundlich .fr-heroimg .fr-facts{position:relative;z-index:2;justify-content:center;margin-top:calc(${PILL_H} * -.5);padding:0 calc(var(--sys-space-s) * .75)}
.pb-freundlich .fr-heroimg .fr-fact{box-shadow:${PILL_SHADOW}}
.pb-freundlich .fr-heroimg .fr-fact:nth-child(1){--fr-pbg:var(--sys-tint-2-bg)}
.pb-freundlich .fr-heroimg .fr-fact:nth-child(2){--fr-pbg:var(--sys-tint-3-bg)}
.pb-freundlich .fr-heroimg .fr-fact:nth-child(3){--fr-pbg:var(--sys-tint-4-bg)}
/* Pille über dem Titel auf Papier: Pastell 3 (Systemblatt 10 Mitte) */
.pb-freundlich .fr-entry--photo .fr-pill--top{--fr-pbg:var(--sys-tint-3-bg)}
/* Erste Fläche nach dem Foto-Einstieg: Band (die Wolke führt dorthin) */
.pb-freundlich .fr-entry--photo+.fr-sec{background:var(--sys-band);padding-bottom:var(--sys-space-section)}

/* tint: schwaches / kein Foto — Pastell 1, Kopf liegt mit darauf */
.pb-freundlich .fr-top--tint .fr-head,.pb-freundlich .fr-entry--tint{background:var(--sys-tint-1-bg);color:var(--sys-tint-1-ink);
  --fr-text:var(--sys-tint-1-ink);--fr-text-muted:var(--sys-tint-1-ink)}
.pb-freundlich .fr-entry--tint{padding:var(--sys-space-m) 0 calc(var(--sys-space-xl) + ${CLOUD})}
.pb-freundlich .fr-entry--tint .fr-display{max-width:13ch}
.pb-freundlich .fr-entry--tint .fr-facts{margin-top:var(--sys-space-l)}
.pb-freundlich .fr-entry--tint .fr-fact:nth-child(1){--fr-pbg:var(--sys-tint-2-bg)}
.pb-freundlich .fr-entry--tint .fr-fact:nth-child(2){--fr-pbg:var(--sys-tint-3-bg)}
.pb-freundlich .fr-entry--tint .fr-fact:nth-child(3){--fr-pbg:var(--sys-tint-4-bg)}
.pb-freundlich .fr-smallpic{margin:var(--sys-space-l) 0 0 auto;width:58%;max-width:calc(var(--sys-space-l) * 7.5);aspect-ratio:1;border-radius:var(--sys-radius-m);overflow:hidden;
  background:var(--sys-surface);box-shadow:0 0 0 ${RING} var(--sys-surface),${PHOTO_SHADOW}}

@media (max-width:calc(${WIDE} - 1px)){
  .pb-freundlich .fr-ctas .fr-btn{width:100%}
}
@media (min-width:${WIDE}){
  .pb-freundlich .fr-entry--tint{padding:var(--sys-space-xl) 0 calc(var(--sys-space-2xl) + ${CLOUD_WIDE})}
  .pb-freundlich .fr-entry--small .fr-entry-in{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-xl);align-items:center}
  .pb-freundlich .fr-entry--small .fr-smallpic{margin:0;width:calc(var(--sys-space-l) * 7.5)}
}
@media (min-width:${NAV}){
  .pb-freundlich .fr-entry--photo{padding-bottom:calc(var(--sys-space-xl) + ${CLOUD_WIDE})}
  .pb-freundlich .fr-frame{aspect-ratio:16/9}
  /* Kippen erst ab Desktop; am Handy gerade (Endwerte) */
  .pb-freundlich .fr-frame{transform:rotate(calc(var(--sys-tilt) * -1))}
  .pb-freundlich .fr-smallpic{transform:rotate(var(--sys-tilt))}
}
`;
