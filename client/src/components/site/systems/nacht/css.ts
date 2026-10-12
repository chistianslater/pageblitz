import { NACHT } from "../../../../../../shared/designSystems/nacht";
import { systemFontFaces } from "../shared/fonts";
import {
  DOCK,
  H_BTN,
  H_DOCK,
  H_MIN,
  HEAD_H,
  MONO,
  NAV,
  R,
  ROUND,
  WIDE,
  step,
} from "./step";
import { ENTRY_CSS } from "./entryCss";

export { step } from "./step";

/** @font-face aus der Systemdefinition — Gilda Display, Jost. */
const FONT_FACES = systemFontFaces(NACHT);

/** Ziel 44 px. */
const TAP = "calc(var(--sys-space-l) * 1.1)";

/**
 * Grundschicht von Nacht (Kopf, Knöpfe, Kapitel, Unterseiten, Fuß,
 * Handy-Leiste; Einstieg in entryCss). Gestalt nach
 * docs/designsysteme/nacht/systemblatt.html (Anker Restaurant Zimmerl).
 * Größen, Abstände und Farben ausschließlich über `--sys-*` (oder
 * Vielfache); Ausnahmen: 1px/2px-Linien, 2px-Ecken und der Fokusring.
 * Kupfer (accent) für Titel, Ziffern und Linien; Fließtext in Tinte.
 */
export function nachtCss(sections: string): string {
  return `
${FONT_FACES}

.pb-nacht{--nc-focus:2px;background:var(--sys-paper);color:var(--sys-ink);${step("body")};font-variant-numeric:lining-nums;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-kerning:normal;overflow-x:clip}
.pb-nacht *{box-sizing:border-box}
.pb-nacht h1,.pb-nacht h2,.pb-nacht h3,.pb-nacht h4{margin:0;font-weight:inherit;text-wrap:balance;hyphens:manual}
.pb-nacht p,.pb-nacht blockquote,.pb-nacht figure,.pb-nacht dl,.pb-nacht dd{margin:0}
.pb-nacht p{text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-nacht address{font-style:normal}
.pb-nacht a{color:inherit}
.pb-nacht img{display:block;max-width:100%;height:auto}
.pb-nacht .nc-ic{flex:none;width:1.25em;height:1.25em}
.pb-nacht :focus-visible{outline:var(--nc-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-nacht .nc-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-nacht .nc-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}

/* Knöpfe: Kupferfläche (Haupt), Linie (Zweit). Ecke 2 px, 56 px hoch. */
.pb-nacht .nc-btn{${step("link")};display:inline-flex;align-items:center;justify-content:center;gap:calc(var(--sys-space-s) * .875);max-width:100%;min-height:${H_BTN};
  padding:var(--sys-space-xs) var(--sys-space-m);border-radius:${R};text-decoration:none;text-align:center;cursor:pointer;
  transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.pb-nacht .nc-btn--p{background:var(--sys-signal);color:var(--sys-on-signal)}
.pb-nacht .nc-btn--s{color:var(--sys-ink);box-shadow:inset 0 0 0 1px var(--sys-ink)}
.pb-nacht .nc-btn .nc-ic{transition:transform 200ms cubic-bezier(.23,1,.32,1)}
.pb-nacht .nc-btn:active{transform:scale(.97)}
@media (hover:hover) and (pointer:fine){
  .pb-nacht .nc-btn--p:hover{background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
  .pb-nacht .nc-btn--p:hover .nc-ic{transform:translateX(var(--sys-space-2xs))}
  .pb-nacht .nc-btn--s:hover{background:color-mix(in srgb,var(--sys-ink) 8%,transparent)}
}

/* Kopf: Monogramm im Kupferring + Marke, „Menü"; Desktop Navigation + Hauptweg */
.pb-nacht .nc-top{position:relative}
.pb-nacht .nc-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink)}
.pb-nacht .nc-head--over{position:absolute;inset:0 0 auto 0;background:transparent}
.pb-nacht .nc-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;gap:calc(var(--sys-space-s) * .875);min-height:${HEAD_H};padding:0 var(--sys-space-gutter)}
.pb-nacht .nc-brand{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75);margin-right:auto;min-width:0;min-height:${H_MIN};text-decoration:none}
.pb-nacht .nc-mono{flex:none;display:grid;place-items:center;width:${MONO};height:${MONO};border-radius:${ROUND};box-shadow:inset 0 0 0 1px var(--sys-accent);color:var(--sys-accent);
  font-family:var(--sys-font-display);font-weight:400;font-size:var(--sys-space-m);line-height:1}
.pb-nacht .nc-mark{${step("mark")};min-width:0;overflow-wrap:anywhere;color:var(--sys-ink)}
.pb-nacht .nc-head--over .nc-mark{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pb-nacht .nc-menu{flex:none}
.pb-nacht .nc-menu-toggle{${step("link")};display:inline-flex;align-items:center;gap:calc(var(--sys-space-xs) * 1.25);min-height:${H_MIN};padding:0 var(--sys-space-2xs) 0 calc(var(--sys-space-s) * .75);
  list-style:none;cursor:pointer}
.pb-nacht .nc-menu-toggle::-webkit-details-marker{display:none}
.pb-nacht .nc-bars{display:grid;gap:calc(var(--sys-space-2xs) * 1.5);width:calc(var(--sys-space-s) * 1.375)}
.pb-nacht .nc-bars::before,.pb-nacht .nc-bars::after{content:"";border-top:2px solid currentColor;transition:transform 200ms cubic-bezier(.23,1,.32,1)}
.pb-nacht .nc-menu[open] .nc-bars::before{transform:translateY(calc(var(--sys-space-2xs) * .75 + 1px)) rotate(45deg)}
.pb-nacht .nc-menu[open] .nc-bars::after{transform:translateY(calc(var(--sys-space-2xs) * -.75 - 1px)) rotate(-45deg)}
.pb-nacht .nc-menu-panel{position:absolute;left:0;right:0;top:100%;display:grid;background:var(--sys-surface);color:var(--sys-ink);
  padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-l);border-top:1px solid var(--sys-rule);border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-menu-panel a{${step("h3")};display:flex;align-items:center;min-height:${H_MIN};padding-block:var(--sys-space-xs);text-decoration:none;border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-menu-panel a[aria-current]{color:var(--sys-accent)}
.pb-nacht .nc-nav,.pb-nacht .nc-btn--head{display:none}
/* Sehr schmal (unter 24 rem): „Menü" nur für Vorleser, Marke etwas kleiner — der Name passt */
@media (max-width:calc(24rem - 1px)){
  .pb-nacht .nc-menu-word{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .pb-nacht .nc-menu-toggle{min-width:${H_MIN};justify-content:center;padding:0}
  .pb-nacht .nc-mark{font-size:calc(var(--sys-mark-size) * .85)}
  /* Leiste: lange Hauptwege („Reservieren") ohne Symbol, etwas enger gesperrt */
  .pb-nacht .nc-dock .nc-btn--p .nc-ic{display:none}
  .pb-nacht .nc-dock .nc-btn{letter-spacing:.1em}
}
@media (min-width:${NAV}){
  .pb-nacht .nc-menu--main{display:none}
  .pb-nacht .nc-menu--always{display:block}
  .pb-nacht .nc-nav{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:var(--sys-space-xs) calc(var(--sys-space-s) * 2.125);margin-right:calc(var(--sys-space-s) * 1.25)}
  .pb-nacht .nc-nav a{${step("link")};display:inline-flex;align-items:center;min-height:${TAP};text-decoration:none}
  .pb-nacht .nc-nav a:hover,.pb-nacht .nc-nav a[aria-current]{text-decoration:underline;text-decoration-color:var(--sys-accent);text-decoration-thickness:1px;text-underline-offset:.45em}
  .pb-nacht .nc-btn--head{display:inline-flex;min-height:${H_MIN}}
}

/* Kapitel (vorläufig, N4–N6 nach Systemblatt 10–16) */
.pb-nacht .nc-sec{position:relative;padding-top:var(--sys-space-section)}
.pb-nacht .nc-h2{${step("h2")};color:var(--sys-accent);max-width:14em;overflow-wrap:break-word}
.pb-nacht .nc-h3{${step("h3")};color:var(--sys-ink)}
.pb-nacht .nc-intro{margin-top:var(--sys-space-s);max-width:var(--sys-space-measure);color:var(--sys-muted)}
.pb-nacht .nc-cat{margin-top:var(--sys-space-l)}
.pb-nacht .nc-cat .nc-h3{padding-bottom:var(--sys-space-s);border-bottom:1px solid var(--sys-accent)}
.pb-nacht .nc-rows{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-nacht .nc-cat .nc-rows{margin-top:0}
.pb-nacht .nc-rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) calc(var(--sys-space-s) * 1.125);padding:var(--sys-space-m) 0;border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-row-t{font-weight:500;overflow-wrap:anywhere}
.pb-nacht .nc-row-p{grid-column:2;grid-row:1;color:var(--sys-accent);text-align:right;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.pb-nacht .nc-row-d{grid-column:1;${step("small")};color:var(--sys-muted)}
.pb-nacht .nc-rows--hours .nc-row-p{white-space:normal;color:var(--sys-ink)}
.pb-nacht .nc-rows--hours .nc-now .nc-row-t{color:var(--sys-accent)}
.pb-nacht .nc-body{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure)}
.pb-nacht .nc-photo{margin-top:var(--sys-space-l);aspect-ratio:4/3;overflow:hidden;max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-nacht .nc-photo img,.pb-nacht .nc-grid img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-nacht .nc-grid{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-s)}
.pb-nacht .nc-grid li{aspect-ratio:4/5;overflow:hidden}
.pb-nacht .nc-voice{margin-top:var(--sys-space-l);max-width:var(--sys-space-measure)}
.pb-nacht .nc-voice blockquote{${step("h3")};color:var(--sys-ink)}
.pb-nacht .nc-voice figcaption{${step("small")};margin-top:var(--sys-space-s);color:var(--sys-muted)}
.pb-nacht .nc-faq{border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-faq:first-of-type{margin-top:var(--sys-space-l);border-top:1px solid var(--sys-rule)}
.pb-nacht .nc-faq summary{display:flex;align-items:center;min-height:${H_MIN};padding-block:var(--sys-space-s);font-weight:500;cursor:pointer}
.pb-nacht .nc-faq p{padding-bottom:var(--sys-space-m);color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-nacht .nc-adr{${step("h3")};margin-top:var(--sys-space-l)}
.pb-nacht .nc-ways{display:flex;flex-wrap:wrap;gap:0 var(--sys-space-m);margin-top:var(--sys-space-s)}
.pb-nacht .nc-ways a{display:inline-flex;align-items:center;min-height:${TAP};text-underline-offset:.25em;text-decoration-color:var(--sys-accent)}
.pb-nacht .nc-sec .nc-btn{margin-top:var(--sys-space-l)}

${sections}

/* Unterseiten- und Rechtsseiten-Kopf: Name gedämpft, ein h1 in Stufe h2 */
.pb-nacht .nc-page-head{padding-top:var(--sys-space-xl)}
.pb-nacht .nc-page-head .nc-kicker{color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-nacht .nc-page-head .nc-h2{overflow-wrap:anywhere}
.pb-nacht .nc-legal{padding-top:var(--sys-space-l)}
.pb-nacht .nc-legal>*{max-width:var(--sys-space-measure)}
.pb-nacht .nc-legal h2{${step("h3")};color:var(--sys-accent);margin:var(--sys-space-xl) 0 var(--sys-space-s)}
.pb-nacht .nc-legal h3{font-weight:500;margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-nacht .nc-legal p,.pb-nacht .nc-legal ul{margin:0 0 var(--sys-space-s);color:var(--sys-muted)}
.pb-nacht .nc-legal a{color:var(--sys-ink);overflow-wrap:anywhere;text-decoration-color:var(--sys-accent);text-underline-offset:.25em}
.pb-nacht .nc-legal hr{border:0!important;border-top:1px solid var(--sys-rule)!important}
/* Inline-Grau des Generators wird gedämpft in Tokens */
.pb-nacht .nc-legal [style*="color"]{color:var(--sys-muted)!important}

/* Fuß: tiefes Band, Monogramm, Name groß, Kontakt, Adresse, Rechtslinks */
.pb-nacht .nc-foot{margin-top:var(--sys-space-section);background:var(--sys-deep);color:var(--sys-on-deep);padding:var(--sys-space-xl) 0}
.pb-nacht .nc-foot :focus-visible{outline-color:var(--sys-on-deep)}
.pb-nacht .nc-mono--foot{width:var(--sys-space-xl);height:var(--sys-space-xl);font-size:calc(var(--sys-space-xl) * .5)}
.pb-nacht .nc-foot-name{${step("h2")};margin-top:var(--sys-space-m);color:var(--sys-accent);overflow-wrap:anywhere}
.pb-nacht .nc-foot-cols{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-nacht .nc-foot-h{${step("kicker")};color:var(--sys-accent);margin-bottom:var(--sys-space-xs)}
.pb-nacht .nc-foot-col{min-width:0;overflow-wrap:anywhere}
.pb-nacht .nc-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-nacht .nc-foot-col a{display:inline-flex;align-items:center;min-height:${TAP};text-decoration:none}
.pb-nacht .nc-foot-col a:hover{text-decoration:underline;text-decoration-color:var(--sys-accent);text-underline-offset:.25em}
.pb-nacht .nc-foot-legal{${step("small")};display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-xs) var(--sys-space-m);margin-top:var(--sys-space-xl);padding-top:var(--sys-space-m);
  border-top:1px solid color-mix(in srgb,var(--sys-on-deep) 12%,transparent)}
.pb-nacht .nc-foot-legal a{display:inline-flex;align-items:center;min-height:${TAP};text-decoration-color:color-mix(in srgb,var(--sys-accent) 60%,transparent);text-underline-offset:.3em}
.pb-nacht .nc-foot-legal span{margin-left:auto;color:var(--sys-muted)}
@media (min-width:${WIDE}){
  .pb-nacht .nc-foot-cols{grid-template-columns:repeat(2,minmax(0,1fr));max-width:calc(var(--sys-space-measure) * 1.6)}
}

/* Bildnachweis im Fuß-Band (tief), gedämpft */
.pb-nacht .pb-photo-credits{${step("small")};color:var(--sys-muted);background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-nacht .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Handy-Leiste: Anrufen + Hauptweg, unter 48 rem */
.pb-nacht .nc-dock{display:none}
@media (max-width:calc(${DOCK} - 1px)){
  .pb-nacht .nc-dock{position:fixed;left:calc(var(--sys-space-s) * .625);right:calc(var(--sys-space-s) * .625);bottom:calc(var(--sys-space-s) * .625 + env(safe-area-inset-bottom,0rem));z-index:30;
    display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:var(--sys-space-xs);padding:var(--sys-space-xs);border-radius:var(--sys-space-2xs);
    background:color-mix(in srgb,var(--sys-deep) 86%,transparent);-webkit-backdrop-filter:blur(var(--sys-space-s)) saturate(1.2);backdrop-filter:blur(var(--sys-space-s)) saturate(1.2);
    box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sys-ink) 8%,transparent),0 calc(var(--sys-space-s) * 1.125) var(--sys-space-l) calc(var(--sys-space-s) * -1.125) var(--sys-deep)}
  .pb-nacht .nc-dock--one{grid-template-columns:minmax(0,1fr)}
  .pb-nacht .nc-dock .nc-btn{width:100%;min-height:${H_DOCK};padding:0 calc(var(--sys-space-s) * .75);gap:calc(var(--sys-space-s) * .625)}
  .pb-nacht .nc-dock .nc-btn--s{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sys-ink) 70%,transparent)}
  .pb-nacht .nc-foot{padding-bottom:calc(var(--sys-space-xl) + ${H_DOCK} + var(--sys-space-m) + env(safe-area-inset-bottom,0rem))}
}

@media (prefers-reduced-motion:reduce){.pb-nacht *,.pb-nacht *::before,.pb-nacht *::after{transition:none!important;animation:none!important}}
/* ende nacht */
`;
}

export const NACHT_CSS = nachtCss(ENTRY_CSS);
