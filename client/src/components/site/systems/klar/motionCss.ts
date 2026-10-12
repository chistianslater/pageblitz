import { R_FRAME } from "./step";

/**
 * Bewegung von Klar (Systemblatt 7 „Bewegung nur zum Verstehen"). Regeln:
 *  - nur transform, opacity, clip-path; eine Kurve cubic-bezier(.23,1,.32,1)
 *  - Startzustände nur mit Script (`data-kl-ready`, gesetzt von motion.ts)
 *    und nur ohne reduzierte Bewegung — ohne JS ist alles sofort sichtbar
 *  - Einstieg einmal: Pille, große Zeile, Satz, Knöpfe, Chips je 12 px hoch
 *    und einblenden, 320 ms, 60 ms Abstand
 *  - Foto im Rahmen (LCP) wird nie versteckt: es öffnet sich nur von
 *    clip-path inset(8% round Rahmen-Ecke) auf voll, 520 ms — 84 % der
 *    Fläche bleiben vom ersten Bild an sichtbar, keine Deckkraft
 *  - Heute-Karte (bzw. Zeiten-Karte neben dem kleinen Foto) 160 ms nach dem
 *    Foto, 8 px von unten; ohne Foto kommt die Zeiten-Karte mit dem Foto-Takt
 *  - Abschnitte einmalig beim Hereinscrollen (`data-kl-in`): 16 px, 360 ms
 *  - FAQ: Antwort blendet ein (keine Höhe), Plus dreht sich (Grund-CSS)
 *  - kein Laufband, kein Parallax, keine Dauerschleife
 *  - nur am Bildschirm (`screen`): beim Drucken nie versteckt
 *  - reduzierte Bewegung: gar keine Bewegung (Grund-CSS schaltet alles ab;
 *    strenger als das Blatt, das 150 ms Einblenden erlaubt — Einblenden
 *    bräuchte Startzustände, die es dort nicht geben darf)
 * Hinweis: Der äußere Block schließt mit „\n}\n" (Test sucht genau das);
 * innere Blöcke sind eingerückt.
 */
const EASE = "cubic-bezier(.23,1,.32,1)";
const P = ".pb-klar[data-kl-ready]";
/** Abstand zwischen den Einstiegs-Zeilen (Systemblatt: 60 ms). */
const STAGGER = 60;
/** Foto beginnt mit der zweiten Zeile; Heute-Karte 160 ms danach. */
const PHOTO_AT = STAGGER;
const CARD_AT = PHOTO_AT + 160;

/** Reihenfolge im Einstieg: Pille → Zeile → Satz → Knöpfe → Chips. */
const ENTRY_ORDER = [
  ".kl-entry .kl-pill",
  ".kl-entry .kl-display",
  ".kl-entry-lede",
  ".kl-entry-actions",
  ".kl-entry-facts",
];

const entryRules = ENTRY_ORDER.map(
  (sel, i) =>
    `  ${P} ${sel}{animation:kl-rise 320ms ${EASE}${i ? ` ${i * STAGGER}ms` : ""} backwards}`
).join("\n");

export const KLAR_MOTION_CSS = `/* Bewegung (Systemblatt 7) */
@media screen and (prefers-reduced-motion: no-preference){
${entryRules}
  ${P} .kl-entry-media .kl-frame{--kl-clip-r:${R_FRAME};animation:kl-frame 520ms ${EASE} ${PHOTO_AT}ms backwards}
  ${P} .kl-entry-media .kl-duo .kl-frame{--kl-clip-r:calc(var(--sys-space-s) * 1.375)}
  ${P} .kl-entry-media .kl-todaycard,${P} .kl-entry-media .kl-side{animation:kl-card 320ms ${EASE} ${CARD_AT}ms backwards}
  ${P} .kl-entry-media .kl-hours--entry{animation:kl-card 320ms ${EASE} ${PHOTO_AT}ms backwards}
  ${P} .kl-sec:not([data-kl-in])>.kl-wrap{opacity:0;transform:translateY(var(--sys-space-s))}
  ${P} .kl-sec>.kl-wrap{transition:opacity 360ms ${EASE},transform 360ms ${EASE}}
  ${P} .kl-faq-item[open] .kl-faq-a{animation:kl-fade 240ms ${EASE}}
  @keyframes kl-rise{from{opacity:0;transform:translateY(calc(var(--sys-space-s) * .75))}}
  @keyframes kl-frame{from{clip-path:inset(8% round var(--kl-clip-r))}to{clip-path:inset(0 round var(--kl-clip-r))}}
  @keyframes kl-card{from{opacity:0;transform:translateY(var(--sys-space-xs))}}
  @keyframes kl-fade{from{opacity:0}}
}
`;
