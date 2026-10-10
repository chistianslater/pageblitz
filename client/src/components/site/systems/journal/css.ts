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
  /* Fokusring 2 px (WCAG 2.4.13); Trefferfläche: Textlinks wachsen unsichtbar auf ≥ 44 px Höhe */
  --jr-focus:2px;--jr-hit:calc(var(--sys-space-s) * -.75);
  /* Kopfmarke Desktop = 18 px (Systemblatt „Kopf“: Marke eine Stufe über mark) */
  --jr-brand-desk:calc(var(--sys-mark-size) * 1.125);
  background:var(--sys-paper);color:var(--sys-ink);${step("body")};
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal;font-variant-numeric:oldstyle-nums proportional-nums}
.pb-journal *{box-sizing:border-box}
.pb-journal h1,.pb-journal h2,.pb-journal h3{margin:0;text-wrap:balance;hyphens:manual}
.pb-journal p{margin:0;text-wrap:pretty;hyphens:auto;hyphenate-limit-chars:7 3 3}
.pb-journal address{font-style:normal}
.pb-journal a{color:inherit}
.pb-journal img{display:block;max-width:100%}
.pb-journal :focus-visible{outline:var(--jr-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-journal .jr-wrap{max-width:var(--sys-space-max);margin-inline:auto;padding-inline:var(--sys-space-gutter)}
.pb-journal .jr-kicker{${step("kicker")}}
.pb-journal .jr-mark{${step("mark")}}

/* Textlink (Aman): Linie darunter, zieht sich beim Zeigen zusammen */
.pb-journal .jr-link{${step("link")};text-decoration:none;display:inline-block;padding-bottom:var(--sys-space-2xs);position:relative}
.pb-journal .jr-link::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:currentColor;transform-origin:left;transition:transform 250ms var(--jr-ease)}
.pb-journal .jr-link:hover::after{transform:scaleX(.4)}
.pb-journal .jr-link::before,.pb-journal .jr-foot-contact a::before,.pb-journal .jr-foot-legal a::before{content:"";position:absolute;inset:var(--jr-hit) calc(var(--sys-space-2xs) * -1)}
.pb-journal .jr-foot-contact a,.pb-journal .jr-foot-legal a{position:relative}
.pb-journal .jr-links{display:flex;flex-wrap:wrap;gap:var(--sys-space-m)}

/* Knopf (Klassenname jr-pill aus dem Plan; Gestalt laut Systemblatt eckig) */
.pb-journal .jr-pill{${step("link")};display:inline-flex;align-items:center;justify-content:center;text-decoration:none;
  background:var(--sys-deep);color:var(--sys-on-deep);border:1px solid var(--sys-deep);padding:var(--sys-space-s) var(--sys-space-m);
  transition:transform 120ms var(--jr-ease),background 200ms var(--jr-ease),border-color 200ms var(--jr-ease)}
.pb-journal .jr-pill:hover{background:color-mix(in srgb,var(--sys-deep) 86%,var(--sys-paper));border-color:color-mix(in srgb,var(--sys-deep) 86%,var(--sys-paper))}
.pb-journal .jr-pill:focus-visible{outline:var(--jr-focus) solid var(--sys-deep);outline-offset:var(--sys-space-2xs)}
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
.pb-journal .jr-menu-panel a{${step("h3")};text-decoration:none;padding-block:var(--sys-space-xs);display:flex;align-items:center;min-height:calc(var(--sys-space-l) + var(--sys-space-2xs));border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-menu-panel a[aria-current]{color:var(--sys-muted)}

@media (min-width:64rem){
  .pb-journal .jr-head-bar{padding-block:var(--sys-space-s)}
  .pb-journal .jr-brand{font-size:var(--jr-brand-desk)}
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
.pb-journal .jr-foot{background:var(--jr-raised);border-top:1px solid var(--sys-rule);padding-block:var(--sys-space-xl)}
.pb-journal .jr-foot .jr-mark{margin-bottom:var(--sys-space-m)}
.pb-journal .jr-foot-contact{${step("small")};color:var(--sys-muted)}
.pb-journal .jr-foot-contact a{text-decoration:none}
.pb-journal .jr-foot-contact a:hover{text-decoration:underline}
.pb-journal .jr-foot .jr-links{margin-top:var(--sys-space-m)}
.pb-journal .jr-foot-legal{${step("small")};color:var(--sys-muted);margin-top:var(--sys-space-l);padding-top:var(--sys-space-m);border-top:1px solid var(--sys-rule);
  display:flex;justify-content:space-between;gap:var(--sys-space-m)}
.pb-journal .jr-foot-legal a{text-decoration:none}
.pb-journal .jr-foot-legal a:hover{text-decoration:underline}
@media (min-width:64rem){.pb-journal .jr-foot-legal{justify-content:flex-start;gap:var(--sys-space-l)}}
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
/* Gut zu wissen (Systemblatt): Fragen in h3-Größe, Haarlinien, Plus wird Minus */
.pb-journal .jr-faq-list{border-top:1px solid var(--sys-ink)}
.pb-journal .jr-faq-item{border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-faq-item summary{display:grid;grid-template-columns:minmax(0,1fr) var(--sys-space-m);gap:var(--sys-space-s);align-items:start;
  padding-block:calc(var(--sys-space-s) + var(--sys-space-2xs));cursor:pointer;list-style:none}
.pb-journal .jr-faq-item summary::-webkit-details-marker{display:none}
.pb-journal .jr-faq-item summary:focus-visible{outline:var(--jr-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
.pb-journal .jr-faq-q{${step("h3")};transition:color 200ms var(--jr-ease)}
.pb-journal .jr-faq-item summary:hover .jr-faq-q{color:var(--sys-muted)}
.pb-journal .jr-faq-sign{position:relative;justify-self:end;width:var(--sys-space-s);height:calc(var(--sys-h3-size) * var(--sys-h3-line))}
.pb-journal .jr-faq-sign::before,.pb-journal .jr-faq-sign::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:currentColor;transition:transform 250ms var(--jr-ease)}
.pb-journal .jr-faq-sign::after{transform:rotate(90deg)}
.pb-journal .jr-faq-item[open] .jr-faq-sign::after{transform:rotate(0)}
.pb-journal .jr-faq-a{padding:0 calc(var(--sys-space-m) + var(--sys-space-s)) calc(var(--sys-space-m) - var(--sys-space-2xs)) 0}
.pb-journal .jr-faq-a p{max-width:var(--sys-space-measure)}

/* Besuch (Aman „Getting here"): Handy zentriert — Name und Adresse,
   Zeiten mit „heute", Karten-Fläche, Textlinks. Ab 64rem Kopf, Adresse
   und Zeiten links, Karte rechts. */
.pb-journal .jr-contact{text-align:center}
.pb-journal .jr-contact-grid{display:flex;flex-direction:column;max-width:var(--sys-space-measure);margin-inline:auto}
.pb-journal .jr-contact-main{display:contents}
.pb-journal .jr-contact-address{display:grid;justify-items:center;order:1}
.pb-journal .jr-contact-area{${step("small")};color:var(--sys-muted);margin-top:var(--sys-space-s);order:2}
.pb-journal .jr-hours{order:3;margin-top:calc(var(--sys-space-l) - var(--sys-space-xs));text-align:left}
.pb-journal .jr-hours-title{color:var(--sys-muted);margin-bottom:var(--sys-space-s)}
.pb-journal .jr-hours dl{margin:0;border-top:1px solid var(--sys-rule)}
.pb-journal .jr-hours-row{display:flex;justify-content:space-between;align-items:baseline;gap:var(--sys-space-m);
  padding-block:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2);border-bottom:1px solid var(--sys-rule);font-variant-numeric:oldstyle-nums tabular-nums}
.pb-journal .jr-hours dd{margin:0;text-align:right}
.pb-journal .jr-hours-closed{color:var(--sys-muted)}
.pb-journal .jr-hours-row[data-today]{font-weight:500}
.pb-journal .jr-today{${step("kicker")};font-style:normal;color:var(--sys-accent);margin-left:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2)}
.pb-journal .jr-contact-map{order:4;margin-top:var(--sys-space-l)}
.pb-journal .jr-map{display:block;position:relative;aspect-ratio:1.618/1;background-color:var(--jr-raised);background-image:
  linear-gradient(var(--sys-rule),var(--sys-rule)),linear-gradient(var(--sys-rule),var(--sys-rule)),
  linear-gradient(90deg,var(--sys-rule),var(--sys-rule)),linear-gradient(90deg,var(--sys-rule),var(--sys-rule));
  background-size:100% 1px,100% 1px,1px 100%,1px 100%;background-position:0 38%,0 71%,33% 0,77% 0;background-repeat:no-repeat}
.pb-journal .jr-section--raised .jr-map{background-color:var(--sys-paper)}
.pb-journal .jr-map-dot{position:absolute;left:52%;top:46%;width:calc(var(--sys-space-s) * .8);aspect-ratio:1;border-radius:50%;background:var(--sys-ink);
  box-shadow:0 0 0 calc(var(--sys-space-2xs) * 1.5) color-mix(in srgb,var(--sys-ink) 12%,transparent);transition:transform 300ms var(--jr-ease)}
.pb-journal .jr-map:hover .jr-map-dot{transform:scale(1.25)}
.pb-journal .jr-contact-cta{order:5;margin-top:var(--sys-space-l)}
.pb-journal .jr-contact-links{order:6;justify-content:center;gap:var(--sys-space-s) var(--sys-space-m);margin-top:calc(var(--sys-space-m) + var(--sys-space-2xs))}
.pb-journal .jr-contact-form{color:var(--sys-muted);margin-top:var(--sys-space-xl);padding-top:var(--sys-space-l);border-top:1px solid var(--sys-rule)}
/* Kontakt-Insel (bestehendes Formular), von der Hydration an #kontakt gehängt */
.pb-journal .jr-contact>.pb-island{max-width:calc(var(--sys-space-measure) + 2 * var(--sys-space-gutter));margin:var(--sys-space-m) auto 0;padding-inline:var(--sys-space-gutter);text-align:left}
.pb-journal .pb-island-form{max-width:none;gap:var(--sys-space-m)}
.pb-journal .pb-island-form label{${step("kicker")};color:var(--sys-muted);gap:var(--sys-space-xs)}
.pb-journal .pb-island-form input,.pb-journal .pb-island-form textarea{${step("body")};border:0;border-bottom:1px solid var(--sys-ink);border-radius:0;
  background:transparent;color:var(--sys-ink);padding:var(--sys-space-xs) 0}
.pb-journal .pb-island-form input:focus,.pb-journal .pb-island-form textarea:focus{outline:none;border-bottom-color:var(--sys-accent);box-shadow:0 1px 0 var(--sys-accent)}
.pb-journal .pb-island-submit{${step("link")};background:var(--sys-deep);color:var(--sys-on-deep);border-radius:0;padding:var(--sys-space-s) var(--sys-space-m)}
.pb-journal .pb-island-privacy{${step("small")};color:var(--sys-muted)}

/* Handy-Dock (Systemblatt): Hauptaktion über die Breite + Quadrat */
.pb-journal .jr-dock{position:fixed;left:0;right:0;bottom:0;z-index:25;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:calc(var(--sys-space-xs) + var(--sys-space-2xs) / 2);
  padding:calc(var(--sys-space-s) - var(--sys-space-2xs) / 2) var(--sys-space-gutter) calc(var(--sys-space-s) - var(--sys-space-2xs) / 2 + env(safe-area-inset-bottom));
  background:color-mix(in srgb,var(--sys-paper) 92%,transparent);border-top:1px solid var(--sys-rule);-webkit-backdrop-filter:blur(var(--sys-space-xs));backdrop-filter:blur(var(--sys-space-xs))}
.pb-journal .jr-dock a{display:flex;align-items:center;justify-content:center;height:calc(var(--sys-space-l) + var(--sys-space-s));text-decoration:none;
  transition:transform 120ms var(--jr-ease),background 200ms var(--jr-ease)}
.pb-journal .jr-dock a:active{transform:scale(.98)}
.pb-journal .jr-dock-main{${step("link")};background:var(--sys-deep);color:var(--sys-on-deep);padding-inline:var(--sys-space-m);min-width:0;text-align:center}
.pb-journal .jr-dock-icon{width:calc(var(--sys-space-l) + var(--sys-space-s));border:1px solid var(--sys-ink);color:var(--sys-ink)}
.pb-journal .jr-dock-icon svg{width:calc(var(--sys-space-s) * 1.4);height:calc(var(--sys-space-s) * 1.4)}
.pb-journal .jr-dock a:focus-visible{outline:var(--jr-focus) solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
/* Bildnachweis (PhotoCredits) im Journal-Fuß: gleiches helles Band, Textschrift, gedämpft */
.pb-journal .pb-photo-credits{${step("small")};font-size:calc(var(--sys-small-size) * .93);color:var(--sys-muted);background:var(--jr-raised);
  margin:0;padding:0 var(--sys-space-gutter) var(--sys-space-l);text-align:left}
.pb-journal .pb-photo-credits a{color:inherit;text-underline-offset:.2em}
@media (min-width:64rem){.pb-journal .pb-photo-credits{max-width:none;padding-inline:max(var(--sys-space-gutter),calc((100% - var(--sys-space-max)) / 2 + var(--sys-space-gutter)))}}
@media (max-width:47.99rem){
  /* Platz unter dem Dock in der Farbe des Fußes, kein fremder Streifen am Seitenende */
  .pb-journal{--jr-dock-space:calc(var(--sys-space-l) + var(--sys-space-s) * 3 + env(safe-area-inset-bottom));padding-bottom:var(--jr-dock-space);
    background:var(--sys-paper) linear-gradient(var(--jr-raised),var(--jr-raised)) left bottom/100% var(--jr-dock-space) no-repeat}
  .pb-journal .pb-island--fab{bottom:calc(var(--sys-space-l) + var(--sys-space-s) * 4)}
  .pb-journal .pb-island--fab ~ .pb-island--fab{bottom:calc(var(--sys-space-l) * 2 + var(--sys-space-s) * 5)}
}
@media (min-width:48rem){.pb-journal .jr-dock{display:none}}
@media (min-width:64rem){
  .pb-journal .jr-contact{text-align:left}
  .pb-journal .jr-contact .jr-wrap{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--sys-space-m);align-items:start}
  .pb-journal .jr-contact-head{grid-column:1/6;grid-row:1}
  .pb-journal .jr-contact-grid{display:contents}
  .pb-journal .jr-contact-main{display:block;grid-column:1/6;grid-row:2}
  .pb-journal .jr-contact-address{justify-items:start}
  .pb-journal .jr-contact-links{justify-content:flex-start}
  .pb-journal .jr-contact-map{grid-column:7/13;grid-row:1/3;margin-top:0}
  .pb-journal .jr-contact-form{grid-column:1/-1}
}
/* Unterseiten- und Rechtsseiten-Kopf: Typo-Einstieg ohne Foto, ein h1 */
.pb-journal .jr-page-head{text-align:center;padding-block:calc(var(--sys-space-xl) - var(--sys-space-s)) var(--sys-space-xl);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-page-kicker{margin-bottom:calc(var(--sys-space-s) + var(--sys-space-2xs))}
.pb-journal .jr-page-head h1,.pb-journal .jr-page-head--more h2{${step("h2")};font-size:calc(var(--sys-h2-size) * 1.4);max-width:calc(var(--sys-space-measure) * .9);margin-inline:auto;overflow-wrap:anywhere;hyphens:auto}
.pb-journal .jr-page-intro{${step("lede")};font-style:italic;font-weight:300;max-width:calc(var(--sys-space-measure) * .8);margin:var(--sys-space-m) auto 0;hyphens:manual}

/* Rechtsseiten: Fließtext im Textmaß, Überschriften aus der Skala */
.pb-journal .jr-legal{max-width:calc(var(--sys-space-measure) + 2 * var(--sys-space-gutter));padding-block:var(--sys-space-xl) var(--sys-space-section);overflow-wrap:anywhere}
.pb-journal .jr-legal h1,.pb-journal .jr-legal h2{${step("h3")};margin:var(--sys-space-l) 0 var(--sys-space-s);padding-top:var(--sys-space-m);border-top:1px solid var(--sys-rule)}
.pb-journal .jr-legal>:first-child{margin-top:0;padding-top:0;border-top:0}
.pb-journal .jr-legal h3,.pb-journal .jr-legal h4{${step("kicker")};color:var(--sys-muted);margin:var(--sys-space-m) 0 var(--sys-space-xs)}
.pb-journal .jr-legal p+p{margin-top:var(--sys-space-s)}
.pb-journal .jr-legal ul,.pb-journal .jr-legal ol{margin:var(--sys-space-s) 0;padding-left:var(--sys-space-m)}
.pb-journal .jr-legal li+li{margin-top:var(--sys-space-2xs)}
.pb-journal .jr-legal a{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:var(--sys-space-2xs)}
.pb-journal .jr-legal strong,.pb-journal .jr-legal b{font-weight:500}

/* Geschichte: Kapitel, erster Absatz als Einleitung */
.pb-journal .jr-story-body{max-width:var(--sys-space-measure)}
.pb-journal .jr-story-body p:first-child{${step("lede")}}
.pb-journal .jr-story-body p+p{margin-top:var(--sys-space-s)}

/* Grundsätze: Punkte zwischen Haarlinien */
.pb-journal .jr-usp-list{list-style:none;margin:0;padding:0;display:grid;column-gap:calc(var(--sys-space-l) + var(--sys-space-xs));border-top:1px solid var(--sys-ink)}
.pb-journal .jr-usp-list li{display:grid;align-content:start;gap:var(--sys-space-xs);padding-block:var(--sys-space-m);border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-usp-list h3{${step("h3")}}
.pb-journal .jr-usp-list p{${step("small")};color:var(--sys-muted);max-width:calc(var(--sys-space-measure) * .6)}

/* Zahlen: kursive Display-Ziffern, Haarlinie links */
.pb-journal .jr-stats{padding-block:var(--sys-space-xl)}
.pb-journal .jr-stats-list{list-style:none;margin:0;padding:0;display:grid;border-bottom:1px solid var(--sys-rule)}
.pb-journal .jr-stats-list li{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-items:baseline;gap:var(--sys-space-m);
  padding-block:var(--sys-space-s);border-top:1px solid var(--sys-rule);min-width:0}
.pb-journal .jr-stat-value{font-family:var(--sys-font-display);font-style:italic;font-weight:300;font-size:calc(var(--sys-display-size) * .55);
  line-height:var(--sys-display-line);letter-spacing:var(--sys-display-track);overflow-wrap:anywhere}
.pb-journal .jr-stat-label{${step("small")};color:var(--sys-muted)}

/* Zitat: Akzentstrich, große kursive Zeile */
.pb-journal .jr-quote-band{text-align:center}
.pb-journal .jr-motto{margin:0 auto;max-width:calc(var(--sys-space-measure) * 1.1)}
.pb-journal .jr-motto::before{content:"";display:block;width:var(--sys-space-xl);height:1px;background:var(--sys-accent);margin:0 auto var(--sys-space-l)}
.pb-journal .jr-motto blockquote{margin:0}
.pb-journal .jr-motto p{${step("h2")};font-style:italic;text-wrap:balance;hyphens:manual}
.pb-journal .jr-motto p::before{content:"„"}
.pb-journal .jr-motto p::after{content:"“"}
.pb-journal .jr-quote-author{color:var(--sys-muted);margin-top:var(--sys-space-m)}

/* Partner: ruhige Logo-Zeile in Graustufen */
.pb-journal .jr-partners{padding-block:var(--sys-space-xl);text-align:center}
.pb-journal .jr-partners .jr-chapter h2{${step("h3")}}
.pb-journal .jr-logos{list-style:none;margin:0;padding:var(--sys-space-l) 0 0;border-top:1px solid var(--sys-rule);display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:var(--sys-space-l) var(--sys-space-xl)}
.pb-journal .jr-logos img{height:var(--sys-space-l);width:auto;max-width:calc(var(--sys-space-2xl) * 1.5);object-fit:contain;filter:grayscale(1);opacity:.72;transition:opacity 200ms var(--jr-ease),filter 200ms var(--jr-ease)}
.pb-journal .jr-logos a:hover img{opacity:1;filter:none}

/* Aufruf: das einzige dunkle Band */
.pb-journal .jr-cta{background:var(--sys-deep);color:var(--sys-on-deep);text-align:center}
.pb-journal .jr-cta h2{${step("h2")};max-width:calc(var(--sys-space-measure) * .9);margin-inline:auto}
.pb-journal .jr-cta-action{margin-top:var(--sys-space-l)}
.pb-journal .jr-pill--light{background:var(--sys-on-deep);color:var(--sys-deep);border-color:var(--sys-on-deep)}
.pb-journal .jr-pill--light:hover{background:transparent;color:var(--sys-on-deep);border-color:var(--sys-on-deep)}
.pb-journal .jr-cta :focus-visible{outline-color:var(--sys-on-deep)}

@media (min-width:48rem){
  .pb-journal .jr-usp-list{grid-template-columns:repeat(2,minmax(0,1fr));border-top:0}
  .pb-journal .jr-usp-list li:nth-child(-n+2){border-top:1px solid var(--sys-ink)}
}
@media (min-width:64rem){
  .pb-journal .jr-page-head{padding-block:var(--sys-space-xl) calc(var(--sys-space-xl) + var(--sys-space-m))}
  .pb-journal .jr-stats-list{grid-template-columns:repeat(var(--jr-stats,3),minmax(0,1fr));column-gap:var(--sys-space-m);border-bottom:0}
  .pb-journal .jr-stats-list li{grid-template-columns:minmax(0,1fr);gap:var(--sys-space-xs);padding:var(--sys-space-m) 0 0;border-top:1px solid var(--sys-ink)}
  .pb-journal .jr-stats-list[data-count="2"]{--jr-stats:2}
  .pb-journal .jr-stats-list[data-count="4"]{--jr-stats:4}
  .pb-journal .jr-stat-value{font-size:calc(var(--sys-display-size) * .72)}
}
/* Bewegung: Startzustände nur mit Script (data-jr-ready) und ohne reduzierte Bewegung.
   Nur transform, opacity, clip-path. Das Foto bleibt deckend (LCP), es wird nur aufgedeckt. */
@media (prefers-reduced-motion: no-preference){
  .pb-journal[data-jr-ready] .jr-entry h1{animation:jr-rise .7s cubic-bezier(.16,1,.3,1) both}
  .pb-journal[data-jr-ready] .jr-entry-line{animation:jr-rise .7s cubic-bezier(.16,1,.3,1) .12s both}
  .pb-journal[data-jr-ready] .jr-entry-photo img{animation:jr-reveal 1s cubic-bezier(.16,1,.3,1) .1s both}
  .pb-journal[data-jr-ready] .jr-section:not(.jr-entry):not([data-jr-in]){opacity:0;transform:translateY(16px)}
  .pb-journal[data-jr-ready] .jr-section:not(.jr-entry){transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1)}
  @keyframes jr-rise{from{opacity:0;transform:translateY(14px)}}
  @keyframes jr-reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}
}
/* Streifen-Fortschritt: liegt absolut im Abschnittsrand (kein Platz im Fluss, kein Layoutsprung),
   nur opacity wird geschaltet; sichtbar nur, wenn der Streifen wirklich überläuft (data-active) */
.pb-journal .jr-strip-wrap{position:relative}
.pb-journal .jr-strip-bar{position:absolute;left:var(--sys-space-gutter);right:var(--sys-space-gutter);top:calc(100% + var(--sys-space-xs));height:1px;background:var(--sys-rule);overflow:hidden;opacity:0;pointer-events:none}
.pb-journal .jr-strip-bar>span{display:block;height:100%;background:var(--sys-ink);transform:scaleX(0);transform-origin:left}
@media (max-width:63.99rem){
  .pb-journal[data-jr-ready] .jr-strip-bar[data-active]{opacity:1;transition:opacity .3s ease}
}
/* ende journal */
`;
