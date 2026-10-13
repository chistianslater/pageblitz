import { FOCUS, H_BTN, H_MIN, H_SMALL, LINE, NAV, WIDE, step } from "./step";

/** Schalter-Kachel der Fragen 36 px, Kartenkachel 160 px hoch. */
const TOGGLE = "calc(var(--sys-space-l) * .9)";
const MAP_H = "calc(var(--sys-space-xl) * 2.5)";
const PIN = "calc(var(--sys-space-l) * 1.2)";
/** Straßen der Kartenkachel: 14 px bzw. 10 px breit. */
const ROAD = "calc(var(--sys-space-s) * .875)";
const ROAD_S = "calc(var(--sys-space-s) * .625)";
/** Leicht aufgehellte Zeile „heute" auf Tief. */
const NOW_BG = "color-mix(in srgb,var(--sys-on-deep) 12%,var(--sys-deep))";
const DEEP_RULE = "color-mix(in srgb,var(--sys-on-deep) 16%,transparent)";
/** Druckkante beim Überfahren 6 px, beim Drücken 1 px (wie die Knöpfe). */
const PRESS_HOVER = "calc(var(--sys-press) * 1.5)";
const PRESS_DOWN = "calc(var(--sys-press) * .25)";

/**
 * Besuch nach Systemblatt 8/13/14/17: Fragen als weiße Karten zum
 * Aufklappen, Zeiten auf Tief mit „heute", Kartenkachel ohne Einbettung,
 * Abschluss-Band, Kontakt-Insel im Freundlich-Gewand (Beschriftung über
 * dem Feld, Fokus 3 px Akzent, Fehler nicht nur über Farbe) und die
 * gestrichelten Vorschau-Platzhalter.
 */
export const VISIT_CSS = `
/* Gut zu wissen: weiße Karten, erste offen, Pastellkachel Plus/Minus */
.pb-freundlich .fr-faq{display:grid;gap:calc(var(--sys-space-s) * .625);max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-freundlich .fr-q{border-radius:var(--sys-radius-m);background:var(--sys-surface);color:var(--sys-ink)}
.pb-freundlich .fr-q summary{display:flex;align-items:center;justify-content:space-between;gap:var(--sys-space-s);min-height:${H_MIN};padding:var(--sys-space-s) calc(var(--sys-space-m) * .85);
  list-style:none;cursor:pointer;border-radius:var(--sys-radius-m)}
.pb-freundlich .fr-q summary::-webkit-details-marker{display:none}
.pb-freundlich .fr-q-text{${step("h3")};font-size:calc(var(--sys-h3-size) * .72);line-height:1.3;min-width:0;overflow-wrap:break-word}
.pb-freundlich .fr-tile--toggle{width:${TOGGLE};height:${TOGGLE}}
.pb-freundlich .fr-q-minus,.pb-freundlich .fr-q[open] .fr-q-plus{display:none}
.pb-freundlich .fr-q[open] .fr-q-minus{display:grid}
.pb-freundlich .fr-q-answer{padding:0 calc(var(--sys-space-m) * .85) var(--sys-space-m);color:var(--sys-muted);max-width:var(--sys-space-measure)}

/* Besuch uns: Zeiten auf Tief + Kartenkachel */
.pb-freundlich .fr-visit{display:grid;gap:var(--sys-space-s)}
.pb-freundlich .fr-visit--solo{max-width:calc(var(--sys-space-measure) * 1.2)}
.pb-freundlich .fr-hours{padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);border-radius:var(--sys-radius-l);background:var(--sys-deep);color:var(--sys-on-deep);min-width:0}
.pb-freundlich .fr-hours :focus-visible{outline-color:var(--sys-on-deep)}
.pb-freundlich .fr-hours-title{${step("h3")};margin-bottom:var(--sys-space-xs)}
.pb-freundlich .fr-hours-table{width:100%;border-collapse:collapse}
.pb-freundlich .fr-hours-table tr{border-top:1px solid ${DEEP_RULE}}
.pb-freundlich .fr-hours-table tr:first-child{border-top:0}
.pb-freundlich .fr-hours-table th,.pb-freundlich .fr-hours-table td{padding:calc(var(--sys-space-s) * .7) calc(var(--sys-space-s) * .5);text-align:left;vertical-align:baseline}
.pb-freundlich .fr-hours-table th{font-weight:600;white-space:nowrap;padding-right:var(--sys-space-m)}
.pb-freundlich .fr-hv{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--sys-space-2xs) var(--sys-space-xs);font-variant-numeric:tabular-nums lining-nums}
.pb-freundlich .fr-hv span{white-space:nowrap}
.pb-freundlich .fr-hv--text span{white-space:normal;overflow-wrap:anywhere}
.pb-freundlich .fr-now th,.pb-freundlich .fr-now td{background:${NOW_BG}}
.pb-freundlich .fr-now th{border-radius:var(--sys-radius-s) 0 0 var(--sys-radius-s)}
.pb-freundlich .fr-now td{border-radius:0 var(--sys-radius-s) var(--sys-radius-s) 0}
.pb-freundlich .fr-hv .fr-now-tag{${step("small")};font-size:calc(var(--sys-small-size) * .8125);font-weight:600;line-height:1.6;padding:0 var(--sys-space-xs);border-radius:var(--sys-radius-pill);
  background:var(--sys-signal);color:var(--sys-on-signal)}
.pb-freundlich .fr-place{display:grid;border-radius:var(--sys-radius-l);background:var(--sys-surface);color:var(--sys-ink);overflow:hidden;min-width:0}
.pb-freundlich .fr-map{position:relative;height:${MAP_H};background:var(--sys-band);overflow:hidden}
.pb-freundlich .fr-map-road::before,.pb-freundlich .fr-map-road::after{content:"";position:absolute;background:var(--sys-surface)}
.pb-freundlich .fr-map-road::before{left:-10%;right:-10%;top:55%;height:${ROAD};transform:rotate(-8deg)}
.pb-freundlich .fr-map-road::after{top:-10%;bottom:-10%;left:42%;width:${ROAD_S};transform:rotate(6deg)}
.pb-freundlich .fr-map-blob::before,.pb-freundlich .fr-map-blob::after{content:"";position:absolute;border-radius:50%}
.pb-freundlich .fr-map-blob::before{right:-8%;bottom:-30%;width:45%;height:85%;background:var(--sys-tint-1-bg)}
.pb-freundlich .fr-map-blob::after{left:8%;bottom:8%;width:28%;height:28%;background:var(--sys-tint-2-bg)}
.pb-freundlich .fr-map-pin{position:absolute;left:50%;top:46%;transform:translate(-50%,-100%);color:var(--sys-edge-color)}
.pb-freundlich .fr-map-pin .fr-ic{width:${PIN};height:${PIN};fill:var(--sys-signal)}
.pb-freundlich .fr-place-body{display:grid;gap:var(--sys-space-s);padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);min-width:0}
.pb-freundlich .fr-place-adr{${step("h3")};overflow-wrap:anywhere}
.pb-freundlich .fr-ways{display:flex;flex-direction:column;align-items:flex-start;gap:var(--sys-space-2xs)}
.pb-freundlich .fr-way{display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${H_MIN};max-width:100%;overflow-wrap:anywhere;text-underline-offset:.25em;text-decoration-color:var(--sys-accent)}
.pb-freundlich .fr-ways .fr-btn{margin-top:var(--sys-space-xs)}
.pb-freundlich .fr-form-title{${step("h3")};margin-top:var(--sys-space-xl)}

/* Abschluss-Band: Titel mittig, Hauptweg + Nummer */
.pb-freundlich .fr-sec--cta .fr-chead{margin-bottom:0}
.pb-freundlich .fr-ctas--band{justify-content:center}

/* Kontakt-Insel: weiße Karte, Beschriftung über dem Feld, Fokus 3 px Akzent */
.pb-freundlich .fr-sec--contact>.pb-island{position:relative;z-index:1;max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-freundlich .pb-island-form{max-width:calc(var(--sys-space-measure) * 1.1);gap:var(--sys-space-s);padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);border-radius:var(--sys-radius-l);
  background:var(--sys-surface);color:var(--sys-ink)}
.pb-freundlich .pb-island-form label{${step("small")};font-weight:600;text-transform:none;letter-spacing:0;color:var(--sys-ink);gap:var(--sys-space-xs)}
.pb-freundlich .pb-island-form input,.pb-freundlich .pb-island-form textarea{${step("body")};min-height:${H_SMALL};padding:calc(var(--sys-space-s) * .625) calc(var(--sys-space-s) * .875);
  border:${LINE} solid var(--sys-muted);border-radius:var(--sys-radius-s);background:var(--sys-paper);color:var(--sys-ink)}
.pb-freundlich .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 1.2)}
.pb-freundlich .pb-island-form ::placeholder{color:var(--sys-muted);opacity:1}
.pb-freundlich .pb-island-form input:focus,.pb-freundlich .pb-island-form textarea:focus{outline:none}
.pb-freundlich .pb-island-form input:focus-visible,.pb-freundlich .pb-island-form textarea:focus-visible{outline:${FOCUS} solid var(--sys-accent);outline-offset:0;border-color:var(--sys-accent);background:var(--sys-surface)}
/* Ungültig nach Eingabe: Rand gestrichelt und doppelt so stark (nicht nur Farbe) */
.pb-freundlich .pb-island-form input:user-invalid,.pb-freundlich .pb-island-form textarea:user-invalid{border-style:dashed;border-width:calc(${LINE} * 2);border-color:var(--sys-edge-color)}
.pb-freundlich .pb-island-submit{${step("link")};display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:${H_BTN};padding:var(--sys-space-xs) var(--sys-space-m);
  border:0;border-radius:var(--sys-radius-pill);background:var(--sys-signal);color:var(--sys-on-signal);cursor:pointer;
  box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 var(--sys-press) 0 var(--sys-edge-color);transition:transform 140ms cubic-bezier(.22,1,.36,1),box-shadow 140ms cubic-bezier(.22,1,.36,1)}
.pb-freundlich .pb-island-submit:hover,.pb-freundlich .pb-island-submit:focus-visible{opacity:1}
.pb-freundlich .pb-island-submit:active{transform:translateY(calc(var(--sys-press) * .75));box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 ${PRESS_DOWN} 0 var(--sys-edge-color)}
@media (hover:hover) and (pointer:fine){
  .pb-freundlich .pb-island-submit:hover{transform:translateY(calc(var(--sys-press) * -.5));box-shadow:inset 0 0 0 ${LINE} var(--sys-edge-color),0 ${PRESS_HOVER} 0 var(--sys-edge-color)}
}
.pb-freundlich .pb-island-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
.pb-freundlich .pb-island-privacy{${step("small")};color:var(--sys-muted)}
.pb-freundlich .pb-island-privacy a{color:var(--sys-ink);text-decoration-color:var(--sys-accent);text-underline-offset:.25em}
.pb-freundlich .pb-island-status{${step("small")}}
/* Erfolg/Fehler: Tinte, Kante und Zeichen statt nur Farbe (islandsCss färbt sonst fest) */
.pb-freundlich .pb-island-status[data-state="success"],.pb-freundlich .pb-island-status[data-state="error"]{color:var(--sys-ink);font-weight:600;
  border-left:calc(${LINE} * 2) solid var(--sys-edge-color);padding-left:var(--sys-space-s)}
.pb-freundlich .pb-island-status[data-state="error"]::before{content:"! ";font-weight:700}
.pb-freundlich .pb-island-status[data-state="info"]{color:var(--sys-muted)}

/* Vorschau-Platzhalter (nur Vorschau) */
.pb-freundlich .fr-slot-section{padding-top:var(--sys-space-section)}
.pb-freundlich .fr-slot{max-width:var(--sys-space-measure);border:2px dashed var(--sys-muted);border-radius:var(--sys-radius-m);padding:var(--sys-space-m);color:var(--sys-ink);background:var(--sys-paper)}
.pb-freundlich .fr-sec .fr-slot{margin-top:var(--sys-space-l)}
.pb-freundlich .fr-slot-kicker{${step("kicker")};color:var(--sys-muted)}
.pb-freundlich .fr-slot .fr-h3{margin-top:var(--sys-space-xs)}
.pb-freundlich .fr-slot-text{${step("small")};margin-top:var(--sys-space-xs);color:var(--sys-muted)}

@media (min-width:${WIDE}){
  .pb-freundlich .fr-visit{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}
  .pb-freundlich .fr-visit--solo{grid-template-columns:minmax(0,1fr)}
}
@media (min-width:${NAV}){
  .pb-freundlich .fr-visit:not(.fr-visit--solo){grid-template-columns:minmax(0,5fr) minmax(0,7fr)}
  .pb-freundlich .fr-visit:not(.fr-visit--solo) .fr-place:has(>.fr-map){grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .pb-freundlich .fr-visit:not(.fr-visit--solo) .fr-map{height:auto;min-height:${MAP_H}}
}
`;
