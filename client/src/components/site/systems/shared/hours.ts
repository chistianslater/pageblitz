import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { coversToday, isPlaceholderHours } from "../../artDirection/heroFacts";
import { isRoundTheClock } from "./entryFacts";

/**
 * Öffnungszeiten (Klar Systemblatt 8/9, geteilt mit Nacht): Tabelle Tag für Tag, „heute"
 * als Text, Mittagspause als zwei Spannen, geschlossene Tage in Folge
 * zusammengefasst („Sa, So"). Nur echte Zeiten (kein Platzhalter der
 * Erzeugung); Tage ohne Eintrag entfallen — nichts wird erfunden.
 * „Heute" hängt nur am Wochentag (wie Werkstoff/Plakat kein „jetzt
 * geöffnet" nach Uhrzeit, Seiten liegen im Cache).
 */

export type Hours = SectionOf<"contact">["openingHours"];

export type HoursRow = {
  /** „Mo", „Sa, So", „Fr–So" oder die Angabe wörtlich. */
  label: string;
  /** „8:00 bis 12:00" je Spanne, sonst „geschlossen" bzw. wörtlich. */
  lines: string[];
  closed: boolean;
  /** Zeilen sind gelesene Spannen (nicht umbrechen), sonst wörtlich. */
  spans: boolean;
  today: boolean;
};

const SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
const LONG = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;
/** Die sieben Wochentage (Berlin, Mittag), ab Montag. */
const WEEK = SHORT.map((_, i) => new Date(Date.UTC(2026, 9, 12 + i, 10)));

const RANGE =
  /(\d{1,2})(?:[:.](\d{2}))?\s*(?:Uhr)?\s*[–-]\s*(\d{1,2})(?:[:.](\d{2}))?/g;
const CLOSED = /geschlossen|closed|ruhetag/i;
const DAY = 24 * 60;
/** Abendtermine ab dieser Schließzeit (Minuten). */
const EVENING = 19 * 60;

export type Span = { from: number; to: number };

/** Echte Zeiten, sonst undefined. */
export const realHours = (hours: Hours | undefined) =>
  hours?.length && !isPlaceholderHours(hours) ? hours : undefined;

function spans(text: string): Span[] {
  return [...text.matchAll(RANGE)]
    .filter(m => Number(m[2] ?? 0) < 60 && Number(m[4] ?? 0) < 60)
    .map(m => ({
      from: Number(m[1]) * 60 + Number(m[2] ?? 0),
      to: Number(m[3]) * 60 + Number(m[4] ?? 0),
    }))
    .filter(r => r.from < DAY && r.to <= DAY);
}

/** Gelesene Spannen eines Zeiten-Texts (Minuten), z. B. für Nacht. */
export const readSpans = (text: string): Span[] => spans(text);

/** Minuten → „8:00", „20:30". */
export const clock = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Geschlossen nur, wenn keine Spanne lesbar ist und der Text es sagt —
 * „8:00 – 12:00, nachmittags geschlossen" ist ein offener Tag.
 */
export const isClosedText = (text: string) =>
  spans(text).length === 0 && CLOSED.test(text);

/** Zeiten-Text → Zeilen, geschlossen-Flag, gelesene Spannen? */
function linesOf(text: string): {
  lines: string[];
  closed: boolean;
  spans: boolean;
} {
  const found = spans(text);
  if (found.length)
    return {
      lines: found.map(s => `${clock(s.from)} bis ${clock(s.to)}`),
      closed: false,
      spans: true,
    };
  if (CLOSED.test(text))
    return { lines: ["geschlossen"], closed: true, spans: false };
  return { lines: [text.trim()], closed: false, spans: false };
}

/** Index (0 = Mo) des heutigen Wochentags in Berlin. */
const todayIndex = (now: Date) => SHORT.findIndex(d => coversToday(d, now));

/** Welche Wochentage deckt eine Angabe ab („Mo–Do" → 0..3)? */
const daysOf = (day: string) =>
  WEEK.flatMap((d, i) => (coversToday(day, d) ? [i] : []));

/** Geschlossene Tage in Folge: zwei mit Komma, mehr mit Strich. */
function closedLabel(days: number[]): string {
  if (days.length === 1) return SHORT[days[0]];
  if (days.length === 2) return `${SHORT[days[0]]}, ${SHORT[days[1]]}`;
  return `${SHORT[days[0]]}–${SHORT[days[days.length - 1]]}`;
}

export function hoursRows(hours: Hours | undefined, now: Date): HoursRow[] {
  const real = realHours(hours);
  if (!real) return [];
  const today = todayIndex(now);
  // Nicht als Wochentag lesbar („Feiertage"): alles wörtlich, Reihenfolge der Daten.
  if (real.some(h => daysOf(h.day).length === 0))
    return real.map(h => ({
      label: h.day.trim(),
      ...linesOf(h.hours),
      today: today >= 0 && coversToday(h.day, now),
    }));
  const perDay = SHORT.flatMap((_, i) => {
    const entry = real.find(h => coversToday(h.day, WEEK[i]));
    return entry ? [{ i, ...linesOf(entry.hours) }] : [];
  });
  const rows: HoursRow[] = [];
  for (let k = 0; k < perDay.length; k++) {
    const day = perDay[k];
    if (!day.closed) {
      rows.push({
        label: SHORT[day.i],
        lines: day.lines,
        closed: false,
        spans: day.spans,
        today: day.i === today,
      });
      continue;
    }
    const run = [day.i];
    while (perDay[k + 1]?.closed && perDay[k + 1].i === run[run.length - 1] + 1)
      run.push(perDay[++k].i);
    rows.push({
      label: closedLabel(run),
      lines: ["geschlossen"],
      closed: true,
      spans: false,
      today: run.includes(today),
    });
  }
  return rows;
}

export type TodayHours = { day: string; lines: string[]; closed: boolean };

/** Heute-Karte am Foto („Heute, Montag / 8:00 bis 12:00 …"). */
export function todayHours(
  hours: Hours | undefined,
  now: Date
): TodayHours | undefined {
  const real = realHours(hours);
  const i = todayIndex(now);
  if (!real || i < 0) return undefined;
  if (isRoundTheClock(real))
    return { day: LONG[i], lines: ["rund um die Uhr geöffnet"], closed: false };
  const entry = real.find(h => coversToday(h.day, now));
  if (!entry) return undefined;
  const { lines, closed } = linesOf(entry.hours);
  return { day: LONG[i], lines, closed };
}

/** Tage ausgeschrieben: Folge „Montag bis Donnerstag", sonst „… und …". */
function daysText(days: number[]): string {
  const consecutive = days.every((d, k) => k === 0 || d === days[k - 1] + 1);
  if (days.length > 2 && consecutive)
    return `${LONG[days[0]]} bis ${LONG[days[days.length - 1]]}`;
  const names = days.map(d => LONG[d]);
  return names.length === 1
    ? names[0]
    : `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}`;
}

/**
 * Abendtermine (Karte neben dem schwachen Foto, Systemblatt 8 Mitte):
 * späteste Schließzeit ab 19 Uhr und die Tage, an denen sie gilt. Über
 * Mitternacht zählt nicht (Praxen); ohne Abend nichts.
 */
export function eveningHours(
  hours: Hours | undefined
): { days: string; until: string } | undefined {
  const real = realHours(hours);
  if (!real || isRoundTheClock(real)) return undefined;
  const close = WEEK.map(d => {
    const entry = real.find(h => coversToday(h.day, d));
    if (!entry) return -1;
    const ends = spans(entry.hours)
      .filter(s => s.to > s.from)
      .map(s => s.to);
    return ends.length ? Math.max(...ends) : -1;
  });
  const latest = Math.max(...close);
  if (latest < EVENING) return undefined;
  const days = close.flatMap((c, i) => (c === latest ? [i] : []));
  return { days: daysText(days), until: `bis ${clock(latest)} Uhr` };
}
