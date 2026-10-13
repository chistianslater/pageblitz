import { CLOUD, H_MIN, LINE, NAV, WIDE, step } from "./step";
import { VISIT_CSS } from "./visitCss";

/** Weicher Schatten unter Fotos (Tinte), wie im Einstieg. */
const SHADOW =
  "0 var(--sys-space-s) var(--sys-space-l) calc(var(--sys-space-s) * -.75) color-mix(in srgb,var(--sys-ink) 35%,transparent)";
/** Kachel 44 px, Initialen-Kreis 64 px bzw. 40 px. */
const TILE = "calc(var(--sys-space-l) * 1.1)";
const AVATAR = "var(--sys-space-xl)";
const AVATAR_S = "var(--sys-space-l)";
/** Mindestbreite einer Karte im Raster (≈ 15 rem / 17,5 rem). */
const CARD_MIN = "calc(var(--sys-space-xl) * 3.75)";
const WIDE_CARD_MIN = "calc(var(--sys-space-xl) * 4.375)";
/** Leichtes Kippen der Zettel ab Desktop (ein Drittel des Systemwinkels). */
const TILT_SOFT = "calc(var(--sys-tilt) * .33)";

/**
 * Abschnitte nach Systemblatt 7/8/11–18: Flächen (Papier, Band, Pastell 2
 * und 4) mit Wolke beim Wechsel, Kapitelköpfe in zwei Tönen, Farbkarten des
 * Angebots, Ablauf, Zahlen, Über uns, Team, Galerie, Stimmen, Extras.
 * Besuch, Formular und Platzhalter in visitCss. Text auf Pastell immer in
 * der Tinte des Pastells; nur `--sys-*` (oder Vielfache), Ausnahmen 1/1,5-
 * px-Linien.
 */
export const CONTENT_CSS = `
/* Flächen */
.pb-freundlich .fr-sec{position:relative;padding-top:var(--sys-space-section);--fr-mut:var(--sys-muted)}
.pb-freundlich .fr-sec>.fr-wrap{position:relative;z-index:1}
.pb-freundlich .fr-sec--fill{margin-top:var(--sys-space-section);padding-bottom:var(--sys-space-section)}
.pb-freundlich .fr-sec--fill+.fr-sec--fill,.pb-freundlich .fr-entry+.fr-sec--fill{margin-top:0}
.pb-freundlich .fr-sec--band{background:var(--sys-band);--fr-mut:var(--sys-ink)}
.pb-freundlich .fr-sec--tint2{background:var(--sys-tint-2-bg);color:var(--sys-tint-2-ink);--fr-mut:var(--sys-tint-2-ink)}
.pb-freundlich .fr-sec--tint4{background:var(--sys-tint-4-bg);color:var(--sys-tint-4-ink);--fr-mut:var(--sys-tint-4-ink)}
.pb-freundlich .fr-cloud--tint2{--fr-cc:var(--sys-tint-2-bg)}
.pb-freundlich .fr-cloud--tint4{--fr-cc:var(--sys-tint-4-bg)}
.pb-freundlich .fr-cloud--top{top:calc(var(--fr-ch) * -1 + 1px);bottom:auto}
.pb-freundlich .fr-sec--fill:has(>.fr-cloud--top){margin-top:max(var(--sys-space-section),calc(${CLOUD} + var(--sys-space-l)))}
.pb-freundlich .fr-sec--fill+.fr-sec--fill:has(>.fr-cloud--top){margin-top:0}

/* Kapitelkopf: h2 in zwei Tönen, Einleitung */
.pb-freundlich .fr-chead{margin-bottom:var(--sys-space-l)}
.pb-freundlich .fr-h2{${step("h2")};max-width:16ch;overflow-wrap:break-word}
.pb-freundlich .fr-h3{${step("h3")}}
.pb-freundlich .fr-intro{${step("lede")};margin-top:var(--sys-space-s);color:var(--fr-mut);max-width:var(--sys-space-measure)}
.pb-freundlich .fr-chead--center{text-align:center}
.pb-freundlich .fr-chead--center .fr-h2,.pb-freundlich .fr-chead--center .fr-intro{margin-inline:auto}
.pb-freundlich .fr-muted{color:var(--fr-mut)}
.pb-freundlich .fr-more{margin-top:var(--sys-space-l)}

/* Pastell je Karte: Fläche, Tinte, Neben-Grau, Kante */
.pb-freundlich .fr-tint-1{--fr-cbg:var(--sys-tint-1-bg);--fr-cink:var(--sys-tint-1-ink);--fr-cmut:var(--sys-tint-1-muted);--fr-cedge:var(--sys-tint-1-edge)}
.pb-freundlich .fr-tint-2{--fr-cbg:var(--sys-tint-2-bg);--fr-cink:var(--sys-tint-2-ink);--fr-cmut:var(--sys-tint-2-muted);--fr-cedge:var(--sys-tint-2-edge)}
.pb-freundlich .fr-tint-3{--fr-cbg:var(--sys-tint-3-bg);--fr-cink:var(--sys-tint-3-ink);--fr-cmut:var(--sys-tint-3-muted);--fr-cedge:var(--sys-tint-3-edge)}
.pb-freundlich .fr-tint-4{--fr-cbg:var(--sys-tint-4-bg);--fr-cink:var(--sys-tint-4-ink);--fr-cmut:var(--sys-tint-4-muted);--fr-cedge:var(--sys-tint-4-edge)}

/* Kachel: weiß mit Pastellkante (Angebot), Nummer/Schalter in Pastell */
.pb-freundlich .fr-tile{flex:none;display:grid;place-items:center;width:${TILE};height:${TILE};border-radius:var(--sys-radius-s);background:var(--sys-surface);color:var(--sys-ink);
  box-shadow:inset 0 0 0 ${LINE} var(--fr-cedge,var(--sys-ink)),var(--sys-tile) var(--sys-tile) 0 var(--fr-cedge,var(--sys-ink));${step("data")}}
.pb-freundlich .fr-tile--no,.pb-freundlich .fr-tile--toggle{background:var(--fr-cbg);color:var(--fr-cink)}

/* Angebot: Farbkarten, je Angebot ein Pastell, Preis als weiße Pille */
.pb-freundlich .fr-offers{list-style:none;margin:0;padding:0;display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fit,minmax(min(100%,${CARD_MIN}),1fr))}
.pb-freundlich .fr-offer{display:flex;flex-direction:column;gap:calc(var(--sys-space-s) * .75);min-width:0;padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);border-radius:var(--sys-radius-m);
  background:var(--fr-cbg);color:var(--fr-cink);overflow-wrap:break-word}
.pb-freundlich .fr-offer-top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sys-space-s);margin-bottom:var(--sys-space-xs)}
.pb-freundlich .fr-offer-name{${step("h3")};hyphens:auto}
.pb-freundlich .fr-offer-text{${step("small")};color:var(--fr-cmut)}
.pb-freundlich .fr-price{${step("data")};flex:none;padding:calc(var(--sys-space-xs) * .5) calc(var(--sys-space-s) * .75);border-radius:var(--sys-radius-pill);background:var(--sys-surface);color:var(--sys-ink);
  white-space:nowrap;font-variant-numeric:tabular-nums lining-nums}
.pb-freundlich .fr-price--note{flex:0 1 auto;white-space:normal;text-align:right;max-width:60%}

/* Karte/Preisliste: je Kategorie eine Pastellkarte mit Posten */
.pb-freundlich .fr-cats{display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fit,minmax(min(100%,${WIDE_CARD_MIN}),1fr))}
.pb-freundlich .fr-cat{padding:var(--sys-space-m);border-radius:var(--sys-radius-m);background:var(--fr-cbg);color:var(--fr-cink);min-width:0}
.pb-freundlich .fr-cat-name{${step("h3")};margin-bottom:var(--sys-space-xs)}
.pb-freundlich .fr-rows{list-style:none;margin:0;padding:0}
.pb-freundlich .fr-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-s);align-items:baseline;padding-block:calc(var(--sys-space-s) * .75);
  border-top:1px solid color-mix(in srgb,var(--fr-cedge) 55%,transparent)}
.pb-freundlich .fr-row:first-child{border-top:0}
.pb-freundlich .fr-row-name{font-weight:600;overflow-wrap:break-word}
.pb-freundlich .fr-row-text{${step("small")};grid-column:1/-1;color:var(--fr-cmut)}
.pb-freundlich .fr-row .fr-price--note{max-width:none}

/* Ablauf: weiße Karten, Nummernkachel in Pastell */
.pb-freundlich .fr-steps{list-style:none;margin:0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .75)}
.pb-freundlich .fr-step{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--sys-space-s);align-items:start;padding:calc(var(--sys-space-m) * .85);border-radius:var(--sys-radius-m);
  background:var(--sys-surface);color:var(--sys-ink);--fr-mut:var(--sys-muted)}
.pb-freundlich .fr-step-name{${step("h3")};font-size:calc(var(--sys-h3-size) * .8)}
.pb-freundlich .fr-step-text p{${step("small")};margin-top:var(--sys-space-2xs)}

/* Zahlen: tiefe Fläche, Wert groß links, Beschriftung rechts */
.pb-freundlich .fr-figs{max-width:calc(var(--sys-space-measure) * 1.4);margin-inline:auto;padding:var(--sys-space-2xs) var(--sys-space-m);border-radius:var(--sys-radius-l);background:var(--sys-deep);color:var(--sys-on-deep)}
.pb-freundlich .fr-fig{display:flex;flex-direction:row-reverse;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--sys-space-xs) var(--sys-space-s);padding-block:var(--sys-space-m);
  border-top:1px solid color-mix(in srgb,var(--sys-on-deep) 18%,transparent)}
.pb-freundlich .fr-fig:first-child{border-top:0}
.pb-freundlich .fr-fig dd{${step("figure")};font-variant-numeric:lining-nums}
.pb-freundlich .fr-fig dt{${step("small")};text-align:right}

/* Über uns, Geschichte */
.pb-freundlich .fr-prose{display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure)}
.pb-freundlich .fr-about{display:grid;gap:var(--sys-space-l)}
.pb-freundlich .fr-pic{margin:0;border-radius:var(--sys-radius-m);overflow:hidden;background:var(--sys-band)}
.pb-freundlich .fr-pic img{width:100%;height:100%;object-fit:cover}
.pb-freundlich .fr-pic--about{aspect-ratio:4/3;border-radius:var(--sys-radius-l);box-shadow:${SHADOW}}

/* Team: Pastellkarten, Initialen im weißen Kreis */
.pb-freundlich .fr-people{list-style:none;margin:0;padding:0;display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fit,minmax(min(100%,${WIDE_CARD_MIN}),1fr))}
.pb-freundlich .fr-person{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--sys-space-s);align-items:center;padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);
  border-radius:var(--sys-radius-m);background:var(--fr-cbg);color:var(--fr-cink)}
.pb-freundlich .fr-avatar{flex:none;display:grid;place-items:center;width:${AVATAR};height:${AVATAR};border-radius:var(--sys-radius-pill);overflow:hidden;
  background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 ${LINE} var(--fr-cedge,var(--sys-rule));${step("h3")};font-size:calc(var(--sys-h3-size) * .8)}
.pb-freundlich .fr-avatar img{width:100%;height:100%;object-fit:cover}
.pb-freundlich .fr-avatar--s{width:${AVATAR_S};height:${AVATAR_S};${step("small")};font-weight:600;font-size:calc(var(--sys-small-size) * .8)}
.pb-freundlich .fr-person-name{${step("h3")};overflow-wrap:anywhere}
.pb-freundlich .fr-person-text p{margin-top:var(--sys-space-2xs)}

/* Galerie: eins groß, zwei klein; runde Ecken */
.pb-freundlich .fr-gal{list-style:none;margin:0;padding:0;display:grid;gap:calc(var(--sys-space-s) * .625);grid-template-columns:repeat(2,minmax(0,1fr))}
.pb-freundlich .fr-gal li{min-width:0}
.pb-freundlich .fr-gal .fr-pic{display:flex;flex-direction:column;height:100%;background:none}
.pb-freundlich .fr-gal img{aspect-ratio:1;border-radius:var(--sys-radius-m);background:var(--sys-band);flex:1;min-height:0}
.pb-freundlich .fr-gal li:first-child{grid-column:1/-1}
.pb-freundlich .fr-gal li:first-child img{aspect-ratio:4/3}
.pb-freundlich .fr-gal[data-n="2"] li:first-child{grid-column:auto}
.pb-freundlich .fr-gal[data-n="2"] img{aspect-ratio:4/5}
.pb-freundlich .fr-cap{${step("small")};color:var(--fr-mut);margin-top:var(--sys-space-xs)}

/* Stimmen: Zettel in Pastell, Initialen, Quelle; Note als Pille */
.pb-freundlich .fr-voices{display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fit,minmax(min(100%,${WIDE_CARD_MIN}),1fr))}
.pb-freundlich .fr-voice{margin:0;display:flex;flex-direction:column;justify-content:space-between;gap:var(--sys-space-s);padding:var(--sys-space-m) calc(var(--sys-space-m) * .85);
  border-radius:var(--sys-radius-m);background:var(--fr-cbg);color:var(--fr-cink);text-align:left}
.pb-freundlich .fr-voice-text p{${step("h3")};font-size:calc(var(--sys-h3-size) * .75);line-height:1.3;hyphens:auto}
.pb-freundlich .fr-who{display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75)}
.pb-freundlich .fr-who b{display:block;font-weight:600}
.pb-freundlich .fr-who small{display:block;${step("small")};color:var(--fr-cmut)}
.pb-freundlich .fr-rate{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:var(--sys-space-2xs) var(--sys-space-s);width:fit-content;max-width:100%;margin:var(--sys-space-l) auto 0;
  padding:calc(var(--sys-space-xs) * 1.25) var(--sys-space-m);border-radius:var(--sys-radius-l);background:var(--sys-tint-2-bg);color:var(--sys-tint-2-ink);text-align:center;
  box-shadow:inset 0 0 0 ${LINE} var(--sys-tint-2-edge),0 var(--sys-press) 0 var(--sys-tint-2-edge);${step("small")}}
.pb-freundlich .fr-rate-value{display:inline-flex;align-items:center;gap:var(--sys-space-2xs);font-weight:600}

/* Leitsatz, Partner */
.pb-freundlich .fr-motto{max-width:24ch;margin:0 auto;text-align:center}
.pb-freundlich .fr-motto p{${step("h2")};font-size:calc(var(--sys-h2-size) * .6);line-height:1.2}
.pb-freundlich .fr-motto-who{${step("small")};margin-top:var(--sys-space-s);color:var(--fr-mut)}
.pb-freundlich .fr-logos{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-s)}
.pb-freundlich .fr-logos li{display:grid;place-items:center;padding:var(--sys-space-s) var(--sys-space-m);border-radius:var(--sys-radius-m);background:var(--sys-surface)}
.pb-freundlich .fr-logos a{display:grid;place-items:center;min-height:${H_MIN}}
.pb-freundlich .fr-logos img{height:calc(var(--sys-space-xl) * .6);width:auto;max-width:calc(var(--sys-space-xl) * 2.5);object-fit:contain}

@media (min-width:${WIDE}){
  .pb-freundlich .fr-about--photo{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:var(--sys-space-xl)}
}
@media (min-width:${NAV}){
  .pb-freundlich .fr-chead--split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--sys-space-xl);align-items:end}
  .pb-freundlich .fr-chead--split .fr-intro{margin-top:0}
  .pb-freundlich .fr-aside{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--sys-space-xl);align-items:start}
  .pb-freundlich .fr-aside .fr-chead{margin-bottom:0}
  .pb-freundlich .fr-step:nth-child(odd){transform:rotate(calc(${TILT_SOFT} * -1))}
  .pb-freundlich .fr-step:nth-child(even){transform:rotate(${TILT_SOFT})}
  .pb-freundlich .fr-voice:nth-child(odd){transform:rotate(calc(${TILT_SOFT} * -1))}
  .pb-freundlich .fr-voice:nth-child(even){transform:rotate(${TILT_SOFT})}
  .pb-freundlich .fr-pic--about{transform:rotate(calc(var(--sys-tilt) * -1))}
  .pb-freundlich .fr-gal{grid-template-columns:repeat(3,minmax(0,1fr))}
  .pb-freundlich .fr-gal li:first-child{grid-column:span 2;grid-row:span 2}
  .pb-freundlich .fr-gal li:first-child img{aspect-ratio:1}
  .pb-freundlich .fr-gal[data-n="1"] li:first-child{grid-column:1/-1;grid-row:auto}
  .pb-freundlich .fr-gal[data-n="1"] li:first-child img{aspect-ratio:16/9}
  .pb-freundlich .fr-gal[data-n="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pb-freundlich .fr-gal[data-n="2"] li:first-child{grid-column:auto;grid-row:auto}
  .pb-freundlich .fr-gal[data-n="2"] img{aspect-ratio:4/3}
}
${VISIT_CSS}`;
