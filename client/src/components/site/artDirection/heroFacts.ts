/**
 * Fakten für die Kompositionen „Bühne" und „Farbfläche" (2026-10-05):
 * Öffnungszeit von heute, Straße, Telefon. Alles kommt aus dem
 * Kontakt-Abschnitt — fehlt etwas, entfällt das Element, erfunden wird nie.
 */
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../shared/onboardingV2/openingHours";

type OpeningHours = { day: string; hours: string }[];

const DAY_ABBR = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_FULL = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

/** Wochentag in Deutschland — der Server läuft in UTC, die Kunden nicht. */
function berlinWeekday(now: Date): number {
  const name = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Berlin",
  }).format(now);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

function dayIndex(token: string): number {
  const t = token.trim().toLocaleLowerCase("de-DE");
  const abbr = DAY_ABBR.findIndex(d => d.toLocaleLowerCase("de-DE") === t);
  return abbr !== -1
    ? abbr
    : DAY_FULL.findIndex(d => d.toLocaleLowerCase("de-DE") === t);
}

function coversDay(day: string, today: number): boolean {
  const range = day.trim().match(/^(\p{L}{2,})\s*[–-]\s*(\p{L}{2,})$/u);
  if (range) {
    const start = dayIndex(range[1]);
    const end = dayIndex(range[2]);
    if (start === -1 || end === -1) return false;
    return start <= end
      ? today >= start && today <= end
      : today >= start || today <= end;
  }
  return dayIndex(day) === today;
}

function isPlaceholder(hours: OpeningHours): boolean {
  return (
    hours.length === PLACEHOLDER_OPENING_HOURS.length &&
    hours.every(
      (h, i) =>
        h.day === PLACEHOLDER_OPENING_HOURS[i].day &&
        h.hours === PLACEHOLDER_OPENING_HOURS[i].hours
    )
  );
}

/** „09:00–18:00 Uhr" → „9–18 Uhr", „08:30 - 12:00" → „8:30–12 Uhr". */
export function shortHours(hours: string): string {
  const compact = hours
    .replace(/\s*Uhr\s*/gi, "")
    .replace(/\b0(\d)(?=:)/g, "$1")
    .replace(/:00\b/g, "")
    .replace(/\s*[–-]\s*/g, "–")
    .trim();
  return /\d/.test(compact) ? `${compact} Uhr` : hours.trim();
}

/**
 * Neutrale Zeile „Heute 9–18 Uhr" bzw. „Heute geschlossen". Bewusst kein
 * „jetzt geöffnet": Live-Seiten liegen bis zu einer Stunde im Cache.
 */
export function todayLine(
  openingHours: OpeningHours | undefined,
  now: Date
): string | undefined {
  if (!openingHours?.length || isPlaceholder(openingHours)) return undefined;
  const today = berlinWeekday(now);
  const entry = openingHours.find(oh => coversDay(oh.day, today));
  if (!entry) return undefined;
  if (/geschlossen|closed|ruhetag/i.test(entry.hours))
    return "Heute geschlossen";
  return `Heute ${shortHours(entry.hours)}`;
}

/**
 * Google liefert die Straße manchmal mit Firmennamen davor
 * („Friseurhaarem, Ludgeripl. 19"). Für die Kopfzeile zählt nur der Teil
 * mit Hausnummer.
 */
export function streetLine(street: string | undefined): string | undefined {
  if (!street?.trim()) return undefined;
  const parts = street
    .split(",")
    .map(p => p.trim())
    .filter(Boolean);
  return parts.find(p => /\d/.test(p)) ?? parts[parts.length - 1];
}

/** `tel:`-Link nur mit Ziffern und führendem Plus. */
export function telHref(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.trim().replace(/(?!^\+)\D/g, "");
  return digits.replace(/\D/g, "").length >= 6 ? `tel:${digits}` : undefined;
}
