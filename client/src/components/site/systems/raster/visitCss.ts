import { GRID, step } from "./step";

/**
 * Gut zu wissen, Zeiten + Kontakt, Kontakt-Insel, übrige Abschnitte,
 * Hinweis-Banner (Systemblatt 7–9). Nur `--sys-*`; feste Werte nur
 * Haarlinien. Signal nur für Status (Quadrate) und Hauptaktionen.
 */
const ON_DEEP_DIM = "color-mix(in srgb,var(--sys-on-deep) 62%,var(--sys-deep))";

export const VISIT_CSS = `/* Gut zu wissen: Haarlinien-Zeilen, Frage h3, „+" rechts, Antwort gedämpft */
.pb-raster .rs-faq{border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-faq-item{border-top:1px solid var(--sys-rule)}
.pb-raster .rs-faq-item summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:var(--sys-space-m);
  padding-block:var(--sys-space-s);min-height:var(--rs-tap)}
.pb-raster .rs-faq-item summary::-webkit-details-marker{display:none}
.pb-raster .rs-faq-item summary:focus-visible{outline-offset:calc(var(--rs-focus) * -1)}
.pb-raster .rs-faq-q{${step("h3")};color:var(--sys-ink)}
.pb-raster .rs-faq-item:not([open]) .rs-faq-q{color:color-mix(in srgb,var(--sys-ink) 82%,var(--sys-paper))}
.pb-raster .rs-faq-item summary:hover .rs-faq-q{color:var(--sys-ink)}
.pb-raster .rs-faq-sign{${step("h3")};font-variant-numeric:tabular-nums;min-width:1ch;text-align:center}
.pb-raster .rs-faq-sign::before{content:"+"}
.pb-raster .rs-faq-item[open] .rs-faq-sign::before{content:"–"}
.pb-raster .rs-faq-a{color:var(--sys-muted);max-width:var(--sys-space-measure);padding-bottom:var(--sys-space-m);margin-top:calc(var(--sys-space-xs) * -1)}

/* Zeiten + Kontakt */
.pb-raster .rs-visit{display:grid;gap:var(--sys-space-xl)}
.pb-raster .rs-visit-times,.pb-raster .rs-visit-reach{display:grid;gap:var(--sys-space-m);align-content:start;min-width:0}
.pb-raster .rs-status{${step("h3")};color:var(--sys-ink)}
.pb-raster .rs-status .rs-live::before{width:.55em;height:.55em}
.pb-raster .rs-hours-title{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-xs)}
.pb-raster .rs-hours{margin:0;font-variant-numeric:tabular-nums;border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-hours-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-m);border-top:1px solid var(--sys-rule);padding-block:calc(var(--sys-space-s) * .75)}
.pb-raster .rs-hours-row dt,.pb-raster .rs-hours-row dd{margin:0}
.pb-raster .rs-hours-row dd{text-align:right}
.pb-raster .rs-hours-row--today{font-weight:500}
.pb-raster .rs-hours-row--today dt::before{content:"";display:inline-block;width:.55em;height:.55em;margin-right:.6em;vertical-align:.08em;background:var(--sys-signal)}
.pb-raster .rs-today{white-space:nowrap}
.pb-raster .rs-phone{${step("h2")};font-variant-numeric:tabular-nums;justify-self:start;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.14em;
  overflow-wrap:anywhere;min-height:var(--rs-tap);display:inline-flex;align-items:center}
.pb-raster .rs-phone:hover{text-decoration-color:transparent}
.pb-raster .rs-address{display:grid;overflow-wrap:anywhere}
.pb-raster .rs-area{${step("small")};color:var(--sys-muted)}
.pb-raster .rs-links{display:flex;flex-wrap:wrap;gap:var(--sys-space-s) var(--sys-space-m)}
.pb-raster .rs-links .rs-link{min-height:var(--rs-tap);display:inline-flex;align-items:center}
.pb-raster .rs-map{position:relative;display:block;aspect-ratio:16/9;margin-top:var(--sys-space-xs);border:1px solid var(--sys-rule);color:var(--sys-ink);
  background-color:var(--sys-paper);background-image:linear-gradient(var(--sys-rule) 1px,transparent 1px),linear-gradient(90deg,var(--sys-rule) 1px,transparent 1px);
  background-size:var(--sys-space-l) var(--sys-space-l);background-position:center}
.pb-raster .rs-map-dot{position:absolute;left:50%;top:50%;width:var(--sys-space-s);height:var(--sys-space-s);transform:translate(-50%,-50%);background:var(--sys-signal);
  box-shadow:0 0 0 var(--sys-space-xs) color-mix(in srgb,var(--sys-signal) 22%,transparent)}
.pb-raster .rs-map-label{${step("link")};position:absolute;left:0;bottom:0;background:var(--sys-paper);padding:var(--sys-space-xs) var(--sys-space-s);
  border-top:1px solid var(--sys-rule);border-right:1px solid var(--sys-rule);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-map:hover .rs-map-label{text-decoration-color:transparent}
.pb-raster .rs-form-title{${step("h3")};margin-top:var(--sys-space-xl);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule)}
@media (min-width:${GRID}){
  .pb-raster .rs-visit{grid-template-columns:repeat(9,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-raster .rs-visit-times{grid-column:1/5}
  .pb-raster .rs-visit-reach{grid-column:6/10}
  .pb-raster .rs-visit-reach:only-child{grid-column:1/6}
}

/* Kontakt-Insel (Formular) unter dem Kontakt-Kapitel, im Raster ausgerichtet */
.pb-raster .rs-contact>.pb-island{max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-raster .rs-contact>.pb-island .pb-island-form{max-width:var(--sys-space-measure)}
.pb-raster .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 2)}
.pb-raster .pb-island-privacy a{color:var(--sys-ink)}
.pb-raster .pb-island-status{${step("small")}}
/* Farbe hier nötig: islandsCss färbt Erfolg/Fehler (u. a. #b3261e, auf Kohle unlesbar) und steht später im Dokument */
.pb-raster .pb-island-status[data-state="success"],.pb-raster .pb-island-status[data-state="error"]{color:var(--sys-ink);border-left:var(--rs-focus) solid var(--sys-signal);padding-left:var(--sys-space-s)}
.pb-raster .pb-island-status[data-state="info"]{color:var(--sys-muted)}
.pb-raster .pb-island-submit{min-height:var(--rs-tap);cursor:pointer}
.pb-raster .pb-island-submit:focus-visible{outline:var(--rs-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
@media (min-width:${GRID}){
  .pb-raster .rs-contact>.pb-island{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-raster .rs-contact>.pb-island>*{grid-column:4/11}
}

/* Geschichte, Grundsätze */
.pb-raster .rs-prose{display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure)}
.pb-raster .rs-usps{list-style:none;margin:0;padding:0;border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-usp{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 var(--sys-space-m);border-top:1px solid var(--sys-rule);padding:var(--sys-space-s) 0 var(--sys-space-m)}
.pb-raster .rs-usp-no{${step("h3")};font-variant-numeric:tabular-nums;color:var(--sys-muted);min-width:1.4em}
.pb-raster .rs-usp h3{${step("h3")}}
.pb-raster .rs-usp p{margin-top:var(--sys-space-xs);color:var(--sys-muted);max-width:var(--sys-space-measure)}
@media (min-width:${GRID}){.pb-raster .rs-usp{grid-template-columns:3fr 6fr}}

/* Zitat (Zwischenton) und Partner */
.pb-raster .rs-motto .rs-lab{margin-bottom:var(--sys-space-l)}
.pb-raster .rs-logos{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--sys-rule);border:1px solid var(--sys-rule)}
.pb-raster .rs-logos li{display:flex;align-items:center;justify-content:center;background:var(--sys-on-deep);padding:var(--sys-space-m);min-height:calc(var(--sys-space-2xl) + var(--sys-space-l))}
.pb-raster .rs-logos a{display:flex;align-items:center;justify-content:center;min-height:var(--rs-tap);min-width:var(--rs-tap)}
.pb-raster .rs-logos a:focus-visible{outline-color:var(--sys-deep)}
.pb-raster .rs-logos img{height:var(--sys-space-l);width:auto;max-width:100%;object-fit:contain;filter:grayscale(1);opacity:.9}
@media (min-width:${GRID}){.pb-raster .rs-logos{grid-template-columns:repeat(4,minmax(0,1fr))}}

/* Aufruf: dunkles Band, Signal-Knopf */
.pb-raster .rs-cta{background:var(--sys-deep);color:var(--sys-on-deep);padding-block:var(--sys-space-section)}
.pb-raster .rs-cta>.rs-wrap{border-top:0;padding-top:0}
.pb-raster .rs-cta .rs-lab-text{color:${ON_DEEP_DIM}}
.pb-raster .rs-cta-title{${step("h2")};max-width:16em}
.pb-raster .rs-cta .rs-btn:focus-visible{outline-color:var(--sys-on-deep)}
.pb-raster .rs-cta+.rs-sec>.rs-wrap{border-top:0}
.pb-raster .rs-cta+.rs-sec{padding-top:var(--sys-space-m)}

/* Hinweis-Banner über dem Kopf: Status in Signal */
.pb-raster .pb-notice{background:var(--sys-signal);color:var(--sys-on-signal);padding:var(--sys-space-xs) var(--sys-space-gutter);text-align:left}
.pb-raster .pb-notice p{${step("small")};font-weight:500;max-width:var(--sys-space-max);margin-inline:auto}
.pb-raster .pb-notice a{color:inherit}

/* Rechtstexte: Links in ink, auch auf dunklem Papier */
.pb-raster .rs-legal a{color:var(--sys-ink);text-decoration-thickness:1px;text-underline-offset:.2em}
.pb-raster .rs-legal{color:var(--sys-ink)}
.pb-raster .rs-legal .back-link{display:none}
`;
