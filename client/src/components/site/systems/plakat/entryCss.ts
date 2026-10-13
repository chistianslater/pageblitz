import { DOCK, GRID, PILL, step } from "./step";

/**
 * Einstieg, Sticker, Laufband, Dock (Systemblatt 8, 9, 15). Nur Tokens
 * (oder Vielfache). Maße des Systemblatts als Vielfache: Sticker 108 px ≈
 * 1,04 × 2xl (Desktop 150 px ≈ 1,45 × 2xl), Knopf 56 px = 0,875 × xl,
 * Signal-Kreis 40 px = l, Dock-Knopf 48 px = 0,75 × xl.
 */
const ENTRY = `/* Einstieg: arch · circle · type */
.pb-plakat .pk-entry{padding-block:var(--sys-space-m) var(--sys-space-xl);overflow:hidden}
.pb-plakat .pk-entry--type{padding-top:var(--sys-space-l)}
.pb-plakat .pk-entry-grid{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter);display:grid;grid-template-columns:minmax(0,1fr)}
.pb-plakat .pk-entry-text,.pb-plakat .pk-entry-copy,.pb-plakat .pk-entry-media{min-width:0}
/* Status-Zeile bleibt einzeilig; reicht der Platz nicht, rutscht der Sticker darunter (rechts) */
.pb-plakat .pk-entry-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:var(--sys-space-s);margin-bottom:var(--sys-space-m)}
.pb-plakat .pk-entry-top .pk-entry-stk{margin-left:auto}
.pb-plakat .pk-status{${step("kicker")};display:inline-flex;align-items:center;gap:calc(var(--sys-space-xs) * 1.125);white-space:nowrap}
.pb-plakat .pk-status::before{content:"";flex:none;width:calc(var(--sys-space-xs) * 1.125);height:calc(var(--sys-space-xs) * 1.125);border-radius:50%;background:var(--sys-signal)}
.pb-plakat .pk-status--closed::before{background:var(--pk-muted)}
.pb-plakat .pk-entry-kicker{${step("kicker")};color:var(--pk-muted);margin-bottom:var(--sys-space-xs);overflow-wrap:anywhere}
.pb-plakat .pk-entry-name{display:inline;font:inherit;letter-spacing:inherit;color:inherit}
/* Große Zeile: Staffel, füllt die Breite (--pk-fit aus fit.ts), Zeile ≥ .88 für Umlautpunkte */
.pb-plakat .pk-fit{container-type:inline-size}
.pb-plakat .pk-display{${step("display")};font-size:var(--sys-h2-size);overflow-wrap:anywhere;hyphens:manual;text-wrap:wrap}
.pb-plakat .pk-display span{display:block}
.pb-plakat .pk-display .pk-in{padding-left:1.6em}
@supports (font-size:1cqi){
  .pb-plakat .pk-display{font-size:clamp(var(--sys-h3-size),calc(100cqi / var(--pk-fit)),var(--sys-display-size))}
}
.pb-plakat .pk-display--flow,.pb-plakat .pk-display.pk-display--flow{font-size:var(--sys-h2-size);text-wrap:balance}
/* Fließsatz: Stufe h2, gedeckelt am längsten Wort (--pk-word aus fit.ts) — Umbruch nur zwischen Wörtern */
@supports (font-size:1cqi){
  .pb-plakat .pk-display--flow,.pb-plakat .pk-display.pk-display--flow{font-size:min(var(--sys-h2-size),100cqi / var(--pk-word,1))}
}
/* Formen: Duoton = grau + multiply auf Feldfarbe */
.pb-plakat .pk-shape{position:relative;overflow:hidden;isolation:isolate;background:var(--pk-shape-bg,var(--sys-rule))}
.pb-plakat .pk-shape img{display:block;width:100%;height:100%;max-width:none;object-fit:cover;filter:var(--sys-image-filter);mix-blend-mode:multiply}
.pb-plakat .pk-shape--arch{aspect-ratio:4/5;border-radius:${PILL} ${PILL} 0 0}
.pb-plakat .pk-shape--circle{aspect-ratio:1;border-radius:50%}
.pb-plakat .pk-entry-media{position:relative}
.pb-plakat .pk-entry--arch .pk-entry-media{margin:var(--sys-space-m) 0 0 24%;--pk-shape-bg:var(--sys-field-1-bg)}
.pb-plakat .pk-entry--circle .pk-entry-media{width:74%;margin:var(--sys-space-s) 0 0 auto;--pk-shape-bg:var(--sys-field-2-bg)}
.pb-plakat .pk-entry--arch .pk-entry-stk{position:absolute;left:max(calc(var(--pk-stk) * -.78),-31%);top:calc(var(--sys-space-l) * .85)}
.pb-plakat .pk-entry--circle .pk-entry-stk{position:absolute;left:calc(var(--pk-stk) * -.28);bottom:0}
.pb-plakat .pk-entry-lede{${step("lede")};margin-top:var(--sys-space-m);max-width:calc(var(--sys-space-measure) * .82)}
.pb-plakat .pk-entry-actions{display:flex;flex-wrap:wrap;gap:calc(var(--sys-space-xs) * 1.25);margin-top:var(--sys-space-l)}
.pb-plakat .pk-facts{list-style:none;margin:var(--sys-space-l) 0 0;padding:var(--sys-space-m) 0 0;border-top:2px solid currentColor;
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * 1.25)}
.pb-plakat .pk-facts li{${step("small")};font-weight:600;min-width:0;overflow-wrap:anywhere}
.pb-plakat .pk-facts b{display:block;font-weight:600}
.pb-plakat .pk-facts span{display:block;font-weight:500;color:var(--pk-muted)}

@media (min-width:${GRID}){
  .pb-plakat .pk-entry{padding-top:var(--sys-space-l)}
  .pb-plakat .pk-entry-grid{grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m);grid-template-rows:auto 1fr auto}
  .pb-plakat .pk-entry-text{grid-column:1/8;grid-row:1}
  .pb-plakat .pk-entry-copy{grid-column:1/7;grid-row:2;align-self:start}
  .pb-plakat .pk-entry-media,.pb-plakat .pk-entry--arch .pk-entry-media,.pb-plakat .pk-entry--circle .pk-entry-media{grid-column:8/13;grid-row:1/3;margin:0;width:auto;align-self:start}
  .pb-plakat .pk-entry--circle .pk-entry-media{align-self:center}
  /* Schrift-Einstieg: Zeilen fließen (eine Spalte trägt sie), Sticker in der freien Ecke rechts */
  .pb-plakat .pk-entry-grid{position:relative}
  .pb-plakat .pk-entry--type .pk-entry-text{grid-column:1/10}
  .pb-plakat .pk-entry--type .pk-entry-copy{grid-column:1/8}
  .pb-plakat .pk-entry--type .pk-display span{display:inline}
  .pb-plakat .pk-entry--type .pk-display .pk-in{padding-left:0}
  /* Ohne Foto trägt die Schrift die ganze Fläche: eine Stufe größer, bricht als Plakatzeilen um */
  .pb-plakat .pk-entry--type .pk-display{font-size:calc(var(--sys-display-size) * 1.35);text-wrap:balance}
  @supports (font-size:1cqi){
    .pb-plakat .pk-entry--type .pk-display{font-size:min(calc(var(--sys-display-size) * 1.35),100cqi / var(--pk-word,1))}
  }
  .pb-plakat .pk-entry--type .pk-entry-stk{position:absolute;right:var(--sys-space-gutter);top:0}
  .pb-plakat .pk-entry--arch .pk-entry-stk{left:calc(var(--pk-stk) * -.47);top:calc(var(--sys-space-xl) * .875)}
  .pb-plakat .pk-facts{grid-column:1/-1;grid-row:3;grid-template-columns:repeat(4,minmax(0,1fr))}
}`;

/** Sticker: rund, Signal, −9°, gestrichelter Innenring; auf Feldern tief. */
const STICKER = `/* Sticker */
.pb-plakat .pk-stk{--pk-stk:calc(var(--sys-space-2xl) * 1.04);position:relative;z-index:2;flex:none;margin:0;width:var(--pk-stk);aspect-ratio:1;border-radius:50%;
  background:var(--sys-signal);color:var(--sys-on-signal);display:grid;place-items:center;text-align:center;transform:rotate(-9deg);
  box-shadow:0 var(--sys-space-xs) var(--sys-space-m) calc(var(--sys-space-s) * -.875) color-mix(in srgb,var(--sys-ink) 60%,transparent)}
.pb-plakat .pk-stk::before{content:"";position:absolute;inset:calc(var(--sys-space-2xs) * 1.5);border-radius:50%;border:1px dashed currentColor;opacity:.6}
.pb-plakat .pk-stk-in{display:block;max-width:82%}
.pb-plakat .pk-stk b{display:block;font-family:var(--sys-font-display);font-weight:400;font-size:calc(var(--pk-stk) * .34);line-height:.9;text-transform:uppercase;font-stretch:var(--sys-display-stretch)}
.pb-plakat .pk-stk--long b{font-size:calc(var(--pk-stk) * .25)}
.pb-plakat .pk-stk--xlong b{font-size:calc(var(--pk-stk) * .2)}
.pb-plakat .pk-stk-in>span{display:block;font-family:var(--sys-font-text);font-weight:700;font-size:calc(var(--pk-stk) * .12);line-height:1.15;margin-top:var(--sys-space-2xs)}
.pb-plakat .pk-stk--fine .pk-stk-in>span{font-size:calc(var(--pk-stk) * .1)}
.pb-plakat .pk-stk--fine .pk-stk-in{max-width:76%}
.pb-plakat .pk-stk--inv{background:var(--sys-deep);color:var(--sys-on-deep)}
@media (min-width:${GRID}){.pb-plakat .pk-stk{--pk-stk:calc(var(--sys-space-2xl) * 1.45)}}`;

/** Laufband: tief, League Gothic, Signalpunkt; läuft nur mit Script (motionCss), sonst still. */
const TICKER = `/* Laufband */
.pb-plakat .pk-tick{position:relative;background:var(--sys-field-3-bg);color:var(--sys-field-3-ink);overflow:hidden;padding-block:var(--sys-space-s)}
.pb-plakat .pk-tick-track{display:flex;width:max-content;padding-left:var(--sys-space-gutter)}
.pb-plakat .pk-tick-run{display:flex;align-items:center;list-style:none;margin:0;padding:0}
.pb-plakat .pk-tick-run li{display:flex;align-items:center;white-space:nowrap;font-family:var(--sys-font-display);font-weight:400;font-size:calc(var(--sys-h2-size) * .72);
  line-height:1;text-transform:uppercase;font-stretch:var(--sys-h2-stretch);letter-spacing:var(--sys-h2-track)}
.pb-plakat .pk-tick-run li::after{content:"";flex:none;width:calc(var(--sys-space-s) * .875);height:calc(var(--sys-space-s) * .875);border-radius:50%;background:var(--sys-signal);margin-inline:calc(var(--sys-space-s) * 1.375)}
/* Pause-Knopf (WCAG 2.2.2): nur sichtbar, wenn das Band läuft (motionCss) */
.pb-plakat .pk-tick-toggle{display:none;place-items:center;position:absolute;z-index:1;right:var(--sys-space-gutter);top:50%;transform:translateY(-50%);
  width:var(--pk-tap);height:var(--pk-tap);padding:0;border:0;border-radius:50%;cursor:pointer;
  background:var(--sys-field-3-bg);color:var(--sys-field-3-ink);box-shadow:inset 0 0 0 2px currentColor,0 0 0 var(--sys-space-xs) var(--sys-field-3-bg)}
.pb-plakat .pk-tick-toggle i{display:block;width:calc(var(--sys-space-s) * .75);height:calc(var(--sys-space-s) * .875);
  border-inline:calc(var(--sys-space-2xs) * .75) solid currentColor}
.pb-plakat .pk-tick-toggle[aria-pressed="true"] i{width:0;height:0;margin-left:calc(var(--sys-space-2xs) * .75);border-inline-end:0;
  border-block:calc(var(--sys-space-s) * .4375) solid transparent;border-inline-start:calc(var(--sys-space-s) * .75) solid currentColor}
.pb-plakat .pk-tick-toggle:focus-visible{outline-color:var(--sys-field-3-ink)}`;

/** Dock: Tinte-Pille, Neben-Weg + Hauptaktion in Signal (unter 48 rem). */
const DOCK_CSS = `/* Dock (unter ${DOCK}) */
.pb-plakat .pk-dock{display:none}
@media (max-width:47.99rem){
  .pb-plakat{--pk-dock:calc(var(--sys-space-xl) + var(--sys-space-s) * 1.75)}
  .pb-plakat:has(.pk-dock) .pk-foot{padding-bottom:calc(var(--sys-space-l) + var(--pk-dock) + env(safe-area-inset-bottom,0rem))}
  .pb-plakat:has(.pk-dock):has(.pb-photo-credits) .pk-foot{padding-bottom:var(--sys-space-l)}
  .pb-plakat:has(.pk-dock) .pb-photo-credits{padding-bottom:calc(var(--sys-space-l) + var(--pk-dock) + env(safe-area-inset-bottom,0rem))}
  .pb-plakat .pk-dock{position:fixed;z-index:30;inset-inline:calc(var(--sys-space-xs) * 1.5);bottom:calc(var(--sys-space-xs) * 1.5 + env(safe-area-inset-bottom,0rem));
    display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--sys-space-xs);padding:var(--sys-space-xs);border-radius:${PILL};
    background:var(--sys-ink);box-shadow:0 var(--sys-space-s) var(--sys-space-l) calc(var(--sys-space-s) * -1.125) color-mix(in srgb,var(--sys-ink) 70%,transparent)}
  .pb-plakat .pk-dock--one{grid-template-columns:minmax(0,1fr)}
  .pb-plakat .pk-dock a{${step("link")};font-size:var(--sys-small-size);display:grid;place-items:center;text-align:center;min-height:calc(var(--sys-space-xl) * .75);
    min-width:0;padding-inline:calc(var(--sys-space-s) * 1.25);border-radius:${PILL};color:var(--sys-paper);text-decoration:none;overflow-wrap:anywhere;transition:transform 160ms}
  .pb-plakat .pk-dock a:active{transform:scale(.97)}
  .pb-plakat .pk-dock-b{background:var(--sys-signal)}
  .pb-plakat .pk-dock a.pk-dock-b{color:var(--sys-on-signal)}
  .pb-plakat .pk-dock a:focus-visible{outline-color:var(--sys-paper)}
}`;

export const ENTRY_CSS = [ENTRY, STICKER, TICKER, DOCK_CSS].join("\n\n");
