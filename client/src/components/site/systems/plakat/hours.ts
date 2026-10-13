import type { SectionOf } from "../../../../../../shared/siteContract/types";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
} from "../shared/heroFacts";
import { groupOpeningHours } from "../../../../../../shared/onboardingV2/openingHours";
import { isRoundTheClock } from "../shared";

/**
 * Öffnungszeiten für Plakat: Status-Zeile, späte Schließzeit, Sonntag.
 * Nur echte Zeiten (kein Platzhalter der Erzeugung) — sonst nichts.
 */

export type Hours = SectionOf<"contact">["openingHours"];

const RANGE =
  /(\d{1,2})(?:[:.](\d{2}))?\s*(?:Uhr)?\s*[–-]\s*(\d{1,2})(?:[:.](\d{2}))?/g;
const CLOSED = /geschlossen|closed|ruhetag/i;
const DAY = 24 * 60;

/** Echte Zeiten, sonst undefined. */
export const realHours = (hours: Hours | undefined) =>
  hours?.length && !isPlaceholderHours(hours) ? hours : undefined;

/** „11:00 – 2:00" → Spannen in Minuten (`to < from`: über Mitternacht). */
export function spans(text: string): { from: number; to: number }[] {
  return [...text.matchAll(RANGE)]
    .filter(m => Number(m[2] ?? 0) < 60 && Number(m[4] ?? 0) < 60)
    .map(m => ({
      from: Number(m[1]) * 60 + Number(m[2] ?? 0),
      to: Number(m[3]) * 60 + Number(m[4] ?? 0),
    }))
    .filter(r => r.from < DAY && r.to <= DAY);
}

/** Minuten → „19 Uhr", „18:30 Uhr", „2 Uhr" (24 → 24 Uhr). */
export function uhr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} Uhr` : `${h}:${String(m).padStart(2, "0")} Uhr`;
}

export type Status = { text: string; closed: boolean };

/**
 * Status-Zeile im Einstieg (Systemblatt: „Heute bis 19 Uhr offen"). Wie
 * Werkstoff kein „jetzt geöffnet" nach Uhrzeit (Seiten liegen im Cache);
 * nur der Tag zählt. Ohne Uhrzeit für heute: keine Zeile.
 */
export function statusLine(
  hours: Hours | undefined,
  now: Date
): Status | undefined {
  const real = realHours(hours);
  if (!real) return undefined;
  if (isRoundTheClock(real))
    return { text: "Rund um die Uhr offen", closed: false };
  const entry = real.find(h => coversToday(h.day, now));
  if (!entry) return undefined;
  if (CLOSED.test(entry.hours))
    return { text: "Heute geschlossen", closed: true };
  const today = spans(entry.hours);
  if (!today.length) return undefined;
  return {
    text: `Heute bis ${uhr(today[today.length - 1].to)} offen`,
    closed: false,
  };
}

/** Späteste Schließzeit nach Mitternacht (bis 6 Uhr), in Minuten. */
const LATE_LIMIT = 6 * 60;

export function lateClose(hours: Hours | undefined): number | undefined {
  const real = realHours(hours);
  if (!real || isRoundTheClock(real)) return undefined;
  const late = real
    .filter(h => !CLOSED.test(h.hours))
    .flatMap(h => spans(h.hours))
    .filter(s => s.to < s.from && s.to > 0 && s.to <= LATE_LIMIT)
    .map(s => s.to);
  return late.length ? Math.max(...late) : undefined;
}

/** Ein Sonntag (Berlin, Mittag). */
const SUNDAY = new Date(Date.UTC(2026, 9, 18, 10));

/** Sonntags geöffnet (eigener Eintrag mit Uhrzeit, nicht „geschlossen"). */
export function sundayOpen(hours: Hours | undefined): boolean {
  const real = realHours(hours);
  if (!real || isRoundTheClock(real)) return false;
  return real.some(
    h =>
      coversToday(h.day, SUNDAY) &&
      !CLOSED.test(h.hours) &&
      spans(h.hours).length > 0
  );
}

/** Die sieben Wochentage (Berlin, Mittag), ab Montag. */
const WEEK = Array.from(
  { length: 7 },
  (_, i) => new Date(Date.UTC(2026, 9, 12 + i, 10))
);

/**
 * Kurzform der Zeiten für Fakten und Laufband: die zusammengefasste Zeile
 * mit den meisten Tagen („Di–Sa", „11–2 Uhr"), bei Gleichstand die erste.
 */
export function firstHours(
  hours: Hours | undefined
): { day: string; hours: string } | undefined {
  const real = realHours(hours);
  if (!real) return undefined;
  const open = groupOpeningHours(real).filter(h => !CLOSED.test(h.hours));
  if (!open.length) return undefined;
  const days = (day: string) => WEEK.filter(d => coversToday(day, d)).length;
  const best = open.reduce((a, b) => (days(b.day) > days(a.day) ? b : a));
  return { day: best.day, hours: shortHours(best.hours) };
}
