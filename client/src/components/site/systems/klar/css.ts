import { KLAR } from "../../../../../../shared/designSystems/klar";
import { systemFontFaces } from "../shared/fonts";
import {
  DOCK,
  GRID,
  H_BTN,
  H_MIN,
  NAV,
  PILL,
  R_BTN,
  R_CARD,
  TAP,
  TILE,
  step,
} from "./step";
import { ENTRY_CSS } from "./entryCss";

export { step } from "./step";

/** @font-face aus der Systemdefinition — DM Sans, Atkinson Hyperlegible Next. */
const FONT_FACES = systemFontFaces(KLAR);

/**
 * Grundschicht von Klar (Kopf, Knöpfe, Zeiten-Karte, schlichte Kapitel,
 * Unterseiten, Fuß, Handy-Leiste; Einstieg in entryCss). Gestalt nach
 * docs/designsysteme/klar/systemblatt.html (Anker Luma Dental).
 * Größen, Abstände und Farben ausschließlich über `--sys-*` (oder
 * Vielfache); Ausnahmen: 1px/2px-Linien und der 2px-Fokusring.
 * Lindgrün & Co. (Felder) nur als Fläche, nie als Schrift- oder Knopffarbe.
 */
export function klarCss(sections: string): string {
  return `
${FONT_FACES}

.pb-klar{--kl-focus:2px;--kl-muted:var(--sys-muted);background:var(--sys-paper);color:var(--sys-ink);${step("body")};font-variant-numeric:tabular-nums;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal}
.pb-klar *{box-sizing:border-box}
.pb-klar h1,.pb-klar h2,.pb-klar h3,.pb-klar h4{margin:0;font-weight:inherit;text-wrap:balance;hyphens:manual}
.pb-klar p,.pb-klar blockquote,.pb-klar figure,.pb-klar dl,.pb-klar dd{margin:0}
.pb-klar p{text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-klar address{font-style:normal}
.pb-klar a{color:inherit}
.pb-klar img{display:block;max-width:100%;height:auto}
.pb-klar .kl-ic{flex:none;width:1.25em;height:1.25em}
.pb-klar :focus-visible{outline:var(--kl-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-klar .kl-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-klar .kl-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}

/* Knöpfe: Hauptknopf dunkel mit heller Kachel, Nebenknopf Kontur auf Karte */
.pb-klar .kl-btn{${step("link")};display:inline-flex;align-items:center;justify-content:center;gap:calc(var(--sys-space-s) * .75);max-width:100%;min-height:${H_BTN};
  padding:0 calc(var(--sys-space-s) * 1.375);border-radius:${R_BTN};text-decoration:none;transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.pb-klar .kl-btn--p{background:var(--sys-signal);color:var(--sys-on-signal);padding-right:var(--sys-space-xs)}
.pb-klar .kl-btn-ic{flex:none;display:grid;place-items:center;width:${TILE};height:${TILE};border-radius:calc(var(--sys-space-s) * .625);background:var(--sys-on-signal);color:var(--sys-signal)}
.pb-klar .kl-btn--s{background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 2px var(--sys-ink)}
.pb-klar .kl-btn:active,.pb-klar .kl-pillbtn:active{transform:scale(.97)}
@media (hover:hover){
  .pb-klar .kl-btn--p:hover{background:color-mix(in srgb,var(--sys-signal) 86%,var(--sys-ink))}
  .pb-klar .kl-btn--s:hover,.pb-klar .kl-pillbtn:hover{background:color-mix(in srgb,var(--sys-surface) 88%,var(--sys-rule))}
}
.pb-klar .kl-pillbtn{${step("small")};font-weight:700;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:calc(var(--sys-space-xs) * .75);
  min-width:${H_MIN};min-height:${H_MIN};padding:0 calc(var(--sys-space-s) * .75);border-radius:${R_BTN};background:var(--sys-surface);color:var(--sys-ink);
  box-shadow:inset 0 0 0 2px var(--sys-rule);text-decoration:none;cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1)}

/* Kopf: Monogramm-Kachel + Name, „Menü"-Pille; Desktop Navigation, Telefon, Termin */
.pb-klar .kl-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink)}
.pb-klar .kl-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75);
  min-height:calc(var(--sys-space-xl) * 1.125);padding:var(--sys-space-xs) var(--sys-space-gutter)}
.pb-klar .kl-brand{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .625);margin-right:auto;min-width:0;min-height:${TAP};text-decoration:none}
.pb-klar .kl-logo{flex:none;display:grid;place-items:center;width:${TILE};height:${TILE};border-radius:calc(var(--sys-space-s) * .75);background:var(--sys-signal);color:var(--sys-on-signal);
  font-family:var(--sys-font-display);font-weight:var(--sys-mark-weight);font-size:var(--sys-mark-size);line-height:1}
.pb-klar .kl-mark{${step("mark")};min-width:0;overflow-wrap:break-word;hyphens:auto}
.pb-klar .kl-mark--long{font-size:var(--sys-small-size);line-height:1.3}
@media (max-width:calc(30rem - 1px)){
  .pb-klar .kl-head .kl-mark--long{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
}
.pb-klar .kl-menu-toggle{list-style:none}
.pb-klar .kl-menu-toggle::-webkit-details-marker{display:none}
.pb-klar .kl-menu-panel{position:absolute;left:0;right:0;top:100%;display:grid;background:var(--sys-surface);color:var(--sys-ink);
  padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-l);border-bottom:1px solid var(--sys-rule);box-shadow:0 1px 0 var(--sys-rule)}
.pb-klar .kl-menu-panel a{${step("h3")};display:flex;align-items:center;min-height:${H_MIN};padding-block:var(--sys-space-xs);text-decoration:none;border-bottom:1px solid var(--sys-rule)}
.pb-klar .kl-menu-panel a[aria-current]{color:var(--sys-accent)}
.pb-klar .kl-nav,.pb-klar .kl-head-actions{display:none}
@media (min-width:${NAV}){
  .pb-klar .kl-head:not(.kl-head--menu) .kl-menu{display:none}
  .pb-klar .kl-head--menu .kl-menu-panel{left:auto;width:calc(var(--sys-space-2xl) * 4);border-radius:0 0 ${R_CARD} ${R_CARD}}
  .pb-klar .kl-head:not(.kl-head--menu) .kl-nav{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--sys-space-xs) calc(var(--sys-space-s) * 1.875);margin-right:calc(var(--sys-space-s) * 1.25)}
  .pb-klar .kl-nav a{${step("link")};display:inline-flex;align-items:center;min-height:${TAP};text-decoration:none}
  .pb-klar .kl-nav a:hover,.pb-klar .kl-nav a[aria-current]{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.3em}
  .pb-klar .kl-head-actions{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75)}
  .pb-klar .kl-btn--head{min-height:${H_MIN}}
  .pb-klar .kl-btn--head .kl-btn-ic{width:calc(${TILE} * .85);height:calc(${TILE} * .85)}
}

/* Zeiten-Karte: Tag als Zeilenkopf, „heute" als Wort in einer Pille */
.pb-klar .kl-hours{background:var(--sys-surface);color:var(--sys-ink);border-radius:${R_CARD};padding:var(--sys-space-xs);box-shadow:0 0 0 1px var(--sys-rule)}
.pb-klar .kl-hours-hd{${step("link")};display:flex;justify-content:space-between;align-items:center;gap:var(--sys-space-s);
  padding:calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * .625)}
.pb-klar .kl-hours-table{width:100%;border-collapse:separate;border-spacing:0}
.pb-klar .kl-hours-table th,.pb-klar .kl-hours-table td{padding:calc(var(--sys-space-s) * .75) calc(var(--sys-space-s) * .875);border-top:1px solid var(--sys-rule);text-align:left;vertical-align:top}
.pb-klar .kl-hours-table th{font-weight:700;width:7.5em;padding-right:var(--sys-space-xs)}
.pb-klar .kl-hours-table td span{${step("data")};font-weight:400;display:block;white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:calc(24rem - 1px)){.pb-klar .kl-hours-table th{width:auto}.pb-klar .kl-hours-table th,.pb-klar .kl-hours-table td{padding-inline:calc(var(--sys-space-s) * .625)}}
.pb-klar .kl-hours-table .kl-now>*{background:var(--sys-field-1-bg);color:var(--sys-field-1-ink);border-top-color:transparent}
.pb-klar .kl-hours-table .kl-now th{border-radius:calc(var(--sys-space-s) * .875) 0 0 calc(var(--sys-space-s) * .875)}
.pb-klar .kl-hours-table .kl-now td{border-radius:0 calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * .875) 0}
.pb-klar .kl-hours-table .kl-now td span{font-weight:700}
.pb-klar .kl-hours-table .kl-now+tr>*{border-top-color:transparent}
.pb-klar .kl-hours-table .kl-zu td{color:var(--sys-muted)}
.pb-klar .kl-today-tag{${step("small")};font-weight:700;display:inline-block;margin-left:calc(var(--sys-space-xs) * .75);padding:0 var(--sys-space-xs);
  border-radius:${PILL};background:var(--sys-signal);color:var(--sys-on-signal)}

/* Kapitel (bis K4–K6 schlicht) */
.pb-klar .kl-sec{padding-top:var(--sys-space-section)}
.pb-klar .kl-title{${step("h2")};max-width:10em;overflow-wrap:break-word}
.pb-klar .kl-intro{margin-top:calc(var(--sys-space-s) * .75);max-width:var(--sys-space-measure);color:var(--sys-muted)}
.pb-klar .kl-cards{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .625);grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))}
.pb-klar .kl-card{display:grid;gap:var(--sys-space-xs);align-content:start;padding:calc(var(--sys-space-s) * 1.25);border-radius:${R_CARD};background:var(--sys-surface);box-shadow:0 0 0 1px var(--sys-rule);min-width:0;overflow-wrap:break-word}
.pb-klar .kl-card h3{${step("h3")}}
.pb-klar .kl-card p,.pb-klar .kl-who{color:var(--sys-muted)}
.pb-klar .kl-card-price{${step("data")};color:var(--sys-ink)}
.pb-klar .kl-steps{margin:var(--sys-space-l) 0 0;padding-left:var(--sys-space-m);display:grid;gap:var(--sys-space-m)}
.pb-klar .kl-steps h3{${step("h3")}}
.pb-klar .kl-steps p{color:var(--sys-muted)}
.pb-klar .kl-price{margin-top:var(--sys-space-m);padding:calc(var(--sys-space-xs) * .75) calc(var(--sys-space-s) * 1.125);border-radius:${R_CARD};background:var(--sys-surface);box-shadow:0 0 0 1px var(--sys-rule)}
.pb-klar .kl-price h3{${step("link")};padding-block:calc(var(--sys-space-s) * .75)}
.pb-klar .kl-price dl>div{display:flex;justify-content:space-between;gap:var(--sys-space-s);padding-block:calc(var(--sys-space-s) * .8);border-top:1px solid var(--sys-rule)}
.pb-klar .kl-price dd{${step("data")};flex:none}
.pb-klar .kl-stats{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-m);grid-template-columns:repeat(auto-fill,minmax(min(100%,12rem),1fr))}
.pb-klar .kl-stats div{display:flex;flex-direction:column-reverse}
.pb-klar .kl-stats dd{${step("figure")}}
.pb-klar .kl-stats dt{color:var(--sys-muted)}
.pb-klar .kl-photo{margin-top:var(--sys-space-l);width:100%;border-radius:${R_CARD};filter:var(--sys-image-filter)}
.pb-klar .kl-prose{margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}
.pb-klar .kl-prose p+p{margin-top:var(--sys-space-s)}
.pb-klar .kl-gallery{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .625);grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr))}
.pb-klar .kl-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:${R_CARD};filter:var(--sys-image-filter)}
.pb-klar .kl-faq{margin-top:var(--sys-space-l);display:grid;gap:calc(var(--sys-space-s) * .625)}
.pb-klar .kl-faq details{border-radius:var(--sys-space-s);background:var(--sys-surface);box-shadow:0 0 0 1px var(--sys-rule)}
.pb-klar .kl-faq summary{font-weight:700;cursor:pointer;min-height:calc(var(--sys-space-xl) * .9375);display:flex;align-items:center;padding:calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * 1.125)}
.pb-klar .kl-faq details p{padding:0 calc(var(--sys-space-s) * 1.125) calc(var(--sys-space-s) * 1.125);color:var(--sys-muted)}
.pb-klar .kl-quote{${step("h3")};margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}
.pb-klar .kl-quote footer{${step("small")};margin-top:var(--sys-space-s);color:var(--sys-muted)}
.pb-klar .kl-partners{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-xs) var(--sys-space-m)}
.pb-klar .kl-visit{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));align-items:start}
.pb-klar .kl-visit-ways{display:grid;margin-top:var(--sys-space-xs)}
.pb-klar .kl-visit-ways a{display:inline-flex;align-items:center;min-height:${TAP};overflow-wrap:anywhere}
.pb-klar .kl-cta p{margin-top:var(--sys-space-m)}

${sections}

/* Unterseiten- und Rechtsseiten-Kopf: Name gedämpft, ein h1 in Stufe h2 */
.pb-klar .kl-page-head{padding-block:var(--sys-space-l) 0}
.pb-klar .kl-page-kicker{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-xs)}
.pb-klar .kl-page-title{${step("h2")};overflow-wrap:anywhere}
.pb-klar .kl-legal{padding-top:var(--sys-space-l)}
.pb-klar .kl-legal>*{max-width:var(--sys-space-measure)}
.pb-klar .kl-legal h2{${step("h3")};margin:var(--sys-space-xl) 0 var(--sys-space-s)}
.pb-klar .kl-legal h3{${step("link")};margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-klar .kl-legal p,.pb-klar .kl-legal ul{margin:0 0 var(--sys-space-s)}
.pb-klar .kl-legal a{overflow-wrap:anywhere;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-klar .kl-legal hr{border:0!important;border-top:1px solid var(--sys-rule)!important}
/* Inline-Grau des Generators wird gedämpft in Tokens */
.pb-klar .kl-legal [style*="color"]{color:var(--sys-muted)!important}

/* Fuß: tiefes Feld, Marke, Adresse, Kontakt, Zeiten, Rechtslinks */
.pb-klar .kl-foot{margin-top:var(--sys-space-section);background:var(--sys-deep);color:var(--sys-on-deep);padding:var(--sys-space-xl) 0 var(--sys-space-l)}
.pb-klar .kl-foot :focus-visible{outline-color:var(--sys-on-deep)}
.pb-klar .kl-foot .kl-logo{background:var(--sys-on-signal);color:var(--sys-signal)}
.pb-klar .kl-foot-cols{${step("small")};display:grid;gap:calc(var(--sys-space-s) * 1.375)}
.pb-klar .kl-foot-col{min-width:0;overflow-wrap:anywhere}
.pb-klar .kl-foot-h{font-weight:700;color:var(--sys-field-3-muted);margin-bottom:calc(var(--sys-space-xs) * .75)}
.pb-klar .kl-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-klar .kl-foot-col a{display:inline-flex;align-items:center;min-height:${TAP};text-underline-offset:.2em}
.pb-klar .kl-foot-legal{${step("small")};display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-xs) calc(var(--sys-space-s) * 1.375);margin-top:var(--sys-space-l)}
.pb-klar .kl-foot-legal a{font-weight:700;display:inline-flex;align-items:center;min-height:${TAP};text-underline-offset:.25em}
.pb-klar .kl-foot-legal span{color:var(--sys-field-3-muted)}
@media (min-width:${GRID}){
  .pb-klar .kl-foot-cols{grid-template-columns:1.4fr 1fr 1fr 1fr}
}

/* Bildnachweis im Fuß-Band (tief), gedämpft */
.pb-klar .pb-photo-credits{${step("small")};color:var(--sys-field-3-muted);background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-klar .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Handy-Leiste: Anrufen + Termin, unter 48 rem */
.pb-klar .kl-dock{display:none}
@media (max-width:calc(${DOCK} - 1px)){
  .pb-klar .kl-dock{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:var(--sys-space-xs);
    padding:calc(var(--sys-space-s) * .625) calc(var(--sys-space-s) * .75) calc(var(--sys-space-s) * .875 + env(safe-area-inset-bottom,0rem));
    background:color-mix(in srgb,var(--sys-surface) 94%,transparent);box-shadow:0 -1px 0 var(--sys-rule);-webkit-backdrop-filter:blur(var(--sys-space-xs));backdrop-filter:blur(var(--sys-space-xs))}
  .pb-klar .kl-dock--one{grid-template-columns:minmax(0,1fr)}
  .pb-klar .kl-dock .kl-btn{width:100%;padding:0 calc(var(--sys-space-s) * .75)}
  .pb-klar .kl-foot{padding-bottom:calc(var(--sys-space-l) + ${H_BTN} + var(--sys-space-m) + env(safe-area-inset-bottom,0rem))}
}

@media (prefers-reduced-motion:reduce){.pb-klar *,.pb-klar *::before,.pb-klar *::after{transition:none!important;animation:none!important}}
/* ende klar */
`;
}

export const KLAR_CSS = klarCss(ENTRY_CSS);
