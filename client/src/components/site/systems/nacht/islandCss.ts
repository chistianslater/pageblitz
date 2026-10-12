import { DOCK, H_DOCK, H_MIN, R, ROUND, step } from "./step";

/**
 * Chat- und Termin-Insel auf dunklem Papier (N7). Die Inseln bringen ihr
 * Grund-CSS mit (`islands/islandsCss.ts`, nur `--pb-*`-Aliase); hier nur,
 * was auf Nacht anders sein muss:
 *  - Knöpfe (in der Seite): Ecke 2 px, Stufe „link", Termin-Knopf 48 px
 *    hoch; unter 48 rem über der Handy-Leiste statt auf ihr
 *  - Panels: hängen per Portal an <body>, außerhalb von `.pb-nacht` —
 *    darum `:root:has(.pb-nacht)`. Die `--sys-*`-Werte kopiert
 *    `copySiteCssVars` mit auf das Panel. Fokusring 2 px in Tinte,
 *    Schließen ≥ 44 px, Text in der kleinsten Stufe (1 rem), Fehler in
 *    Tinte mit Kupferstrich statt Rot (Rot auf Dunkel ist unlesbar)
 * Nur `--sys-*` (oder Vielfache); Ausnahmen 2px-Linien, -Ecken, Fokus.
 */

/** Ziel 44 px. */
const TAP = "calc(var(--sys-space-l) * 1.1)";
/** Unterkante der Handy-Leiste + Abstand: Knöpfe schweben darüber. */
const ABOVE_DOCK = `calc(var(--sys-space-s) * .625 + ${H_DOCK} + var(--sys-space-xs) * 2 + var(--sys-space-s) + env(safe-area-inset-bottom,0rem))`;
/** Zweiter Knopf über dem ersten (Chat-Knopf 56 px + 12 px). */
const NEXT_FAB = "calc(var(--sys-space-l) * 1.4 + var(--sys-space-s) * .75)";
/** Panels liegen am <body>, nicht in `.pb-nacht`. */
const PANEL = ":root:has(.pb-nacht) .pb-island-panel";

export const ISLAND_CSS = `/* Inseln: Chat und Termin auf dunkel */
.pb-nacht .pb-island-fab-btn{${step("link")};border-radius:${R};min-height:${H_MIN};box-shadow:0 calc(var(--sys-space-xs) * 1.5) var(--sys-space-l) calc(var(--sys-space-xs) * -1) var(--sys-deep)}
.pb-nacht .pb-island-chat-fab{border-radius:${ROUND};letter-spacing:0}
.pb-nacht .pb-island-fab-btn[aria-expanded="true"]{opacity:1}
@media (max-width:calc(${DOCK} - 1px)){
  .pb-nacht .pb-island--fab{right:calc(var(--sys-space-s) * .625);bottom:${ABOVE_DOCK}}
  .pb-nacht .pb-island--fab ~ .pb-island--fab{bottom:calc(${ABOVE_DOCK} + ${NEXT_FAB})}
}
${PANEL}{border-radius:${R};border-color:var(--sys-rule);font-family:var(--sys-font-text)}
${PANEL} :focus-visible{outline:2px solid var(--sys-ink);outline-offset:var(--sys-space-2xs)}
${PANEL} .pb-island-chat-composer input{border-radius:${R};border-color:var(--sys-muted)}
${PANEL} .pb-island-chat-composer input:focus{outline:2px solid var(--sys-ink);outline-offset:var(--sys-space-2xs);border-color:var(--sys-ink)}
${PANEL} .pb-island-msg,${PANEL} .pb-island-chat-composer input,${PANEL} .pb-island-chip,${PANEL} .pb-island-summary,${PANEL} .pb-island-empty,${PANEL} .pb-island-step-back,${PANEL} .pb-island-panel-close{font-size:var(--sys-small-size)}
${PANEL} .pb-island-msg--assistant{border-color:var(--sys-rule);border-radius:${R}}
${PANEL} .pb-island-msg--user{border-radius:${R}}
${PANEL} .pb-island-chat-close,${PANEL} .pb-island-panel-close,${PANEL} .pb-island-step-back{min-width:${TAP};min-height:${TAP}}
${PANEL} .pb-island-panel-close,${PANEL} .pb-island-chat-close{color:var(--sys-ink)}
${PANEL} .pb-island-chip{min-height:${TAP};border-radius:${R};border-color:var(--sys-muted)}
${PANEL} .pb-island-chip span{color:var(--sys-muted)}
${PANEL} .pb-island-chip[aria-pressed="true"] span{color:inherit;opacity:1}
${PANEL} .pb-island-status[data-state="error"],${PANEL} .pb-island-status[data-state="success"]{color:var(--sys-ink);border-left:2px solid var(--sys-accent);padding-left:var(--sys-space-s)}
@media (max-width:30rem){${PANEL}{border-radius:${R} ${R} 0 0}}`;
