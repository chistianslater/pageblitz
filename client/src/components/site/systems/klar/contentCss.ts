import {
  step,
  GRID,
  H_MIN,
  PILL,
  R_BTN,
  R_CARD,
  R_FRAME,
  TAP,
  TILE,
} from "./step";

/** Zwei Spalten für Karten ab Tablet. */
const TWO = "40rem";
/** Weiche Kartenfläche: weiß auf Papier, feine Linie statt Schatten. */
const CARD = `background:var(--sys-surface);color:var(--sys-ink);border-radius:${R_CARD};box-shadow:0 0 0 1px var(--sys-rule)`;
/** Innenabstand der Karten (20 px Handy, 22 px Desktop). */
const PAD = "calc(var(--sys-space-s) * 1.25)";

/**
 * Inhalte von Klar (Systemblatt 9–13): Leistungen, Preise, erster Termin,
 * Team, Galerie, Stimmen, Fragen, Sprechzeiten und Anfahrt, Aufruf,
 * Extras, Vorschau-Platzhalter, Kontakt-Insel. Nur `--sys-*`-Tokens;
 * Felder (Lind/Tau/Rose …) nur als Fläche mit ihrer eigenen Tinte.
 */
export const CONTENT_CSS = `/* Kapitel-Kopf mit Knopf rechts (Desktop) */
.pb-klar .kl-sec-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:var(--sys-space-s) var(--sys-space-l)}
.pb-klar .kl-sec-link{min-height:${H_MIN}}

/* Leistungen: weiche Karten; bei vier die erste auf Lind (Desktop groß), die zweite getönt */
.pb-klar .kl-svc{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .625);grid-template-columns:minmax(0,1fr)}
.pb-klar .kl-svc-card{${CARD};display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sys-space-xs);align-content:start;padding:${PAD};min-width:0;overflow-wrap:break-word}
.pb-klar .kl-svc-card--lead{background:var(--sys-field-1-bg);color:var(--sys-field-1-ink);box-shadow:none;--kl-muted:var(--sys-field-1-muted)}
.pb-klar .kl-svc-card--tint{background:var(--sys-field-2-bg);color:var(--sys-field-2-ink);box-shadow:none;--kl-muted:var(--sys-field-2-muted)}
.pb-klar .kl-svc-name{${step("h3")};hyphens:auto}
.pb-klar .kl-svc-text{color:var(--kl-muted)}
.pb-klar .kl-svc-price{${step("data")};margin-top:var(--sys-space-2xs)}
.pb-klar .kl-svc-note{${step("small")};margin-top:var(--sys-space-2xs);color:var(--kl-muted)}
@media (min-width:${TWO}){
  .pb-klar .kl-svc{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (min-width:${GRID}){
  .pb-klar .kl-svc{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--sys-space-s)}
  .pb-klar .kl-svc[data-n="4"]{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,1fr)}
  .pb-klar .kl-svc[data-n="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pb-klar .kl-svc-card{padding:calc(${PAD} * 1.1)}
  .pb-klar .kl-svc[data-n="4"] .kl-svc-card--lead{grid-row:span 2;align-content:end;padding:calc(${PAD} * 1.6)}
  .pb-klar .kl-svc[data-n="4"] .kl-svc-card--lead .kl-svc-name{${step("h2")}}
  .pb-klar .kl-svc[data-n="4"] .kl-svc-card:last-child{grid-column:span 2}
}

/* Preise und Karte: klare Tabelle, Betrag rechts */
.pb-klar .kl-prices{margin-top:var(--sys-space-l);display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sys-space-s);max-width:calc(var(--sys-space-measure) * 1.25)}
.pb-klar .kl-ptable{${CARD};width:100%;border-collapse:separate;border-spacing:0;padding:calc(var(--sys-space-xs) * .75) calc(var(--sys-space-s) * 1.125)}
.pb-klar .kl-pcat{${step("small")};font-weight:700;text-align:left;color:var(--sys-muted);caption-side:top;padding:0 0 var(--sys-space-xs)}
.pb-klar .kl-ptable th,.pb-klar .kl-ptable td{padding:calc(var(--sys-space-s) * .8) 0;border-top:1px solid var(--sys-rule);vertical-align:top;font-weight:400}
.pb-klar .kl-ptable tr:first-child>*{border-top:0}
.pb-klar .kl-ptable th{text-align:left;padding-right:var(--sys-space-s);overflow-wrap:break-word}
.pb-klar .kl-ptable td{text-align:right;width:40%}
.pb-klar .kl-pname{display:block}
.pb-klar .kl-pdesc{${step("small")};display:block;color:var(--sys-muted)}
.pb-klar .kl-pval{${step("data")};white-space:nowrap}
.pb-klar .kl-pnote{${step("small")};display:block;color:var(--sys-muted);overflow-wrap:break-word}

/* Erster Termin: Linie mit Nummern-Kreisen (Handy), Karten (Desktop) */
.pb-klar .kl-steps-list{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;position:relative;display:grid;gap:calc(var(--sys-space-s) * 1.375)}
.pb-klar .kl-steps-list::before{content:"";position:absolute;left:calc(${TAP} / 2 - 1px);top:calc(${TAP} / 2);bottom:calc(${TAP} / 2);width:2px;background:var(--sys-rule)}
.pb-klar .kl-step{position:relative;display:grid;grid-template-columns:${TAP} minmax(0,1fr);gap:var(--sys-space-s)}
.pb-klar .kl-step-no{display:grid;place-items:center;width:${TAP};height:${TAP};border-radius:${PILL};background:var(--sys-surface);color:var(--sys-accent);box-shadow:inset 0 0 0 2px var(--sys-accent);
  font-family:var(--sys-font-display);font-weight:650;font-size:var(--sys-link-size);line-height:1}
.pb-klar .kl-step:first-child .kl-step-no{background:var(--sys-signal);color:var(--sys-on-signal);box-shadow:none}
.pb-klar .kl-step-body{min-width:0;padding-top:var(--sys-space-xs);overflow-wrap:break-word}
.pb-klar .kl-step-title{${step("h3")}}
.pb-klar .kl-step-text{margin-top:var(--sys-space-2xs);color:var(--sys-muted)}
@media (min-width:${TWO}){
  .pb-klar .kl-steps-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-m) calc(var(--sys-space-l) * .9)}
  .pb-klar .kl-steps-list::before{display:none}
  .pb-klar .kl-step{${CARD};grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .75);align-content:start;padding:calc(${PAD} * 1.1)}
  .pb-klar .kl-step-body{padding-top:0}
}
@media (min-width:${GRID}){
  .pb-klar .kl-steps-list:has(>li:nth-child(3):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}
}

/* Team: Monogramm-Kacheln (Lind, Tau, Tief) oder Porträt im weichen Rahmen */
.pb-klar .kl-crew{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .75)}
.pb-klar .kl-person{${CARD};display:grid;grid-template-columns:calc(${TILE} * 2.1) minmax(0,1fr);gap:var(--sys-space-s);align-items:center;padding:calc(var(--sys-space-s) * .625);min-width:0}
.pb-klar .kl-mono,.pb-klar .kl-portrait{display:grid;place-items:center;aspect-ratio:1/1;border-radius:${R_BTN};overflow:hidden}
.pb-klar .kl-mono{font-family:var(--sys-font-display);font-weight:var(--sys-display-weight);letter-spacing:-.04em;font-size:calc(var(--sys-space-l) * .75);line-height:1}
.pb-klar .kl-mono--1{background:var(--sys-field-1-bg);color:var(--sys-field-1-ink)}
.pb-klar .kl-mono--2{background:var(--sys-field-2-bg);color:var(--sys-field-2-ink)}
.pb-klar .kl-mono--3{background:var(--sys-field-3-bg);color:var(--sys-field-3-ink)}
.pb-klar .kl-portrait{background:var(--sys-field-2-bg)}
.pb-klar .kl-portrait img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-klar .kl-person-text{min-width:0;overflow-wrap:break-word}
.pb-klar .kl-person-name{${step("link")};hyphens:auto}
.pb-klar .kl-person-role{${step("small")};color:var(--sys-muted)}
@media (min-width:${TWO}){
  .pb-klar .kl-crew{grid-template-columns:repeat(auto-fill,minmax(min(100%,12rem),1fr));gap:var(--sys-space-m)}
  .pb-klar .kl-person{background:none;box-shadow:none;padding:0;grid-template-columns:minmax(0,1fr);align-items:start;gap:calc(var(--sys-space-s) * .75)}
  .pb-klar .kl-mono,.pb-klar .kl-portrait{border-radius:${R_CARD}}
  .pb-klar .kl-mono{font-size:calc(var(--sys-space-xl) * .85)}
}

/* Fotos im weichen Doppelrahmen (Über uns, Galerie) */
.pb-klar .kl-pic{padding:calc(var(--sys-space-xs) * .75);border-radius:${R_FRAME};background:var(--sys-surface);box-shadow:0 0 0 1px var(--sys-rule)}
.pb-klar .kl-pic-in{border-radius:calc(${R_FRAME} - var(--sys-space-xs) * .75);overflow:hidden;aspect-ratio:4/3;background:var(--sys-field-2-bg)}
.pb-klar .kl-pic img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-klar .kl-about-grid{margin-top:var(--sys-space-l);display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sys-space-l)}
.pb-klar .kl-about-grid .kl-prose{margin-top:0}
.pb-klar .kl-prose{margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}
.pb-klar .kl-prose p+p{margin-top:var(--sys-space-s)}
.pb-klar .kl-gal{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:var(--sys-space-s);grid-template-columns:minmax(0,1fr)}
/* Galerie ohne Waisen: Tablet 2 Spalten (ungerade → erstes Foto über beide),
   Desktop 6er-Raster mit 3 je Zeile, 2 und 4 als Paare, 5 = 2 + 3 */
@media (min-width:40rem) and (max-width:calc(${GRID} - 1px)){
  .pb-klar .kl-gal{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pb-klar .kl-gal:is([data-n="1"],[data-n="3"],[data-n="5"]) li:first-child{grid-column:span 2}
}
.pb-klar .kl-gal-fig{margin:0}
.pb-klar .kl-gal-cap{${step("small")};margin-top:var(--sys-space-xs);color:var(--sys-muted)}
@media (min-width:${GRID}){
  .pb-klar .kl-about-grid--photo{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:center;gap:var(--sys-space-xl)}
  .pb-klar .kl-gal{grid-template-columns:repeat(6,minmax(0,1fr))}
  .pb-klar .kl-gal li{grid-column:span 2}
  .pb-klar .kl-gal:is([data-n="2"],[data-n="4"]) li,.pb-klar .kl-gal[data-n="5"] li:nth-child(-n+2){grid-column:span 3}
  .pb-klar .kl-gal[data-n="1"]{grid-template-columns:minmax(0,1fr);max-width:calc(var(--sys-space-measure) * 1.4)}
  .pb-klar .kl-gal[data-n="1"] li{grid-column:auto}
}

/* Stimmen: ruhige Karten, erste mit Google-Schnitt und großem Zitat */
.pb-klar .kl-voices{margin-top:var(--sys-space-l);display:grid;gap:calc(var(--sys-space-s) * .75);grid-template-columns:minmax(0,1fr)}
.pb-klar .kl-voice{${CARD};margin:0;padding:calc(${PAD} * 1.1);display:grid;grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .75);align-content:start;min-width:0;overflow-wrap:break-word}
.pb-klar .kl-voice-rate{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:calc(var(--sys-space-s) * .75)}
.pb-klar .kl-voice-rate b{font-family:var(--sys-font-display);font-weight:var(--sys-figure-weight);letter-spacing:var(--sys-figure-track);line-height:1;font-size:calc(var(--sys-space-l) * 1.3)}
.pb-klar .kl-voice-rate span{${step("small")};color:var(--sys-muted)}
.pb-klar .kl-stars{display:flex;gap:var(--sys-space-2xs);color:var(--sys-accent)}
.pb-klar .kl-stars .kl-ic{width:1.1em;height:1.1em}
.pb-klar .kl-voice-text p{font-family:var(--sys-font-display);font-weight:500;letter-spacing:-.01em;line-height:1.4}
.pb-klar .kl-voice--lead .kl-voice-text p{font-size:var(--sys-h3-size);line-height:1.35}
.pb-klar .kl-voice-who{${step("small")};color:var(--sys-muted)}
@media (min-width:${GRID}){
  .pb-klar .kl-voices{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-s)}
  .pb-klar .kl-voice--lead{grid-column:1/-1;padding:calc(${PAD} * 1.5)}
  .pb-klar .kl-voice--lead .kl-voice-text p{max-width:30em}
}

/* Fragen: details mit Plus-Kachel (offen → ×) */
.pb-klar .kl-faqs{margin-top:var(--sys-space-l);display:grid;grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .625);max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-klar .kl-faq-item{background:var(--sys-surface);color:var(--sys-ink);border-radius:var(--sys-space-s);box-shadow:0 0 0 1px var(--sys-rule)}
.pb-klar .kl-faq-item summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:calc(var(--sys-space-s) * .875);
  min-height:calc(var(--sys-space-xl) * .9375);padding:calc(var(--sys-space-s) * .875) calc(var(--sys-space-s) * 1.125);font-weight:700;cursor:pointer;border-radius:var(--sys-space-s)}
.pb-klar .kl-faq-item summary::-webkit-details-marker{display:none}
.pb-klar .kl-faq-q{min-width:0;overflow-wrap:break-word}
.pb-klar .kl-faq-sign{flex:none;display:grid;place-items:center;width:calc(${TILE} * .9);height:calc(${TILE} * .9);border-radius:calc(var(--sys-space-s) * .625);
  background:var(--sys-field-1-bg);color:var(--sys-field-1-ink);transition:transform 200ms cubic-bezier(.23,1,.32,1)}
.pb-klar .kl-faq-item[open] .kl-faq-sign{transform:rotate(45deg)}
.pb-klar .kl-faq-a{padding:0 calc(var(--sys-space-s) * 1.125) calc(var(--sys-space-s) * 1.125)}
.pb-klar .kl-faq-a p{color:var(--sys-muted);max-width:var(--sys-space-measure)}

/* Sprechzeiten und Anfahrt: Zeiten-Karte neben der Kartenkachel (ohne Einbettung) */
.pb-klar .kl-visit{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-s);grid-template-columns:minmax(0,1fr);align-items:start}
.pb-klar .kl-place{${CARD};overflow:hidden;min-width:0}
.pb-klar .kl-map{position:relative;height:calc(var(--sys-space-2xl) * 2.2);
  background:
    linear-gradient(90deg,transparent 47%,var(--sys-surface) 47%,var(--sys-surface) 53%,transparent 53%),
    linear-gradient(0deg,transparent 58%,var(--sys-surface) 58%,var(--sys-surface) 63%,transparent 63%),
    linear-gradient(28deg,transparent 30%,var(--sys-surface) 30%,var(--sys-surface) 33%,transparent 33%),
    linear-gradient(90deg,color-mix(in srgb,var(--sys-surface) 55%,transparent) 2px,transparent 2px) 0 0/calc(var(--sys-space-xl) * .95) 100%,
    linear-gradient(0deg,color-mix(in srgb,var(--sys-surface) 55%,transparent) 2px,transparent 2px) 0 0/100% calc(var(--sys-space-l) * 1.2),
    var(--sys-field-2-bg)}
.pb-klar .kl-map-park{position:absolute;left:8%;top:12%;width:24%;height:30%;border-radius:calc(var(--sys-space-s) * 1.125);background:var(--sys-field-1-bg)}
.pb-klar .kl-map-pin{position:absolute;left:50%;top:60%;display:grid;place-items:center;width:calc(${TILE} * 1.3);height:calc(${TILE} * 1.3);
  border-radius:var(--sys-space-s) var(--sys-space-s) var(--sys-space-s) var(--sys-space-2xs);background:var(--sys-signal);color:var(--sys-on-signal);
  transform:translate(-50%,-100%) rotate(-45deg);box-shadow:0 calc(var(--sys-space-s) * .625) calc(var(--sys-space-m)) calc(var(--sys-space-s) * -.625) color-mix(in srgb,var(--sys-ink) 50%,transparent)}
.pb-klar .kl-map-pin .kl-ic{transform:rotate(45deg)}
.pb-klar .kl-place-body{display:grid;grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .75);padding:calc(var(--sys-space-s) * 1.125) ${PAD} ${PAD}}
.pb-klar .kl-place-addr{font-weight:700;overflow-wrap:break-word}
.pb-klar .kl-place-acc{list-style:none;margin:0;padding:0;display:grid;gap:var(--sys-space-2xs);color:var(--sys-muted)}
.pb-klar .kl-place-acc li{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .625)}
.pb-klar .kl-place-acc .kl-ic{color:var(--sys-accent)}
.pb-klar .kl-place-ways{display:flex;flex-direction:column;align-items:flex-start;gap:var(--sys-space-2xs)}
.pb-klar .kl-way{display:inline-flex;align-items:center;gap:calc(var(--sys-space-s) * .625);min-height:${TAP};max-width:100%;overflow-wrap:anywhere;text-underline-offset:.2em}
.pb-klar .kl-way .kl-ic{color:var(--sys-accent)}
.pb-klar .kl-place-ways .kl-btn{margin-top:var(--sys-space-xs)}
@media (min-width:${GRID}){
  .pb-klar .kl-visit{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--sys-space-l)}
  /* Zeiten stehen schon im Einstieg: Karte und Anschrift nebeneinander über die volle Breite */
  .pb-klar .kl-visit--solo{grid-template-columns:minmax(0,1fr)}
  .pb-klar .kl-visit--solo .kl-place:has(.kl-map){display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr)}
  .pb-klar .kl-visit--solo .kl-map{height:auto;min-height:calc(var(--sys-space-2xl) * 2.6)}
  .pb-klar .kl-visit--solo .kl-place-body{align-content:center;padding:${PAD} calc(${PAD} * 1.5)}
}

/* Kontakt-Insel: Titel nur, wenn das Formular rendert; Felder ≥ 7:1 */
.pb-klar .kl-form-title{${step("h3")};margin-top:var(--sys-space-xl)}
.pb-klar .kl-contact>.pb-island{max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-klar .kl-contact>.pb-island .pb-island-form{max-width:var(--sys-space-measure)}
.pb-klar .pb-island-form{gap:var(--sys-space-m)}
.pb-klar .pb-island-form label{${step("small")};font-weight:700;color:var(--sys-ink);gap:var(--sys-space-xs)}
.pb-klar .pb-island-form input,.pb-klar .pb-island-form textarea{${step("body")};min-height:${H_MIN};background:var(--sys-surface);color:var(--sys-ink);border:2px solid var(--sys-muted);
  border-radius:${R_BTN};padding:calc(var(--sys-space-s) * .75) var(--sys-space-s)}
.pb-klar .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 1.6)}
.pb-klar .pb-island-form input:focus-visible,.pb-klar .pb-island-form textarea:focus-visible{outline:var(--kl-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs);border-color:var(--sys-ink)}
.pb-klar .pb-island-submit{${step("link")};min-height:${H_MIN};cursor:pointer;background:var(--sys-signal);color:var(--sys-on-signal);border:0;border-radius:${R_BTN};padding:0 calc(var(--sys-space-s) * 1.375)}
.pb-klar .pb-island-submit:focus-visible{outline:var(--kl-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-klar .pb-island-privacy{${step("small")};color:var(--sys-muted)}
.pb-klar .pb-island-privacy a{color:var(--sys-ink)}
.pb-klar .pb-island-status{${step("small")}}
/* Farbe hier nötig: islandsCss färbt Erfolg/Fehler fest und steht später im Dokument */
.pb-klar .pb-island-status[data-state="success"],.pb-klar .pb-island-status[data-state="error"]{color:var(--sys-ink);border-left:2px solid currentColor;padding-left:var(--sys-space-s)}
.pb-klar .pb-island-status[data-state="info"]{color:var(--sys-muted)}

/* Aufruf: tiefe Fläche, heller Hauptknopf; geht in den Fuß über */
.pb-klar .kl-band{margin-top:var(--sys-space-section);padding-block:var(--sys-space-xl);background:var(--sys-deep);color:var(--sys-on-deep)}
.pb-klar .kl-band :focus-visible{outline-color:var(--sys-on-deep)}
.pb-klar .kl-band-title{${step("h2")};max-width:16em;overflow-wrap:break-word}
.pb-klar .kl-band-actions{display:grid;grid-template-columns:minmax(0,1fr);gap:calc(var(--sys-space-s) * .75);margin-top:var(--sys-space-m)}
.pb-klar .kl-band .kl-btn--p{background:var(--sys-on-signal);color:var(--sys-signal);justify-content:space-between}
.pb-klar .kl-band .kl-btn--p .kl-btn-ic{background:var(--sys-signal);color:var(--sys-on-signal)}
.pb-klar .kl-band .kl-btn--s{background:transparent;color:var(--sys-on-deep);box-shadow:inset 0 0 0 2px var(--sys-on-deep)}
@media (hover:hover){
  .pb-klar .kl-band .kl-btn--p:hover{background:color-mix(in srgb,var(--sys-on-signal) 88%,var(--sys-on-deep))}
  .pb-klar .kl-band .kl-btn--s:hover{background:color-mix(in srgb,var(--sys-on-deep) 12%,transparent)}
}
.pb-klar .kl-main:has(>.kl-band:last-child)+.kl-foot{margin-top:0}
@media (min-width:${TWO}){
  .pb-klar .kl-band-actions{display:flex;flex-wrap:wrap}
}

/* Zahlen, Vorteile, Leitsatz, Partner */
.pb-klar .kl-figs{margin-top:var(--sys-space-l);display:grid;gap:calc(var(--sys-space-s) * .75);grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr))}
.pb-klar .kl-fig{${CARD};display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:var(--sys-space-xs);padding:${PAD};min-width:0;overflow-wrap:break-word}
.pb-klar .kl-fig dd{${step("figure")}}
.pb-klar .kl-fig dt{color:var(--sys-muted)}
.pb-klar .kl-points{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .625);grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))}
.pb-klar .kl-point{${CARD};display:grid;grid-template-columns:${TILE} minmax(0,1fr);gap:var(--sys-space-s);align-items:start;padding:${PAD};min-width:0;overflow-wrap:break-word}
.pb-klar .kl-point-ic{display:grid;place-items:center;width:${TILE};height:${TILE};border-radius:calc(var(--sys-space-s) * .625);background:var(--sys-field-1-bg);color:var(--sys-field-1-ink)}
.pb-klar .kl-point-title{${step("link")};padding-top:var(--sys-space-xs)}
.pb-klar .kl-point-text{margin-top:var(--sys-space-2xs);color:var(--sys-muted)}
.pb-klar .kl-motto{margin:0;max-width:calc(var(--sys-space-measure) * 1.4);padding:calc(${PAD} * 1.5);border-radius:${R_CARD};background:var(--sys-field-2-bg);color:var(--sys-field-2-ink)}
.pb-klar .kl-motto p{${step("h2")}}
.pb-klar .kl-motto-who{${step("small")};margin-top:var(--sys-space-s);color:var(--sys-field-2-muted)}
.pb-klar .kl-logos{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-s) var(--sys-space-l)}
.pb-klar .kl-logos a{display:inline-flex;align-items:center;min-height:${TAP};border-radius:${R_BTN}}
.pb-klar .kl-logos img{height:calc(var(--sys-space-l) * 1.2);width:auto;max-width:calc(var(--sys-space-2xl) * 1.8);object-fit:contain}

/* Vorschau-Platzhalter: gestrichelt, nur in der Vorschau */
.pb-klar .kl-slot-section{padding-top:var(--sys-space-section)}
.pb-klar .kl-slot{max-width:var(--sys-space-measure);border:2px dashed var(--sys-muted);border-radius:${R_CARD};padding:var(--sys-space-m);color:var(--sys-ink)}
.pb-klar .kl-sec .kl-slot{margin-top:var(--sys-space-l)}
.pb-klar .kl-slot-kicker{${step("kicker")};color:var(--sys-muted)}
.pb-klar .kl-slot-title{${step("h3")};margin-top:var(--sys-space-xs)}
.pb-klar .kl-slot-text{${step("small")};margin-top:var(--sys-space-xs);color:var(--sys-muted)}`;
