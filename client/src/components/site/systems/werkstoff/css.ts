import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import { systemFontFaces } from "../shared/fonts";
import { DEEP_RULE, GRID, NAV, ON_DEEP_DIM, RAISED, step } from "./step";
import { ENTRY_CSS } from "./entryCss";

export { step } from "./step";

/** @font-face aus der Systemdefinition — Zilla, Karla, DM Mono je einmal. */
const FONT_FACES = systemFontFaces(WERKSTOFF);


/**
 * Grundschicht von Werkstoff (Kopf, Kapitel, Grundform der Abschnitte,
 * Knöpfe, Rechtsseiten, Fuß). Gestalt nach
 * docs/designsysteme/werkstoff/systemblatt.html (Anker Hollis Butcher Co.).
 * Größen, Abstände und Farben ausschließlich über `--sys-*` (oder Vielfache);
 * Ausnahmen: 1px-Haarlinien und der 2px-Fokusring. Hell bleiben: `deep`
 * nur im Fuß (Test „Hell bleiben").
 */
export function werkstoffCss(sections: string): string {
  return `
${FONT_FACES}

.pb-werkstoff{--ws-focus:2px;--ws-radius:calc(var(--sys-space-2xs) * .75);--ws-tap:calc(var(--sys-space-l) + var(--sys-space-2xs));
  --ws-hit:calc(var(--sys-space-s) * -.8125);--ws-raised:${RAISED};
  background:var(--sys-paper);color:var(--sys-ink);${step("body")};
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal}
.pb-werkstoff *{box-sizing:border-box}
.pb-werkstoff h1,.pb-werkstoff h2,.pb-werkstoff h3{margin:0;font-weight:var(--sys-h2-weight);text-wrap:balance;hyphens:manual}
.pb-werkstoff p,.pb-werkstoff blockquote,.pb-werkstoff figure{margin:0}
.pb-werkstoff p{text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-werkstoff address{font-style:normal}
.pb-werkstoff a{color:inherit}
.pb-werkstoff img{display:block;max-width:100%}
.pb-werkstoff :focus-visible{outline:var(--ws-focus) solid currentColor;outline-offset:var(--sys-space-2xs)}
.pb-werkstoff .ws-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.pb-werkstoff .ws-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
.pb-werkstoff .ws-data{${step("data")};font-variant-numeric:tabular-nums}
.pb-werkstoff .ws-nowrap{white-space:nowrap}

/* Textlink: Unterstrich wie im Systemblatt */
.pb-werkstoff .ws-link{${step("link")};text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.25em;position:relative}
.pb-werkstoff .ws-link::before{content:"";position:absolute;inset:var(--ws-hit) calc(var(--sys-space-2xs) * -1)}

/* Knöpfe: Signal (gefüllt) und Tinte (Kontur), Radius 3 px, 52 px hoch */
.pb-werkstoff .ws-btn,.pb-werkstoff .ws-btn2{${step("link")};display:inline-flex;align-items:center;justify-content:center;gap:var(--sys-space-xs);
  min-height:calc(var(--sys-space-xl) * .8125);padding:0 var(--sys-space-m);border-radius:var(--ws-radius);text-decoration:none;white-space:nowrap;
  transition:background 200ms,transform 140ms}
.pb-werkstoff .ws-btn{background:var(--sys-signal);color:var(--sys-on-signal)}
.pb-werkstoff .ws-btn2{background:transparent;color:var(--sys-ink);box-shadow:inset 0 0 0 1px var(--sys-ink)}
.pb-werkstoff .ws-btn:active,.pb-werkstoff .ws-btn2:active{transform:scale(.97)}
.pb-werkstoff .ws-btn:focus-visible,.pb-werkstoff .ws-btn2:focus-visible{outline-color:var(--sys-ink)}
@media (hover:hover){
  .pb-werkstoff .ws-btn:hover{background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
  .pb-werkstoff .ws-btn2:hover{background:var(--ws-raised)}
}

/* Kopf: Name (Slab) + Gewerk (Mono), Menü als zwei Striche; Desktop Navigation + Knopf */
.pb-werkstoff .ws-head{position:relative;z-index:20;background:var(--sys-paper);color:var(--sys-ink);border-bottom:1px solid var(--sys-rule)}
.pb-werkstoff .ws-head-bar{max-width:var(--sys-space-max);margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:var(--sys-space-m);
  min-height:calc(var(--sys-space-xl) - var(--sys-space-2xs));padding:var(--sys-space-2xs) var(--sys-space-gutter)}
.pb-werkstoff .ws-brand{display:flex;flex-direction:column;justify-content:center;min-height:var(--ws-tap);min-width:0;text-decoration:none}
.pb-werkstoff .ws-brand-mark{${step("mark")};overflow-wrap:anywhere}
.pb-werkstoff .ws-brand-sub{${step("data")};font-size:calc(var(--sys-data-size) * .85);color:var(--sys-muted);margin-top:var(--sys-space-2xs)}
.pb-werkstoff .ws-menu-toggle{list-style:none;cursor:pointer;display:grid;place-content:center;gap:calc(var(--sys-space-xs) * .75);
  width:var(--ws-tap);height:var(--ws-tap);margin-inline-end:calc(var(--sys-space-xs) * -1)}
.pb-werkstoff .ws-menu-toggle::-webkit-details-marker{display:none}
.pb-werkstoff .ws-menu-toggle i{display:block;width:calc(var(--sys-space-m) - var(--sys-space-2xs) / 2);height:2px;background:var(--sys-ink);transition:transform 200ms}
.pb-werkstoff .ws-menu[open] .ws-menu-toggle i:first-of-type{transform:translateY(calc(var(--sys-space-xs) * .375 + 1px)) rotate(45deg)}
.pb-werkstoff .ws-menu[open] .ws-menu-toggle i:last-of-type{transform:translateY(calc(var(--sys-space-xs) * -.375 - 1px)) rotate(-45deg)}
.pb-werkstoff .ws-menu-panel{position:absolute;left:0;right:0;top:100%;background:var(--sys-paper);border-bottom:1px solid var(--sys-ink);
  padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-l);display:grid}
.pb-werkstoff .ws-menu-panel a{${step("h3")};text-decoration:none;display:flex;align-items:center;min-height:var(--ws-tap);padding-block:var(--sys-space-xs);border-bottom:1px solid var(--sys-rule)}
.pb-werkstoff .ws-menu-panel a[aria-current]{color:var(--sys-accent)}
.pb-werkstoff .ws-nav{display:none}
@media (min-width:${NAV}){
  .pb-werkstoff .ws-head-bar{min-height:calc(var(--sys-space-xl) + var(--sys-space-xs))}
  .pb-werkstoff .ws-menu{display:none}
  .pb-werkstoff .ws-nav{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:var(--sys-space-xs) calc(var(--sys-space-m) + var(--sys-space-2xs))}
  .pb-werkstoff .ws-nav a:not(.ws-btn){${step("link")};font-size:var(--sys-small-size);text-decoration:none;display:inline-flex;align-items:center;min-height:var(--ws-tap)}
  .pb-werkstoff .ws-nav a:not(.ws-btn):hover,.pb-werkstoff .ws-nav a[aria-current]{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.3em}
  .pb-werkstoff .ws-nav .ws-btn{min-height:calc(var(--sys-space-l) + var(--sys-space-xs))}
}

/* Kapitel: Slab-Überschrift, gedämpfter Satz in Lesebreite, großzügiger Abstand */
.pb-werkstoff .ws-sec{padding-top:var(--sys-space-section)}
.pb-werkstoff .ws-title{${step("h2")};max-width:16ch}
.pb-werkstoff .ws-intro{color:var(--sys-muted);max-width:var(--sys-space-measure);margin-top:var(--sys-space-m)}

${sections}

/* Grundform (W2): Zeilen mit Tinte-Linie, Zeiten, Kontakt, Fotos, Zitat */
.pb-werkstoff .ws-rows{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;border-bottom:1px solid var(--sys-ink)}
.pb-werkstoff .ws-rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-s);align-items:baseline;padding:var(--sys-space-m) 0;border-top:1px solid var(--sys-ink)}
.pb-werkstoff .ws-row-title{${step("h3")}}
.pb-werkstoff .ws-row-meta{color:var(--sys-muted)}
.pb-werkstoff .ws-row-text{grid-column:1/-1;${step("small")};color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-werkstoff .ws-contact{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-werkstoff .ws-hours{list-style:none;margin:0;padding:0;background:var(--ws-raised);border:1px solid var(--sys-ink);${step("data")}}
.pb-werkstoff .ws-hours li{display:flex;justify-content:space-between;gap:var(--sys-space-s);padding:calc(var(--sys-space-xs) * 1.25) var(--sys-space-s);border-bottom:1px solid var(--sys-rule)}
.pb-werkstoff .ws-hours li:last-child{border-bottom:0}
.pb-werkstoff .ws-contact-lines{display:grid;gap:var(--sys-space-xs)}
.pb-werkstoff .ws-contact-address{${step("h3")}}
.pb-werkstoff .ws-form-title{${step("h3")}}
.pb-werkstoff .ws-shots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-xs);margin-top:var(--sys-space-xl)}
.pb-werkstoff .ws-shots img{width:100%;aspect-ratio:4/5;object-fit:cover;filter:var(--sys-image-filter);background:var(--sys-rule)}
.pb-werkstoff .ws-shots figcaption{color:var(--sys-muted);padding-top:var(--sys-space-xs)}
.pb-werkstoff .ws-quote-text{font-family:var(--sys-font-text);font-weight:600;font-size:calc(var(--sys-h2-size) * .68);line-height:1.16;letter-spacing:-.02em;max-width:24ch;margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-voice-who{margin-top:var(--sys-space-l);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule);font-family:var(--sys-font-display);font-weight:var(--sys-h3-weight)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-contact{grid-template-columns:5fr 7fr;gap:var(--sys-space-2xl)}
  .pb-werkstoff .ws-shots{grid-template-columns:repeat(3,minmax(0,1fr))}
}

/* Unterseiten- und Rechtsseiten-Kopf: Mono-Zeile, genau ein h1 in Stufe h2 */
.pb-werkstoff .ws-page-head{padding-block:var(--sys-space-l) var(--sys-space-xl)}
.pb-werkstoff .ws-page-kicker{${step("data")};color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-werkstoff .ws-page-title{${step("h2")};overflow-wrap:anywhere}
.pb-werkstoff .ws-page-intro{${step("lede")};color:var(--sys-muted);margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}
.pb-werkstoff .ws-legal>*{max-width:var(--sys-space-measure)}
.pb-werkstoff .ws-legal{border-top:1px solid var(--sys-ink)}
.pb-werkstoff .ws-legal h2{${step("h3")};margin:var(--sys-space-xl) 0 var(--sys-space-s)}
.pb-werkstoff .ws-legal h3{${step("data")};color:var(--sys-muted);margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-werkstoff .ws-legal p,.pb-werkstoff .ws-legal ul{margin:0 0 var(--sys-space-s)}
.pb-werkstoff .ws-legal a{overflow-wrap:anywhere}

/* Fuß: einzige dunkle Fläche. Aufforderung, Telefon-Knopf, vier Spalten, Wortmarke */
.pb-werkstoff .ws-foot{background:var(--sys-deep);color:var(--sys-on-deep);margin-top:var(--sys-space-section);padding-top:var(--sys-space-section);overflow:hidden}
.pb-werkstoff .ws-foot :focus-visible{outline-color:var(--sys-on-deep)}
.pb-werkstoff .ws-foot-call{${step("h2")};max-width:14ch}
.pb-werkstoff .ws-foot-btn{margin-top:var(--sys-space-l)}
.pb-werkstoff .ws-foot-btn:focus-visible{outline-color:var(--sys-on-deep)}
.pb-werkstoff .ws-foot-cols{${step("small")};display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m);
  margin-top:var(--sys-space-2xl);padding-top:var(--sys-space-l);border-top:1px solid ${DEEP_RULE}}
.pb-werkstoff .ws-foot-col{min-width:0;overflow-wrap:anywhere;line-height:1.6}
.pb-werkstoff .ws-foot-h{${step("data")};color:${ON_DEEP_DIM};margin:0 0 var(--sys-space-xs)}
.pb-werkstoff .ws-foot-col ul{list-style:none;margin:0;padding:0;display:grid}
.pb-werkstoff .ws-foot-col a,.pb-werkstoff .ws-foot-legal a{text-decoration:none;position:relative}
.pb-werkstoff .ws-foot-col a::before,.pb-werkstoff .ws-foot-legal a::before{content:"";position:absolute;inset:var(--ws-hit) calc(var(--sys-space-2xs) * -1)}
.pb-werkstoff .ws-foot-col a:hover,.pb-werkstoff .ws-foot-legal a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-werkstoff .ws-foot-legal{${step("small")};color:${ON_DEEP_DIM};display:flex;flex-wrap:wrap;gap:var(--sys-space-s) var(--sys-space-m);margin-top:var(--sys-space-xl)}
.pb-werkstoff .ws-foot-word{container-type:inline-size;font-family:var(--sys-font-display);font-weight:var(--sys-figure-weight);line-height:.8;letter-spacing:var(--sys-figure-track);
  white-space:nowrap;margin-top:var(--sys-space-l);padding-bottom:var(--sys-space-m);font-size:var(--sys-h2-size)}
@supports (font-size:1cqw){
  .pb-werkstoff .ws-foot{container-type:inline-size}
  .pb-werkstoff .ws-foot-word{container-type:normal;font-size:clamp(var(--sys-h2-size),calc((100cqw - 2 * var(--sys-space-gutter)) / var(--ws-fit)),var(--sys-figure-size))}
}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-foot-cols{grid-template-columns:repeat(4,minmax(0,1fr))}
}

/* Bildnachweis im Fuß-Band (dunkel), gedämpft */
.pb-werkstoff .pb-photo-credits{${step("small")};color:${ON_DEEP_DIM};background:var(--sys-deep);margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-werkstoff .pb-photo-credits a{color:inherit;text-underline-offset:.2em}

/* Kontakt-Insel (Formular) in Werkstoff-Tokens */
.pb-werkstoff .pb-island-form{gap:var(--sys-space-m)}
.pb-werkstoff .pb-island-form label{${step("data")};color:var(--sys-muted);gap:var(--sys-space-xs)}
.pb-werkstoff .pb-island-form input,.pb-werkstoff .pb-island-form textarea{${step("body")};border:1px solid var(--sys-ink);border-radius:var(--ws-radius);
  background:var(--ws-raised);color:var(--sys-ink);padding:var(--sys-space-xs) var(--sys-space-s)}
.pb-werkstoff .pb-island-form input:focus,.pb-werkstoff .pb-island-form textarea:focus{outline:var(--ws-focus) solid var(--sys-accent);outline-offset:1px}
.pb-werkstoff .pb-island-submit{${step("link")};background:var(--sys-signal);color:var(--sys-on-signal);border-radius:var(--ws-radius);padding:var(--sys-space-s) var(--sys-space-m)}
.pb-werkstoff .pb-island-privacy{${step("small")};color:var(--sys-muted)}

@media (prefers-reduced-motion:reduce){.pb-werkstoff *,.pb-werkstoff *::before,.pb-werkstoff *::after{transition:none!important;animation:none!important}}
/* ende werkstoff */
`;
}

export const WERKSTOFF_CSS = werkstoffCss(ENTRY_CSS);
