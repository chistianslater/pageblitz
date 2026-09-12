/**
 * Design-Stand (Spec 2026-09-12, „Design-Stände").
 *
 * Das Aussehen einer Kundenseite liegt im Code, nicht im Dokument: Eine
 * geänderte Zeile in `packs/<id>/css.ts` verändert jede Seite auf diesem
 * Pack beim nächsten Aufruf. Solange niemand zahlt, ist das folgenlos —
 * ab dem ersten Kunden nicht mehr.
 *
 * Dieses Feld hält fest, MIT WELCHER Fassung eine Seite gebaut wurde.
 * Es tut vorerst nichts weiter: kein zweiter Stand, keine Umschaltung.
 * Aber rückwirkend lässt es sich nicht ermitteln, deshalb steht es jetzt
 * schon drin (Spec §6, Schritte 1–2).
 */
export const AKTUELLER_DESIGN_STAND = "2026-09";

/** Format: Jahr-Monat, z. B. „2026-09". */
export const DESIGN_STAND_MUSTER = /^\d{4}-(0[1-9]|1[0-2])$/;
