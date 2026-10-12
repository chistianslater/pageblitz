import { GRID, PILL, step } from "./step";

/**
 * Inhaltsabschnitte (P4–P6) nach Systemblatt Bausteine 10 und Seiten
 * 12–16. Nur Tokens (oder Vielfache), Linien 1px/2px. Flächen setzen
 * `--pk-bg/ink/muted` (css.ts); Formen und Monogramme nehmen dazu die
 * Töne `--pk-tone-a/b/c`, die je Fläche eine andere Farbe als den Grund
 * wählen (Duoton bleibt auf jedem Feld sichtbar).
 */

const SHARED = `/* Töne je Fläche (Formen, Monogramme, Farbpunkte) */
.pb-plakat .pk-ground{--pk-tone-a:var(--sys-field-1-bg);--pk-tone-b:var(--sys-field-2-bg);--pk-tone-c:var(--sys-rule)}
.pb-plakat .pk-f1{--pk-tone-a:var(--sys-field-2-bg);--pk-tone-b:var(--sys-paper);--pk-tone-c:var(--sys-paper)}
.pb-plakat .pk-f2{--pk-tone-a:var(--sys-field-1-bg);--pk-tone-b:var(--sys-paper);--pk-tone-c:var(--sys-paper)}
.pb-plakat .pk-deep{--pk-tone-a:var(--sys-field-1-bg);--pk-tone-b:var(--sys-field-2-bg);--pk-tone-c:var(--sys-paper)}
.pb-plakat .pk-shape--pill{border-radius:${PILL}}
.pb-plakat .pk-shape--pill-wide{border-radius:${PILL};aspect-ratio:2.4/1}
.pb-plakat .pk-more{margin-top:var(--sys-space-l)}
.pb-plakat .pk-prose{display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure);margin-top:var(--sys-space-m)}
.pb-plakat .pk-ul{${step("link")};text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.25em}
.pb-plakat .pk-today{display:inline-block;vertical-align:middle;margin-left:calc(var(--sys-space-xs) * 1.25);padding:calc(var(--sys-space-2xs) * 1.25) calc(var(--sys-space-xs) * 1.125);
  border-radius:${PILL};background:var(--sys-signal);color:var(--sys-on-signal);font-family:var(--sys-font-text);font-style:normal;font-weight:700;
  font-size:calc(var(--sys-small-size) * .8);line-height:1;letter-spacing:0;text-transform:none;font-stretch:normal}
/* Kapitel mit Form daneben: Handy Form nach dem Inhalt, Desktop links (Ablauf) bzw. rechts (Über uns) */
.pb-plakat .pk-split{display:grid;grid-template-columns:minmax(0,1fr)}
.pb-plakat .pk-split>:first-child{order:1;margin-top:var(--sys-space-xl)}
.pb-plakat .pk-split-body{min-width:0}
@media (min-width:${GRID}){
  .pb-plakat .pk-split{grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m);align-items:start}
  .pb-plakat .pk-split>:first-child{order:0;margin-top:0;grid-column:1/6;grid-row:1;position:sticky;top:var(--sys-space-l)}
  .pb-plakat .pk-split-body{grid-column:7/13;grid-row:1}
  .pb-plakat .pk-about .pk-split>:first-child{grid-column:8/13}
  .pb-plakat .pk-about .pk-split-body{grid-column:1/7}
}`;

/** Leistungen, Preise, Karte, Ablauf, Zahlen, Vorschau-Platzhalter. */
const OFFER = `/* Riesenliste: Name in League Gothic, Preis rechts (nur aus Daten) */
.pb-plakat .pk-rows{list-style:none;margin:var(--sys-space-l) 0 0;padding:0}
.pb-plakat .pk-row{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:var(--sys-space-s);align-items:end;
  padding-block:calc(var(--sys-space-s) * .875);border-bottom:2px solid currentColor}
.pb-plakat .pk-row:first-child{border-top:2px solid currentColor}
.pb-plakat .pk-row-name{${step("h2")};overflow-wrap:anywhere;hyphens:manual}
.pb-plakat .pk-row-price{${step("h2")};font-size:calc(var(--sys-h2-size) * .78);white-space:nowrap}
.pb-plakat .pk-row-note{${step("small")};color:var(--pk-muted);text-align:right;max-width:calc(var(--sys-space-2xl) * 1.2)}
.pb-plakat .pk-row-text{${step("small")};grid-column:1/-1;margin-top:calc(var(--sys-space-2xs) * 1.5);color:var(--pk-muted);max-width:var(--sys-space-measure)}
.pb-plakat .pk-cat+.pk-cat{margin-top:var(--sys-space-xl)}
.pb-plakat .pk-cat-name{${step("h2")};font-size:calc(var(--sys-h2-size) * .62);display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75);margin-top:var(--sys-space-l)}
.pb-plakat .pk-cat-name i{flex:none;width:calc(var(--sys-space-l) * .75);height:calc(var(--sys-space-l) * .75);border-radius:50%;background:var(--pk-tone-a)}
.pb-plakat .pk-cat:nth-of-type(4n+2) .pk-cat-name i{background:var(--pk-tone-b)}
.pb-plakat .pk-cat:nth-of-type(4n+3) .pk-cat-name i{background:var(--sys-signal)}
.pb-plakat .pk-cat:nth-of-type(4n+4) .pk-cat-name i{background:var(--sys-deep)}
.pb-plakat .pk-cat-name+.pk-rows{margin-top:var(--sys-space-s)}
/* Karte: Gericht in h3-Stufe, Preis in mark, feine Linie */
.pb-plakat .pk-mrows{list-style:none;margin:var(--sys-space-xs) 0 0;padding:0}
.pb-plakat .pk-mrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-s);padding-block:calc(var(--sys-space-s) * .875);
  border-top:1px solid color-mix(in srgb,currentColor 28%,transparent)}
.pb-plakat .pk-mrow-name{${step("h3")};font-size:calc(var(--sys-h3-size) * .9);overflow-wrap:anywhere}
.pb-plakat .pk-mrow-price{${step("mark")};white-space:nowrap;align-self:start}
.pb-plakat .pk-mrow-text{${step("small")};color:var(--pk-muted);grid-column:1}
@media (min-width:${GRID}){
  .pb-plakat .pk-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-xl)}
  .pb-plakat .pk-row:nth-child(2){border-top:2px solid currentColor}
  .pb-plakat .pk-karte .pk-wrap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-2xl);align-items:start}
  .pb-plakat .pk-karte .pk-title,.pb-plakat .pk-karte .pk-intro,.pb-plakat .pk-karte .pk-more{grid-column:1/-1}
  .pb-plakat .pk-karte .pk-cat+.pk-cat{margin-top:0}
}

/* Ablauf: riesige 01·02·03 in Signal (auf Feldern in Feld-Tinte) */
.pb-plakat .pk-steps{list-style:none;margin:0;padding:0}
.pb-plakat .pk-step{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:var(--sys-space-m);align-items:end;padding-top:var(--sys-space-l)}
.pb-plakat .pk-step-no{${step("figure")};color:var(--sys-signal)}
.pb-plakat .pk-f1 .pk-step-no,.pb-plakat .pk-f2 .pk-step-no,.pb-plakat .pk-deep .pk-step-no{color:inherit}
.pb-plakat .pk-step-title{${step("h3")};padding-bottom:.35em;overflow-wrap:anywhere}
.pb-plakat .pk-step-text{grid-column:1/-1;margin-top:var(--sys-space-xs);color:var(--pk-muted);max-width:calc(var(--sys-space-measure) * .8)}
.pb-plakat .pk-process-media{width:72%;margin-left:auto}
.pb-plakat .pk-process-media .pk-shape{--pk-shape-bg:var(--pk-tone-b)}
@media (min-width:${GRID}){.pb-plakat .pk-process-media{width:auto;margin:0}}

/* Zahlen */
.pb-plakat .pk-figs{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}
.pb-plakat .pk-figs li{min-width:0;border-top:2px solid currentColor;padding-top:var(--sys-space-s)}
.pb-plakat .pk-fig-value{${step("h2")};font-size:calc(var(--sys-h2-size) * 1.2);display:block;overflow-wrap:anywhere}
.pb-plakat .pk-fig-label{${step("small")};display:block;margin-top:var(--sys-space-xs);color:var(--pk-muted)}
@media (min-width:${GRID}){.pb-plakat .pk-figs{grid-template-columns:repeat(4,minmax(0,1fr))}}

/* Vorschau-Platzhalter: setzt die Fläche davor fort */
.pb-plakat .pk-slot-section{padding-bottom:var(--sys-space-section)}
.pb-plakat .pk-slot{max-width:var(--sys-space-measure);border:2px dashed currentColor;border-radius:calc(var(--sys-space-s) * 1.25);padding:var(--sys-space-m)}
.pb-plakat .pk-sec .pk-slot{margin-top:var(--sys-space-l)}
.pb-plakat .pk-slot-kicker{${step("kicker")};color:var(--pk-muted)}
.pb-plakat .pk-slot-title{${step("h3")};margin-top:var(--sys-space-xs)}
.pb-plakat .pk-slot-text{${step("small")};margin-top:var(--sys-space-xs);color:var(--pk-muted)}`;

/** Über uns, Team, Galerie, Stimme, Partner. */
const STORY = `/* Über uns: Pille daneben */
.pb-plakat .pk-about-media{width:64%;margin-left:auto}
.pb-plakat .pk-about-media .pk-shape{aspect-ratio:3/4;--pk-shape-bg:var(--pk-tone-a)}
@media (min-width:${GRID}){.pb-plakat .pk-about-media{width:auto;margin:0}}

/* Team im Kreis; ohne Foto Monogramm (Grund, Feld, Signal) */
.pb-plakat .pk-crew{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--sys-space-m) var(--sys-space-s);align-items:start}
.pb-plakat .pk-crew li{min-width:0}
.pb-plakat .pk-crew figure{display:grid;gap:calc(var(--sys-space-xs) * 1.25)}
.pb-plakat .pk-crew .pk-shape{--pk-shape-bg:var(--pk-tone-a)}
.pb-plakat .pk-mono{display:grid;place-items:center;aspect-ratio:1;border-radius:50%;background:var(--pk-tone-b);color:var(--sys-ink);
  font-family:var(--sys-font-display);font-size:calc(var(--sys-h2-size) * 1.1);line-height:1;font-stretch:var(--sys-h2-stretch)}
.pb-plakat .pk-crew li:nth-child(3n+2) .pk-mono{background:var(--pk-tone-a)}
.pb-plakat .pk-crew li:nth-child(3n) .pk-mono{background:var(--sys-signal);color:var(--sys-on-signal)}
.pb-plakat .pk-team-name{${step("mark")};font-size:calc(var(--sys-mark-size) * .9);display:block;overflow-wrap:anywhere}
.pb-plakat .pk-team-role{${step("small")};display:block;color:var(--pk-muted);overflow-wrap:anywhere}
@media (min-width:${GRID}){.pb-plakat .pk-crew{grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}}

/* Galerie: stehende Pille, Bogen, liegende Pille */
.pb-plakat .pk-gal{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:var(--sys-space-s);align-items:end}
.pb-plakat .pk-gal+.pk-gal{margin-top:var(--sys-space-xl)}
.pb-plakat .pk-gal li{min-width:0}
.pb-plakat .pk-gal-pill .pk-shape{aspect-ratio:1/1.9;--pk-shape-bg:var(--pk-tone-a)}
.pb-plakat .pk-gal-arch .pk-shape{--pk-shape-bg:var(--pk-tone-b)}
.pb-plakat .pk-gal-pill-wide{grid-column:1/-1}
.pb-plakat .pk-gal-pill-wide .pk-shape{--pk-shape-bg:var(--pk-tone-c)}
.pb-plakat .pk-gal-cap{${step("small")};margin-top:var(--sys-space-xs);color:var(--pk-muted);overflow-wrap:anywhere}
@media (min-width:${GRID}){
  .pb-plakat .pk-gal{grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-plakat .pk-gal-pill{grid-column:span 3}
  .pb-plakat .pk-gal-arch{grid-column:span 4}
  .pb-plakat .pk-gal-pill-wide{grid-column:span 5}
  .pb-plakat .pk-gal[data-n="1"] .pk-gal-pill-wide{grid-column:1/9}
}

/* Stimme und Motto: ein großer Satz, Kicker, Urheber */
.pb-plakat .pk-voice-kicker{${step("kicker")};color:var(--pk-muted);display:flex;flex-wrap:wrap;align-items:center;gap:var(--sys-space-xs) var(--sys-space-s)}
.pb-plakat .pk-stars{color:var(--sys-signal);letter-spacing:.12em}
.pb-plakat .pk-voice-text{margin:var(--sys-space-m) 0 0}
.pb-plakat .pk-voice-text p{${step("h2")};overflow-wrap:anywhere;hyphens:manual;max-width:18em}
.pb-plakat .pk-voice-text--long p{font-size:calc(var(--sys-h2-size) * .66)}
.pb-plakat .pk-voice-who{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-2xs)}
.pb-plakat .pk-voice-name{${step("small")};font-weight:650}
.pb-plakat .pk-voice-src{${step("small")};color:var(--pk-muted)}

/* Partner: ruhige Logo-Reihe auf Papier */
.pb-plakat .pk-logos{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-s)}
.pb-plakat .pk-logos li{display:flex;align-items:center;justify-content:center;min-height:calc(var(--sys-space-2xl) * .9);padding:var(--sys-space-m);
  border-radius:${PILL};background:var(--sys-paper);box-shadow:inset 0 0 0 2px var(--pk-ink)}
.pb-plakat .pk-logos a{display:flex;align-items:center;justify-content:center;min-height:var(--pk-tap);min-width:var(--pk-tap)}
.pb-plakat .pk-logos img{height:var(--sys-space-l);width:auto;max-width:100%;object-fit:contain}
@media (min-width:${GRID}){.pb-plakat .pk-logos{grid-template-columns:repeat(4,minmax(0,1fr))}}`;

/** Fragen, Zeiten mit „Heute", Kartenfläche, Kontakt-Insel, Hinweis-Banner. */
const VISIT = `/* Fragen: Plus im Kreis, offen invertiert */
.pb-plakat .pk-faqs{margin-top:var(--sys-space-l);max-width:calc(var(--sys-space-measure) * 1.5)}
.pb-plakat .pk-faq-item{border-top:2px solid currentColor}
.pb-plakat .pk-faq-item:last-child{border-bottom:2px solid currentColor}
.pb-plakat .pk-faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:var(--sys-space-s);
  min-height:var(--pk-tap);padding-block:var(--sys-space-s)}
.pb-plakat .pk-faq-item summary::-webkit-details-marker{display:none}
.pb-plakat .pk-faq-q{${step("h3")};font-size:calc(var(--sys-h3-size) * .9)}
.pb-plakat .pk-faq-sign{position:relative;flex:none;width:calc(var(--sys-space-l) * .85);height:calc(var(--sys-space-l) * .85);border-radius:50%;box-shadow:inset 0 0 0 2px currentColor}
.pb-plakat .pk-faq-sign::before,.pb-plakat .pk-faq-sign::after{content:"";position:absolute;left:50%;top:50%;width:calc(var(--sys-space-s) * .75);height:2px;
  background:currentColor;transform:translate(-50%,-50%);transition:transform 200ms}
.pb-plakat .pk-faq-sign::after{transform:translate(-50%,-50%) rotate(90deg)}
.pb-plakat .pk-faq-item[open] .pk-faq-sign{background:var(--pk-ink);box-shadow:none}
.pb-plakat .pk-faq-item[open] .pk-faq-sign::before,.pb-plakat .pk-faq-item[open] .pk-faq-sign::after{background:var(--pk-bg)}
.pb-plakat .pk-faq-item[open] .pk-faq-sign::after{transform:translate(-50%,-50%)}
.pb-plakat .pk-faq-a{color:var(--pk-muted);max-width:var(--sys-space-measure);padding-bottom:var(--sys-space-s)}
.pb-plakat .pk-faq-call{margin-top:var(--sys-space-m);color:var(--pk-muted)}
.pb-plakat .pk-faq-call a{color:var(--pk-ink)}

/* Vorbeikommen: Zeiten als Pillen, heute Tinte mit Signal-Etikett */
.pb-plakat .pk-visit{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sys-space-xl);margin-top:var(--sys-space-m)}
.pb-plakat .pk-late{${step("figure")}}
.pb-plakat .pk-hours{list-style:none;margin:var(--sys-space-m) 0 0;padding:0;max-width:calc(var(--sys-space-measure) * .9)}
.pb-plakat .pk-hours-row{display:flex;justify-content:space-between;align-items:center;gap:var(--sys-space-s);padding:calc(var(--sys-space-s) * .6875) var(--sys-space-s);
  border-radius:${PILL};font-weight:600;line-height:1.2}
.pb-plakat .pk-hours-row--today{background:var(--sys-ink);color:var(--sys-paper)}
.pb-plakat .pk-hours-day,.pb-plakat .pk-hours-time{min-width:0;overflow-wrap:anywhere}
.pb-plakat .pk-hours-time{text-align:right}
.pb-plakat .pk-visit-reach{display:grid;gap:calc(var(--sys-space-xs) * .75);align-content:start;min-width:0}
.pb-plakat .pk-visit-address{${step("h3")};overflow-wrap:anywhere}
.pb-plakat .pk-visit-tel,.pb-plakat .pk-visit-mail{display:inline-flex;align-items:center;min-height:var(--pk-tap);overflow-wrap:anywhere}
.pb-plakat .pk-visit-mail{${step("small")};color:var(--pk-muted);text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-plakat .pk-visit-area{${step("small")};color:var(--pk-muted)}
.pb-plakat .pk-visit-actions{display:flex;flex-wrap:wrap;gap:calc(var(--sys-space-xs) * 1.25);margin-top:var(--sys-space-s)}
/* Kartenfläche ohne Einbettung: liegende Pille, Punkt, Route (ein Tab-Halt) */
.pb-plakat .pk-map{position:relative;display:grid;place-items:center;align-content:center;gap:var(--sys-space-xs);aspect-ratio:2.4/1;margin-top:var(--sys-space-m);
  max-width:calc(var(--sys-space-measure) * .9);border-radius:${PILL};text-decoration:none;color:var(--sys-ink);background-color:var(--pk-tone-a);
  background-image:linear-gradient(28deg,transparent 46%,color-mix(in srgb,var(--sys-paper) 70%,transparent) 46% 50%,transparent 50%),
    linear-gradient(-62deg,transparent 58%,color-mix(in srgb,var(--sys-paper) 55%,transparent) 58% 61%,transparent 61%)}
.pb-plakat .pk-map-dot{width:var(--sys-space-s);height:var(--sys-space-s);border-radius:50%;background:var(--sys-signal);
  box-shadow:0 0 0 calc(var(--sys-space-2xs) * 1.5) color-mix(in srgb,var(--sys-signal) 30%,transparent)}
.pb-plakat .pk-map-label{${step("link")};font-size:var(--sys-small-size);background:var(--sys-paper);color:var(--sys-ink);border-radius:${PILL};padding:var(--sys-space-2xs) var(--sys-space-s)}
@media (hover:hover){.pb-plakat .pk-map:hover .pk-map-label{text-decoration:underline;text-underline-offset:.2em}}
.pb-plakat .pk-form-title{${step("h3")};margin-top:var(--sys-space-xl);padding-top:var(--sys-space-s);border-top:2px solid currentColor}
@media (min-width:${GRID}){
  .pb-plakat .pk-visit{grid-template-columns:5fr 6fr;gap:var(--sys-space-2xl)}
  .pb-plakat .pk-visit--solo{grid-template-columns:minmax(0,1fr)}
}

/* Kontakt-Insel (Formular) in Plakat-Tokens, auf jeder Fläche lesbar */
.pb-plakat .pk-contact>.pb-island{max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-plakat .pk-contact>.pb-island .pb-island-form{max-width:var(--sys-space-measure)}
.pb-plakat .pb-island-form{gap:var(--sys-space-m)}
.pb-plakat .pb-island-form label{${step("kicker")};color:var(--pk-ink);gap:var(--sys-space-xs)}
.pb-plakat .pb-island-form input,.pb-plakat .pb-island-form textarea{${step("body")};border:2px solid var(--sys-ink);border-radius:calc(var(--sys-space-s) * .75);
  background:var(--sys-paper);color:var(--sys-ink);padding:var(--sys-space-xs) var(--sys-space-s)}
.pb-plakat .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 2)}
.pb-plakat .pb-island-form input:focus-visible,.pb-plakat .pb-island-form textarea:focus-visible{outline:var(--pk-focus) solid var(--pk-ink);outline-offset:var(--sys-space-2xs)}
.pb-plakat .pb-island-submit{${step("link")};min-height:var(--pk-tap);cursor:pointer;background:var(--sys-ink);color:var(--sys-paper);border:0;border-radius:${PILL};padding:var(--sys-space-s) var(--sys-space-m)}
.pb-plakat .pb-island-submit:focus-visible{outline:var(--pk-focus) solid var(--pk-ink);outline-offset:var(--sys-space-2xs)}
.pb-plakat .pb-island-privacy{${step("small")};color:var(--pk-muted)}
.pb-plakat .pb-island-privacy a{color:var(--pk-ink)}
.pb-plakat .pb-island-status{${step("small")}}
/* Farbe hier nötig: islandsCss färbt Erfolg/Fehler fest und steht später im Dokument */
.pb-plakat .pb-island-status[data-state="success"],.pb-plakat .pb-island-status[data-state="error"]{color:var(--pk-ink);border-left:2px solid currentColor;padding-left:var(--sys-space-s)}
.pb-plakat .pb-island-status[data-state="info"]{color:var(--pk-muted)}

/* Hinweis-Banner über dem Kopf: Signal-Fläche, onSignal */
.pb-plakat .pb-notice{background:var(--sys-signal);color:var(--sys-on-signal);padding:var(--sys-space-xs) var(--sys-space-gutter);text-align:left}
.pb-plakat .pb-notice p{${step("small")};font-weight:600;max-width:var(--sys-space-max);margin-inline:auto}
.pb-plakat .pb-notice a{color:inherit}
.pb-plakat .pb-notice :focus-visible{outline-color:var(--sys-on-signal)}`;

export const CONTENT_CSS = [SHARED, OFFER, STORY, VISIT].join("\n\n");
