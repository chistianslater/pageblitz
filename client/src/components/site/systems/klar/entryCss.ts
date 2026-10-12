import {
  step,
  GRID,
  PILL,
  R_CARD,
  R_FRAME,
  R_PANEL,
  R_PANEL_WIDE,
  SHADOW,
  TAP,
} from "./step";

/**
 * Einstieg (Systemblatt 8 Handy, 12 Desktop): helle Fläche (Feld 1) mit
 * Kicker-Pille, großer Zeile, Satz, Knöpfen; Bild im weichen Doppelrahmen
 * mit Heute-Karte · kleines Foto neben Zeiten-Karte · Zeiten-Tabelle.
 * Fakten-Chips und Bewertung darunter (Desktop in der Textspalte).
 */
export const ENTRY_CSS = `/* Einstieg: photo · small · hours · text */
.pb-klar .kl-entry{padding:var(--sys-space-2xs) calc(var(--sys-space-s) * .75) 0}
.pb-klar .kl-entry-panel{--kl-muted:var(--sys-field-1-muted);max-width:var(--sys-space-max);margin-inline:auto;display:grid;grid-template-columns:minmax(0,1fr);
  grid-template-areas:"text" "actions" "media" "facts";background:var(--sys-field-1-bg);color:var(--sys-field-1-ink);border-radius:${R_PANEL};
  padding:calc(var(--sys-space-l) * .7) calc(var(--sys-space-s) * 1.25) calc(var(--sys-space-s) * 1.25)}
.pb-klar .kl-entry-text{grid-area:text;min-width:0}
.pb-klar .kl-pill{${step("kicker")};display:inline-flex;flex-wrap:wrap;align-items:center;column-gap:.3em;max-width:100%;min-height:calc(var(--sys-space-l) * .9);
  padding:calc(var(--sys-space-2xs) * 1.5) calc(var(--sys-space-s) * .875);border-radius:calc(var(--sys-space-s) * 1.125);background:var(--sys-surface);color:var(--sys-ink);overflow-wrap:anywhere}
.pb-klar .kl-pill-name{font:inherit;letter-spacing:inherit;display:inline}
.pb-klar .kl-display{${step("display")};margin-top:calc(var(--sys-space-s) * 1.125);max-width:8em;text-wrap:balance;overflow-wrap:break-word;hyphens:auto}
.pb-klar .kl-entry-lede{${step("lede")};margin-top:calc(var(--sys-space-s) * .875);max-width:var(--sys-space-measure);color:var(--kl-muted)}
.pb-klar .kl-entry-actions{grid-area:actions;display:grid;gap:calc(var(--sys-space-s) * .75);margin-top:calc(var(--sys-space-s) * 1.75)}
.pb-klar .kl-entry-actions .kl-btn{width:100%;justify-content:space-between}
.pb-klar .kl-entry-actions .kl-btn--s{justify-content:center}
.pb-klar .kl-entry-media{grid-area:media;min-width:0;margin-top:calc(var(--sys-space-s) * 1.75)}

/* Doppelrahmen: helle Kante um das Foto */
.pb-klar .kl-frame{margin:0;padding:calc(var(--sys-space-xs) * .875);border-radius:${R_FRAME};background:color-mix(in srgb,var(--sys-surface) 55%,transparent);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sys-surface) 70%,transparent)}
.pb-klar .kl-frame-in{border-radius:calc(${R_FRAME} - var(--sys-space-xs) * .875);overflow:hidden;aspect-ratio:4/3}
.pb-klar .kl-frame img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}

/* photo: Heute-Karte überlappt die Unterkante */
.pb-klar .kl-stage{position:relative}
.pb-klar .kl-stage--card{margin-bottom:calc(var(--sys-space-l) * .85)}
.pb-klar .kl-todaycard{position:absolute;left:var(--sys-space-s);right:var(--sys-space-s);bottom:calc(var(--sys-space-l) * -.85);display:flex;align-items:center;gap:calc(var(--sys-space-s) * .75);
  padding:calc(var(--sys-space-s) * .75) calc(var(--sys-space-s) * .875);border-radius:var(--sys-space-s);background:var(--sys-surface);color:var(--sys-ink);box-shadow:${SHADOW}}
.pb-klar .kl-todaycard p{min-width:0}
.pb-klar .kl-todaycard-day{${step("small")};display:block;color:var(--sys-muted)}
.pb-klar .kl-todaycard b{${step("data")};display:block}
.pb-klar .kl-tile{flex:none;display:grid;place-items:center;width:${TAP};height:${TAP};border-radius:calc(var(--sys-space-s) * .75);background:var(--sys-field-1-bg);color:var(--sys-ink)}
.pb-klar .kl-tile--f2{background:var(--sys-field-2-bg);color:var(--sys-field-2-ink)}

/* small: kleines Hochformat neben der Zeiten-Karte */
.pb-klar .kl-duo{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1fr);gap:calc(var(--sys-space-s) * .625);align-items:stretch}
.pb-klar .kl-duo--solo{grid-template-columns:minmax(0,1fr);max-width:calc(var(--sys-space-2xl) * 2.5)}
.pb-klar .kl-duo .kl-frame{padding:calc(var(--sys-space-2xs) * 1.25);border-radius:calc(var(--sys-space-s) * 1.375)}
/* Hochformat 3:4 als Mindesthöhe (Polster in % der Breite); wird die
   Zeiten-Karte höher, wächst das Foto mit, statt breiter zu werden und sie
   zu überdecken (320 px, lange Tage) */
.pb-klar .kl-duo .kl-frame{height:100%}
.pb-klar .kl-duo .kl-frame-in{position:relative;aspect-ratio:auto;height:100%;border-radius:calc(var(--sys-space-s) * 1.0625)}
.pb-klar .kl-duo .kl-frame-in::before{content:"";display:block;padding-top:calc(400% / 3)}
.pb-klar .kl-duo .kl-frame-in img{position:absolute;inset:0}
.pb-klar .kl-side{display:grid;align-content:space-between;gap:calc(var(--sys-space-s) * .625);min-width:0;padding:var(--sys-space-s);border-radius:${R_CARD};background:var(--sys-surface);color:var(--sys-ink)}
.pb-klar .kl-side p{min-width:0;overflow-wrap:break-word}
.pb-klar .kl-side-days{${step("small")};display:block;color:var(--sys-muted)}
.pb-klar .kl-side-until{${step("h3")};display:block}
.pb-klar .kl-side-line{${step("data")};display:block}

/* hours: die Zeiten-Karte ist das Bild */
.pb-klar .kl-hours--entry{box-shadow:none}

/* Fakten-Chips und Bewertung (nur aus Daten) */
.pb-klar .kl-entry-facts{grid-area:facts;min-width:0;margin-top:calc(var(--sys-space-s) * 1.25)}
.pb-klar .kl-chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-xs)}
.pb-klar .kl-chip{${step("small")};font-weight:700;display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${TAP};max-width:100%;
  padding:calc(var(--sys-space-2xs) * .5) calc(var(--sys-space-s) * .875);border-radius:${PILL};background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 1px var(--sys-rule)}
.pb-klar .kl-chip .kl-ic{color:var(--sys-accent)}
.pb-klar .kl-rate{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:calc(var(--sys-space-s) * .625);margin-top:var(--sys-space-s)}
.pb-klar .kl-rate b{font-family:var(--sys-font-display);font-weight:var(--sys-figure-weight);letter-spacing:var(--sys-figure-track);line-height:1;font-size:calc(var(--sys-space-l) * 1.1)}
.pb-klar .kl-rate span{${step("small")};color:var(--kl-muted)}

@media (min-width:${GRID}){
  .pb-klar .kl-entry{padding:var(--sys-space-xs) var(--sys-space-m) 0}
  .pb-klar .kl-entry-panel{grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);grid-template-rows:auto auto 1fr;grid-template-areas:"text media" "actions media" "facts media";
    column-gap:calc(var(--sys-space-l) * 1.4);align-items:start;border-radius:${R_PANEL_WIDE};padding:calc(var(--sys-space-l) * 1.4) calc(var(--sys-space-l) * 1.4) calc(var(--sys-space-l) * 1.4) var(--sys-space-xl)}
  .pb-klar .kl-entry--text .kl-entry-panel{grid-template-columns:minmax(0,1fr);grid-template-rows:auto;grid-template-areas:"text" "actions" "facts"}
  .pb-klar .kl-display{max-width:9.5em;hyphens:manual}
  .pb-klar .kl-entry-actions{display:flex;flex-wrap:wrap}
  .pb-klar .kl-entry-actions .kl-btn{width:auto}
  .pb-klar .kl-entry-media{margin-top:0;align-self:center}
  .pb-klar .kl-frame-in{aspect-ratio:5/4.6}
  .pb-klar .kl-stage--card{margin-bottom:0}
  .pb-klar .kl-todaycard{left:auto;right:calc(var(--sys-space-l) * -.7);bottom:calc(var(--sys-space-l) * .9);width:calc(var(--sys-space-2xl) * 3.125);padding:calc(var(--sys-space-s) * .875) var(--sys-space-s)}
  .pb-klar .kl-duo{max-width:calc(var(--sys-space-2xl) * 5.5)}
  .pb-klar .kl-entry-facts{margin-top:var(--sys-space-l)}
  .pb-klar .kl-chip{background:color-mix(in srgb,var(--sys-surface) 70%,transparent);box-shadow:none}
  .pb-klar .kl-rate b{font-size:calc(var(--sys-space-l) * 1.5)}
}`;
