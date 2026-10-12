import { GRID } from "./step";

/**
 * Bewegung von Plakat (Systemblatt 09 „Laufband und Bewegung"). Regeln:
 *  - nur transform, opacity, clip-path; eine Kurve für alles (Laufband linear)
 *  - Startzustände nur mit Script (`data-pk-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - Einstieg: Zeilen der großen Schrift wachsen einzeln aus
 *    clip-path inset(0 0 100% 0), 600 ms, 70 ms Versatz; am Desktop fließt
 *    der Schrift-Einstieg in einer Zeile (inline) → ganze Zeile auf einmal
 *  - Einstiegsfoto (LCP) wird nie versteckt oder beschnitten: es setzt sich
 *    nur (scale 1.06 → 1)
 *  - Sticker setzt sich einmal: scale(.92) rotate(-2°) → −9°, 420 ms
 *  - Abschnitte einmalig beim Hereinscrollen (`data-pk-in`): Inhalt rückt
 *    hoch, Formen (Bogen/Kreis/Pille) öffnen sich von unten (700 ms),
 *    Ziffern 01·02·03 wachsen wie die Einstiegszeilen
 *  - Laufband läuft erst mit Script (Pause-Knopf, WCAG 2.2.2), hält bei
 *    Hover und auf Knopfdruck; ohne Script und bei reduce steht es still
 *  - nur am Bildschirm (`screen`): beim Drucken nie versteckt
 * Hinweis: Der äußere Block schließt mit „\n}\n" (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.23,1,.32,1)";
const P = ".pb-plakat[data-pk-ready]";
/** Versatz je Zeile der großen Schrift (Systemblatt: 70 ms). */
const LINE_STEP = 70;
/** Zeilen mit eigenem Versatz; ab der fünften gleich. */
const LINES = [2, 3, 4, 5];
/** Erste Ziffer beginnt nach der Abschnitts-Bewegung; jede weitere 80 ms später. */
const STEP_BASE = 120;

const lineDelays = LINES.map(
  n =>
    `  ${P} .pk-entry .pk-display span:nth-of-type(${n >= 5 ? "n+5" : n}){animation-delay:${(n - 1) * LINE_STEP}ms}`
).join("\n");
const stepDelays = LINES.map(
  n =>
    `  ${P} .pk-step:nth-child(${n >= 5 ? "n+5" : n}) .pk-step-no{animation-delay:${STEP_BASE + (n - 1) * 80}ms}`
).join("\n");

export const PLAKAT_MOTION_CSS = `/* Bewegung (Systemblatt 09) */
@media screen and (prefers-reduced-motion: no-preference){
  ${P} .pk-entry .pk-display span,${P} .pk-entry .pk-display--flow{animation:pk-line 600ms ${EASE} backwards}
${lineDelays}
  ${P} .pk-entry-kicker,${P} .pk-status{animation:pk-rise 500ms ${EASE} backwards}
  ${P} .pk-entry-lede,${P} .pk-entry-actions{animation:pk-rise 500ms ${EASE} 140ms backwards}
  ${P} .pk-entry-media .pk-shape img{animation:pk-settle 900ms ${EASE} backwards}
  ${P} .pk-entry .pk-stk{animation:pk-stick 420ms ${EASE} 280ms backwards}
  ${P} .pk-sec:not([data-pk-in])>.pk-wrap,${P} .pk-sec:not([data-pk-in])>.pb-island{opacity:0;transform:translateY(var(--sys-space-s))}
  ${P} .pk-sec>.pk-wrap,${P} .pk-sec>.pb-island{transition:opacity 500ms ${EASE},transform 500ms ${EASE}}
  ${P} .pk-sec:not([data-pk-in]) .pk-shape{clip-path:inset(100% 0 0 0)}
  ${P} .pk-sec[data-pk-in] .pk-shape{animation:pk-open 700ms ${EASE} 120ms backwards}
  ${P} .pk-sec:not([data-pk-in]) .pk-step-no{clip-path:inset(0 -.2em 100% -.2em)}
  ${P} .pk-sec[data-pk-in] .pk-step-no{animation:pk-line 600ms ${EASE} ${STEP_BASE}ms backwards}
${stepDelays}
  ${P} .pk-tick-track{animation:pk-tick 38s linear infinite}
  ${P} .pk-tick-track:hover,${P} .pk-tick[data-pk-paused] .pk-tick-track{animation-play-state:paused}
  ${P} .pk-tick-toggle{display:grid}
  @media (min-width:${GRID}){
    ${P} .pk-entry--type .pk-display span{animation:none}
    ${P} .pk-entry--type .pk-display{animation:pk-line 600ms ${EASE} backwards}
  }
  @keyframes pk-line{from{clip-path:inset(0 -.2em 100% -.2em)}to{clip-path:inset(-.2em)}}
  @keyframes pk-open{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0)}}
  @keyframes pk-rise{from{opacity:0;transform:translateY(var(--sys-space-s))}}
  @keyframes pk-settle{from{transform:scale(1.06)}}
  @keyframes pk-stick{from{transform:scale(.92) rotate(-2deg)}to{transform:scale(1) rotate(-9deg)}}
  @keyframes pk-tick{to{transform:translateX(calc(-50% + var(--sys-space-gutter) / 2))}}
}
`;
