/**
 * Bewegung von Freundlich (Systemblatt 8 „Bewegung federt leise"). Regeln:
 *  - nur transform und opacity; zwei Kurven laut Blatt: Feder
 *    cubic-bezier(.3,1.22,.6,1) für den einen Moment, sonst
 *    cubic-bezier(.22,1,.36,1)
 *  - Startzustände nur mit Script (`data-fr-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - ein Moment: das Einstiegsfoto (LCP) bzw. das kleine Foto setzt sich
 *    einmal mit Feder (0,9 s, 200 ms verzögert) aus 20 px Tiefe, 96 % und
 *    geradem Winkel in seine Lage (ab Desktop −1,5° bzw. +1,5°) — nie
 *    versteckt: keine Deckkraft, kein Ausschnitt
 *  - Kapitel einmalig beim Hereinscrollen (`data-fr-in`): 16 px Aufstieg
 *    mit Einblenden, 0,7 s; die Kontakt-Insel geht mit; ein Kapitel mit
 *    Tastaturfokus ist sofort sichtbar (nie unsichtbar fokussiert)
 *  - Farbkarten heben sich bei Mauszeiger um 4 px und −0,6°
 *  - Knöpfe heben/drücken sich in der Grundschicht (css.ts), Leiste fest
 *    ohne Animation (Ausblenden regelt dockAutoHide)
 *  - nur am Bildschirm (`screen`): beim Drucken nie versteckt
 *  - reduzierte Bewegung: gar keine Bewegung (Grund-CSS schaltet alles ab)
 * Hinweis: Der äußere Block schließt mit „\n}\n" (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.22,1,.36,1)";
const SPRING = "cubic-bezier(.3,1.22,.6,1)";
const P = ".pb-freundlich[data-fr-ready]";
/** Foto setzt sich mit Feder (Systemblatt: 0,9 s, 200 ms verzögert). */
const SETTLE_MS = 900;
const SETTLE_AT = 200;
/** Kapitel steigen auf (Systemblatt: 0,7 s). */
const RISE_MS = 700;
/** Farbkarte bei Mauszeiger (Systemblatt: −4 px, −0,6°). */
const CARD_MS = 300;

export const FREUNDLICH_MOTION_CSS = `/* Bewegung (Systemblatt 8) */
@media screen and (prefers-reduced-motion: no-preference){
  ${P} .fr-heroimg .fr-frame,${P} .fr-entry .fr-smallpic{animation:fr-settle ${SETTLE_MS}ms ${SPRING} ${SETTLE_AT}ms backwards}
  ${P} .fr-sec:not([data-fr-in])>.fr-wrap,${P} .fr-sec:not([data-fr-in])>.pb-island{opacity:0;transform:translateY(var(--sys-space-s))}
  ${P} .fr-sec:focus-within>.fr-wrap,${P} .fr-sec:focus-within>.pb-island{opacity:1;transform:none}
  ${P} .fr-sec>.fr-wrap,${P} .fr-sec>.pb-island{transition:opacity ${RISE_MS}ms ${EASE},transform ${RISE_MS}ms ${EASE}}
  ${P} .fr-offer{transition:transform ${CARD_MS}ms ${EASE}}
  @media (hover:hover) and (pointer:fine){
    ${P} .fr-offer:hover{transform:translateY(calc(var(--sys-space-2xs) * -1)) rotate(calc(var(--sys-tilt) * -.4))}
  }
  @keyframes fr-settle{from{transform:translateY(calc(var(--sys-space-s) * 1.25)) rotate(0deg) scale(.96)}}
}
`;
