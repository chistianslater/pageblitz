import { DOCK, FOCUS, H_SMALL, LINE, step } from "./step";

/**
 * Chat- und Termin-Insel auf Freundlich (F4). Die Inseln bringen ihr
 * Grund-CSS mit (`islands/islandsCss.ts`, nur `--pb-*`-Aliase); hier nur,
 * was auf Freundlich anders sein muss:
 *  - Knöpfe (in der Seite): Pille in Signal mit Druckkante wie der
 *    Hauptknopf, Stufe „link", ≥ 48 px; unter 48 rem über der Handy-Leiste
 *    statt auf ihr
 *  - Panels: hängen per Portal an <body>, außerhalb von `.pb-freundlich` —
 *    darum `:root:has(.pb-freundlich)`. Die `--sys-*`-Werte kopiert
 *    `copySiteCssVars` mit auf das Panel. Ecke 20 px (Karte), Fokusring
 *    3 px Akzent, Schließen/Zurück/Termine ≥ 44 px, Text in der kleinsten
 *    Stufe (1 rem), Meldungen in Tinte mit Akzentstrich und „!" statt Rot
 * Nur `--sys-*` (oder Vielfache); Ausnahmen 1,5px-Linien und 3px-Fokus.
 */

/** Ziel 44 px. */
const TAP = "calc(var(--sys-space-l) * 1.1)";
/** Oberkante der Handy-Leiste (Abstand + Polster + Knopf + Kante) + Luft. */
const ABOVE_DOCK = `calc(var(--sys-space-s) * .75 + var(--sys-space-xs) * 2 + var(--sys-press) + ${H_SMALL} + var(--sys-space-s) + env(safe-area-inset-bottom,0rem))`;
/** Zweiter Knopf über dem ersten (Chat-Knopf 56 px + 12 px). */
const NEXT_FAB = "calc(var(--sys-space-l) * 1.4 + var(--sys-space-s) * .75)";
/** Panels liegen am <body>, nicht in `.pb-freundlich`. */
const PANEL = ":root:has(.pb-freundlich) .pb-island-panel";
/** Druckkante wie der Hauptknopf (css.ts). */
const EDGE = `inset 0 0 0 ${LINE} var(--sys-edge-color),0 var(--sys-press) 0 var(--sys-edge-color)`;

export const ISLAND_CSS = `/* Inseln: Chat und Termin */
.pb-freundlich .pb-island-fab-btn{${step("link")};min-height:${H_SMALL};border-radius:var(--sys-radius-pill);background:var(--sys-signal);color:var(--sys-on-signal);box-shadow:${EDGE}}
.pb-freundlich .pb-island-fab-btn:focus-visible{outline:${FOCUS} solid var(--sys-accent);outline-offset:var(--sys-space-2xs)}
.pb-freundlich .pb-island-chat-fab{letter-spacing:0}
.pb-freundlich .pb-island-fab-btn[aria-expanded="true"]{opacity:1}
@media (max-width:calc(${DOCK} - 1px)){
  .pb-freundlich .pb-island--fab{right:calc(var(--sys-space-s) * .75);bottom:${ABOVE_DOCK}}
  .pb-freundlich .pb-island--fab ~ .pb-island--fab{bottom:calc(${ABOVE_DOCK} + ${NEXT_FAB})}
}
${PANEL}{border-radius:var(--sys-radius-m);border-color:var(--sys-rule);font-family:var(--sys-font-text);color:var(--sys-ink)}
${PANEL} :focus-visible{outline:${FOCUS} solid var(--sys-accent);outline-offset:var(--sys-space-2xs)}
${PANEL} .pb-island-panel-header,${PANEL} .pb-island-chat-title{font-family:var(--sys-font-display);letter-spacing:0;text-transform:none}
${PANEL} .pb-island-chat-composer input{border-radius:var(--sys-radius-pill);border:${LINE} solid var(--sys-muted)}
${PANEL} .pb-island-chat-composer input:focus{outline:none}
${PANEL} .pb-island-chat-composer input:focus-visible{outline:${FOCUS} solid var(--sys-accent);outline-offset:0;border-color:var(--sys-accent)}
${PANEL} .pb-island-msg,${PANEL} .pb-island-chat-composer input,${PANEL} .pb-island-chip,${PANEL} .pb-island-summary,${PANEL} .pb-island-empty,${PANEL} .pb-island-step-back,${PANEL} .pb-island-panel-close{font-size:var(--sys-small-size)}
${PANEL} .pb-island-msg--assistant{border-color:var(--sys-rule);border-radius:var(--sys-radius-m) var(--sys-radius-m) var(--sys-radius-m) var(--sys-radius-s)}
${PANEL} .pb-island-msg--user{border-radius:var(--sys-radius-m) var(--sys-radius-m) var(--sys-radius-s) var(--sys-radius-m)}
${PANEL} .pb-island-chat-close,${PANEL} .pb-island-panel-close,${PANEL} .pb-island-step-back{min-width:${TAP};min-height:${TAP}}
${PANEL} .pb-island-panel-close,${PANEL} .pb-island-chat-close,${PANEL} .pb-island-step-back{color:var(--sys-ink)}
${PANEL} .pb-island-chip{min-height:${TAP};border-radius:var(--sys-radius-s);border:${LINE} solid var(--sys-muted)}
${PANEL} .pb-island-chip span{color:var(--sys-muted)}
${PANEL} .pb-island-chip[aria-pressed="true"] span{color:inherit;opacity:1}
${PANEL} .pb-island-summary{border-radius:var(--sys-radius-s)}
${PANEL} .pb-island-status[data-state="error"],${PANEL} .pb-island-status[data-state="success"]{color:var(--sys-ink);font-weight:600;border-left:${FOCUS} solid var(--sys-accent);padding-left:var(--sys-space-s)}
${PANEL} .pb-island-status[data-state="error"]::before{content:"! ";font-weight:700}
@media (max-width:30rem){${PANEL}{border-radius:var(--sys-radius-m) var(--sys-radius-m) 0 0}}`;
