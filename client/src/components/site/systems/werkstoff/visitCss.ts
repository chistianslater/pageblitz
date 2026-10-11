import { GRID, RAISED, step } from "./step";

/**
 * Gut zu wissen, Besuch (Zeiten-Karte mit Heute), Kontakt-Insel, übrige
 * Abschnitte, Hinweis-Banner (Systemblatt 09, 11–13). Nur Tokens; Plus-
 * Kasten 30 px ≈ l − 2xs·2,5, Heute-Kante 4 px = 2xs. Hell bleiben: der
 * Aufruf ist kein dunkles Band.
 */
export const VISIT_CSS = `/* Gut zu wissen: Tinte-Linie oben, Fragen in Slab, eckiges Plus */
.pb-werkstoff .ws-faq-call{margin-top:var(--sys-space-s)}
.pb-werkstoff .ws-faq-list{margin-top:var(--sys-space-l);border-top:1px solid var(--sys-ink)}
.pb-werkstoff .ws-faq-item{border-bottom:1px solid var(--sys-rule)}
.pb-werkstoff .ws-faq-item summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-s);align-items:center;
  padding-block:var(--sys-space-m);min-height:var(--ws-tap)}
.pb-werkstoff .ws-faq-item summary::-webkit-details-marker{display:none}
.pb-werkstoff .ws-faq-item summary:focus-visible{outline-offset:calc(var(--ws-focus) * -1)}
.pb-werkstoff .ws-faq-q{${step("h3")};font-size:calc(var(--sys-h3-size) * .86);line-height:1.18}
.pb-werkstoff .ws-faq-sign{position:relative;width:calc(var(--sys-space-l) * .75);height:calc(var(--sys-space-l) * .75);border-radius:var(--ws-radius);
  box-shadow:inset 0 0 0 1px var(--sys-ink)}
.pb-werkstoff .ws-faq-sign::before,.pb-werkstoff .ws-faq-sign::after{content:"";position:absolute;left:50%;top:50%;width:calc(var(--sys-space-s) * .75);height:2px;
  background:currentColor;transform:translate(-50%,-50%);transition:transform 200ms}
.pb-werkstoff .ws-faq-sign::after{transform:translate(-50%,-50%) rotate(90deg)}
.pb-werkstoff .ws-faq-item[open] .ws-faq-sign{background:var(--sys-signal);color:var(--sys-on-signal);box-shadow:none}
.pb-werkstoff .ws-faq-item[open] .ws-faq-sign::after{transform:translate(-50%,-50%)}
.pb-werkstoff .ws-faq-a{color:var(--sys-muted);max-width:var(--sys-space-measure);padding-bottom:var(--sys-space-m);margin-top:calc(var(--sys-space-xs) * -1)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-faq>.ws-wrap{display:grid;grid-template-columns:5fr 7fr;column-gap:var(--sys-space-2xl);align-items:start}
  .pb-werkstoff .ws-faq .ws-title,.pb-werkstoff .ws-faq-call{grid-column:1}
  .pb-werkstoff .ws-faq-list{grid-column:2;grid-row:1/4;margin-top:0}
}

/* Besuch: Zeiten-Karte (hell, Tinte-Rahmen, Heute mit Oxid-Kante) + Wege */
.pb-werkstoff .ws-visit{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-werkstoff .ws-hours-card{background:${RAISED};border:1px solid var(--sys-ink);align-self:start;min-width:0}
.pb-werkstoff .ws-hours-status{display:flex;align-items:center;gap:var(--sys-space-xs);padding:calc(var(--sys-space-s) * .875) var(--sys-space-s);border-bottom:1px solid var(--sys-ink);font-weight:600}
.pb-werkstoff .ws-hours{margin:0;${step("data")};font-variant-numeric:tabular-nums}
.pb-werkstoff .ws-hours-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-s);padding:calc(var(--sys-space-xs) * 1.25) var(--sys-space-s);border-bottom:1px solid var(--sys-rule)}
.pb-werkstoff .ws-hours-row:last-child{border-bottom:0}
.pb-werkstoff .ws-hours-row dt,.pb-werkstoff .ws-hours-row dd{margin:0}
.pb-werkstoff .ws-hours-row dd{text-align:right}
.pb-werkstoff .ws-hours-row--today{box-shadow:inset var(--sys-space-2xs) 0 0 var(--sys-signal);background:color-mix(in srgb,var(--sys-signal) 7%,transparent)}
.pb-werkstoff .ws-today{color:var(--sys-accent);margin-left:var(--sys-space-xs)}
.pb-werkstoff .ws-visit-reach{display:grid;gap:var(--sys-space-s);align-content:start;min-width:0}
.pb-werkstoff .ws-visit-address{${step("h3")};overflow-wrap:break-word}
.pb-werkstoff .ws-visit-links{display:grid;justify-items:start;gap:var(--sys-space-xs);overflow-wrap:anywhere}
.pb-werkstoff .ws-visit-links .ws-link{min-height:var(--ws-tap);display:inline-flex;align-items:center}
.pb-werkstoff .ws-visit-area{${step("small")};color:var(--sys-muted)}
.pb-werkstoff .ws-visit-actions{display:flex;flex-wrap:wrap;gap:var(--sys-space-xs)}
.pb-werkstoff .ws-map{position:relative;display:block;aspect-ratio:16/9;max-width:var(--sys-space-measure);margin-top:var(--sys-space-xs);border:1px solid var(--sys-ink);color:var(--sys-ink);
  background-color:${RAISED};background-image:linear-gradient(var(--sys-rule) 1px,transparent 1px),linear-gradient(90deg,var(--sys-rule) 1px,transparent 1px);
  background-size:var(--sys-space-l) var(--sys-space-l);background-position:center}
.pb-werkstoff .ws-map:focus-visible{outline-color:var(--sys-ink)}
.pb-werkstoff .ws-map-dot{position:absolute;left:50%;top:50%;width:var(--sys-space-s);height:var(--sys-space-s);border-radius:50%;transform:translate(-50%,-50%);background:var(--sys-signal);
  box-shadow:0 0 0 var(--sys-space-xs) color-mix(in srgb,var(--sys-signal) 22%,transparent)}
.pb-werkstoff .ws-map-label{${step("link")};position:absolute;left:0;bottom:0;background:var(--sys-paper);padding:var(--sys-space-xs) var(--sys-space-s);
  border-top:1px solid var(--sys-ink);border-right:1px solid var(--sys-ink);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-werkstoff .ws-form-title{${step("h3")};margin-top:var(--sys-space-xl);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-ink)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-visit{grid-template-columns:5fr 7fr;gap:var(--sys-space-2xl)}
  .pb-werkstoff .ws-visit-reach:only-child{grid-column:1/-1;max-width:calc(var(--sys-space-measure) + var(--sys-space-xl))}
}

/* Kontakt-Insel (Formular) unter dem Besuch */
.pb-werkstoff .ws-contact>.pb-island{max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-werkstoff .ws-contact>.pb-island .pb-island-form{max-width:var(--sys-space-measure)}
.pb-werkstoff .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 2)}
.pb-werkstoff .pb-island-privacy a{color:var(--sys-ink)}
.pb-werkstoff .pb-island-status{${step("small")}}
/* Farbe hier nötig: islandsCss färbt Erfolg/Fehler fest und steht später im Dokument */
.pb-werkstoff .pb-island-status[data-state="success"],.pb-werkstoff .pb-island-status[data-state="error"]{color:var(--sys-ink);border-left:var(--ws-focus) solid var(--sys-signal);padding-left:var(--sys-space-s)}
.pb-werkstoff .pb-island-status[data-state="info"]{color:var(--sys-muted)}
.pb-werkstoff .pb-island-submit{min-height:var(--ws-tap);cursor:pointer}
.pb-werkstoff .pb-island-submit:focus-visible{outline:var(--ws-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}

/* Geschichte, Grundsätze, Zitat, Partner, Aufruf (hell) */
.pb-werkstoff .ws-prose{display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure);margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-list--plain li{grid-template-columns:minmax(0,1fr)}
.pb-werkstoff .ws-motto .ws-quote-text{margin-top:0}
.pb-werkstoff .ws-logos{list-style:none;margin:var(--sys-space-xl) 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--sys-rule);border:1px solid var(--sys-rule)}
.pb-werkstoff .ws-logos li{display:flex;align-items:center;justify-content:center;background:${RAISED};padding:var(--sys-space-m);min-height:calc(var(--sys-space-2xl) + var(--sys-space-l))}
.pb-werkstoff .ws-logos a{display:flex;align-items:center;justify-content:center;min-height:var(--ws-tap);min-width:var(--ws-tap)}
.pb-werkstoff .ws-logos img{height:var(--sys-space-l);width:auto;max-width:100%;object-fit:contain}
.pb-werkstoff .ws-cta>.ws-wrap{border-top:1px solid var(--sys-ink);padding-top:var(--sys-space-l)}
.pb-werkstoff .ws-cta-action{margin-top:var(--sys-space-l)}
@media (min-width:${GRID}){
  .pb-werkstoff .ws-logos{grid-template-columns:repeat(4,minmax(0,1fr))}
  .pb-werkstoff .ws-list--plain li{grid-template-columns:minmax(0,1fr)}
  .pb-werkstoff .ws-list--plain .ws-list-text{grid-column:1;grid-row:auto}
}

/* Hinweis-Banner über dem Kopf: hell genug, Signal-Fläche, onSignal */
.pb-werkstoff .pb-notice{background:var(--sys-signal);color:var(--sys-on-signal);padding:var(--sys-space-xs) var(--sys-space-gutter);text-align:left}
.pb-werkstoff .pb-notice p{${step("small")};font-weight:500;max-width:var(--sys-space-max);margin-inline:auto}
.pb-werkstoff .pb-notice a{color:inherit}
.pb-werkstoff .pb-notice :focus-visible{outline-color:var(--sys-on-signal)}

/* Rechtstexte: Links in Tinte, Zurück-Link des Generators aus */
.pb-werkstoff .ws-legal{color:var(--sys-ink);padding-bottom:var(--sys-space-l)}
.pb-werkstoff .ws-legal a{color:var(--sys-ink);text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-werkstoff .ws-legal .back-link{display:none}
/* Generator-Fußzeile färbt inline hellgrau (unter AA): gedämpft in Tokens */
.pb-werkstoff .ws-legal [style*="color"]{color:var(--sys-muted)!important}
.pb-werkstoff .ws-legal hr{border:0!important;border-top:1px solid var(--sys-rule)!important}
`;
