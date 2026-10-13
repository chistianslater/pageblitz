import { FREUNDLICH } from "../../../../../../shared/designSystems/freundlich";
import { systemFontFaces } from "../shared/fonts";
import {
  CLOUD,
  CLOUD_WIDE,
  DOCK,
  FOCUS,
  H_BTN,
  H_MIN,
  H_SMALL,
  HEAD_H,
  LINE,
  LOGO,
  NAV,
  WIDE,
  step,
} from "./step";
import { ENTRY_CSS } from "./entryCss";
import { CONTENT_CSS } from "./contentCss";

export { step } from "./step";

/** @font-face aus der Systemdefinition — Bricolage Grotesque, Instrument Sans. */
const FONT_FACES = systemFontFaces(FREUNDLICH);

/** Druckkante beim Überfahren 6 px, beim Drücken 1 px (Endwerte). */
const PRESS_HOVER = "calc(var(--sys-press) * 1.5)";
const PRESS_DOWN = "calc(var(--sys-press) * .25)";

/**
 * Grundschicht von Freundlich (Kopf, Knöpfe, Unterseiten, Fuß,
 * Handy-Leiste; Einstieg in entryCss, Abschnitte in contentCss). Gestalt
 * nach docs/designsysteme/freundlich/systemblatt.html (Anker Bright Path).
 * Größen, Abstände, Radien und Farben ausschließlich über `--sys-*` (oder
 * Vielfache); Ausnahmen: 1px/1,5px-Linien und der 3px-Fokusring.
 */
export function freundlichCss(sections: string): string {
  return `
${FONT_FACES}

.pb-freundlich{background:var(--sys-paper);color:var(--sys-ink);${step("body")};font-variant-numeric:lining-nums;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-kerning:normal;overflow-x:clip}
.pb-freundlich *{box-sizing:border-box}
.pb-freundlich h1,.pb-freundlich h2,.pb-freundlich h3,.pb-freundlich h4{margin:0;font-weight:inherit;text-wrap:balance;hyphens:manual}
.pb-freundlich p,.pb-freundlich blockquote,.pb-freundlich figure,.pb-freundlich dl,.pb-freundlich dd{margin:0}
.pb-freundlich p{text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:10 4 4}
.pb-freundlich address{font-style:normal}
.pb-freundlich a{color:inherit}
.pb-freundlich img{display:block;max-width:100%;height:auto;filter:var(--sys-image-filter)}
.pb-freundlich ::selection{background:var(--sys-tint-1-bg);color:var(--sys-tint-1-ink)}
.pb-freundlich .fr-ic{flex:none;width:1.2em;height:1.2em}
.pb-freundlich :focus-visible{outline:${FOCUS} solid var(--sys-accent);outline-offset:var(--sys-space-2xs)}
.pb-freundlich .fr-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-freundlich .fr-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}

/* Knöpfe: Pille mit Druckkante. Haupt = Signal mit Kante, Zweit = Weiß mit Tintenrand. */
.pb-freundlich .fr-btn{${step("link")};display:inline-flex;align-items:center;justify-content:center;gap:calc(var(--sys-space-s) * .625);max-width:100%;min-height:${H_BTN};
  padding:var(--sys-space-xs) calc(var(--sys-space-s) * 1.625);border-radius:var(--sys-radius-pill);text-decoration:none;text-align:center;cursor:pointer;
  transition:transform 140ms cubic-bezier(.22,1,.36,1),box-shadow 140ms cubic-bezier(.22,1,.36,1)}
.pb-freundlich .fr-btn--p{background:var(--sys-signal);color:var(--sys-on-signal);box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 var(--sys-press) 0 var(--sys-edge-color)}
.pb-freundlich .fr-btn--s{background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 ${LINE} var(--sys-ink),0 var(--sys-press) 0 var(--sys-ink)}
.pb-freundlich .fr-btn:active{transform:translateY(calc(var(--sys-press) * .75))}
.pb-freundlich .fr-btn--p:active{box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 ${PRESS_DOWN} 0 var(--sys-edge-color)}
.pb-freundlich .fr-btn--s:active{box-shadow:inset 0 0 0 ${LINE} var(--sys-ink),0 ${PRESS_DOWN} 0 var(--sys-ink)}
@media (hover:hover) and (pointer:fine){
  .pb-freundlich .fr-btn:hover{transform:translateY(calc(var(--sys-press) * -.5))}
  .pb-freundlich .fr-btn--p:hover{box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 ${PRESS_HOVER} 0 var(--sys-edge-color)}
  .pb-freundlich .fr-btn--s:hover{box-shadow:inset 0 0 0 ${LINE} var(--sys-ink),0 ${PRESS_HOVER} 0 var(--sys-ink)}
}

/* Kopf: Zeichen + Name, „Menü" als Pille; Desktop Navigation, Telefon, Hauptweg */
.pb-freundlich .fr-top{position:relative}
.pb-freundlich .fr-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink)}
.pb-freundlich .fr-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;gap:calc(var(--sys-space-s) * .875);min-height:${HEAD_H};padding:0 var(--sys-space-gutter)}
.pb-freundlich .fr-brand{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .625);margin-right:auto;min-width:0;min-height:${H_MIN};text-decoration:none}
.pb-freundlich .fr-logo{flex:none;display:grid;place-items:center;width:${LOGO};height:${LOGO};border-radius:var(--sys-radius-s);background:var(--sys-deep);color:var(--sys-on-deep);
  ${step("mark")};font-size:calc(${LOGO} * .5)}
.pb-freundlich .fr-mark{${step("mark")};min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pb-freundlich .fr-menu{flex:none}
.pb-freundlich .fr-menu-toggle{${step("link")};display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${H_MIN};padding:0 var(--sys-space-s);border-radius:var(--sys-radius-pill);
  background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 ${LINE} var(--sys-ink);list-style:none;cursor:pointer}
.pb-freundlich .fr-menu-toggle::-webkit-details-marker{display:none}
.pb-freundlich .fr-menu[open] .fr-menu-toggle{background:var(--sys-tint-1-bg);color:var(--sys-tint-1-ink)}
.pb-freundlich .fr-menu-panel{position:absolute;left:var(--sys-space-gutter);right:var(--sys-space-gutter);top:calc(100% - var(--sys-space-xs));display:grid;background:var(--sys-surface);color:var(--sys-ink);
  padding:var(--sys-space-xs) var(--sys-space-m);border-radius:var(--sys-radius-m);box-shadow:inset 0 0 0 ${LINE} var(--sys-ink),0 var(--sys-press) 0 var(--sys-ink)}
.pb-freundlich .fr-menu-panel a{${step("h3")};display:flex;align-items:center;min-height:${H_SMALL};padding-block:var(--sys-space-xs);text-decoration:none;border-bottom:1px solid var(--sys-rule)}
.pb-freundlich .fr-menu-panel a:last-child{border-bottom:0}
.pb-freundlich .fr-menu-panel a[aria-current]{color:var(--sys-accent)}
.pb-freundlich .fr-nav,.pb-freundlich .fr-btn--head{display:none}
@media (min-width:${NAV}){
  .pb-freundlich .fr-menu--main{display:none}
  .pb-freundlich .fr-menu--always{display:block}
  .pb-freundlich .fr-nav{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:var(--sys-space-xs) calc(var(--sys-space-s) * 1.875);margin-right:calc(var(--sys-space-s) * .5)}
  .pb-freundlich .fr-nav a{${step("link")};font-weight:500;display:inline-flex;align-items:center;min-height:${H_MIN};text-decoration:none}
  .pb-freundlich .fr-nav a:hover,.pb-freundlich .fr-nav a[aria-current]{color:var(--sys-accent);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.4em}
  .pb-freundlich .fr-btn--head.fr-btn--p{display:inline-flex;min-height:${H_SMALL}}
}
@media (min-width:80rem){
  .pb-freundlich .fr-btn--head.fr-btn--s{display:inline-flex;min-height:${H_SMALL}}
}

${sections}

/* Unterseiten- und Rechtsseiten-Kopf */
.pb-freundlich .fr-page-head{padding-top:var(--sys-space-xl)}
.pb-freundlich .fr-back{${step("link")};display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${H_MIN};margin-bottom:var(--sys-space-s);color:var(--sys-accent);text-decoration:none}
.pb-freundlich .fr-back .fr-ic{transform:scaleX(-1)}
.pb-freundlich .fr-kicker{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-freundlich .fr-page-head--more{padding-top:var(--sys-space-section)}
.pb-freundlich .fr-page-head .fr-h2{overflow-wrap:anywhere}
.pb-freundlich .fr-legal{padding-top:var(--sys-space-l)}
.pb-freundlich .fr-legal>*{max-width:var(--sys-space-measure)}
.pb-freundlich .fr-legal h2{${step("h3")};margin:var(--sys-space-xl) 0 var(--sys-space-s)}
.pb-freundlich .fr-legal h3{font-weight:600;margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-freundlich .fr-legal p,.pb-freundlich .fr-legal ul,.pb-freundlich .fr-legal ol{margin:0 0 var(--sys-space-s);color:var(--sys-muted);overflow-wrap:break-word}
.pb-freundlich .fr-legal ul,.pb-freundlich .fr-legal ol{padding-left:var(--sys-space-m)}
.pb-freundlich .fr-legal strong,.pb-freundlich .fr-legal b{font-weight:600;color:var(--sys-ink)}
.pb-freundlich .fr-legal a{color:var(--sys-accent);overflow-wrap:anywhere;text-underline-offset:.25em}
.pb-freundlich .fr-legal hr{border:0!important;border-top:1px solid var(--sys-rule)!important}
.pb-freundlich .fr-legal [style*="color"]{color:var(--sys-muted)!important}

/* Fuß: Wolkenkante, tiefe Fläche, Zeichen, Name, Kontakt, Adresse, Rechtslinks */
.pb-freundlich .fr-foot{position:relative;margin-top:calc(var(--sys-space-section) + ${CLOUD});background:var(--sys-deep);color:var(--sys-on-deep);padding:var(--sys-space-l) 0 var(--sys-space-xl)}
.pb-freundlich .fr-foot .fr-cloud{top:calc(${CLOUD} * -1 + 1px);bottom:auto}
.pb-freundlich .fr-foot :focus-visible{outline-color:var(--sys-on-deep)}
.pb-freundlich .fr-logo--foot{background:var(--sys-on-deep);color:var(--sys-deep)}
.pb-freundlich .fr-foot-name{${step("h3")};margin-top:var(--sys-space-m);overflow-wrap:anywhere}
.pb-freundlich .fr-foot-cols{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-freundlich .fr-foot-h{${step("kicker")};font-weight:600;margin-bottom:var(--sys-space-xs)}
.pb-freundlich .fr-foot-col{min-width:0;overflow-wrap:anywhere}
.pb-freundlich .fr-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-freundlich .fr-foot-col a{display:inline-flex;align-items:center;min-height:${H_MIN};text-underline-offset:.25em}
.pb-freundlich .fr-foot-legal{${step("small")};display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-xs) var(--sys-space-m);margin-top:var(--sys-space-xl);padding-top:var(--sys-space-m);
  border-top:1px solid color-mix(in srgb,var(--sys-on-deep) 18%,transparent)}
.pb-freundlich .fr-foot-legal a{display:inline-flex;align-items:center;min-height:${H_MIN};text-underline-offset:.3em}
.pb-freundlich .fr-foot-legal span{margin-left:auto}
@media (min-width:${NAV}){
  .pb-freundlich .fr-foot{margin-top:calc(var(--sys-space-section) + ${CLOUD_WIDE})}
  .pb-freundlich .fr-foot .fr-cloud{top:calc(${CLOUD_WIDE} * -1 + 1px)}
}
@media (min-width:${WIDE}){
  .pb-freundlich .fr-foot-cols{grid-template-columns:repeat(2,minmax(0,1fr));max-width:calc(var(--sys-space-measure) * 1.6)}
}

/* Bildnachweis auf der tiefen Fläche */
.pb-freundlich .pb-photo-credits{${step("small")};color:var(--sys-on-deep);background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-freundlich .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Handy-Leiste: weiße Insel mit Anrufen + Hauptweg, unter 48 rem */
.pb-freundlich .fr-dock{display:none}
@media (max-width:calc(${DOCK} - 1px)){
  .pb-freundlich .fr-dock{position:fixed;left:calc(var(--sys-space-s) * .75);right:calc(var(--sys-space-s) * .75);bottom:calc(var(--sys-space-s) * .75 + env(safe-area-inset-bottom,0rem));z-index:30;
    display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:var(--sys-space-xs);padding:var(--sys-space-xs) var(--sys-space-xs) calc(var(--sys-space-xs) + var(--sys-press));
    border-radius:var(--sys-radius-l);background:var(--sys-surface);box-shadow:0 var(--sys-space-s) var(--sys-space-l) calc(var(--sys-space-s) * -.75) color-mix(in srgb,var(--sys-ink) 45%,transparent)}
  .pb-freundlich .fr-dock--one{grid-template-columns:minmax(0,1fr)}
  .pb-freundlich .fr-dock .fr-btn{width:100%;min-height:${H_SMALL};padding:0 calc(var(--sys-space-s) * .75);gap:var(--sys-space-xs)}
  .pb-freundlich .fr-foot{padding-bottom:calc(var(--sys-space-xl) + ${H_SMALL} + var(--sys-space-l) + env(safe-area-inset-bottom,0rem))}
}
/* Sehr schmal (unter 22 rem): Leiste ohne Symbole, „Menü" nur für Vorleser */
@media (max-width:calc(22rem - 1px)){
  .pb-freundlich .fr-dock .fr-ic{display:none}
  .pb-freundlich .fr-menu-word{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .pb-freundlich .fr-menu-toggle{min-width:${H_MIN};justify-content:center;padding:0}
}

@media (prefers-reduced-motion:reduce){.pb-freundlich *,.pb-freundlich *::before,.pb-freundlich *::after{transition:none!important;animation:none!important}}
/* ende freundlich */
`;
}

export const FREUNDLICH_CSS = freundlichCss(`${ENTRY_CSS}

${CONTENT_CSS}`);
