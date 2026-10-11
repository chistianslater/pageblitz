import { RASTER } from "../../../../../../shared/designSystems/raster";
import { systemFontFaces } from "../shared/fonts";
import { FIT_FLOOR_REM, FIT_HARD_FLOOR_REM, FIT_MAX_REM } from "./fit";
import { DEEP_RULE, GRID, step } from "./step";
import { OFFER_CSS } from "./offerCss";
import { STORY_CSS } from "./storyCss";
import { VISIT_CSS } from "./visitCss";
import { RASTER_MOTION_CSS } from "./motionCss";

export { step } from "./step";
export { BAND_ALT, BAND_DESC_ALPHA, BAND_FILTER, BAND_SCRIM } from "./offerCss";

/** @font-face aus der Systemdefinition — Geist nur einmal (Display = Text). */
const FONT_FACES = systemFontFaces(RASTER);

/**
 * Breakpoints laut Systemblatt: Kapitel-Raster (12 Spalten, Labelspalte
 * 1–3) ab 900 px; Desktop-Navigation erst ab 64 rem, damit lange Namen
 * neben fünf, sechs Einträgen nicht gedrängt stehen.
 */
const NAV = "64rem";

/** Gedämpfter Text auf `deep` (Systemblatt: onDeep 62 %). */
const ON_DEEP_DIM = "color-mix(in srgb,var(--sys-on-deep) 62%,var(--sys-deep))";

/** Handy-Leiste nur unterhalb dieser Breite (Systemblatt). */
const DOCK = "48rem";
/**
 * Bildfilter laut Systemblatt Abschnitt 07 (S/W). Kontrast/Helligkeit des
 * Einstiegsfotos als Zahlen, weil die Kontrastprüfung (raster.test) damit
 * den schlimmsten Fall (rein weiße Fotofläche) nachrechnet.
 */
export const BLEED_FILTER = { contrast: 1.15, brightness: 0.8 } as const;
const FILTER_BLEED = `grayscale(1) contrast(${BLEED_FILTER.contrast}) brightness(${BLEED_FILTER.brightness})`;
const FILTER_PLATE = "grayscale(1) contrast(1.1) brightness(1.02)";

/**
 * Abdunkelung des Foto-Einstiegs (Anteil `deep`), so gewählt, dass auch auf
 * einer rein weißen Fotostelle gilt (siehe Test):
 *  - `base` über die ganze Höhe: Wortmarke (große Schrift) ≥ 3:1
 *  - `local` zusätzlich hinter Kopfzeile, Wortmarke + Kicker und dem
 *    unteren Textblock: kleine Schrift (Navigation, Kicker, Fakten) ≥ 4,5:1
 * Der Systemblatt-Verlauf (oben 38 %, unten 66 %) liegt obendrauf und zählt
 * für die Prüfung nicht mit.
 */
export const BLEED_SCRIM = { base: 0.4, local: 0.25 } as const;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const deepAt = (n: number) =>
  `color-mix(in srgb,var(--sys-deep) ${pct(n)},transparent)`;
const SCRIM = [
  // Kopfzeile (liegt außerhalb des Einstiegs, im Rahmen darüber)
  `linear-gradient(180deg,${deepAt(BLEED_SCRIM.local)} 0,${deepAt(BLEED_SCRIM.local)} var(--sys-space-2xl),transparent calc(var(--sys-space-2xl) + var(--sys-space-m)))`,
  // Systemblatt-Verlauf: oben 38 %, unten 66 %
  `linear-gradient(180deg,${deepAt(0.38)} 0%,transparent 32%,transparent 48%,${deepAt(0.66)} 100%)`,
  // Grundabdunkelung über die ganze Höhe
  `linear-gradient(${deepAt(BLEED_SCRIM.base)},${deepAt(BLEED_SCRIM.base)})`,
].join(",");
/** Lokaler Schleier hinter einem Textblock, randlos über die Fotobreite. */
const LOCAL_SCRIM = `linear-gradient(180deg,transparent 0,${deepAt(BLEED_SCRIM.local)} var(--sys-space-m),${deepAt(BLEED_SCRIM.local)} calc(100% - var(--sys-space-m)),transparent 100%)`;

/**
 * Einstieg (Systemblatt 6/10). Wortmarke: Größe aus der Spaltenbreite
 * (Container-Einheit) ÷ Breite des längsten Worts (`--rs-fit`, serverseitig
 * aus der Geist-Tabelle), Untergrenze `display`, Obergrenze 26 rem. Ohne
 * Container-Einheiten bleibt die Stufe `display`.
 */
const ENTRY_CSS = `/* Einstieg: drei Fassungen (plate · bleed · type) */
.pb-raster .rs-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-raster .rs-entry{position:relative;display:flex;flex-direction:column}
.pb-raster .rs-entry-in{position:relative;display:flex;flex-direction:column;flex:1 0 auto;width:100%;padding-block:var(--sys-space-s) var(--sys-space-xl)}
.pb-raster .rs-fit{container-type:inline-size}
.pb-raster .rs-wordmark{${step("display")};hyphens:manual;overflow-wrap:normal;word-break:normal;text-wrap:wrap;margin-left:-.04em}
@supports (font-size:1cqi){
  .pb-raster .rs-wordmark{font-size:clamp(${FIT_FLOOR_REM}rem,100cqi / var(--rs-fit),${FIT_MAX_REM}rem)}
  .pb-raster .rs-wordmark--tight{font-size:clamp(${FIT_HARD_FLOOR_REM}rem,100cqi / var(--rs-fit),${FIT_MAX_REM}rem)}
}
.pb-raster .rs-wordmark--tight{overflow-wrap:anywhere}
.pb-raster .rs-entry-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:var(--sys-space-2xs) var(--sys-space-m);margin-bottom:var(--sys-space-m)}
.pb-raster .rs-entry-kicker{${step("kicker")}}
.pb-raster .rs-entry-lede{${step("lede")};max-width:15em;hyphens:manual}
.pb-raster .rs-entry-bottom{display:grid;gap:var(--sys-space-s);margin-top:var(--sys-space-l)}
.pb-raster .rs-entry-facts{${step("small")};list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-2xs) var(--sys-space-m)}
.pb-raster .rs-entry-status{${step("kicker")}}
.pb-raster .rs-live{display:inline-flex;align-items:center;gap:var(--sys-space-xs)}
.pb-raster .rs-live::before{content:"";flex:none;width:var(--sys-space-xs);height:var(--sys-space-xs);background:var(--sys-signal)}

/* plate: Papier, Schrift oben, S/W-Tafel unten (Handy randlos) */
.pb-raster .rs-entry--plate .rs-entry-in{flex:0 0 auto}
.pb-raster .rs-entry-plate{margin:0;flex:1 0 auto;min-height:calc(var(--sys-space-2xl) * 4);position:relative;overflow:hidden;background:var(--sys-rule)}
.pb-raster .rs-entry-plate img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:${FILTER_PLATE}}

/* bleed: S/W-Foto vollflächig, Kopf liegt darüber (rs-frame) */
.pb-raster .rs-frame{position:relative}
.pb-raster .rs-head--over{position:absolute;inset-inline:0;top:0;background:transparent;color:var(--sys-on-deep)}
/* Navigation auf dem Foto voll deckend (Kontrast wird mit voller Farbe geprüft) */
.pb-raster .rs-head--over .rs-nav a:not(.rs-btn){color:var(--sys-on-deep)}
.pb-raster .rs-head--over .rs-menu-panel{color:var(--sys-ink)}
.pb-raster .rs-entry--bleed{min-height:100vh;min-height:100svh;background:var(--sys-deep);color:var(--sys-on-deep);overflow:hidden}
.pb-raster .rs-entry-bg{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;filter:${FILTER_BLEED}}
.pb-raster .rs-entry-scrim{position:absolute;inset:0;background:${SCRIM}}
.pb-raster .rs-entry--bleed .rs-entry-in{z-index:1;padding-top:calc(var(--sys-space-2xl) + var(--sys-space-2xs));padding-bottom:calc(var(--rs-dock,0rem) + var(--sys-space-l))}
.pb-raster .rs-entry--bleed .rs-entry-kicker{margin-top:var(--sys-space-s)}
.pb-raster .rs-entry--bleed .rs-entry-top,.pb-raster .rs-entry--bleed .rs-entry-bottom{position:relative}
.pb-raster .rs-entry--bleed .rs-entry-top::before,.pb-raster .rs-entry--bleed .rs-entry-bottom::before{content:"";position:absolute;z-index:-1;
  top:calc(var(--sys-space-m) * -1);bottom:calc(var(--sys-space-m) * -1);left:calc(50% - 50vw);right:calc(50% - 50vw);background:${LOCAL_SCRIM};pointer-events:none}
.pb-raster .rs-entry--bleed .rs-entry-bottom{margin-top:auto}
.pb-raster .rs-entry--bleed .rs-entry-top{margin-bottom:var(--sys-space-xl)}
.pb-raster .rs-entry--bleed :focus-visible{outline-color:var(--sys-on-deep)}

/* type: nur Schrift, Haarlinien-Zeilen, „24/7" in Signal */
.pb-raster .rs-entry--type .rs-entry-in{min-height:calc(100svh - var(--sys-space-2xl) - var(--rs-dock,0rem))}
.pb-raster .rs-entry--type .rs-entry-row{border-top:1px solid var(--sys-rule);border-bottom:1px solid var(--sys-rule);padding-block:var(--sys-space-s);margin-bottom:var(--sys-space-s)}
.pb-raster .rs-entry--type .rs-entry-kicker{color:var(--sys-muted)}
.pb-raster .rs-entry-clock{container-type:inline-size;border-top:1px solid var(--sys-rule);margin-top:var(--sys-space-s);padding-top:var(--sys-space-xs);color:var(--sys-signal)}
.pb-raster .rs-entry-clock-figure{${step("figure")};display:block;font-variant-numeric:tabular-nums;white-space:nowrap}
@supports (font-size:1cqi){
  .pb-raster .rs-entry-clock-figure{font-size:clamp(var(--sys-figure-size),100cqi / var(--rs-fit),${FIT_MAX_REM}rem)}
}
.pb-raster .rs-entry--type .rs-entry-bottom{margin-top:auto;padding-top:var(--sys-space-xl)}

@media (min-width:${GRID}){
  .pb-raster .rs-entry--plate .rs-entry-in{padding-bottom:var(--sys-space-l)}
  .pb-raster .rs-entry-plate{flex:none;min-height:0;aspect-ratio:21/9;max-width:calc(var(--sys-space-max) - 2 * var(--sys-space-gutter));width:calc(100% - 2 * var(--sys-space-gutter));margin:0 auto var(--sys-space-section)}
  .pb-raster .rs-entry--bleed .rs-entry-bottom{display:flex;justify-content:space-between;align-items:flex-end;gap:var(--sys-space-l)}
  .pb-raster .rs-entry--bleed .rs-entry-facts{justify-content:flex-end;text-align:right}
  .pb-raster .rs-entry--type .rs-entry-bottom{grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-raster .rs-entry--type .rs-entry-bottom>*{grid-column:1/9}
}`;

/** Handy-Leiste: zwei Felder oder Anrufleiste, 64 px, Sicherheitsabstand unten. */
const DOCK_CSS = `/* Handy-Leiste (unter ${DOCK}) */
.pb-raster .rs-dock{display:none}
@media (max-width:47.99rem){
  .pb-raster{--rs-dock:calc(var(--sys-space-l) + var(--sys-space-m))}
  .pb-raster:has(.rs-dock){padding-bottom:calc(var(--rs-dock) + env(safe-area-inset-bottom,0rem))}
  .pb-raster .rs-dock{position:fixed;inset-inline:0;bottom:0;z-index:30;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;
    background:var(--sys-rule);border-top:1px solid var(--sys-rule);padding-bottom:env(safe-area-inset-bottom,0rem)}
  .pb-raster .rs-dock--one,.pb-raster .rs-dock--call{grid-template-columns:minmax(0,1fr)}
  .pb-raster .rs-dock-field{display:flex;flex-direction:column;justify-content:center;gap:0;height:var(--rs-dock);overflow:hidden;padding:0 var(--sys-space-gutter);
    background:var(--sys-paper);color:var(--sys-ink);text-decoration:none;min-width:0}
  .pb-raster .rs-dock-field--signal{background:var(--sys-signal);color:var(--sys-on-signal)}
  .pb-raster .rs-dock-field--signal .rs-dock-detail{opacity:1}
  .pb-raster .rs-dock-field:active{background:color-mix(in srgb,var(--sys-paper) 88%,var(--sys-ink))}
  .pb-raster .rs-dock-field--signal:active{background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
  .pb-raster .rs-dock-field:focus-visible{outline:var(--rs-focus) solid currentColor;outline-offset:calc(var(--rs-focus) * -2)}
  .pb-raster .rs-dock-label{${step("link")};flex:none}
  /* Zweizeiliges Label (schmal, lange Aktion) verdrängt die Detailzeile, nie die Leistenhöhe */
  .pb-raster .rs-dock-detail{${step("small")};opacity:.78;font-variant-numeric:tabular-nums;letter-spacing:0;min-height:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .pb-raster .rs-dock--call .rs-dock-field{flex-direction:row;align-items:center;justify-content:space-between;gap:var(--sys-space-s)}
  .pb-raster .rs-dock-number{${step("mark")};text-transform:none;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}
}`;

/**
 * Grundschicht von Raster (Kopf, Fuß, Kapitel-Raster, Knopf, Rechtsseiten).
 * Gestalt nach docs/designsysteme/raster/systemblatt.html (Anker Colophon).
 * Größen, Abstände und Farben ausschließlich über `--sys-*`; Ausnahmen:
 * 1px-Haarlinien, Mischungen auf `deep` und der Fokusring. Abschnitte
 * (R3–R6) hängen ihr CSS vor dem Endmarker an.
 */
export const RASTER_CSS = `
${FONT_FACES}

.pb-raster{--rs-focus:2px;--rs-hit:calc(var(--sys-space-s) * -.75);--rs-tap:calc(var(--sys-space-l) + var(--sys-space-2xs));
  background:var(--sys-paper);color:var(--sys-ink);${step("body")};
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal}
.pb-raster *{box-sizing:border-box}
.pb-raster h1,.pb-raster h2,.pb-raster h3{margin:0;font-weight:400;text-wrap:balance;hyphens:manual}
.pb-raster p{margin:0;text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-raster address{font-style:normal}
.pb-raster a{color:inherit}
.pb-raster img{display:block;max-width:100%}
.pb-raster :focus-visible{outline:var(--rs-focus) solid currentColor;outline-offset:var(--sys-space-2xs)}
.pb-raster .rs-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
.pb-raster .rs-kicker{${step("kicker")}}
.pb-raster .rs-mark{${step("mark")}}
.pb-raster .rs-num{font-variant-numeric:tabular-nums}

/* Textlink: Haarlinie darunter (für „Route planen“/„E-Mail schreiben“ in Kontakt, R6) */
.pb-raster .rs-link{${step("link")};text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em;position:relative}
.pb-raster .rs-link:hover{text-decoration-color:transparent}
.pb-raster .rs-link::before{content:"";position:absolute;inset:var(--rs-hit) calc(var(--sys-space-2xs) * -1)}

/* Knopf: Signalfläche, eckig, 52 px (Systemblatt) bzw. 44 px im Kopf */
.pb-raster .rs-btn{${step("link")};display:inline-flex;align-items:center;justify-content:center;gap:var(--sys-space-xs);text-decoration:none;
  min-height:calc(var(--sys-space-l) + var(--sys-space-s) - var(--sys-space-2xs));padding:0 var(--sys-space-m);
  background:var(--sys-signal);color:var(--sys-on-signal);transition:background 200ms,transform 120ms}
.pb-raster .rs-btn:hover{background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
.pb-raster .rs-btn:active{transform:scale(.98)}
.pb-raster .rs-btn:focus-visible{outline-color:var(--sys-ink)}

/* Kopf: Wortmarke links, „Menü" rechts; Desktop Navigation + Knopf */
.pb-raster .rs-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink)}
.pb-raster .rs-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:var(--sys-space-m);
  min-height:var(--sys-space-2xl);padding:var(--sys-space-xs) var(--sys-space-gutter)}
.pb-raster .rs-brand{${step("mark")};text-decoration:none;min-width:0;overflow-wrap:anywhere;display:flex;align-items:center;min-height:var(--rs-tap)}
.pb-raster .rs-menu-toggle{${step("link")};list-style:none;cursor:pointer;display:flex;align-items:center;min-height:var(--rs-tap);padding-inline:var(--sys-space-2xs);
  margin-inline-end:calc(var(--sys-space-2xs) * -1)}
.pb-raster .rs-menu-toggle::-webkit-details-marker{display:none}
.pb-raster .rs-menu[open] .rs-menu-toggle{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-menu-panel{position:absolute;left:0;right:0;top:100%;background:var(--sys-paper);border-top:1px solid var(--sys-rule);border-bottom:1px solid var(--sys-rule);
  padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-l);display:grid}
.pb-raster .rs-menu-panel a{${step("h3")};text-decoration:none;display:flex;align-items:center;min-height:var(--rs-tap);padding-block:var(--sys-space-xs);border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-menu-panel a[aria-current]{color:var(--sys-muted);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-nav{display:none}
@media (min-width:${NAV}){
  .pb-raster .rs-menu{display:none}
  .pb-raster .rs-nav{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:var(--sys-space-xs) var(--sys-space-l)}
  .pb-raster .rs-nav a:not(.rs-btn){${step("link")};text-decoration:none;color:var(--sys-muted);display:inline-flex;align-items:center;min-height:var(--rs-tap);transition:color 200ms}
  .pb-raster .rs-nav a:not(.rs-btn):hover,.pb-raster .rs-nav a[aria-current]{color:var(--sys-ink)}
  .pb-raster .rs-nav a[aria-current]{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
  .pb-raster .rs-nav .rs-btn{min-height:var(--rs-tap)}
}

/* Kapitel (Colophon): Haarlinie über die Inhaltsbreite, Label oben links, Inhalt rechts */
.pb-raster .rs-sec{padding-bottom:var(--sys-space-section)}
.pb-raster .rs-sec>.rs-wrap{border-top:1px solid var(--sys-rule);padding-top:var(--sys-space-m)}
.pb-raster .rs-entry+.rs-sec>.rs-wrap{border-top:0}
.pb-raster .rs-lab{${step("kicker")};display:flex;gap:.5em;margin:0 0 var(--sys-space-l)}
.pb-raster .rs-no{color:var(--sys-ink);font-variant-numeric:tabular-nums}
.pb-raster .rs-lab-text{color:var(--sys-muted)}
.pb-raster .rs-body{display:grid;gap:var(--sys-space-m);align-content:start;min-width:0}
.pb-raster .rs-title{${step("h2")}}
.pb-raster .rs-intro{${step("h3")};color:var(--sys-muted);max-width:var(--sys-space-measure)}
@media (min-width:${GRID}){
  .pb-raster .rs-g12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-raster .rs-g12>.rs-lab{grid-column:1/4;margin:0}
  .pb-raster .rs-g12>.rs-body{grid-column:4/11}
  .pb-raster .rs-g12>.rs-body--full{grid-column:4/13}
}

${ENTRY_CSS}

${OFFER_CSS}

${STORY_CSS}

${VISIT_CSS}

/* Unterseiten- und Rechtsseiten-Kopf: genau ein h1 */
.pb-raster .rs-page-head{padding-block:var(--sys-space-l) var(--sys-space-xl)}
.pb-raster .rs-page-kicker{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-raster .rs-page-head h1{${step("h2")};overflow-wrap:anywhere}
.pb-raster .rs-page-intro{${step("h3")};color:var(--sys-muted);margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}
.pb-raster .rs-legal{padding-bottom:var(--sys-space-section)}
.pb-raster .rs-legal>*{max-width:var(--sys-space-measure)}
.pb-raster .rs-legal h2{${step("h3")};margin:var(--sys-space-xl) 0 var(--sys-space-s);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule)}
.pb-raster .rs-legal h3{${step("body")};font-weight:500;margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-raster .rs-legal p,.pb-raster .rs-legal ul{margin:0 0 var(--sys-space-s)}
.pb-raster .rs-legal a{overflow-wrap:anywhere}

/* Fuß: dunkel, Aufforderung, vier Spalten Fakten, Rechtszeile */
.pb-raster .rs-foot{background:var(--sys-deep);color:var(--sys-on-deep);padding-block:var(--sys-space-section) var(--sys-space-l)}
.pb-raster .rs-foot-call{${step("h2")};max-width:14em}
.pb-raster .rs-foot-call a{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.14em}
.pb-raster .rs-foot-call a:hover{text-decoration-color:transparent}
.pb-raster .rs-foot-cols{${step("small")};display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m);
  margin-top:var(--sys-space-xl);border-top:1px solid ${DEEP_RULE};padding-top:var(--sys-space-m)}
.pb-raster .rs-foot-col{min-width:0;overflow-wrap:anywhere}
.pb-raster .rs-foot-h{${step("small")};color:${ON_DEEP_DIM};margin:0 0 var(--sys-space-xs)}
.pb-raster .rs-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-raster .rs-foot-col a{text-decoration:none;position:relative}
.pb-raster .rs-foot-col a::before{content:"";position:absolute;inset:var(--rs-hit) calc(var(--sys-space-2xs) * -1)}
.pb-raster .rs-foot-col a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-foot-legal{${step("small")};color:${ON_DEEP_DIM};display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--sys-space-s) var(--sys-space-m);margin-top:var(--sys-space-xl)}
@media (min-width:${GRID}){
  .pb-raster .rs-foot-cols{grid-template-columns:repeat(4,minmax(0,1fr))}
}
${DOCK_CSS}

/* Bildnachweis im Fuß-Band (dunkel), gedämpft */
.pb-raster .pb-photo-credits{${step("small")};color:${ON_DEEP_DIM};background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-raster .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Kontakt-Insel (Formular) in Raster-Tokens */
.pb-raster .pb-island-form{gap:var(--sys-space-m)}
.pb-raster .pb-island-form label{${step("kicker")};color:var(--sys-muted);gap:var(--sys-space-xs)}
.pb-raster .pb-island-form input,.pb-raster .pb-island-form textarea{${step("body")};border:0;border-bottom:1px solid var(--sys-ink);border-radius:0;
  background:transparent;color:var(--sys-ink);padding:var(--sys-space-xs) 0}
/* Fokus nicht nur über Farbe: Linie wird um die Fokusring-Stärke dicker */
.pb-raster .pb-island-form input:focus,.pb-raster .pb-island-form textarea:focus{outline:none;border-bottom-color:var(--sys-accent);box-shadow:0 var(--rs-focus) 0 var(--sys-accent)}
.pb-raster .pb-island-submit{${step("link")};background:var(--sys-signal);color:var(--sys-on-signal);border-radius:0;padding:var(--sys-space-s) var(--sys-space-m)}
.pb-raster .pb-island-privacy{${step("small")};color:var(--sys-muted)}

${RASTER_MOTION_CSS}
@media (prefers-reduced-motion:reduce){.pb-raster *,.pb-raster *::before,.pb-raster *::after{transition:none!important;animation:none!important}}
/* ende raster */
`;
