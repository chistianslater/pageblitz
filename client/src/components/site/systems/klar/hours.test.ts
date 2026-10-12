import { describe, expect, test } from "vitest";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { eveningHours, hoursRows, isClosedText, todayHours } from "./hours";
import { TEST_NOW } from "./testkit";

/** Montag, 12.10.2026, 10 Uhr in Berlin. */
const MONDAY = new Date("2026-10-12T10:00:00+02:00");
/** Sonntag, 18.10.2026. */
const SUNDAY = new Date("2026-10-18T10:00:00+02:00");

const ZAHN = [
  { day: "Mo", hours: "8:00 – 12:00, 14:00 – 18:00" },
  { day: "Di", hours: "8:00 – 12:00, 14:00 – 18:00" },
  { day: "Mi", hours: "8:00 – 13:00" },
  { day: "Do", hours: "8:00 – 12:00, 14:00 – 19:00" },
  { day: "Fr", hours: "8:00 – 13:00" },
  { day: "Sa", hours: "geschlossen" },
  { day: "So", hours: "geschlossen" },
];

describe("Klar: Sprechzeiten-Zeilen", () => {
  test("ein Tag je Zeile, Mittagspause als zwei Spannen, Sa+So zusammen geschlossen", () => {
    const rows = hoursRows(ZAHN, MONDAY);
    expect(rows.map(r => r.label)).toEqual([
      "Mo",
      "Di",
      "Mi",
      "Do",
      "Fr",
      "Sa, So",
    ]);
    expect(rows[0]).toEqual({
      label: "Mo",
      lines: ["8:00 bis 12:00", "14:00 bis 18:00"],
      closed: false,
      spans: true,
      today: true,
    });
    expect(rows[2].lines).toEqual(["8:00 bis 13:00"]);
    expect(rows[5]).toEqual({
      label: "Sa, So",
      lines: ["geschlossen"],
      closed: true,
      spans: false,
      today: false,
    });
  });

  test("„heute“ hängt am Wochentag (Berlin), auch im zusammengefassten geschlossenen Block", () => {
    expect(
      hoursRows(ZAHN, TEST_NOW)
        .filter(r => r.today)
        .map(r => r.label)
    ).toEqual(["Di"]);
    expect(
      hoursRows(ZAHN, SUNDAY)
        .filter(r => r.today)
        .map(r => r.label)
    ).toEqual(["Sa, So"]);
  });

  test("Bereiche („Mo–Do“) werden je Tag aufgeschlüsselt; fehlende Tage entfallen (nichts erfunden)", () => {
    const rows = hoursRows(
      [
        { day: "Mo–Do", hours: "7:30 – 20:00" },
        { day: "Fr", hours: "07:30-14:00 Uhr" },
      ],
      MONDAY
    );
    expect(rows.map(r => r.label)).toEqual(["Mo", "Di", "Mi", "Do", "Fr"]);
    expect(rows[4].lines).toEqual(["7:30 bis 14:00"]);
  });

  test("drei geschlossene Tage in Folge: „Fr–So“", () => {
    const rows = hoursRows(
      [
        { day: "Mo–Do", hours: "9:00 – 17:00" },
        { day: "Fr–So", hours: "geschlossen" },
      ],
      MONDAY
    );
    expect(rows.at(-1)!.label).toBe("Fr–So");
  });

  test("Platzhalter der Erzeugung und leere Angaben: keine Zeilen", () => {
    expect(hoursRows(PLACEHOLDER_OPENING_HOURS, MONDAY)).toEqual([]);
    expect(hoursRows(undefined, MONDAY)).toEqual([]);
    expect(hoursRows([], MONDAY)).toEqual([]);
  });

  test("nicht lesbare Tage oder Zeiten bleiben wörtlich stehen", () => {
    const rows = hoursRows(
      [
        { day: "Mo–Fr", hours: "nach Vereinbarung" },
        { day: "Feiertage", hours: "geschlossen" },
      ],
      MONDAY
    );
    expect(rows).toEqual([
      {
        label: "Mo–Fr",
        lines: ["nach Vereinbarung"],
        closed: false,
        spans: false,
        today: true,
      },
      {
        label: "Feiertage",
        lines: ["geschlossen"],
        closed: true,
        spans: false,
        today: false,
      },
    ]);
  });
});

describe("Klar: halbe Tage", () => {
  test("„8:00 – 12:00, nachmittags geschlossen“ ist ein offener Tag (Spannen vor „geschlossen“)", () => {
    const hours = [
      { day: "Mo", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Mi", hours: "8:00 – 12:00, nachmittags geschlossen" },
      { day: "Sa", hours: "geschlossen" },
    ];
    const rows = hoursRows(hours, MONDAY);
    expect(rows[1]).toEqual({ label: "Mi", lines: ["8:00 bis 12:00"], closed: false, spans: true, today: false });
    expect(rows[2].closed).toBe(true);
    const wed = new Date("2026-10-14T10:00:00+02:00");
    expect(todayHours(hours, wed)).toEqual({ day: "Mittwoch", lines: ["8:00 bis 12:00"], closed: false });
    expect(isClosedText("8:00 – 12:00, nachmittags geschlossen")).toBe(false);
    expect(isClosedText("Ruhetag")).toBe(true);
  });
  test("Abendtermine zählen auch an halben Tagen", () => {
    expect(
      eveningHours([{ day: "Do", hours: "14:00 – 20:00, vormittags geschlossen" }])
    ).toEqual({ days: "Donnerstag", until: "bis 20:00 Uhr" });
  });
});

describe("Klar: Heute-Karte", () => {
  test("Wochentag ausgeschrieben, Spannen als Zeilen", () => {
    expect(todayHours(ZAHN, MONDAY)).toEqual({
      day: "Montag",
      lines: ["8:00 bis 12:00", "14:00 bis 18:00"],
      closed: false,
    });
  });
  test("geschlossen und ohne Eintrag", () => {
    expect(todayHours(ZAHN, SUNDAY)).toEqual({
      day: "Sonntag",
      lines: ["geschlossen"],
      closed: true,
    });
    expect(
      todayHours([{ day: "Mo", hours: "9 – 12" }], TEST_NOW)
    ).toBeUndefined();
    expect(todayHours(PLACEHOLDER_OPENING_HOURS, MONDAY)).toBeUndefined();
  });
  test("rund um die Uhr", () => {
    expect(
      todayHours([{ day: "Mo–So", hours: "24 Stunden geöffnet" }], MONDAY)
    ).toEqual({
      day: "Montag",
      lines: ["rund um die Uhr geöffnet"],
      closed: false,
    });
  });
});

describe("Klar: Abendtermine (schwaches Foto)", () => {
  test("späteste Schließzeit ab 19 Uhr mit ihren Tagen", () => {
    expect(
      eveningHours([
        { day: "Mo–Do", hours: "7:30 – 20:00" },
        { day: "Fr", hours: "7:30 – 14:00" },
      ])
    ).toEqual({ days: "Montag bis Donnerstag", until: "bis 20:00 Uhr" });
    expect(eveningHours(ZAHN)).toEqual({
      days: "Donnerstag",
      until: "bis 19:00 Uhr",
    });
    expect(
      eveningHours([
        { day: "Mo", hours: "9 – 20" },
        { day: "Di", hours: "9 – 12" },
        { day: "Mi", hours: "9 – 20" },
      ])
    ).toEqual({ days: "Montag und Mittwoch", until: "bis 20:00 Uhr" });
  });
  test("früher Schluss, über Mitternacht, Platzhalter: nichts", () => {
    expect(eveningHours([{ day: "Mo–Fr", hours: "8 – 18" }])).toBeUndefined();
    expect(eveningHours([{ day: "Fr", hours: "18 – 2" }])).toBeUndefined();
    expect(eveningHours(PLACEHOLDER_OPENING_HOURS)).toBeUndefined();
  });
});
