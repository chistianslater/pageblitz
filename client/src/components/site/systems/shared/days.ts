/**
 * Wochentags-Zeilen in Preislisten und Tafeln („Di", „Dienstag", „So.",
 * „Sonnabend"). Reine Helfer für „heute"-Markierungen (Werkstoff, Plakat).
 */

/** Reiner Wochentag — dann darf eine Tafelzeile „heute" tragen. */
const DAY_NAME =
  /^(mo(ntag)?|di(enstag)?|mi(ttwoch)?|do(nnerstag)?|fr(eitag)?|sa(mstag)?|so(nntag|nnabend)?)\.?$/i;

export const isDayName = (name: string) => DAY_NAME.test(name.trim());

/** „So." → „So", „Sonnabend" → „Sa" — Form, die `coversToday` versteht. */
export function normalizeDay(name: string): string {
  const t = name.trim().replace(/\.$/, "");
  return /^sonnabend$/i.test(t) ? "Sa" : t;
}
