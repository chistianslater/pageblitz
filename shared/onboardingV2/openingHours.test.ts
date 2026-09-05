import { describe, expect, test } from "vitest";
import {
  PLACEHOLDER_OPENING_HOURS,
  displayOpeningHours,
  withPlaceholderOpeningHours,
  groupOpeningHours,
} from "./openingHours";

describe("withPlaceholderOpeningHours", () => {
  test("leere/fehlende Zeiten → Mo–Fr-Platzhalter", () => {
    expect(withPlaceholderOpeningHours(undefined)).toEqual(
      PLACEHOLDER_OPENING_HOURS
    );
    expect(withPlaceholderOpeningHours(null)).toEqual(
      PLACEHOLDER_OPENING_HOURS
    );
    expect(withPlaceholderOpeningHours([])).toEqual(PLACEHOLDER_OPENING_HOURS);
    expect(PLACEHOLDER_OPENING_HOURS[0]?.day).toBe("Mo–Fr");
  });

  test("echte Zeiten bleiben unverändert (GMB gewinnt)", () => {
    const gmb = [
      { day: "Montag", hours: "08:00–12:00" },
      { day: "Samstag", hours: "10:00–14:00" },
    ];
    expect(withPlaceholderOpeningHours(gmb)).toEqual(gmb);
  });

  test("nur Montag (LLM-Stub) → Mo–Fr-Platzhalter", () => {
    expect(
      withPlaceholderOpeningHours([{ day: "Montag", hours: "09:00–17:00" }])
    ).toEqual(PLACEHOLDER_OPENING_HOURS);
    expect(
      withPlaceholderOpeningHours([{ day: "Mo", hours: "08:00–17:00" }])
    ).toEqual(PLACEHOLDER_OPENING_HOURS);
  });

  test("Mo–Fr-Bereich bleibt (kein Stub)", () => {
    const range = [{ day: "Mo–Fr", hours: "09:00–17:00" }];
    expect(withPlaceholderOpeningHours(range)).toEqual(range);
  });
});

describe("displayOpeningHours (Render/Formular)", () => {
  test("bewusst geleerte Liste bleibt leer", () => {
    expect(displayOpeningHours([])).toEqual([]);
  });

  test("fehlende Zeiten und Montag-Stub werden weiter ersetzt", () => {
    expect(displayOpeningHours(undefined)).toEqual(PLACEHOLDER_OPENING_HOURS);
    expect(
      displayOpeningHours([{ day: "Montag", hours: "09:00–17:00" }])
    ).toEqual(PLACEHOLDER_OPENING_HOURS);
  });

  test("echte Zeiten bleiben unverändert", () => {
    const real = [{ day: "Sa", hours: "10:00–14:00" }];
    expect(displayOpeningHours(real)).toEqual(real);
  });
});

describe("groupOpeningHours (Kontakt-Sektion, Befund 2026-09-05)", () => {
  const g = groupOpeningHours;

  test("fasst aufeinanderfolgende Tage mit gleichen Zeiten zusammen", () => {
    expect(
      g([
        { day: "Montag", hours: "08:30–18:30" },
        { day: "Dienstag", hours: "08:30–18:30" },
        { day: "Mittwoch", hours: "08:30–18:30" },
        { day: "Donnerstag", hours: "08:30–18:30" },
        { day: "Freitag", hours: "08:30–18:30" },
        { day: "Samstag", hours: "08:30–15:00" },
        { day: "Sonntag", hours: "Geschlossen" },
      ])
    ).toEqual([
      { day: "Montag–Freitag", hours: "08:30–18:30" },
      { day: "Samstag", hours: "08:30–15:00" },
      { day: "Sonntag", hours: "Geschlossen" },
    ]);
  });

  test("unterbrochene Reihen bleiben getrennt — Mittwoch anders als der Rest", () => {
    expect(
      g([
        { day: "Montag", hours: "09:00–17:00" },
        { day: "Dienstag", hours: "09:00–17:00" },
        { day: "Mittwoch", hours: "Geschlossen" },
        { day: "Donnerstag", hours: "09:00–17:00" },
        { day: "Freitag", hours: "09:00–17:00" },
      ])
    ).toEqual([
      { day: "Montag–Dienstag", hours: "09:00–17:00" },
      { day: "Mittwoch", hours: "Geschlossen" },
      { day: "Donnerstag–Freitag", hours: "09:00–17:00" },
    ]);
  });

  test("zwei gleiche Tage werden zusammengefasst, ein einzelner bleibt allein", () => {
    expect(
      g([
        { day: "Montag", hours: "10–12" },
        { day: "Dienstag", hours: "10–12" },
        { day: "Mittwoch", hours: "14–18" },
      ])
    ).toEqual([
      { day: "Montag–Dienstag", hours: "10–12" },
      { day: "Mittwoch", hours: "14–18" },
    ]);
  });

  test("bereits zusammengefasste oder unbekannte Bezeichnungen bleiben unangetastet", () => {
    const eingabe = [
      { day: "Mo–Fr", hours: "09:00–17:00" },
      { day: "Nach Vereinbarung", hours: "jederzeit" },
    ];
    expect(g(eingabe)).toEqual(eingabe);
  });

  test("Kurzformen werden ebenfalls zusammengefasst", () => {
    expect(
      g([
        { day: "Mo", hours: "9–17" },
        { day: "Di", hours: "9–17" },
        { day: "Mi", hours: "9–17" },
      ])
    ).toEqual([{ day: "Mo–Mi", hours: "9–17" }]);
  });

  test("leere Liste und ein einzelner Tag bleiben unverändert", () => {
    expect(g([])).toEqual([]);
    expect(g([{ day: "Montag", hours: "9–17" }])).toEqual([
      { day: "Montag", hours: "9–17" },
    ]);
  });

  test("Groß- und Kleinschreibung sowie Leerzeichen stören nicht", () => {
    expect(
      g([
        { day: " montag ", hours: "9–17" },
        { day: "DIENSTAG", hours: "9–17" },
      ])
    ).toEqual([{ day: "montag–DIENSTAG", hours: "9–17" }]);
  });
});
