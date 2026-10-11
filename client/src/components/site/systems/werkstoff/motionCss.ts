/**
 * Bewegung von Werkstoff (Systemblatt 08 „Nur was etwas erklärt, und nur
 * einmal"). Regeln:
 *  - nur transform, opacity, clip-path; eine Kurve für alles
 *  - Startzustände nur mit Script (`data-ws-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - Einstieg: Überschrift von unten freigelegt (clip-path, 560 ms), der
 *    Zettel folgt 120 ms später (16 px hoch + Deckkraft)
 *  - Fotos (LCP) werden nie ausgeblendet oder bewegt
 *  - Abschnitte einmalig beim Hereinscrollen (`data-ws-in`), Ziffern 1·2·3
 *    mit derselben Freilegung, Zeitleiste rückt leicht von rechts nach
 *  - Handy-Leiste steht von Anfang an (keine Regel hier)
 * Hinweis: Der äußere Block schließt mit „\n}\n" (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.23,1,.32,1)";
const W = ".pb-werkstoff[data-ws-ready]";
/** Versatz je Ziffer bzw. Zeitleisten-Karte; ab der fünften gleich. */
const STAGGER = [2, 3, 4, 5];

const stepDelays = STAGGER.map(
  n =>
    `  ${W} .ws-step:nth-child(${n}) .ws-step-no{animation-delay:${(n - 1) * 80}ms}`
).join("\n");
const cardDelays = STAGGER.map(
  n =>
    `  ${W} .ws-day-card:nth-child(${n >= 5 ? "n+5" : n}){transition-delay:${(n - 1) * 60}ms}`
).join("\n");

export const WERKSTOFF_MOTION_CSS = `/* Bewegung (Systemblatt 08) */
@media (prefers-reduced-motion: no-preference){
  ${W} .ws-entry-head,${W} .ws-entry-fit,${W} .ws-entry-figure{animation:ws-reveal 560ms ${EASE} backwards}
  ${W} .ws-entry--time .ws-entry-head{animation-delay:60ms}
  ${W} .ws-entry-kicker{animation:ws-rise 500ms ${EASE} backwards}
  ${W} .ws-entry-lede,${W} .ws-entry-today{animation:ws-rise 500ms ${EASE} 80ms backwards}
  ${W} .ws-entry-media .ws-slip{animation:ws-rise 500ms ${EASE} 120ms backwards}
  ${W} .ws-sec:not([data-ws-in])>.ws-wrap:first-child,${W} .ws-sec:not([data-ws-in]) .ws-steps-body{opacity:0;transform:translateY(var(--sys-space-s))}
  ${W} .ws-sec>.ws-wrap:first-child,${W} .ws-sec .ws-steps-body{transition:opacity 500ms ${EASE},transform 500ms ${EASE}}
  ${W} .ws-sec:not([data-ws-in]) .ws-step-no{clip-path:inset(0 -.2em 100% -.2em)}
  ${W} .ws-sec[data-ws-in] .ws-step-no{animation:ws-reveal 560ms ${EASE} 120ms backwards}
${stepDelays}
  ${W} .ws-sec:not([data-ws-in]) .ws-day-card{opacity:0;transform:translateX(var(--sys-space-m))}
  ${W} .ws-day-card{transition:opacity 500ms ${EASE},transform 500ms ${EASE}}
${cardDelays}
  @keyframes ws-reveal{from{clip-path:inset(0 -.2em 100% -.2em)}to{clip-path:inset(-.2em)}}
  @keyframes ws-rise{from{opacity:0;transform:translateY(var(--sys-space-s))}}
}
`;
