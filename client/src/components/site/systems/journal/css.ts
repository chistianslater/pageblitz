import { JOURNAL } from "../../../../../../shared/designSystems/journal";
import type { TypeStep } from "../../../../../../shared/designSystems/types";

const FONT_DIR = "/fonts/systems";

/** @font-face aus der Systemdefinition — eine Quelle für Dateien/Gewichte. */
const FONT_FACES = [JOURNAL.fonts.display, JOURNAL.fonts.text]
  .flatMap(font =>
    font.files.map(
      f =>
        `@font-face{font-family:"${font.family}";src:url(${FONT_DIR}/${f.file}) format("woff2");font-weight:${f.weight};font-style:${f.style};font-display:swap}`
    )
  )
  .join("\n");

/**
 * Vollständige Typo-Deklaration einer Stufe aus den System-Variablen. Die
 * Schriftfamilie folgt `type[step].font` (body = Serife, wie bei Aman).
 */
export function step(s: TypeStep): string {
  const family = JOURNAL.type[s].font;
  return [
    `font-family:var(--sys-font-${family})`,
    `font-size:var(--sys-${s}-size)`,
    `line-height:var(--sys-${s}-line)`,
    `letter-spacing:var(--sys-${s}-track)`,
    `font-weight:var(--sys-${s}-weight)`,
    `text-transform:var(--sys-${s}-transform)`,
  ].join(";");
}

/**
 * Fit-Klassen `jr-fit-7` … `jr-fit-20` für das längste Wort im Namen:
 * Schriftgröße, bei der ein Wort mit N Zeichen gerade in die Spalte passt.
 * NAME_EM_PER_CHAR ist die Breite eines Newsreader-Light-Kleinbuchstabens
 * in em (gemessen 2026-10-10: 0,39–0,49 je nach Wort; Versalien zählt
 * nameFitClasses 1,45-fach).
 */
export const FIT_MIN = 7;
export const FIT_MAX = 20;
const NAME_EM_PER_CHAR = 0.46;
const NAME_FIT = Array.from({ length: FIT_MAX - FIT_MIN + 1 }, (_, i) => {
  const n = FIT_MIN + i;
  return `.pb-journal .jr-fit-${n}{--jr-fit:calc((min(100vw,var(--sys-space-max)) - 2 * var(--sys-space-gutter)) / ${(n * NAME_EM_PER_CHAR).toFixed(2)})}`;
}).join("\n");

/**
 * Grundschicht von Journal (Kopf, Fuß, Kapitel, Textlink, Knopf). Gestalt
 * nach docs/designsysteme/journal/systemblatt.html. Größen, Abstände und
 * Farben ausschließlich über `--sys-*`; Ausnahmen: 1px-Haarlinien, das
 * helle Band (`--jr-raised`, Systemblatt: Papier 35 % mit Weiß) und
 * Bewegungskurven. Abschnitte (Task 8–11) hängen ihr CSS vor dem
 * Endmarker an.
 */
export const JOURNAL_CSS = `
${FONT_FACES}

.pb-journal{--jr-raised:color-mix(in srgb,var(--sys-paper) 35%,#fff);--jr-ease:cubic-bezier(.23,1,.32,1);
  background:var(--sys-paper);color:var(--sys-ink);${step("body")};
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal;font-variant-numeric:oldstyle-nums proportional-nums}
.pb-journal *{box-sizing:border-box}
.pb-journal h1,.pb-journal h2,.pb-journal h3{margin:0;text-wrap:balance;hyphens:manual}
.pb-journal p{margin:0;text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-journal address{font-style:normal}
.pb-journal a{color:inherit}
.pb-journal img{display:block;max-width:100%}
.pb-journal :focus-visible{outline:1px solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-journal .jr-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
.pb-journal .jr-kicker{${step("kicker")}}
.pb-journal .jr-mark{${step("mark")}}

/* Textlink (Aman): Linie darunter, zieht sich beim Zeigen zusammen */
.pb-journal .jr-link{${step("link")};text-decoration:none;display:inline-block;padding-bottom:var(--sys-space-2xs);position:relative}
.pb-journal .jr-link::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:currentColor;transform-origin:left;transition:transform 250ms var(--jr-ease)}
.pb-journal .jr-link:hover::after{transform:scaleX(.4)}
.pb-journal .jr-links{display:flex;flex-wrap:wrap;gap:var(--sys-space-m)}

/* Knopf (Klassenname jr-pill aus dem Plan; Gestalt laut Systemblatt eckig) */
.pb-journal .jr-pill{${step("link")};display:inline-flex;align-items:center;justify-content:center;text-decoration:none;
  background:var(--sys-deep);color:var(--sys-on-deep);border:1px solid var(--sys-deep);padding:var(--sys-space-s) var(--sys-space-m);
  transition:transform 120ms var(--jr-ease),background 200ms var(--jr-ease),border-color 200ms var(--jr-ease)}
.pb-journal .jr-pill:hover{background:color-mix(in srgb,var(--sys-deep) 86%,var(--sys-paper));border-color:color-mix(in srgb,var(--sys-deep) 86%,var(--sys-paper))}
.pb-journal .jr-pill:focus-visible{outline:1px solid var(--sys-deep);outline-offset:var(--sys-space-2xs)}
.pb-journal .jr-pill:active{transform:scale(.98)}

/* Kopf */
.pb-journal .jr-head{position:sticky;top:0;z-index:20;background:var(--sys-paper);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-head-bar{display:grid;grid-template-columns:1fr minmax(0,auto) 1fr;align-items:center;gap:var(--sys-space-s);
  padding:var(--sys-space-s) var(--sys-space-gutter);position:relative}
.pb-journal .jr-brand{${step("mark")};text-decoration:none;text-align:center;text-wrap:balance;min-width:0;overflow-wrap:anywhere}
@media (max-width:63.99rem){
  .pb-journal .jr-brand--long{font-size:calc(var(--sys-mark-size) * .875);letter-spacing:.12em}
  .pb-journal .jr-brand--xlong{text-transform:none;letter-spacing:.01em;line-height:1.15;hyphens:auto}
}
/* Sehr schmale Handys: „Menü" nur als Symbol, damit die Marke Platz hat */
@media (max-width:22.5rem){
  .pb-journal .jr-menu-label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
}
.pb-journal .jr-head-actions{justify-self:end;display:flex;align-items:center;gap:var(--sys-space-m)}
.pb-journal .jr-head-phone,.pb-journal .jr-head .jr-pill,.pb-journal .jr-nav{display:none}
.pb-journal .jr-menu{justify-self:start}
.pb-journal .jr-menu-toggle{${step("link")};list-style:none;cursor:pointer;display:flex;align-items:center;gap:var(--sys-space-xs);
  min-height:calc(var(--sys-space-l) + var(--sys-space-2xs))}
.pb-journal .jr-menu-toggle::-webkit-details-marker{display:none}
.pb-journal .jr-menu-icon{display:block;width:calc(var(--sys-space-s) + var(--sys-space-2xs));height:var(--sys-space-xs);border-top:1px solid currentColor;border-bottom:1px solid currentColor;
  transition:transform 250ms var(--jr-ease)}
.pb-journal .jr-menu[open] .jr-menu-icon{transform:scaleX(.6)}
.pb-journal .jr-menu-panel{position:absolute;left:0;right:0;top:100%;background:var(--sys-paper);border-bottom:1px solid var(--sys-rule);
  padding:var(--sys-space-m) var(--sys-space-gutter) var(--sys-space-l);display:grid}
.pb-journal .jr-menu-panel a{${step("h3")};text-decoration:none;padding-block:var(--sys-space-xs);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-menu-panel a[aria-current]{color:var(--sys-muted)}

@media (min-width:64rem){
  .pb-journal .jr-head-bar{padding-block:var(--sys-space-s)}
  .pb-journal .jr-brand{font-size:calc(var(--sys-mark-size) * 1.125)}
  .pb-journal .jr-head-call{display:none}
  .pb-journal .jr-head-phone,.pb-journal .jr-head .jr-pill{display:inline-flex}
  .pb-journal .jr-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:var(--sys-space-xs) var(--sys-space-l);padding:var(--sys-space-xs) var(--sys-space-gutter) var(--sys-space-s)}
  .pb-journal .jr-nav a{${step("link")};text-decoration:none;color:var(--sys-ink);transition:color 200ms}
  .pb-journal .jr-nav a:hover,.pb-journal .jr-nav a[aria-current]{color:var(--sys-muted)}
  .pb-journal .jr-nav .jr-nav-home{${step("kicker")}}
}

/* Kapitel: „02 LEISTUNGEN" über der Serifen-H2 */
.pb-journal .jr-section{padding-block:var(--sys-space-section)}
.pb-journal .jr-chapter{margin-bottom:var(--sys-space-l)}
.pb-journal .jr-chapter-label{margin-bottom:var(--sys-space-s)}
.pb-journal .jr-chapter-no{${step("body")};font-style:italic;letter-spacing:0;text-transform:none;color:var(--sys-accent);margin-right:var(--sys-space-xs)}
.pb-journal .jr-chapter h2{${step("h2")}}
.pb-journal .jr-chapter-intro{margin-top:var(--sys-space-m);max-width:var(--sys-space-measure)}

/* Fuß: helles Band */
.pb-journal .jr-foot{background:var(--jr-raised);border-top:1px solid var(--sys-rule);padding-block:var(--sys-space-xl) calc(var(--sys-space-2xl) + var(--sys-space-m))}
.pb-journal .jr-foot .jr-mark{margin-bottom:var(--sys-space-m)}
.pb-journal .jr-foot-contact{${step("small")};color:var(--sys-muted)}
.pb-journal .jr-foot-contact a{text-decoration:none}
.pb-journal .jr-foot-contact a:hover{text-decoration:underline}
.pb-journal .jr-foot .jr-links{margin-top:var(--sys-space-m)}
.pb-journal .jr-foot-legal{${step("small")};color:var(--sys-muted);margin-top:var(--sys-space-l);padding-top:var(--sys-space-m);border-top:1px solid var(--sys-rule);
  display:flex;justify-content:space-between;gap:var(--sys-space-m)}
.pb-journal .jr-foot-legal a{text-decoration:none}
.pb-journal .jr-foot-legal a:hover{text-decoration:underline}
@media (min-width:64rem){.pb-journal .jr-foot{padding-block:var(--sys-space-xl)}.pb-journal .jr-foot-legal{justify-content:flex-start;gap:var(--sys-space-l)}}
@media (prefers-reduced-motion:reduce){.pb-journal *,.pb-journal *::before,.pb-journal *::after{transition:none!important;animation:none!important}}
/* Einstieg (Systemblatt „Der Wow-Moment"): Kicker, Name als Buchtitel,
   eine kursive Zeile, Foto mit Abb. 1, Faktenzeilen. Ausnahme von den
   --sys-Größen: --jr-name-floor. Systemblatt nennt 3,25rem als Untergrenze; unter
   ~24rem Breite zerriss das Namen („Lind-ner"), daher 2,5rem: der Name
   bleibt ganz, Trennung nur als letzter Ausweg. */
.pb-journal .jr-entry{text-align:center;padding-top:calc(var(--sys-space-l) - var(--sys-space-2xs))}
.pb-journal .jr-entry-kicker{margin-bottom:calc(var(--sys-space-s) + var(--sys-space-2xs))}
.pb-journal .jr-entry h1{${step("display")};--jr-name-size:var(--sys-display-size);--jr-name-floor:2.5rem;
  font-size:max(var(--jr-name-floor),min(var(--jr-name-size),var(--jr-fit,var(--jr-name-size))));
  margin-inline:auto;text-wrap:balance;overflow-wrap:anywhere;hyphens:auto;hyphenate-limit-chars:10 5 5}
.pb-journal .jr-entry .jr-entry-name--long{--jr-name-size:calc(var(--sys-display-size) * .78)}
.pb-journal .jr-entry .jr-entry-name--xlong{--jr-name-size:calc(var(--sys-display-size) * .6);line-height:1}
${NAME_FIT}
.pb-journal .jr-entry-line{${step("lede")};font-style:italic;font-weight:300;margin:calc(var(--sys-space-m) - var(--sys-space-2xs)) auto 0;max-width:22ch;hyphens:manual}
.pb-journal .jr-entry-photo{margin:calc(var(--sys-space-l) - var(--sys-space-xs)) 0 0;text-align:left}
.pb-journal .jr-entry-photo img{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;background:var(--sys-rule)}
.pb-journal .jr-entry-photo figcaption{${step("small")};font-size:calc(var(--sys-small-size) * .93);color:var(--sys-muted);
  margin-top:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2);display:flex;justify-content:space-between;gap:var(--sys-space-m)}
.pb-journal .jr-entry-abb{font-style:italic;font-family:var(--sys-font-display);font-size:calc(var(--sys-small-size) * 1.07);letter-spacing:0;color:var(--sys-ink)}
.pb-journal .jr-entry-facts{margin-top:var(--sys-space-l);border-top:1px solid var(--sys-rule);text-align:left}
.pb-journal .jr-entry-fact{display:flex;justify-content:space-between;align-items:baseline;gap:var(--sys-space-m);padding-block:var(--sys-space-s);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-entry-fact>span:first-child{flex:0 0 auto;max-width:62%;hyphens:manual}
.pb-journal .jr-entry-fact-note{${step("small")};color:var(--sys-muted);text-align:right;min-width:0}
.pb-journal .jr-entry--type{padding-top:calc(var(--sys-space-xl) - var(--sys-space-s))}
.pb-journal .jr-entry--type h1{--jr-name-size:calc(var(--sys-display-size) * 1.22);line-height:.9}
.pb-journal .jr-entry--type .jr-entry-name--long{--jr-name-size:calc(var(--sys-display-size) * 1.22 * .78)}
.pb-journal .jr-entry--type .jr-entry-line{margin-top:var(--sys-space-m)}
.pb-journal .jr-entry--type .jr-entry-facts{margin-top:calc(var(--sys-space-xl) - var(--sys-space-s))}
.pb-journal .jr-entry-actions{margin-top:calc(var(--sys-space-l) - var(--sys-space-xs));display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:var(--sys-space-s) calc(var(--sys-space-m) + var(--sys-space-2xs))}
.pb-journal .jr-pill--ghost{background:transparent;color:var(--sys-ink);border-color:var(--sys-ink)}
.pb-journal .jr-pill--ghost:hover{background:color-mix(in srgb,var(--sys-ink) 6%,transparent);border-color:var(--sys-ink)}
@media (min-width:64rem){
  .pb-journal .jr-entry{padding-top:calc(var(--sys-space-xl) - var(--sys-space-xs))}
  .pb-journal .jr-entry-kicker{margin-bottom:calc(var(--sys-space-m) - var(--sys-space-2xs))}
  .pb-journal .jr-entry-photo{margin-top:calc(var(--sys-space-xl) - var(--sys-space-m) / 2)}
  .pb-journal .jr-entry-photo img{aspect-ratio:2.2/1}
  .pb-journal .jr-entry-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));column-gap:var(--sys-space-l);border-top:0;margin-top:var(--sys-space-m)}
  .pb-journal .jr-entry-fact{border-top:1px solid var(--sys-rule)}
  .pb-journal .jr-entry--type .jr-entry-facts{display:block;max-width:var(--sys-space-measure);margin-inline:auto;border-top:1px solid var(--sys-rule)}
  .pb-journal .jr-entry--type .jr-entry-fact{border-top:0}
  .pb-journal .jr-entry--type{padding-bottom:var(--sys-space-xl)}
}
/* Abschnitte: helles Band (Systemblatt: jedes zweite Kapitel), Abschnittslinks */
.pb-journal .jr-section--raised{background:var(--jr-raised)}
.pb-journal .jr-section-links{margin-top:calc(var(--sys-space-m) + var(--sys-space-2xs))}

/* Kapitelkopf links, Inhalt rechts (Leistungen, Preise, Speisekarte).
   Handy: Kopf, Liste, dann der Abschnittslink — wie im Systemblatt. */
.pb-journal .jr-split{display:flex;flex-direction:column}
.pb-journal .jr-split-head{display:contents}
.pb-journal .jr-split .jr-chapter{order:1}
.pb-journal .jr-split-body{order:2}
.pb-journal .jr-split .jr-section-links{order:3}

/* Preisliste (Systemblatt „Leistungen als Preisliste") */
.pb-journal .jr-rows{list-style:none;margin:0;padding:0;border-top:1px solid var(--sys-ink)}
.pb-journal .jr-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--sys-space-2xs) var(--sys-space-m);
  padding-block:calc(var(--sys-space-s) + var(--sys-space-2xs) / 2);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-row h3{${step("h3")};grid-column:1}
.pb-journal .jr-price{${step("body")};font-variant-numeric:oldstyle-nums tabular-nums;white-space:nowrap;align-self:baseline;grid-column:2;grid-row:1}
.pb-journal .jr-row p{${step("small")};color:var(--sys-muted);grid-column:1/-1;max-width:calc(var(--sys-space-measure) * .42)}
.pb-journal .jr-group{color:var(--sys-muted);padding-bottom:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2);border-bottom:1px solid var(--sys-ink)}
.pb-journal .jr-group + .jr-rows{border-top:0}
.pb-journal .jr-group-block + .jr-group-block{margin-top:calc(var(--sys-space-l) - var(--sys-space-xs))}

/* Ablauf: große, leichte Ziffern in Akzentfarbe, Haarlinien */
.pb-journal .jr-steps{list-style:none;margin:0;padding:0}
.pb-journal .jr-step{display:grid;align-content:start;grid-template-columns:calc(var(--sys-space-xl) - var(--sys-space-s) / 2) minmax(0,1fr);column-gap:var(--sys-space-xs);
  padding-block:var(--sys-space-m);border-top:1px solid var(--sys-rule)}
.pb-journal .jr-step:last-child{border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-step-no{font-family:var(--sys-font-display);font-weight:300;font-size:calc(var(--sys-space-xl) * .6875);line-height:var(--sys-display-line);
  color:var(--sys-accent);font-variant-numeric:oldstyle-nums}
.pb-journal .jr-step h3{${step("h3")};margin-bottom:calc(var(--sys-space-2xs) * 1.5)}
.pb-journal .jr-step p{max-width:var(--sys-space-measure)}

/* Team: Porträts 4:5, Name in h3, Rolle als Kicker */
.pb-journal .jr-team-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sys-space-l) var(--sys-space-s)}
.pb-journal .jr-team-grid figure{margin:0}
.pb-journal .jr-team-grid img{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;background:var(--sys-rule)}
.pb-journal .jr-team-grid figcaption{margin-top:var(--sys-space-s);display:grid;gap:var(--sys-space-2xs)}
.pb-journal .jr-team-grid h3{${step("h3")}}
.pb-journal .jr-team-grid .jr-kicker{color:var(--sys-muted)}

/* Platzhalter: nur in der Vorschau, gestrichelte Haarlinie */
.pb-journal .jr-slot-section{padding-block:var(--sys-space-xl)}
.pb-journal .jr-slot{margin-top:var(--sys-space-l);border:1px dashed color-mix(in srgb,var(--sys-ink) 32%,transparent);
  background:color-mix(in srgb,var(--sys-accent) 4%,transparent);padding:var(--sys-space-l) var(--sys-space-m);display:grid;gap:var(--sys-space-m)}
.pb-journal .jr-slot-section .jr-slot{margin-top:0}
.pb-journal .jr-slot-copy{display:grid;gap:var(--sys-space-xs)}
.pb-journal .jr-slot .jr-kicker{color:var(--sys-accent)}
.pb-journal .jr-slot h3{${step("h3")}}
.pb-journal .jr-slot-copy p:not(.jr-kicker){${step("small")};color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-journal .jr-slot-faces{display:flex;gap:var(--sys-space-s)}
.pb-journal .jr-slot-faces i{flex:0 1 calc(var(--sys-space-2xl) * .9);aspect-ratio:4/5;border:1px dashed color-mix(in srgb,var(--sys-ink) 28%,transparent);
  background:color-mix(in srgb,var(--sys-paper) 70%,transparent)}

@media (min-width:48rem){
  .pb-journal .jr-team-grid{grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--sys-space-m)}
  .pb-journal .jr-slot{grid-template-columns:minmax(0,1fr) auto;align-items:center;padding:var(--sys-space-l)}
}
@media (min-width:64rem){
  .pb-journal .jr-split{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m);align-items:start}
  .pb-journal .jr-split-head{display:block;grid-column:1/5;position:sticky;top:calc(var(--sys-space-2xl) + var(--sys-space-l))}
  .pb-journal .jr-split .jr-chapter{margin-bottom:0}
  .pb-journal .jr-split-body{grid-column:6/13}
  .pb-journal .jr-rows--flat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:calc(var(--sys-space-l) + var(--sys-space-xs));border-top:0}
  .pb-journal .jr-rows--flat .jr-row:nth-child(-n+2){border-top:1px solid var(--sys-ink)}
  .pb-journal .jr-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:calc(var(--sys-space-l) + var(--sys-space-xs));row-gap:var(--sys-space-xl);align-items:start}
  .pb-journal .jr-group-block + .jr-group-block{margin-top:0}
  .pb-journal .jr-steps{display:grid;grid-template-columns:repeat(var(--jr-steps,3),minmax(0,1fr));column-gap:var(--sys-space-l)}
  .pb-journal .jr-steps[data-count="2"]{--jr-steps:2}
  .pb-journal .jr-steps[data-count="4"]{--jr-steps:4}
  .pb-journal .jr-steps[data-count="5"]{--jr-steps:5}
  .pb-journal .jr-step{grid-template-columns:minmax(0,1fr);row-gap:var(--sys-space-s);padding-top:var(--sys-space-m)}
  .pb-journal .jr-step:last-child{border-bottom:0}
  .pb-journal .jr-step-no{font-size:var(--sys-h2-size)}
}
/* Hilfen: nur für Screenreader; Bildunterschrift „Abb. n" wie im Einstieg */
.pb-journal .jr-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.pb-journal .jr-figcap{${step("small")};font-size:calc(var(--sys-small-size) * .93);color:var(--sys-muted);
  margin-top:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2);display:flex;justify-content:space-between;gap:var(--sys-space-m)}
.pb-journal .jr-abb{font-style:italic;font-family:var(--sys-font-display);font-size:calc(var(--sys-small-size) * 1.07);letter-spacing:0;color:var(--sys-ink)}

/* Über uns: Kapitel, Hochformat mit Abb., Fließtext */
.pb-journal .jr-about-photo{margin:var(--sys-space-xs) 0 calc(var(--sys-space-l) - var(--sys-space-2xs))}
.pb-journal .jr-about-photo img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;background:var(--sys-rule)}
.pb-journal .jr-about-body{max-width:var(--sys-space-measure)}
.pb-journal .jr-about-body p+p{margin-top:var(--sys-space-s)}
.pb-journal .jr-about-body .jr-about-lede{${step("lede")};margin-bottom:var(--sys-space-m)}
.pb-journal .jr-about-body .jr-section-links{margin-top:calc(var(--sys-space-m) + var(--sys-space-2xs))}

/* Einblicke: Wischstreifen gemischter Formate (Aman), vertikal mittig */
.pb-journal .jr-gallery{padding-bottom:calc(var(--sys-space-section) * .75)}
.pb-journal .jr-strip{display:flex;gap:calc(var(--sys-space-s) - var(--sys-space-2xs) / 2);align-items:center;overflow-x:auto;overscroll-behavior-x:contain;
  scroll-snap-type:x mandatory;padding-inline:var(--sys-space-gutter);scroll-padding-inline:var(--sys-space-gutter);scrollbar-width:none}
.pb-journal .jr-strip::-webkit-scrollbar{display:none}
.pb-journal .jr-strip figure{flex:0 0 auto;margin:0;scroll-snap-align:start;position:relative}
.pb-journal .jr-strip img{width:100%;height:auto;object-fit:cover;background:var(--sys-rule)}
.pb-journal .jr-strip figure:nth-child(3n+1){width:62%}
.pb-journal .jr-strip figure:nth-child(3n+1) img{aspect-ratio:3/4}
.pb-journal .jr-strip figure:nth-child(3n+2){width:48%}
.pb-journal .jr-strip figure:nth-child(3n+2) img{aspect-ratio:1/1}
.pb-journal .jr-strip figure:nth-child(3n) {width:74%}
.pb-journal .jr-strip figure:nth-child(3n) img{aspect-ratio:1.618/1}
.pb-journal .jr-strip[data-count="1"] figure{width:100%}
.pb-journal .jr-strip[data-count="1"] img{aspect-ratio:3/2}
.pb-journal .jr-strip:focus-visible{outline-offset:calc(var(--sys-space-2xs) * -1)}
/* Handy: eine Zeile „Abb. 3 bis 7 Wischen für mehr" statt Unterschrift je Bild */
.pb-journal .jr-strip .jr-figcap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.pb-journal .jr-strip-note{margin-top:var(--sys-space-m);padding-top:var(--sys-space-s);border-top:1px solid var(--sys-rule)}

/* Stimmen: zentriert, eine große kursive Stimme */
.pb-journal .jr-reviews{text-align:center}
.pb-journal .jr-reviews .jr-chapter-label{margin-bottom:0}
.pb-journal .jr-quote-figure{margin:calc(var(--sys-space-m) - var(--sys-space-2xs)) 0 0}
.pb-journal .jr-stars{${step("small")};letter-spacing:calc(var(--sys-kicker-track) * 1.5);color:var(--sys-accent);margin-bottom:calc(var(--sys-space-m) - var(--sys-space-2xs))}
.pb-journal .jr-quote{margin:0}
.pb-journal .jr-quote p{${step("lede")};font-style:italic;font-weight:300;hyphens:manual;text-wrap:balance;max-width:calc(var(--sys-space-measure) * .45);margin-inline:auto}
.pb-journal .jr-quote-figure figcaption{margin-top:var(--sys-space-m);display:grid;gap:var(--sys-space-2xs);justify-items:center}
.pb-journal .jr-quote-source{${step("small")};color:var(--sys-muted)}

@media (min-width:64rem){
  .pb-journal .jr-about-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:auto 1fr;column-gap:var(--sys-space-m)}
  .pb-journal .jr-about-grid>.jr-chapter{grid-column:7/13;grid-row:1;align-self:end}
  .pb-journal .jr-about-photo{grid-column:1/6;grid-row:1/3;margin:0}
  .pb-journal .jr-about-photo img{aspect-ratio:4/5}
  .pb-journal .jr-about-body{grid-column:7/12;grid-row:2}
  .pb-journal .jr-about--text .jr-about-grid>.jr-chapter{grid-column:1/5;grid-row:1/3;align-self:start}
  .pb-journal .jr-about--text .jr-about-body{grid-column:6/12;grid-row:1/3}
  .pb-journal .jr-strip{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--sys-space-xl) var(--sys-space-m);align-items:end;
    overflow:visible;max-width:var(--sys-space-max);margin-inline:auto;scroll-snap-type:none}
  .pb-journal .jr-strip figure{width:auto!important}
  .pb-journal .jr-strip figure:nth-child(4n+1){grid-column:1/8}
  .pb-journal .jr-strip figure:nth-child(4n+1) img{aspect-ratio:3/2}
  .pb-journal .jr-strip figure:nth-child(4n+2){grid-column:8/13}
  .pb-journal .jr-strip figure:nth-child(4n+2) img{aspect-ratio:4/5}
  .pb-journal .jr-strip figure:nth-child(4n+3){grid-column:1/6}
  .pb-journal .jr-strip figure:nth-child(4n+3) img{aspect-ratio:4/5}
  .pb-journal .jr-strip figure:nth-child(4n){grid-column:6/13}
  .pb-journal .jr-strip figure:nth-child(4n) img{aspect-ratio:3/2}
  .pb-journal .jr-strip figure:last-child:nth-child(odd){grid-column:1/13}
  .pb-journal .jr-strip figure:last-child:nth-child(odd) img{aspect-ratio:2.2/1}
  .pb-journal .jr-strip .jr-figcap{position:static;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal}
  .pb-journal .jr-strip-note{display:none}
  .pb-journal .jr-quote p{font-size:calc(var(--sys-h2-size) * .72);max-width:calc(var(--sys-space-measure) * .75)}
}
/* ende journal */
`;
