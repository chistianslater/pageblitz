import { describe, expect, test } from "vitest";
import {
  BOOKING_ERROR_GENERIC,
  BOOKING_ERROR_LOCKED,
  BOOKING_ERROR_MISSING_FIELDS,
  BOOKING_ERROR_SLOT_TAKEN,
  buildDateOptions,
  formatSlotLabel,
  mapBookingError,
  type WeeklySchedule,
} from "./bookingHelpers";

const DISABLED = { enabled: false, start: "09:00", end: "17:00" };
const ENABLED = { enabled: true, start: "09:00", end: "17:00" };

const ALL_DAYS_SCHEDULE: WeeklySchedule = {
  mon: ENABLED,
  tue: ENABLED,
  wed: ENABLED,
  thu: ENABLED,
  fri: ENABLED,
  sat: ENABLED,
  sun: ENABLED,
};

const WEEKDAYS_ONLY_SCHEDULE: WeeklySchedule = {
  mon: ENABLED,
  tue: ENABLED,
  wed: ENABLED,
  thu: ENABLED,
  fri: ENABLED,
  sat: DISABLED,
  sun: DISABLED,
};

describe("buildDateOptions", () => {
  // 2026-08-24 ist ein Montag.
  const MONDAY = new Date(2026, 7, 24, 10, 0, 0);

  test("liefert die nächsten advanceDays Kalendertage, wenn jeder Wochentag aktiv ist", () => {
    const options = buildDateOptions(ALL_DAYS_SCHEDULE, 5, MONDAY);
    expect(options).toHaveLength(5);
    expect(options[0]).toEqual({ iso: "2026-08-24", label: "24. August", weekday: "Mo" });
    expect(options[4]).toEqual({ iso: "2026-08-28", label: "28. August", weekday: "Fr" });
  });

  test("überspringt deaktivierte Wochentage (Sa/So raus)", () => {
    // Mo 24.8. bis So 30.8. (7 Tage) — Sa 29.8. und So 30.8. sind deaktiviert.
    const options = buildDateOptions(WEEKDAYS_ONLY_SCHEDULE, 7, MONDAY);
    expect(options).toHaveLength(5);
    expect(options.map(o => o.iso)).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
    ]);
  });

  test("respektiert advanceDays (kürzeres Fenster liefert weniger Tage)", () => {
    const options = buildDateOptions(ALL_DAYS_SCHEDULE, 2, MONDAY);
    expect(options).toHaveLength(2);
    expect(options.map(o => o.iso)).toEqual(["2026-08-24", "2026-08-25"]);
  });

  test("advanceDays=0 liefert eine leere Liste", () => {
    expect(buildDateOptions(ALL_DAYS_SCHEDULE, 0, MONDAY)).toEqual([]);
  });

  test("leeres Wochenplan (alle Tage deaktiviert) liefert eine leere Liste", () => {
    const allDisabled: WeeklySchedule = {
      mon: DISABLED,
      tue: DISABLED,
      wed: DISABLED,
      thu: DISABLED,
      fri: DISABLED,
      sat: DISABLED,
      sun: DISABLED,
    };
    expect(buildDateOptions(allDisabled, 10, MONDAY)).toEqual([]);
  });

  test("ist deterministisch für dasselbe injizierte `now`", () => {
    const first = buildDateOptions(WEEKDAYS_ONLY_SCHEDULE, 14, MONDAY);
    const second = buildDateOptions(WEEKDAYS_ONLY_SCHEDULE, 14, MONDAY);
    expect(first).toEqual(second);
  });
});

describe("mapBookingError", () => {
  test("404 → Freischaltungs-Hinweis", () => {
    expect(mapBookingError(404)).toBe(BOOKING_ERROR_LOCKED);
  });

  test("403 → Freischaltungs-Hinweis", () => {
    expect(mapBookingError(403)).toBe(BOOKING_ERROR_LOCKED);
  });

  test("409 → Slot-bereits-vergeben-Hinweis", () => {
    expect(mapBookingError(409)).toBe(BOOKING_ERROR_SLOT_TAKEN);
  });

  test("400 → fehlende Pflichtfelder", () => {
    expect(mapBookingError(400)).toBe(BOOKING_ERROR_MISSING_FIELDS);
  });

  test("500 → generische Fehlermeldung", () => {
    expect(mapBookingError(500)).toBe(BOOKING_ERROR_GENERIC);
  });

  test("undefined (z. B. Netzwerkfehler ohne Response) → generische Fehlermeldung", () => {
    expect(mapBookingError(undefined)).toBe(BOOKING_ERROR_GENERIC);
  });
});

describe("formatSlotLabel", () => {
  test("hängt ' Uhr' an die Uhrzeit an", () => {
    expect(formatSlotLabel("09:00")).toBe("09:00 Uhr");
  });

  test("funktioniert auch für Uhrzeiten am Nachmittag", () => {
    expect(formatSlotLabel("14:30")).toBe("14:30 Uhr");
  });
});
