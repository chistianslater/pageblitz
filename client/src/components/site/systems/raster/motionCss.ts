import { GRID } from "./step";

/**
 * Bewegung von Raster (Systemblatt 08). Regeln:
 *  - nur transform, opacity, clip-path; eine Kurve für alles
 *  - Startzustände nur mit Script (`data-rs-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - Fotos (LCP) werden nie ausgeblendet, sie setzen sich nur (scale 1.04 → 1)
 *  - Bänder: das Stapeln bleibt reines CSS (offerCss.ts). Wo der Browser
 *    Scroll-Zeitleisten kann, dunkelt das untere Band leicht ab und wird
 *    kleiner, während das nächste es überdeckt — ohne Scroll-Listener.
 *    Fließende Bänder (`rs-bands--flow*`, einzelnes Band) bleiben ruhig.
 *  - Reduzierte Bewegung: Bänder stapeln nicht (position: relative).
 * Hinweis: Der äußere Block schließt mit „\n}\n“ (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.23,1,.32,1)";
const R = ".pb-raster[data-rs-ready]";
/** Bänder je Seite höchstens sechs (offerData.bandPlan). */
const NEXT = [2, 3, 4, 5, 6];

const bandTimelines = NEXT.map(
  n =>
    `    .pb-raster .rs-band:nth-child(${n}){view-timeline-name:--rs-b${n}}
    .pb-raster .rs-band:nth-child(${n - 1}),.pb-raster .rs-band:nth-child(${n - 1})::after{animation-timeline:--rs-b${n}}`
).join("\n");

export const RASTER_MOTION_CSS = `/* Bewegung (Systemblatt 08) */
@media (prefers-reduced-motion: no-preference){
  ${R} .rs-entry .rs-wordmark{animation:rs-mask calc(700ms + 60ms * (var(--rs-wm-lines,1) - 1)) ${EASE} backwards}
  ${R} .rs-entry-clock{animation:rs-mask 700ms ${EASE} 120ms backwards}
  ${R} .rs-entry-kicker,${R} .rs-entry-status{animation:rs-rise 500ms ${EASE} 60ms backwards}
  ${R} .rs-entry-lede{animation:rs-rise 500ms ${EASE} 240ms backwards}
  ${R} .rs-entry-facts{animation:rs-rise 500ms ${EASE} 320ms backwards}
  ${R} .rs-entry-bg,${R} .rs-entry-plate img{animation:rs-settle 900ms ${EASE} backwards}
  ${R} .rs-sec:not([data-rs-in])>.rs-wrap:first-child{opacity:0;transform:translateY(var(--sys-space-s))}
  ${R} .rs-sec>.rs-wrap:first-child{transition:opacity 500ms ${EASE},transform 500ms ${EASE}}
  @keyframes rs-mask{from{clip-path:inset(0 -.25em 100% -.25em);transform:translateY(.35em)}to{clip-path:inset(-.25em);transform:none}}
  @keyframes rs-rise{from{opacity:0;transform:translateY(var(--sys-space-s))}}
  @keyframes rs-settle{from{transform:scale(1.04)}}
  @supports (animation-timeline: view()){
    .pb-raster .rs-bands{timeline-scope:${NEXT.map(n => `--rs-b${n}`).join(",")}}
    .pb-raster .rs-band:not(:last-child){transform-origin:50% 0;animation:rs-cover linear both;animation-range:entry 0% entry 100%}
    .pb-raster .rs-band:not(:last-child)::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:var(--sys-deep);opacity:0;
      animation:rs-dim linear both;animation-range:entry 0% entry 100%}
${bandTimelines}
    .pb-raster .rs-bands--one>.rs-band,.pb-raster .rs-bands--one>.rs-band::after{animation:none}
    @media (max-width:55.99rem){
      .pb-raster .rs-bands--flow>.rs-band,.pb-raster .rs-bands--flow>.rs-band::after{animation:none}
    }
    @media (min-width:${GRID}){
      .pb-raster .rs-bands--flow-wide>.rs-band,.pb-raster .rs-bands--flow-wide>.rs-band::after{animation:none}
    }
    @keyframes rs-cover{to{transform:scale(.96)}}
    @keyframes rs-dim{to{opacity:.5}}
  }
}
@media (prefers-reduced-motion:reduce){.pb-raster .rs-band{position:relative}}
`;
