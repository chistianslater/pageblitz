/**
 * Reine Hilfsfunktionen für die Terminbuchungs-Insel (`BookingIsland.tsx`) —
 * bewusst ohne React/DOM-Abhängigkeit, damit sie ohne Rendering getestet
 * werden können. Spiegelt die Antwortformen von `server/_core/bookingRoutes.ts`
 * (nicht importiert — reines Client-Modul, keine Server-Abhängigkeit).
 */

export interface DaySchedule {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface WeeklySchedule {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
}

export interface BookingSettings {
  title: string;
  description: string | null;
  durationMinutes: number;
  advanceDays: number;
  schedule: WeeklySchedule;
}

export interface DateOption {
  /** "YYYY-MM-DD", identisch zum `date`-Query-Parameter der Slots-Route. */
  iso: string;
  /** z. B. "14. April" — Tag + Monat auf Deutsch, ohne Jahr/Wochentag. */
  label: string;
  /** Kurzer deutscher Wochentag, z. B. "Mo". */
  weekday: string;
}

/** Reihenfolge wie `Date#getDay()` (0 = Sonntag) — deckt sich mit `DAY_KEYS`
 * in `server/_core/bookingRoutes.ts`. */
const DAY_KEYS: (keyof WeeklySchedule)[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const WEEKDAY_SHORT_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function dateToYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Baut die Liste der wählbaren Tage: die nächsten `advanceDays` Kalendertage
 * ab (einschließlich) `now`, gefiltert auf Wochentage, die im `schedule`
 * aktiv sind. `now` wird injiziert statt intern `new Date()` zu lesen, damit
 * das Ergebnis in Tests deterministisch bleibt.
 */
export function buildDateOptions(
  schedule: WeeklySchedule,
  advanceDays: number,
  now: Date
): DateOption[] {
  const options: DateOption[] = [];
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let offset = 0; offset < advanceDays; offset++) {
    const date = new Date(base);
    date.setDate(date.getDate() + offset);
    const dayIndex = date.getDay();
    const daySchedule = schedule[DAY_KEYS[dayIndex]];
    if (!daySchedule?.enabled) continue;
    options.push({
      iso: dateToYMD(date),
      label: date.toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
      }),
      weekday: WEEKDAY_SHORT_DE[dayIndex],
    });
  }
  return options;
}

export const BOOKING_ERROR_LOCKED =
  "Die Terminbuchung ist nach der Freischaltung aktiv.";
export const BOOKING_ERROR_SLOT_TAKEN =
  "Dieser Termin ist leider bereits vergeben. Bitte wähle eine andere Uhrzeit.";
export const BOOKING_ERROR_MISSING_FIELDS =
  "Bitte fülle alle Pflichtfelder aus.";
export const BOOKING_ERROR_GENERIC =
  "Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es später erneut.";

/**
 * Ordnet einen HTTP-Status der passenden deutschen Fehlermeldung zu.
 * 404/403 → Add-on noch nicht freigeschaltet (Website ohne `addOnBooking`
 * oder unbekannter Slug, siehe bookingRoutes.ts `not_available`). 409 →
 * Slot wurde inzwischen von jemand anderem gebucht (Race-Guard beim
 * `/book`-Aufruf). 400 → fehlende/ungültige Pflichtfelder. Alles andere
 * (5xx, Netzwerkfehler ohne Status, ...) → generisch.
 */
export function mapBookingError(status: number | undefined): string {
  if (status === 404 || status === 403) return BOOKING_ERROR_LOCKED;
  if (status === 409) return BOOKING_ERROR_SLOT_TAKEN;
  if (status === 400) return BOOKING_ERROR_MISSING_FIELDS;
  return BOOKING_ERROR_GENERIC;
}

/** Formatiert eine "HH:MM"-Uhrzeit aus der Slots-Route für die Anzeige. */
export function formatSlotLabel(time: string): string {
  return `${time} Uhr`;
}
