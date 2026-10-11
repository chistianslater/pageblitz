import { RASTER } from "../../../../../../shared/designSystems/raster";
import type { TypeStep } from "../../../../../../shared/designSystems/types";
import { systemFontFaces } from "../shared/fonts";

/** @font-face aus der Systemdefinition — Geist nur einmal (Display = Text). */
const FONT_FACES = systemFontFaces(RASTER);

/**
 * Vollständige Typo-Deklaration einer Stufe aus den System-Variablen.
 * Raster führt zusätzlich `figure` (große Ziffern, Bandnamen).
 */
export function step(s: TypeStep): string {
  const spec = RASTER.type[s];
  if (!spec) throw new Error(`Raster: Stufe ${s} fehlt`);
  return [
    `font-family:var(--sys-font-${spec.font})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/**
 * Breakpoints laut Systemblatt: Kapitel-Raster (12 Spalten, Labelspalte
 * 1–3) ab 900 px; Desktop-Navigation erst ab 64 rem, damit lange Namen
 * neben fünf, sechs Einträgen nicht gedrängt stehen.
 */
const GRID = "56.25rem";
const NAV = "64rem";

/** Gedämpfter Text auf `deep` (Systemblatt: onDeep 62 %). */
const ON_DEEP_DIM = "color-mix(in srgb,var(--sys-on-deep) 62%,var(--sys-deep))";
/** Haarlinie auf `deep` (Systemblatt: weiß 14–18 %). */
const DEEP_RULE = "color-mix(in srgb,var(--sys-on-deep) 18%,transparent)";

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
.pb-raster .rs-hide{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* Textlink: Haarlinie darunter */
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
.pb-raster .rs-menu-panel a[aria-current]{color:var(--sys-muted)}
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

/* Einstieg (vorläufig, R3 baut die drei Fassungen): Schrift trägt */
.pb-raster .rs-entry{padding-block:var(--sys-space-l) var(--sys-space-section)}
.pb-raster .rs-entry-kicker{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-raster .rs-entry h1{${step("display")};overflow-wrap:anywhere;hyphens:auto}
.pb-raster .rs-entry-lede{${step("lede")};margin-top:var(--sys-space-m);max-width:15em}

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
.pb-raster .rs-foot-col a::before,.pb-raster .rs-foot-legal a::before{content:"";position:absolute;inset:var(--rs-hit) calc(var(--sys-space-2xs) * -1)}
.pb-raster .rs-foot-col a:hover,.pb-raster .rs-foot-legal a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-foot-legal{${step("small")};color:${ON_DEEP_DIM};display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--sys-space-s) var(--sys-space-m);margin-top:var(--sys-space-xl)}
.pb-raster .rs-foot-legal a{text-decoration:none;position:relative}
@media (min-width:${GRID}){
  .pb-raster .rs-foot-cols{grid-template-columns:repeat(4,minmax(0,1fr))}
}
/* Bildnachweis im Fuß-Band (dunkel), gedämpft */
.pb-raster .pb-photo-credits{${step("small")};color:${ON_DEEP_DIM};background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-raster .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Kontakt-Insel (Formular) in Raster-Tokens */
.pb-raster .pb-island-form{gap:var(--sys-space-m)}
.pb-raster .pb-island-form label{${step("kicker")};color:var(--sys-muted);gap:var(--sys-space-xs)}
.pb-raster .pb-island-form input,.pb-raster .pb-island-form textarea{${step("body")};border:0;border-bottom:1px solid var(--sys-ink);border-radius:0;
  background:transparent;color:var(--sys-ink);padding:var(--sys-space-xs) 0}
.pb-raster .pb-island-form input:focus,.pb-raster .pb-island-form textarea:focus{outline:none;border-bottom-color:var(--sys-accent);box-shadow:0 1px 0 var(--sys-accent)}
.pb-raster .pb-island-submit{${step("link")};background:var(--sys-signal);color:var(--sys-on-signal);border-radius:0;padding:var(--sys-space-s) var(--sys-space-m)}
.pb-raster .pb-island-privacy{${step("small")};color:var(--sys-muted)}

@media (prefers-reduced-motion:reduce){.pb-raster *,.pb-raster *::before,.pb-raster *::after{transition:none!important;animation:none!important}}
/* ende raster */
`;
