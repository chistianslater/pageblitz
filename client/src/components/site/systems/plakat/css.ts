import { PLAKAT } from "../../../../../../shared/designSystems/plakat";
import { systemFontFaces } from "../shared/fonts";
import { NAV, PILL, step } from "./step";
import { ENTRY_CSS } from "./entryCss";
import { CONTENT_CSS } from "./contentCss";

export { step } from "./step";

/** @font-face aus der Systemdefinition — League Gothic (wdth), Hanken Grotesk. */
const FONT_FACES = systemFontFaces(PLAKAT);

/**
 * Grundschicht von Plakat (Flächen, Kopf, Knöpfe, Kapitel, Unterseiten,
 * Fuß; Einstieg/Sticker/Laufband/Dock in entryCss, Inhalte in contentCss). Gestalt nach
 * docs/designsysteme/plakat/systemblatt.html (Anker Arcadia).
 * Größen, Abstände und Farben ausschließlich über `--sys-*` (oder
 * Vielfache); Ausnahmen: 1px/2px-Linien und der 2px-Fokusring.
 * Flächen: `.pk-ground|f1|f2|deep` setzen `--pk-bg/ink/muted` (rhythm.ts);
 * tief = drittes Feld der Palette.
 */
export function plakatCss(sections: string): string {
  return `
${FONT_FACES}

.pb-plakat{--pk-focus:2px;--pk-tap:calc(var(--sys-space-l) + var(--sys-space-2xs));--pk-hit:calc(var(--sys-space-s) * -.8125);
  --pk-bg:var(--sys-paper);--pk-ink:var(--sys-ink);--pk-muted:var(--sys-muted);
  background:var(--sys-paper);color:var(--sys-ink);${step("body")};font-variant-numeric:tabular-nums;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal}
.pb-plakat *{box-sizing:border-box}
.pb-plakat h1,.pb-plakat h2,.pb-plakat h3,.pb-plakat h4{margin:0;font-weight:inherit;text-wrap:balance;hyphens:manual}
.pb-plakat p,.pb-plakat blockquote,.pb-plakat figure{margin:0}
.pb-plakat p{text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-plakat address{font-style:normal}
.pb-plakat a{color:inherit}
.pb-plakat img{display:block;max-width:100%}
.pb-plakat :focus-visible{outline:var(--pk-focus) solid currentColor;outline-offset:var(--sys-space-2xs)}
.pb-plakat .pk-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-plakat .pk-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
.pb-plakat .pk-muted{color:var(--pk-muted)}

/* Flächen (Feld-Rhythmus): Grund, zwei helle Felder, tief */
.pb-plakat .pk-ground{--pk-bg:var(--sys-paper);--pk-ink:var(--sys-ink);--pk-muted:var(--sys-muted)}
.pb-plakat .pk-f1{--pk-bg:var(--sys-field-1-bg);--pk-ink:var(--sys-field-1-ink);--pk-muted:var(--sys-field-1-muted)}
.pb-plakat .pk-f2{--pk-bg:var(--sys-field-2-bg);--pk-ink:var(--sys-field-2-ink);--pk-muted:var(--sys-field-2-muted)}
.pb-plakat .pk-deep{--pk-bg:var(--sys-field-3-bg);--pk-ink:var(--sys-field-3-ink);--pk-muted:var(--sys-field-3-muted)}
.pb-plakat .pk-ground,.pb-plakat .pk-f1,.pb-plakat .pk-f2,.pb-plakat .pk-deep{background:var(--pk-bg);color:var(--pk-ink)}

/* Knöpfe: Tinte-Pille mit Signal-Kreis, Kontur-Pille */
.pb-plakat .pk-btn,.pb-plakat .pk-btn2{${step("link")};display:inline-flex;align-items:center;max-width:100%;min-height:calc(var(--sys-space-xl) * .875);
  border-radius:${PILL};text-decoration:none;transition:transform 160ms}
.pb-plakat .pk-btn{gap:calc(var(--sys-space-s) * .75);padding:var(--sys-space-2xs) var(--sys-space-xs) var(--sys-space-2xs) var(--sys-space-m);background:var(--sys-ink);color:var(--sys-paper)}
.pb-plakat .pk-btn i{flex:none;display:grid;place-items:center;width:var(--sys-space-l);height:var(--sys-space-l);border-radius:50%;
  background:var(--sys-signal);color:var(--sys-on-signal);font-style:normal;font-weight:700;transition:transform 160ms}
.pb-plakat .pk-btn2{padding:var(--sys-space-2xs) calc(var(--sys-space-s) * 1.375);box-shadow:inset 0 0 0 2px currentColor;color:inherit}
.pb-plakat .pk-btn:active,.pb-plakat .pk-btn2:active{transform:scale(.97)}
@media (hover:hover){
  .pb-plakat .pk-btn:hover i{transform:translateX(2px)}
  .pb-plakat .pk-btn2:hover{background:color-mix(in srgb,currentColor 10%,transparent)}
}

/* Kopf: Name in League Gothic, „Menü"-Pille; Desktop Navigation + Hauptaktion */
.pb-plakat .pk-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink)}
.pb-plakat .pk-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:var(--sys-space-m);
  min-height:var(--sys-space-xl);padding:var(--sys-space-2xs) var(--sys-space-gutter)}
.pb-plakat .pk-brand{${step("mark")};display:flex;align-items:center;min-height:var(--pk-tap);min-width:0;text-decoration:none;overflow-wrap:break-word}
.pb-plakat .pk-brand--long{font-size:calc(var(--sys-mark-size) * .72);font-stretch:var(--sys-figure-stretch);line-height:1.05}
.pb-plakat .pk-menu-toggle{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:calc(var(--sys-space-xs) * 1.25);min-height:var(--pk-tap);
  padding:0 var(--sys-space-s) 0 calc(var(--sys-space-s) * 1.125);border-radius:${PILL};background:var(--sys-ink);color:var(--sys-paper);${step("link")};font-size:var(--sys-small-size)}
.pb-plakat .pk-menu-toggle::-webkit-details-marker{display:none}
.pb-plakat .pk-menu-toggle i{display:grid;gap:var(--sys-space-2xs)}
.pb-plakat .pk-menu-toggle i::before,.pb-plakat .pk-menu-toggle i::after{content:"";display:block;width:var(--sys-space-s);height:2px;background:currentColor;transition:transform 200ms}
.pb-plakat .pk-menu[open] .pk-menu-toggle i::before{transform:translateY(calc(var(--sys-space-2xs) / 2 + 1px)) rotate(45deg)}
.pb-plakat .pk-menu[open] .pk-menu-toggle i::after{transform:translateY(calc(var(--sys-space-2xs) / -2 - 1px)) rotate(-45deg)}
.pb-plakat .pk-menu-panel{position:absolute;left:0;right:0;top:100%;display:grid;background:var(--sys-paper);
  padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-l);border-bottom:2px solid var(--sys-ink)}
.pb-plakat .pk-menu-panel a{font-family:var(--sys-font-display);font-size:calc(var(--sys-h2-size) * .7);line-height:1;text-transform:uppercase;font-stretch:var(--sys-h2-stretch);
  text-decoration:none;display:flex;align-items:center;min-height:var(--pk-tap);padding-block:var(--sys-space-xs);border-bottom:1px solid var(--sys-rule)}
.pb-plakat .pk-menu-panel a[aria-current]{color:var(--sys-accent)}
.pb-plakat .pk-nav{display:none}
@media (min-width:${NAV}){
  .pb-plakat .pk-menu{display:none}
  .pb-plakat .pk-nav{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:var(--sys-space-xs) calc(var(--sys-space-m) + var(--sys-space-2xs))}
  .pb-plakat .pk-nav a:not(.pk-btn){${step("link")};font-size:var(--sys-small-size);text-decoration:none;display:inline-flex;align-items:center;min-height:var(--pk-tap)}
  .pb-plakat .pk-nav a:not(.pk-btn):hover,.pb-plakat .pk-nav a[aria-current]{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.3em}
  .pb-plakat .pk-btn--head{min-height:var(--pk-tap);padding-left:calc(var(--sys-space-s) * 1.25);font-size:var(--sys-small-size)}
  .pb-plakat .pk-btn--head i{width:calc(var(--sys-space-l) * .85);height:calc(var(--sys-space-l) * .85)}
}

/* Kapitel: League-Gothic-Überschrift mit Signal-Punkt */
.pb-plakat .pk-sec{padding-block:var(--sys-space-section)}
.pb-plakat .pk-title{${step("h2")};overflow-wrap:break-word}
.pb-plakat .pk-dot{color:var(--sys-accent)}
.pb-plakat .pk-f1 .pk-dot,.pb-plakat .pk-f2 .pk-dot,.pb-plakat .pk-deep .pk-dot{color:inherit}
.pb-plakat .pk-intro{margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}

${sections}

/* Unterseiten- und Rechtsseiten-Kopf: Name gedämpft, ein h1 in Stufe h2 */
.pb-plakat .pk-page-head{padding-block:var(--sys-space-l) var(--sys-space-xl)}
.pb-plakat .pk-page-kicker{${step("kicker")};color:var(--pk-muted);margin-bottom:var(--sys-space-xs)}
.pb-plakat .pk-page-title{${step("h2")};overflow-wrap:anywhere}
.pb-plakat .pk-legal{padding-bottom:var(--sys-space-section)}
.pb-plakat .pk-legal>*{max-width:var(--sys-space-measure)}
.pb-plakat .pk-legal h2{${step("h3")};margin:var(--sys-space-xl) 0 var(--sys-space-s)}
.pb-plakat .pk-legal h3{${step("kicker")};margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-plakat .pk-legal p,.pb-plakat .pk-legal ul{margin:0 0 var(--sys-space-s)}
.pb-plakat .pk-legal a{overflow-wrap:anywhere;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-plakat .pk-legal hr{border:0!important;border-top:2px solid var(--sys-ink)!important}
/* Inline-Grau des Generators wird gedämpft in Tokens */
.pb-plakat .pk-legal [style*="color"]{color:var(--sys-muted)!important}

/* Fuß: tiefes Feld, Spalten, Riesenname (füllt die Breite, nie abgeschnitten) */
.pb-plakat .pk-foot{padding:var(--sys-space-section) 0 var(--sys-space-l);overflow:hidden}
.pb-plakat .pk-foot-cols{${step("small")};display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-m)}
.pb-plakat .pk-foot-col{min-width:0;overflow-wrap:anywhere;line-height:1.6}
.pb-plakat .pk-foot-h{font-weight:700;margin-bottom:var(--sys-space-2xs)}
.pb-plakat .pk-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-plakat .pk-foot-col a,.pb-plakat .pk-foot-legal a{text-decoration:none;position:relative}
.pb-plakat .pk-foot-col a::before,.pb-plakat .pk-foot-legal a::before{content:"";position:absolute;inset:var(--pk-hit) calc(var(--sys-space-2xs) * -1)}
.pb-plakat .pk-foot-col a:hover,.pb-plakat .pk-foot-legal a:hover{text-decoration:underline;text-underline-offset:.2em}
.pb-plakat .pk-foot-fit{container-type:inline-size;margin-top:var(--sys-space-xl)}
.pb-plakat .pk-foot-word{font-family:var(--sys-font-display);font-weight:400;line-height:.9;letter-spacing:var(--sys-figure-track);text-transform:uppercase;
  font-stretch:var(--sys-figure-stretch);font-size:var(--sys-h2-size);overflow-wrap:anywhere}
.pb-plakat .pk-foot-word span{display:block}
@supports (font-size:1cqi){
  .pb-plakat .pk-foot-word{font-size:clamp(var(--sys-h3-size),calc(100cqi / var(--pk-fit)),calc(var(--sys-figure-size) * 1.02))}
}
.pb-plakat .pk-foot-legal{${step("small")};display:flex;flex-wrap:wrap;gap:var(--sys-space-s) var(--sys-space-m);margin-top:var(--sys-space-l)}
.pb-plakat .pk-foot-legal span{color:var(--pk-muted)}

/* Bildnachweis im Fuß-Band (tief), gedämpft */
.pb-plakat .pb-photo-credits{${step("small")};color:var(--sys-field-3-muted);background:var(--sys-field-3-bg);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-plakat .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

@media (prefers-reduced-motion:reduce){.pb-plakat *,.pb-plakat *::before,.pb-plakat *::after{transition:none!important;animation:none!important}}
/* ende plakat */
`;
}

export const PLAKAT_CSS = plakatCss(`${ENTRY_CSS}

${CONTENT_CSS}`);
