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
.pb-journal .jr-brand{${step("mark")};text-decoration:none;text-align:center;text-wrap:balance}
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
/* ende journal */
`;
