import { H_BTN, H_MIN, NAV, R, ROUND, WIDE, step } from "./step";
import { PHOTO_VEIL } from "./entryCss";

/**
 * Inhaltskapitel von Nacht (Systemblatt 10–16): Kapitel-Ziffer, Karte,
 * Leistungen/Zimmer, Menschen und Haus, Gut zu wissen, Zeiten mit Küche,
 * Anfahrt, Reservierungs-Band, Kontakt-Insel, Platzhalter.
 * Nur `--sys-*` (oder Vielfache); Ausnahmen 1px/2px-Linien und -Ecken.
 */

/** Ziel 44 px. */
const TAP = "calc(var(--sys-space-l) * 1.1)";
/** Breite Spalten der Karte erst ab hier (zwei Kategorien nebeneinander). */
const COLS = "72rem";
/** Schleier in Grundfarbe über jedem Inhaltsfoto (wie Einstieg). */
const VEIL = `color-mix(in srgb,var(--sys-paper) ${Math.round(PHOTO_VEIL * 100)}%,transparent)`;

export const CONTENT_CSS = `/* Kapitel */
.pb-nacht .nc-sec{position:relative;padding-top:var(--sys-space-section)}
.pb-nacht .nc-h2{${step("h2")};color:var(--sys-accent);max-width:14em;overflow-wrap:break-word}
/* Lange Wörter („Öffnungszeiten") am schmalen Handy: etwas kleiner, sonst Trennung statt Bruch */
.pb-nacht .nc-sec .nc-h2,.pb-nacht .nc-page-head .nc-h2{font-size:min(var(--sys-h2-size),8.6vw);hyphens:auto;hyphenate-limit-chars:8 4 4}
.pb-nacht .nc-intro{margin-top:var(--sys-space-s);max-width:var(--sys-space-measure);color:var(--sys-muted)}
.pb-nacht .nc-item-title{font-weight:500;color:var(--sys-ink);overflow-wrap:break-word}
.pb-nacht .nc-item-text{margin-top:var(--sys-space-2xs);color:var(--sys-muted)}
.pb-nacht .nc-sec-link{margin-top:var(--sys-space-l)}
.pb-nacht .nc-prose{display:grid;gap:var(--sys-space-s);max-width:var(--sys-space-measure)}
.pb-nacht .nc-cl--short{width:calc(var(--sys-space-2xl) * .75);margin-top:var(--sys-space-m)}

/* Kapitel-Ziffer: Kupferzahl, Geisterwort, Kupferlinie mit Punkt */
.pb-nacht .nc-open{margin-bottom:var(--sys-space-m);container-type:inline-size}
.pb-nacht .nc-open-num{display:flex;align-items:flex-end}
.pb-nacht .nc-open-fig{${step("figure")};flex:none;display:block;color:var(--sys-accent);font-variant-numeric:lining-nums}
.pb-nacht .nc-open-ghost{min-width:0;margin:0 0 .04em calc(var(--sys-figure-size) * -.04);overflow:hidden;white-space:nowrap;
  font-family:var(--sys-font-display);font-size:min(calc(var(--sys-figure-size) * .34),calc(62cqi / var(--nc-chars,10) / .8));line-height:1;letter-spacing:.04em;text-transform:uppercase;color:var(--sys-ink);opacity:.09}
.pb-nacht .nc-open .nc-cl{margin-top:var(--sys-space-s)}

/* Kopf links, Inhalt rechts (Desktop); am Handy Kopf → Inhalt → Bildpaar */
.pb-nacht .nc-split{display:flex;flex-direction:column}
.pb-nacht .nc-split-head{display:contents}
.pb-nacht .nc-split-body{order:2;min-width:0}
.pb-nacht .nc-split .nc-pair{order:3}

/* Karte und Preise */
.pb-nacht .nc-cats{margin-top:var(--sys-space-l)}
.pb-nacht .nc-cat+.nc-cat{margin-top:var(--sys-space-xl)}
.pb-nacht .nc-cat-head{display:flex;align-items:baseline;justify-content:space-between;gap:calc(var(--sys-space-s) * .75);padding-bottom:var(--sys-space-s);border-bottom:1px solid var(--sys-accent)}
.pb-nacht .nc-cat-name{${step("h3")};color:var(--sys-ink);min-width:0;overflow-wrap:break-word;hyphens:auto}
.pb-nacht .nc-cat-count{${step("kicker")};flex:none;white-space:nowrap;color:var(--sys-muted)}
.pb-nacht .nc-dishes,.pb-nacht .nc-svc,.pb-nacht .nc-rooms,.pb-nacht .nc-know,.pb-nacht .nc-steps,.pb-nacht .nc-points,.pb-nacht .nc-crew,.pb-nacht .nc-gal,.pb-nacht .nc-logos{list-style:none;margin:0;padding:0}
.pb-nacht .nc-dish{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) calc(var(--sys-space-s) * 1.125);padding:var(--sys-space-m) 0;border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-dish-name{font-weight:500;line-height:1.35;color:var(--sys-ink);overflow-wrap:break-word;hyphens:auto}
.pb-nacht .nc-dish-text{grid-column:1;${step("small")};color:var(--sys-muted);overflow-wrap:break-word}
.pb-nacht .nc-pr{grid-column:2;grid-row:1;color:var(--sys-accent);text-align:right;white-space:nowrap;font-weight:500;font-variant-numeric:tabular-nums lining-nums}
.pb-nacht .nc-pr--note{${step("small")};white-space:normal;max-width:9em;overflow-wrap:break-word}

/* Bildpaar an der Karte: versetzt, Schleier in Grundfarbe */
.pb-nacht .nc-pair{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:var(--sys-space-s);margin-top:var(--sys-space-l);align-items:start}
.pb-nacht .nc-pair-pic{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--sys-surface)}
.pb-nacht .nc-pair-pic:last-child{margin-top:var(--sys-space-xl);aspect-ratio:3/4}

/* Fotos: Filter des Systems und Schleier */
.pb-nacht .nc-pic-frame,.pb-nacht .nc-portrait{position:relative;overflow:hidden;background:var(--sys-surface)}
.pb-nacht .nc-pic-frame{aspect-ratio:4/5}
.pb-nacht .nc-pic-frame img,.pb-nacht .nc-portrait img,.pb-nacht .nc-pair-pic img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-nacht .nc-pic-frame::after,.pb-nacht .nc-portrait::after,.pb-nacht .nc-pair-pic::after{content:"";position:absolute;inset:0;background:${VEIL};pointer-events:none}

/* Leistungen (Liste mit Preis) */
.pb-nacht .nc-svc{margin-top:var(--sys-space-l)}
.pb-nacht .nc-svc li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-s);align-items:baseline;padding:var(--sys-space-m) 0;border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-svc li:first-child{border-top:1px solid var(--sys-accent)}
.pb-nacht .nc-svc-name{${step("h3")};color:var(--sys-ink);min-width:0;overflow-wrap:break-word;hyphens:auto}
.pb-nacht .nc-svc-text{grid-column:1/-1;color:var(--sys-muted)}

/* Zimmer und Angebote (Unterkunft): Karten auf der Fläche */
.pb-nacht .nc-rooms{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-m)}
.pb-nacht .nc-room{background:var(--sys-surface);padding:var(--sys-space-m);display:grid;gap:var(--sys-space-xs);min-width:0}
.pb-nacht .nc-room-name{${step("h3")};color:var(--sys-ink);overflow-wrap:break-word;hyphens:auto}
.pb-nacht .nc-room-text{color:var(--sys-muted)}
.pb-nacht .nc-room-price{margin-top:var(--sys-space-xs);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule);display:flex;justify-content:flex-end}

/* Ring: Symbol, Nummer oder Monogramm im Kupferring */
.pb-nacht .nc-ring{flex:none;display:grid;place-items:center;width:${TAP};height:${TAP};border-radius:${ROUND};box-shadow:inset 0 0 0 1px var(--sys-accent);color:var(--sys-accent)}
.pb-nacht .nc-ring--no{font-family:var(--sys-font-display);font-size:var(--sys-space-m);line-height:1;font-variant-numeric:lining-nums}
.pb-nacht .nc-ring--mono{width:var(--sys-space-xl);height:var(--sys-space-xl);font-family:var(--sys-font-display);font-size:var(--sys-space-m);line-height:1}

/* Gut zu wissen, Ablauf, Vorteile */
.pb-nacht .nc-know,.pb-nacht .nc-steps,.pb-nacht .nc-points{margin-top:var(--sys-space-l);display:grid}
.pb-nacht .nc-know-item,.pb-nacht .nc-step{display:grid;grid-template-columns:${TAP} minmax(0,1fr);gap:calc(var(--sys-space-s) * .875);align-items:start;padding:var(--sys-space-m) 0;border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-point{position:relative;padding:var(--sys-space-m) 0 var(--sys-space-m) var(--sys-space-m);border-bottom:1px solid var(--sys-rule)}
.pb-nacht .nc-point::before{content:"";position:absolute;left:0;top:calc(var(--sys-space-m) + .6em);width:calc(var(--sys-space-xs) * .875);height:calc(var(--sys-space-xs) * .875);border-radius:${ROUND};background:var(--sys-accent)}

/* Zahlen */
.pb-nacht .nc-figs{margin:var(--sys-space-l) 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-m)}
.pb-nacht .nc-figs-item{display:flex;flex-direction:column-reverse;gap:var(--sys-space-2xs);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule);min-width:0}
.pb-nacht .nc-figs dd{${step("h2")};margin:0;color:var(--sys-accent);font-variant-numeric:lining-nums;overflow-wrap:anywhere}
.pb-nacht .nc-figs dt{${step("small")};color:var(--sys-muted)}

/* Über uns, Geschichte */
.pb-nacht .nc-about-body{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-l)}
.pb-nacht .nc-about-body .nc-pic-frame{max-width:calc(var(--sys-space-measure) * .85)}

/* Team */
.pb-nacht .nc-crew{margin-top:var(--sys-space-l);display:grid;gap:var(--sys-space-m)}
.pb-nacht .nc-person{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--sys-space-s);align-items:center}
.pb-nacht .nc-portrait{width:calc(var(--sys-space-xl) * 1.25);aspect-ratio:3/4}
.pb-nacht .nc-person-name{${step("h3")};color:var(--sys-ink);overflow-wrap:break-word}

/* Galerie: zwei Spalten versetzt (wie das Bildpaar), Desktop drei */
.pb-nacht .nc-gal{margin-top:var(--sys-space-l);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-s);align-items:start}
.pb-nacht .nc-gal li:nth-child(2n){margin-top:var(--sys-space-xl)}
/* Sehr schmal: Zeiten-Tabelle in kleiner Stufe, damit Zeit und Küche nebeneinander passen */
@media (max-width:calc(24rem - 1px)){
  .pb-nacht .nc-hours tbody{${step("small")}}
}
/* Handy, ungerade Anzahl: das erste Bild über beide Spalten, der Versatz wandert mit */
@media (max-width:calc(${WIDE} - 1px)){
  .pb-nacht .nc-gal li:first-child:nth-last-child(2n+1):not(:only-child){grid-column:1/-1}
  .pb-nacht .nc-gal li:first-child:nth-last-child(2n+1) .nc-pic-frame{aspect-ratio:3/2}
  .pb-nacht .nc-gal li:first-child:nth-last-child(2n+1)~li:nth-child(2n){margin-top:0}
  .pb-nacht .nc-gal li:first-child:nth-last-child(2n+1)~li:nth-child(2n+1){margin-top:var(--sys-space-xl)}
}
.pb-nacht .nc-gal[data-n="1"]{grid-template-columns:minmax(0,1fr);max-width:var(--sys-space-measure)}
.pb-nacht .nc-gal-cap{${step("small")};margin-top:var(--sys-space-xs);color:var(--sys-muted)}

/* Gästestimme */
.pb-nacht .nc-voices{display:grid;gap:var(--sys-space-xl);margin-top:var(--sys-space-m)}
.pb-nacht .nc-voice-text{font-family:var(--sys-font-display);font-size:var(--sys-body-size);line-height:1.45;color:var(--sys-ink);max-width:var(--sys-space-measure)}
.pb-nacht .nc-voice--lead .nc-voice-text{font-size:var(--sys-h3-size);line-height:1.35}
.pb-nacht .nc-voice-who{${step("small")};display:flex;flex-wrap:wrap;gap:var(--sys-space-2xs) calc(var(--sys-space-s) * .875);margin-top:var(--sys-space-m);color:var(--sys-muted)}
.pb-nacht .nc-voice-who b{font-weight:500;color:var(--sys-ink)}
.pb-nacht .nc-rate{display:flex;flex-wrap:wrap;align-items:baseline;gap:calc(var(--sys-space-s) * .75);margin-top:var(--sys-space-l);padding-top:var(--sys-space-m);border-top:1px solid var(--sys-rule);max-width:calc(var(--sys-space-measure) * 1.1);${step("small")};color:var(--sys-muted)}
.pb-nacht .nc-rate-value{${step("h2")};color:var(--sys-accent);font-variant-numeric:lining-nums}

/* Leitsatz */
.pb-nacht .nc-motto{text-align:center;max-width:calc(var(--sys-space-measure) * 1.3);margin-inline:auto}
.pb-nacht .nc-motto .nc-vl{margin:0 auto var(--sys-space-l)}
.pb-nacht .nc-motto blockquote{${step("h3")};color:var(--sys-ink)}
.pb-nacht .nc-motto-who{${step("kicker")};margin-top:var(--sys-space-m);color:var(--sys-accent)}

/* Partner: Logos auf heller Kachel (dunkle Logos bleiben sichtbar) */
.pb-nacht .nc-logos{margin-top:var(--sys-space-l);display:flex;flex-wrap:wrap;gap:var(--sys-space-s)}
.pb-nacht .nc-logos li{background:var(--sys-ink);border-radius:${R};padding:calc(var(--sys-space-s) * .75) var(--sys-space-s)}
.pb-nacht .nc-logos a{display:block}
.pb-nacht .nc-logos img{height:calc(var(--sys-space-l) * 1.1);width:auto;max-width:calc(var(--sys-space-2xl) * 1.6);object-fit:contain}

/* Besuch: Zeiten links, Anfahrt rechts */
.pb-nacht .nc-visit{display:grid;gap:var(--sys-space-section)}
.pb-nacht .nc-visit>*{min-width:0}
.pb-nacht .nc-hours{width:100%;margin-top:var(--sys-space-l);border-collapse:collapse;border-top:1px solid var(--sys-accent);font-variant-numeric:tabular-nums lining-nums}
.pb-nacht .nc-hours th,.pb-nacht .nc-hours td{padding:var(--sys-space-s) 0;border-bottom:1px solid var(--sys-rule);text-align:left;vertical-align:baseline}
.pb-nacht .nc-hours thead th{${step("kicker")};padding-block:var(--sys-space-xs);color:var(--sys-muted)}
.pb-nacht .nc-hours thead th:last-child,.pb-nacht .nc-hours .nc-hk{text-align:right}
.pb-nacht .nc-hours tbody th{position:relative;width:1%;padding-right:var(--sys-space-m);font-weight:500;color:var(--sys-ink);white-space:nowrap}
.pb-nacht .nc-hours tbody th.nc-hd--long{white-space:normal;overflow-wrap:break-word;min-width:calc(var(--sys-space-2xl) * 1.1)}
.pb-nacht .nc-hours thead th:first-child{width:1%;padding-right:var(--sys-space-m)}
.pb-nacht .nc-hv span{display:block}
.pb-nacht .nc-hv:not(.nc-hv--text){white-space:nowrap}
.pb-nacht .nc-hv--text{overflow-wrap:anywhere}
.pb-nacht .nc-hours .nc-hk{color:var(--sys-accent);white-space:nowrap;padding-left:var(--sys-space-s)}
.pb-nacht .nc-zu td{color:var(--sys-muted)}
.pb-nacht .nc-now th::before{content:"";position:absolute;left:calc(var(--sys-space-gutter) * -1);top:-1px;bottom:-1px;width:calc(var(--sys-space-2xs) * .75);background:var(--sys-signal)}
.pb-nacht .nc-now-tag{${step("kicker")};display:block;margin-top:var(--sys-space-2xs);color:var(--sys-accent)}

/* Anfahrt: Kartenkachel ohne Einbettung, nachtfarben */
.pb-nacht .nc-map{margin-top:var(--sys-space-l);background:var(--sys-surface)}
.pb-nacht .nc-map-tile{position:relative;height:calc(var(--sys-space-2xl) * 2.25);overflow:hidden;background:
  linear-gradient(90deg,transparent 46%,var(--sys-rule) 46%,var(--sys-rule) 49%,transparent 49%),
  linear-gradient(0deg,transparent 57%,var(--sys-rule) 57%,var(--sys-rule) 61%,transparent 61%),
  linear-gradient(32deg,transparent 31%,var(--sys-rule) 31%,var(--sys-rule) 33%,transparent 33%),
  repeating-linear-gradient(90deg,transparent 0 var(--sys-space-xl),color-mix(in srgb,var(--sys-ink) 4%,transparent) var(--sys-space-xl) calc(var(--sys-space-xl) + 2px)),
  repeating-linear-gradient(0deg,transparent 0 var(--sys-space-l),color-mix(in srgb,var(--sys-ink) 4%,transparent) var(--sys-space-l) calc(var(--sys-space-l) + 2px)),
  var(--sys-deep)}
.pb-nacht .nc-map-water{position:absolute;right:-6%;top:-10%;width:42%;height:60%;border-radius:${ROUND};background:color-mix(in srgb,var(--sys-glow-1) 30%,transparent)}
.pb-nacht .nc-map-pin{position:absolute;left:47.5%;top:59%;width:calc(var(--sys-space-m) * .9);height:calc(var(--sys-space-m) * .9);border-radius:${ROUND};transform:translate(-50%,-50%);background:var(--sys-accent);
  box-shadow:0 0 0 calc(var(--sys-space-s) * .625) color-mix(in srgb,var(--sys-accent) 18%,transparent),0 0 0 calc(var(--sys-space-s) * 1.375) color-mix(in srgb,var(--sys-accent) 8%,transparent)}
.pb-nacht .nc-map-body{padding:var(--sys-space-m);display:grid;gap:var(--sys-space-s)}
.pb-nacht .nc-map-adr{${step("h3")};line-height:1.25;color:var(--sys-ink);overflow-wrap:break-word}
.pb-nacht .nc-map-ways{display:grid;justify-items:start;gap:var(--sys-space-2xs)}
.pb-nacht .nc-way{display:inline-flex;align-items:center;gap:calc(var(--sys-space-s) * .625);min-height:${TAP};color:var(--sys-ink);text-decoration:underline;text-decoration-color:var(--sys-accent);text-underline-offset:.3em;overflow-wrap:anywhere}
.pb-nacht .nc-way .nc-ic{color:var(--sys-accent)}
.pb-nacht .nc-map-ways .nc-btn{margin-top:var(--sys-space-xs)}

/* Reservierung: tiefes Band */
.pb-nacht .nc-sec.nc-band{margin-top:var(--sys-space-section);padding:var(--sys-space-xl) 0;background:var(--sys-deep);color:var(--sys-on-deep)}
.pb-nacht .nc-band :focus-visible{outline-color:var(--sys-on-deep)}
.pb-nacht .nc-band-ways{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-nacht .nc-band-tel{display:block;justify-self:start;font-family:var(--sys-font-display);font-size:var(--sys-h2-size);line-height:1.05;color:var(--sys-on-deep);text-decoration:none;font-variant-numeric:lining-nums;overflow-wrap:anywhere}
.pb-nacht .nc-band-tel small{${step("kicker")};display:block;margin-bottom:var(--sys-space-xs);color:var(--sys-accent)}
.pb-nacht .nc-band-tel:hover{text-decoration:underline;text-decoration-color:var(--sys-accent);text-decoration-thickness:1px;text-underline-offset:.15em}
.pb-nacht .nc-band-go{display:grid;justify-items:start;gap:var(--sys-space-xs)}
.pb-nacht .nc-band-host{${step("small")};color:var(--sys-muted);overflow-wrap:anywhere}

/* Kontakt-Insel: Titel nur, wenn das Formular rendert; Felder auf dunkel */
.pb-nacht .nc-form-title{${step("h3")};margin-top:var(--sys-space-xl);color:var(--sys-ink)}
.pb-nacht .nc-contact>.pb-island{max-width:var(--sys-space-max);margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-nacht .pb-island-form{max-width:var(--sys-space-measure);gap:var(--sys-space-m);color:var(--sys-ink)}
.pb-nacht .pb-island-form label{${step("small")};font-weight:500;color:var(--sys-ink);gap:var(--sys-space-xs)}
.pb-nacht .pb-island-form input,.pb-nacht .pb-island-form textarea{${step("body")};min-height:${H_MIN};background:var(--sys-surface);color:var(--sys-ink);border:1px solid var(--sys-muted);
  border-radius:${R};padding:calc(var(--sys-space-s) * .75) var(--sys-space-s);color-scheme:dark}
.pb-nacht .pb-island-form textarea{min-height:calc(var(--sys-space-2xl) * 1.6)}
.pb-nacht .pb-island-form ::placeholder{color:var(--sys-muted);opacity:1}
.pb-nacht .pb-island-form input:focus-visible,.pb-nacht .pb-island-form textarea:focus-visible{outline:var(--nc-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs);border-color:var(--sys-ink)}
.pb-nacht .pb-island-submit{${step("link")};align-self:flex-start;min-height:${H_BTN};cursor:pointer;background:var(--sys-signal);color:var(--sys-on-signal);border:0;border-radius:${R};padding:0 var(--sys-space-m)}
.pb-nacht .pb-island-submit:hover,.pb-nacht .pb-island-submit:focus-visible{opacity:1;background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
.pb-nacht .pb-island-submit:focus-visible{outline:var(--nc-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-nacht .pb-island-privacy{${step("small")};color:var(--sys-muted)}
.pb-nacht .pb-island-privacy a{color:var(--sys-ink);text-decoration-color:var(--sys-accent);text-underline-offset:.25em}
.pb-nacht .pb-island-status{${step("small")}}
/* Farbe hier nötig: islandsCss färbt Erfolg/Fehler fest und steht später im Dokument */
.pb-nacht .pb-island-status[data-state="success"],.pb-nacht .pb-island-status[data-state="error"]{color:var(--sys-ink);border-left:2px solid var(--sys-accent);padding-left:var(--sys-space-s)}
.pb-nacht .pb-island-status[data-state="info"]{color:var(--sys-muted)}

/* Vorschau-Platzhalter (nur Vorschau) */
.pb-nacht .nc-slot-section{padding-top:var(--sys-space-section)}
.pb-nacht .nc-slot{max-width:var(--sys-space-measure);border:2px dashed var(--sys-muted);border-radius:${R};padding:var(--sys-space-m);color:var(--sys-ink)}
.pb-nacht .nc-sec .nc-slot{margin-top:var(--sys-space-l)}
.pb-nacht .nc-slot-kicker{${step("kicker")};color:var(--sys-muted)}
.pb-nacht .nc-slot-title{${step("h3")};margin-top:var(--sys-space-xs)}
.pb-nacht .nc-slot-text{${step("small")};margin-top:var(--sys-space-xs);color:var(--sys-muted)}

/* Unterseiten: Rückweg */
.pb-nacht .nc-back{${step("link")};display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${H_MIN};margin-bottom:var(--sys-space-s);color:var(--sys-accent);text-decoration:none}
.pb-nacht .nc-back-ic{display:inline-flex;transform:scaleX(-1)}
.pb-nacht .nc-back:hover{text-decoration:underline;text-underline-offset:.3em}

@media (min-width:${WIDE}){
  .pb-nacht .nc-gal{grid-template-columns:repeat(3,minmax(0,1fr))}
  .pb-nacht .nc-gal li:nth-child(2n){margin-top:0}
  .pb-nacht .nc-gal li:nth-child(3n+2){margin-top:var(--sys-space-xl)}
  .pb-nacht .nc-figs{grid-template-columns:repeat(4,minmax(0,1fr))}
  .pb-nacht .nc-crew{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-xl)}
  .pb-nacht .nc-about-body--photo{grid-template-columns:minmax(0,7fr) minmax(0,5fr);column-gap:var(--sys-space-2xl);align-items:start}
  .pb-nacht .nc-band-ways{grid-template-columns:auto auto;justify-content:start;align-items:end;column-gap:var(--sys-space-2xl)}
}
@media (min-width:${NAV}){
  .pb-nacht .nc-split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);column-gap:var(--sys-space-2xl);align-items:start}
  .pb-nacht .nc-split-head{display:block}
  .pb-nacht .nc-split-body>:first-child{margin-top:0}
  .pb-nacht .nc-split .nc-pair{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pb-nacht .nc-visit{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-2xl);align-items:start}
  .pb-nacht .nc-visit--solo{grid-template-columns:minmax(0,1fr)}
  .pb-nacht .nc-visit--solo>*{max-width:calc(var(--sys-space-measure) * 1.4)}
  .pb-nacht .nc-know{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-xl)}
  .pb-nacht .nc-voices{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--sys-space-xl)}
  .pb-nacht .nc-voice--lead{grid-column:1/-1}
  .pb-nacht .nc-crew{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (min-width:${COLS}){
  .pb-nacht .nc-cats--many{columns:2;column-gap:var(--sys-space-xl)}
  .pb-nacht .nc-cats--many .nc-cat{break-inside:avoid;margin:0 0 var(--sys-space-xl)}
  .pb-nacht .nc-rooms{grid-template-columns:repeat(2,minmax(0,1fr))}
}`;
