import { DEEP_RULE, GRID, step } from "./step";

/**
 * Leistungs-Bänder, Zahlenzeile, Ablauf, Preistabellen und Vorschau-
 * Platzhalter (Systemblatt 7/8/11). Nur `--sys-*`; feste Werte laut
 * Endwerte Punkt 5: Bänder 85svh Handy / 100svh ab 900 px, Banderklärung
 * onDeep 72 %, Bildfilter Blatt 07.
 */

/** Bandfoto laut Systemblatt 07: „dunkel genug für weiße Versalien". */
export const BAND_FILTER = { contrast: 1.2, brightness: 0.55 } as const;
/**
 * Abdunkelung der Fotobänder (Anteil `deep`), geprüft am schlimmsten Fall
 * (weiße Fotostelle, offer.test): `base` über die ganze Fläche (Nummer,
 * Preis ≥ 4,5:1), `local` zusätzlich hinter Name und Erklärung.
 */
export const BAND_SCRIM = { base: 0.35, local: 0.45 } as const;
/** Banderklärung: onDeep 72 % über der Bandfläche (Systemblatt). */
export const BAND_DESC_ALPHA = 0.72;
/** Wechselfläche ohne Foto: `deep` mit 6 % onDeep — kaum sichtbar, trennt. */
export const BAND_ALT = 0.06;

const pct = (n: number) => `${Math.round(n * 100)}%`;
const deepAt = (n: number) =>
  `color-mix(in srgb,var(--sys-deep) ${pct(n)},transparent)`;
const BAND_SCRIM_BG = [
  // Systemblatt-Verlauf (oben leicht, unten 72 %) — zählt in der Prüfung nicht
  `linear-gradient(180deg,${deepAt(0.25)} 0%,transparent 30%,${deepAt(0.2)} 55%,${deepAt(0.72)} 100%)`,
  `linear-gradient(${deepAt(BAND_SCRIM.base)},${deepAt(BAND_SCRIM.base)})`,
].join(",");
const LOCAL_SCRIM = `linear-gradient(180deg,transparent 0,${deepAt(BAND_SCRIM.local)} var(--sys-space-m),${deepAt(BAND_SCRIM.local)} calc(100% - var(--sys-space-m)),transparent 100%)`;

export const OFFER_CSS = `/* Leistungen als Bänder (sticky, ohne JS) */
.pb-raster .rs-sec--bands{padding-bottom:0}
.pb-raster .rs-sec--bands>.rs-wrap{padding-bottom:var(--sys-space-m)}
.pb-raster .rs-sec--bands-end+.rs-sec>.rs-wrap{border-top:0}
.pb-raster .rs-bands{list-style:none;margin:0;padding:0}
.pb-raster .rs-band{position:sticky;top:0;min-height:85vh;min-height:85svh;display:flex;flex-direction:column;overflow:hidden;
  --band-bg:var(--sys-deep);background:var(--band-bg);color:var(--sys-on-deep)}
.pb-raster .rs-bands--one>.rs-band{position:relative}
.pb-raster .rs-band+.rs-band{border-top:1px solid ${DEEP_RULE}}
.pb-raster .rs-band--alt{--band-bg:color-mix(in srgb,var(--sys-on-deep) ${pct(BAND_ALT)},var(--sys-deep))}
.pb-raster .rs-band-img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;object-position:50% 40%;
  filter:grayscale(1) contrast(${BAND_FILTER.contrast}) brightness(${BAND_FILTER.brightness})}
.pb-raster .rs-band-scrim{position:absolute;inset:0;background:${BAND_SCRIM_BG}}
.pb-raster .rs-band-in{position:relative;display:flex;flex-direction:column;flex:1 0 auto;width:100%;
  padding-top:var(--sys-space-m);padding-bottom:calc(var(--rs-dock,0rem) + var(--sys-space-l))}
.pb-raster .rs-band-top{${step("kicker")};display:flex;justify-content:space-between;gap:var(--sys-space-m);font-variant-numeric:tabular-nums}
.pb-raster .rs-band-text{margin-top:auto;padding-top:var(--sys-space-xl);position:relative;isolation:isolate;container-type:inline-size}
.pb-raster .rs-band--photo .rs-band-text::before{content:"";position:absolute;z-index:-1;top:var(--sys-space-l);bottom:calc(var(--sys-space-m) * -1);
  left:calc(50% - 50vw);right:calc(50% - 50vw);background:${LOCAL_SCRIM};pointer-events:none}
.pb-raster .rs-band-name{${step("figure")};text-transform:uppercase;font-variant-numeric:tabular-nums;margin-left:-.04em;
  hyphens:auto;-webkit-hyphens:auto;hyphenate-limit-chars:6 3 3;overflow-wrap:normal;word-break:normal}
/* Trennstelle an der Kompositionsfuge gesetzt: nur dort trennen */
.pb-raster .rs-band-name--fuge{hyphens:manual;-webkit-hyphens:manual}
@supports (font-size:1cqi){
  .pb-raster .rs-band-name{font-size:clamp(var(--sys-space-l),100cqi / var(--rs-fit),var(--sys-figure-size))}
  /* Handy: getrennt an der Fuge, Größe nach dem längsten Stück */
  @media (max-width:55.99rem){
    .pb-raster .rs-band-name--fuge{font-size:clamp(var(--sys-space-l),100cqi / var(--rs-fit-part),var(--sys-figure-size))}
  }
}
.pb-raster .rs-band-desc{${step("h3")};max-width:20em;margin-top:var(--sys-space-s);color:color-mix(in srgb,var(--sys-on-deep) ${pct(BAND_DESC_ALPHA)},var(--band-bg))}
.pb-raster .rs-band :focus-visible{outline-color:var(--sys-on-deep)}
.pb-raster .rs-sec>.rs-band-after{border-top:0;padding-block:var(--sys-space-xl) var(--sys-space-section)}
.pb-raster .rs-band-after .rs-body{gap:var(--sys-space-l)}
@media (min-width:${GRID}){
  .pb-raster .rs-band{min-height:100vh;min-height:100svh}
  .pb-raster .rs-band-in{padding-bottom:var(--sys-space-gutter)}
  .pb-raster .rs-band-desc{max-width:24em}
}

/* Zahlenzeile: Haarlinien-Raster, Ziffern in figure, auf die Zelle eingepasst */
.pb-raster .rs-figs{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;
  background:var(--sys-rule);border-top:1px solid var(--sys-rule);border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-figs--odd>.rs-fig:first-child{grid-column:1/-1}
.pb-raster .rs-fig{background:var(--sys-paper);padding:var(--sys-space-s) 0 var(--sys-space-m) var(--sys-space-s);container-type:inline-size;min-width:0}
.pb-raster .rs-figs:not(.rs-figs--odd)>.rs-fig:nth-child(odd),.pb-raster .rs-figs--odd>.rs-fig:nth-child(even){padding-left:0}
.pb-raster .rs-fig-value{${step("figure")};display:block;font-variant-numeric:tabular-nums;white-space:nowrap;margin-bottom:var(--sys-space-xs)}
@supports (font-size:1cqi){
  .pb-raster .rs-fig-value{font-size:min(var(--sys-figure-size),100cqi / var(--rs-fit))}
}
.pb-raster .rs-fig-label{${step("small")};display:block;color:var(--sys-muted)}
@media (min-width:${GRID}){
  .pb-raster .rs-figs{grid-template-columns:repeat(var(--rs-n,4),minmax(0,1fr))}
  .pb-raster .rs-figs>.rs-fig:nth-child(n){padding-left:var(--sys-space-s);grid-column:auto}
}

/* Ablauf: Ziffernzeilen zwischen Haarlinien */
.pb-raster .rs-steps{list-style:none;margin:0;padding:0}
.pb-raster .rs-step{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 var(--sys-space-m);border-top:1px solid var(--sys-rule);
  padding:var(--sys-space-s) 0 var(--sys-space-l)}
.pb-raster .rs-step:last-child{border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-step-no{${step("figure")};font-variant-numeric:tabular-nums;color:var(--sys-accent);min-width:1.1em}
.pb-raster .rs-step h3{${step("h3")};color:var(--sys-ink)}
.pb-raster .rs-step p{margin-top:var(--sys-space-xs);color:var(--sys-muted);max-width:var(--sys-space-measure)}
@media (min-width:${GRID}){
  .pb-raster .rs-step{grid-template-columns:3fr 6fr}
}

/* Tabellen: Preise, Speisekarte, Team, weitere Leistungen */
.pb-raster .rs-groups{display:grid;gap:var(--sys-space-xl)}
.pb-raster .rs-group-h{${step("kicker")};color:var(--sys-muted);margin-bottom:var(--sys-space-xs)}
.pb-raster .rs-table{list-style:none;margin:0;padding:0;border-bottom:1px solid var(--sys-rule)}
.pb-raster .rs-trow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:var(--sys-space-2xs) var(--sys-space-m);
  border-top:1px solid var(--sys-rule);padding-block:var(--sys-space-s)}
.pb-raster .rs-trow-title{min-width:0;overflow-wrap:break-word}
.pb-raster .rs-price,.pb-raster .rs-trow-aside{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
.pb-raster .rs-trow-aside{color:var(--sys-muted)}
.pb-raster .rs-trow-desc{${step("small")};grid-column:1/-1;color:var(--sys-muted);max-width:var(--sys-space-measure)}

/* Vorschau-Platzhalter (nie live) */
.pb-raster .rs-slot{border:1px dashed color-mix(in srgb,var(--sys-ink) 32%,transparent);padding:var(--sys-space-m);display:grid;gap:var(--sys-space-xs)}
.pb-raster .rs-slot .rs-kicker{color:var(--sys-accent)}
.pb-raster .rs-slot h3{${step("h3")}}
.pb-raster .rs-slot p:not(.rs-kicker){${step("small")};color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-raster .rs-slot-faces{display:flex;gap:var(--sys-space-s);margin-top:var(--sys-space-xs)}
.pb-raster .rs-slot-faces i{flex:0 1 var(--sys-space-2xl);aspect-ratio:4/5;border:1px dashed color-mix(in srgb,var(--sys-ink) 28%,transparent)}
.pb-raster .rs-slot-section{padding-bottom:var(--sys-space-section)}
`;
