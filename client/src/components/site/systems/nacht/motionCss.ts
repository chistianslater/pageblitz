/**
 * Bewegung von Nacht (Systemblatt 7 „Bewegung bleibt leise"). Regeln:
 *  - nur transform, opacity, clip-path; eine Kurve cubic-bezier(.23,1,.32,1)
 *  - Startzustände nur mit Script (`data-nc-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - Einstieg einmal: das Foto (LCP) setzt sich von 106 % auf 100 %
 *    (1,6 s) und ist nie versteckt — keine Deckkraft, kein Ausschnitt;
 *    das kleine Hochformat der schwachen Fotos ebenso
 *  - Name wird von unten aufgedeckt (clip-path, 1,1 s, 150 ms nach dem
 *    Foto), steigt dabei um xs; Kicker, Satz und Knöpfe stehen sofort
 *  - Kapitel einmalig beim Hereinscrollen (`data-nc-in`): 24 px Aufstieg
 *    mit Einblenden, 900 ms; die Kontakt-Insel geht mit ihrem Kapitel
 *  - kein Ken-Burns, kein Karussell, kein Parallax, keine Dauerschleife;
 *    Handy-Leiste fest ohne Animation (Ausblenden regelt dockAutoHide)
 *  - nur am Bildschirm (`screen`): beim Drucken nie versteckt
 *  - reduzierte Bewegung: gar keine Bewegung (Grund-CSS schaltet alles ab)
 * Hinweis: Der äußere Block schließt mit „\n}\n" (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.23,1,.32,1)";
const P = ".pb-nacht[data-nc-ready]";
/** Foto setzt sich (Systemblatt: 1,6 s). */
const SETTLE_MS = 1600;
/** Name deckt sich auf (1,1 s), 150 ms nach dem Foto. */
const MASK_MS = 1100;
const MASK_AT = 150;
/** Kapitel steigen auf (Systemblatt: .9 s). */
const RISE_MS = 900;

export const NACHT_MOTION_CSS = `/* Bewegung (Systemblatt 7) */
@media screen and (prefers-reduced-motion: no-preference){
  ${P} .nc-bg img,${P} .nc-entry .nc-pic img{animation:nc-settle ${SETTLE_MS}ms ${EASE} backwards}
  ${P} .nc-entry .nc-display{animation:nc-mask ${MASK_MS}ms ${EASE} ${MASK_AT}ms backwards}
  ${P} .nc-sec:not([data-nc-in])>.nc-wrap,${P} .nc-sec:not([data-nc-in])>.pb-island{opacity:0;transform:translateY(var(--sys-space-m))}
  ${P} .nc-sec>.nc-wrap,${P} .nc-sec>.pb-island{transition:opacity ${RISE_MS}ms ${EASE},transform ${RISE_MS}ms ${EASE}}
  @keyframes nc-settle{from{transform:scale(1.06)}}
  @keyframes nc-mask{from{clip-path:inset(0 0 100% 0);transform:translateY(var(--sys-space-xs))}to{clip-path:inset(0 0 0 0);transform:none}}
}
`;
