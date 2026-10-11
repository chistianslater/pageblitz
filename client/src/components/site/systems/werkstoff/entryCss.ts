import { DOCK, GRID, step } from "./step";

/** Ab hier reicht die Textspalte für den vollen Zettel-Überstand (Systemblatt 1440). */
const WIDE = "80rem";

/**
 * Einstieg, Werkzettel, Handy-Leiste (Systemblatt 8 und 14). Nur Tokens
 * (oder Vielfache); Maße des Systemblatts als Vielfache der Abstände:
 * Zettel 318 px ≈ 3,3 × 2xl, Desktop 360 px = 3,75 × 2xl, 150 px über die
 * Bildkante ≈ 1,6 × 2xl. Der Zettel hängt am Handy um 1,4 × 2xl ins Foto.
 */
const ENTRY = `/* Einstieg: photo · portrait · time · type */
.pb-werkstoff .ws-entry{padding-top:var(--sys-space-m)}
.pb-werkstoff .ws-entry-text{padding-inline:var(--sys-space-gutter);container-type:inline-size;min-width:0}
.pb-werkstoff .ws-entry-kicker{${step("kicker")};color:var(--sys-muted)}
.pb-werkstoff .ws-entry-name{display:inline;font:inherit;letter-spacing:inherit;color:inherit}
.pb-werkstoff .ws-entry-head{${step("display")};margin-top:var(--sys-space-s);max-width:13ch;hyphens:manual}
.pb-werkstoff .ws-entry-lede{${step("lede")};margin-top:var(--sys-space-m);max-width:30ch}
.pb-werkstoff .ws-entry-actions{display:none}
.pb-werkstoff .ws-entry-media{position:relative;margin-top:var(--sys-space-l);min-width:0}
.pb-werkstoff .ws-entry-crop{aspect-ratio:390/320;overflow:hidden;background:var(--sys-rule)}
.pb-werkstoff .ws-entry-img{width:100%;height:100%;max-width:none;object-fit:cover;filter:var(--sys-image-filter)}
.pb-werkstoff .ws-entry-media .ws-slip{position:relative;z-index:1;margin:calc(var(--sys-space-2xl) * -1.4) var(--sys-space-gutter) 0 auto;
  width:min(calc(var(--sys-space-2xl) * 3.3125),calc(100% - 2 * var(--sys-space-gutter)))}
.pb-werkstoff .ws-entry-info{${step("small")};font-weight:500;list-style:none;display:flex;flex-wrap:wrap;gap:var(--sys-space-2xs) calc(var(--sys-space-m) - var(--sys-space-2xs));
  margin:var(--sys-space-l) var(--sys-space-gutter) 0;padding:var(--sys-space-s) 0 0;border-top:1px solid var(--sys-rule)}

/* portrait: Hochformat ruhiger, Zettel darunter angesetzt */
.pb-werkstoff .ws-entry--portrait .ws-entry-crop{aspect-ratio:1/1}

/* time: frühe Öffnung als Ziffer (Bäckerei, Café) */
.pb-werkstoff .ws-entry-figure{${step("figure")};color:var(--sys-accent);font-variant-numeric:tabular-nums;margin:var(--sys-space-m) 0 var(--sys-space-s) -.04em}
.pb-werkstoff .ws-entry--time .ws-entry-head{${step("h2")};max-width:14ch;margin-top:0}
.pb-werkstoff .ws-entry-today{${step("small")};font-weight:600;display:flex;align-items:center;gap:var(--sys-space-xs);margin-top:var(--sys-space-m)}
.pb-werkstoff .ws-dot{flex:none;width:var(--sys-space-xs);height:var(--sys-space-xs);border-radius:50%;background:var(--sys-signal);
  box-shadow:0 0 0 calc(var(--sys-space-2xs) * .75) color-mix(in srgb,var(--sys-signal) 18%,transparent)}
.pb-werkstoff .ws-entry--time .ws-entry-crop{aspect-ratio:390/300}

/* type: Name füllt die Breite (--ws-fit aus fit.ts), Zettel trägt */
.pb-werkstoff .ws-entry--type{padding-top:var(--sys-space-xl)}
.pb-werkstoff .ws-entry-fit{${step("display")};margin-top:var(--sys-space-s);overflow-wrap:break-word}
.pb-werkstoff .ws-entry-fit span{display:block}
@supports (font-size:1cqi){
  .pb-werkstoff .ws-entry-fit{font-size:clamp(var(--sys-h2-size),calc(100cqi / var(--ws-fit)),var(--sys-figure-size))}
}
.pb-werkstoff .ws-entry--type .ws-entry-media,.pb-werkstoff .ws-entry--time .ws-entry-media>.ws-slip{margin-inline:var(--sys-space-gutter)}
.pb-werkstoff .ws-entry--type .ws-entry-media .ws-slip,.pb-werkstoff .ws-entry--time .ws-entry-media>.ws-slip{margin:0;width:auto}

/* Ab der Leisten-Grenze stehen die Wege im Einstieg (darunter trägt die Leiste) */
@media (min-width:${DOCK}){
  .pb-werkstoff .ws-entry-actions{display:flex;flex-wrap:wrap;gap:calc(var(--sys-space-xs) * 1.25);margin-top:var(--sys-space-l)}
  /* Tablet (eine Spalte): flacheres Foto, damit der Zettel im ersten Blick bleibt */
  .pb-werkstoff .ws-entry-crop,.pb-werkstoff .ws-entry--portrait .ws-entry-crop,.pb-werkstoff .ws-entry--time .ws-entry-crop{aspect-ratio:16/9}
}

@media (min-width:${GRID}){
  .pb-werkstoff .ws-entry{padding-top:var(--sys-space-l)}
  .pb-werkstoff .ws-entry-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m);
    max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
  .pb-werkstoff .ws-entry-text{grid-column:1/7;grid-row:1;align-self:end;padding:0 0 var(--sys-space-2xl)}
  .pb-werkstoff .ws-entry-lede{max-width:28ch}
  /* Foto oben bündig: der Zettel hängt an der Bildfläche, nicht an der gestreckten Zeile */
  .pb-werkstoff .ws-entry-media{grid-column:7/13;grid-row:1;margin:0;align-self:start}
  .pb-werkstoff .ws-entry-crop{aspect-ratio:1/1;max-height:calc(100svh - var(--sys-space-2xl) * 1.75)}
  /* Schmale Desktops: kleiner Überstand, damit der Zettel die Knöpfe nie überdeckt */
  .pb-werkstoff .ws-entry-media .ws-slip{position:absolute;margin:0;left:calc(var(--sys-space-l) * -1);bottom:calc(var(--sys-space-l) * 1.1);
    width:min(calc(var(--sys-space-2xl) * 3.75),calc(100% + var(--sys-space-l) - var(--sys-space-m)))}
  .pb-werkstoff .ws-entry-info{grid-column:1/-1;margin:var(--sys-space-l) 0 0;gap:var(--sys-space-2xs) var(--sys-space-l)}
  .pb-werkstoff .ws-entry--portrait .ws-entry-media{grid-column:8/13}
  .pb-werkstoff .ws-entry--portrait .ws-entry-crop{aspect-ratio:4/5}
  .pb-werkstoff .ws-entry--time .ws-entry-crop{aspect-ratio:5/4}
  .pb-werkstoff .ws-entry--type .ws-entry-text{grid-column:1/9;align-self:start;padding-bottom:0}
  .pb-werkstoff .ws-entry--type .ws-entry-media,.pb-werkstoff .ws-entry--time .ws-entry-media:has(>.ws-slip){grid-column:9/13;align-self:end;margin:0}
  .pb-werkstoff .ws-entry--type .ws-entry-media .ws-slip,.pb-werkstoff .ws-entry--time .ws-entry-media>.ws-slip{position:static;width:auto}
}
@media (min-width:${WIDE}){
  .pb-werkstoff .ws-entry--photo .ws-entry-media .ws-slip,.pb-werkstoff .ws-entry--portrait .ws-entry-media .ws-slip{left:calc(var(--sys-space-2xl) * -1.6);width:calc(var(--sys-space-2xl) * 3.75)}
}`;

/** Werkzettel: helles Papier, Tinte-Rahmen, Mono, Leiste in Signal. */
const SLIP = `/* Werkzettel */
.pb-werkstoff .ws-slip{background:var(--ws-raised);color:var(--sys-ink);border:1px solid var(--sys-ink);${step("data")};font-variant-numeric:tabular-nums;
  box-shadow:0 var(--sys-space-m) var(--sys-space-l) calc(var(--sys-space-m) * -1) color-mix(in srgb,var(--sys-deep) 55%,transparent)}
.pb-werkstoff .ws-slip-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:var(--sys-space-2xs) var(--sys-space-s);
  padding:var(--sys-space-xs) calc(var(--sys-space-s) * .75);border-bottom:1px solid var(--sys-rule);overflow-wrap:anywhere}
.pb-werkstoff .ws-slip-row:last-child{border-bottom:0}
.pb-werkstoff .ws-slip-who{display:grid;min-width:0}
.pb-werkstoff .ws-slip-trade{color:var(--sys-muted)}
.pb-werkstoff .ws-slip-phone{white-space:nowrap}
.pb-werkstoff .ws-slip-big{font-size:calc(var(--sys-data-size) * 1.62);letter-spacing:.01em;padding-top:calc(var(--sys-space-s) * .75)}
.pb-werkstoff .ws-slip-side{font-size:var(--sys-data-size);letter-spacing:var(--sys-data-track)}
.pb-werkstoff .ws-slip-bar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:var(--sys-space-2xs) var(--sys-space-s);
  min-height:var(--ws-tap);padding:var(--sys-space-2xs) calc(var(--sys-space-s) * .75);margin:0;border-top:2px dashed var(--sys-muted);
  background:var(--sys-signal);color:var(--sys-on-signal);text-decoration:none}
.pb-werkstoff a.ws-slip-bar:active{background:color-mix(in srgb,var(--sys-signal) 88%,var(--sys-ink))}
.pb-werkstoff a.ws-slip-bar:focus-visible{outline-color:var(--sys-ink);outline-offset:var(--ws-focus)}
.pb-werkstoff .ws-slip-status{display:inline-flex;align-items:center;gap:var(--sys-space-xs);margin-inline-start:auto}
.pb-werkstoff .ws-slip-status::before{content:"";width:calc(var(--sys-space-xs) - 1px);height:calc(var(--sys-space-xs) - 1px);border-radius:50%;background:currentColor}`;

/** Handy-Leiste: Signal + Kontur, leicht durchscheinend, Haarlinie oben. */
const DOCK_CSS = `/* Handy-Leiste (unter ${DOCK}) */
.pb-werkstoff .ws-dock{display:none}
@media (max-width:47.99rem){
  .pb-werkstoff{--ws-dock:calc(var(--sys-space-xl) * .75 + var(--sys-space-xs) * 2.75 + 1px)}
  .pb-werkstoff:has(.ws-dock) .ws-foot{padding-bottom:calc(var(--ws-dock) + env(safe-area-inset-bottom,0rem))}
  .pb-werkstoff:has(.ws-dock):has(.pb-photo-credits) .ws-foot{padding-bottom:0}
  .pb-werkstoff:has(.ws-dock) .pb-photo-credits{padding-bottom:calc(var(--sys-space-l) + var(--ws-dock) + env(safe-area-inset-bottom,0rem))}
  .pb-werkstoff .ws-dock{position:fixed;inset-inline:0;bottom:0;z-index:30;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:calc(var(--sys-space-xs) * 1.25);
    padding:calc(var(--sys-space-xs) * 1.25) var(--sys-space-gutter) calc(var(--sys-space-xs) * 1.5 + env(safe-area-inset-bottom,0rem));
    background:color-mix(in srgb,var(--sys-paper) 92%,transparent);-webkit-backdrop-filter:blur(var(--sys-space-xs));backdrop-filter:blur(var(--sys-space-xs));
    border-top:1px solid var(--sys-rule)}
  .pb-werkstoff .ws-dock--one{grid-template-columns:minmax(0,1fr)}
  .pb-werkstoff .ws-dock .ws-btn,.pb-werkstoff .ws-dock .ws-btn2{min-height:calc(var(--sys-space-xl) * .75);min-width:0}
  .pb-werkstoff .ws-dock .ws-btn2{background:var(--sys-paper)}
}`;

export const ENTRY_CSS = [ENTRY, SLIP, DOCK_CSS].join("\n\n");
