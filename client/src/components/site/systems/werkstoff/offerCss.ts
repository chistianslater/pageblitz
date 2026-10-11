import { GRID, RAISED, step } from "./step";

/**
 * Angebot (Systemblatt Abschnitt 09/11–15): Leistungsliste, Ziffern 1·2·3
 * (mit Foto), Tageszeitleiste, Wochentafel, Zahlen, Vorschau-Karte. Nur
 * Tokens (oder Vielfache), Haarlinien 1px. Systemblatt-Maße: Pfeil-Spalte
 * 40 px ≈ l, Meta-Spalte 18 rem = 3 × 2xl, Zeitleisten-Punkt 10 px =
 * 1,25 × xs, Kartenbreite Handy 64 %.
 */
export const OFFER_CSS = `/* Leistungen: Liste mit Tinte-Linien, Slab-Zeilen, Oxid-Pfeil */
.pb-werkstoff .ws-title--display{${step("display")};max-width:14ch;hyphens:auto;overflow-wrap:break-word}
.pb-werkstoff .ws-list{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;border-bottom:1px solid var(--sys-ink)}
.pb-werkstoff .ws-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-s);align-items:baseline;
  padding:var(--sys-space-m) 0;border-top:1px solid var(--sys-ink)}
.pb-werkstoff .ws-list-title{${step("h2")};font-size:calc(var(--sys-h2-size) * .86);line-height:1.02;overflow-wrap:break-word;hyphens:auto;min-width:0}
.pb-werkstoff .ws-list-arrow{${step("link")};font-size:var(--sys-h3-size);color:var(--sys-signal);transition:transform 200ms}
.pb-werkstoff .ws-list-text{grid-column:1/-1;${step("small")};color:var(--sys-muted);max-width:var(--sys-space-measure);margin-top:var(--sys-space-2xs)}
.pb-werkstoff .ws-list-meta{grid-column:1/-1;color:var(--sys-muted)}
@media (hover:hover){.pb-werkstoff .ws-list li:hover .ws-list-arrow{transform:translateX(var(--sys-space-2xs))}}
.pb-werkstoff .ws-more{margin-top:var(--sys-space-m)}

/* Vorschau-Karte (nur Vorschau) */
.pb-werkstoff .ws-slot{margin-top:var(--sys-space-xl);padding:var(--sys-space-m);border:1px dashed var(--sys-muted);background:${RAISED};max-width:calc(var(--sys-space-measure) + var(--sys-space-xl))}
.pb-werkstoff .ws-slot .ws-data{color:var(--sys-muted)}
.pb-werkstoff .ws-slot-title{${step("h3")};margin-top:var(--sys-space-xs)}
.pb-werkstoff .ws-slot-text{${step("small")};color:var(--sys-muted);margin-top:var(--sys-space-xs)}
.pb-werkstoff .ws-slot-section{padding-top:var(--sys-space-section)}
.pb-werkstoff .ws-slot-section .ws-slot{margin-top:0}

/* Ablauf 1·2·3 (Hollis): Riesenziffer in Signal, Schritt in Slab */
.pb-werkstoff .ws-steps{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0}
.pb-werkstoff .ws-step{padding:var(--sys-space-l) 0 var(--sys-space-xl);border-top:1px solid var(--sys-rule)}
.pb-werkstoff .ws-step-no{display:block;${step("figure")};font-variant-numeric:tabular-nums;color:var(--sys-signal);margin:0 0 var(--sys-space-s) -.05em}
.pb-werkstoff .ws-step-title{${step("h3")};margin-bottom:var(--sys-space-xs)}
.pb-werkstoff .ws-step-text{color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-werkstoff .ws-steps-photo img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;filter:var(--sys-image-filter);background:var(--sys-rule)}
.pb-werkstoff .ws-steps-body{padding:var(--sys-space-xl) var(--sys-space-gutter) 0;min-width:0}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-step{display:grid;grid-template-columns:calc(var(--sys-figure-size) * .66) minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:var(--sys-space-l);padding:var(--sys-space-l) 0}
  .pb-werkstoff .ws-step-no{grid-row:1/3;margin:0}
  .pb-werkstoff .ws-step-title{padding-top:.4em}
  .pb-werkstoff .ws-steps-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch;max-width:var(--sys-space-max);margin-inline:auto}
  .pb-werkstoff .ws-steps-photo{min-height:100%}
  .pb-werkstoff .ws-steps-photo img{aspect-ratio:auto;height:100%;min-height:calc(var(--sys-space-2xl) * 5)}
  .pb-werkstoff .ws-steps-body{padding:var(--sys-space-xl) var(--sys-space-gutter) 0 calc(var(--sys-space-gutter) * 1.6)}
}

/* Tageszeitleiste (Northdock): wischbar, scroll-snap, Uhrzeit statt Ziffer */
.pb-werkstoff .ws-day{overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-top:var(--sys-space-xl);padding-top:var(--sys-space-xs)}
.pb-werkstoff .ws-day:focus-visible{outline-color:var(--sys-ink)}
.pb-werkstoff .ws-day-track{list-style:none;margin:0;padding:0 0 var(--sys-space-s);display:grid;grid-auto-flow:column;grid-auto-columns:64%;gap:calc(var(--sys-space-s) * 1.125);align-items:start}
.pb-werkstoff .ws-day-card{position:relative;border-top:1px solid var(--sys-ink);padding-top:var(--sys-space-m);scroll-snap-align:start;min-width:0}
.pb-werkstoff .ws-day-card::before{content:"";position:absolute;left:0;top:calc(var(--sys-space-xs) * -.625);width:calc(var(--sys-space-xs) * 1.25);height:calc(var(--sys-space-xs) * 1.25);border-radius:50%;background:var(--sys-signal)}
.pb-werkstoff .ws-day-time{${step("h2")};color:var(--sys-signal);font-variant-numeric:tabular-nums}
.pb-werkstoff .ws-day-label{${step("kicker")};margin:var(--sys-space-xs) 0 var(--sys-space-2xs)}
.pb-werkstoff .ws-day-text{${step("small")};color:var(--sys-muted)}
.pb-werkstoff .ws-day-hint{color:var(--sys-muted);margin-top:var(--sys-space-s)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-day-track{grid-auto-columns:minmax(calc(var(--sys-space-2xl) * 2.25),1fr)}
  .pb-werkstoff .ws-day-hint{display:none}
}

/* Wochentafel: begrenzte Tafel in Signal, nie volle Breite */
.pb-werkstoff .ws-board{background:var(--sys-signal);color:var(--sys-on-signal);padding:var(--sys-space-l) var(--sys-space-m) var(--sys-space-m);
  max-width:calc(var(--sys-space-measure) + var(--sys-space-xl))}
.pb-werkstoff .ws-board :focus-visible{outline-color:var(--sys-on-signal)}
.pb-werkstoff .ws-board-title{${step("h2")};margin:var(--sys-space-xs) 0 var(--sys-space-l);overflow-wrap:break-word;hyphens:auto}
.pb-werkstoff .ws-board-cat{margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-werkstoff .ws-board-list{list-style:none;margin:0;padding:0}
.pb-werkstoff .ws-board-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:var(--sys-space-2xs) var(--sys-space-s);align-items:baseline;
  padding:calc(var(--sys-space-s) * .75) 0;border-top:1px solid color-mix(in srgb,var(--sys-on-signal) 34%,transparent)}
.pb-werkstoff .ws-board-row--today{background:color-mix(in srgb,var(--sys-ink) 22%,transparent);margin-inline:calc(var(--sys-space-s) * -1);padding-inline:var(--sys-space-s)}
.pb-werkstoff .ws-board-name{${step("h3")};overflow-wrap:break-word;min-width:0}
.pb-werkstoff .ws-board-desc{grid-column:1/-1;${step("small")}}

/* Zahlen: Slab-Ziffern in Akzent, Mono-Zeile darunter */
.pb-werkstoff .ws-figs{list-style:none;margin:var(--sys-space-xl) 0 0;padding:var(--sys-space-l) 0 0;border-top:1px solid var(--sys-ink);
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}
.pb-werkstoff .ws-fig-value{display:block;${step("h2")};color:var(--sys-accent);overflow-wrap:anywhere}
.pb-werkstoff .ws-fig-label{display:block;color:var(--sys-muted);margin-top:var(--sys-space-xs)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-list li{grid-template-columns:minmax(0,1fr) calc(var(--sys-space-2xl) * 3) var(--sys-space-l)}
  .pb-werkstoff .ws-list-text{grid-column:1;grid-row:2}
  .pb-werkstoff .ws-list-meta{grid-column:2;grid-row:1/3;align-self:center}
  .pb-werkstoff .ws-list-arrow{grid-column:3;grid-row:1/3;align-self:center;justify-self:end}
  .pb-werkstoff .ws-figs{grid-template-columns:repeat(4,minmax(0,1fr))}
}
`;
