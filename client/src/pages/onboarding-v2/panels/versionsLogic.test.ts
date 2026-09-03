import { describe, expect, test } from "vitest";
import {
  formatVersionTime,
  TRIGGER_LABELS,
  undoButtonState,
} from "./versionsLogic";

const now = new Date("2026-09-03T14:00:00+02:00");

describe("formatVersionTime (Verlauf, 2026-09-03)", () => {
  test("unter einer Minute: gerade eben", () => {
    expect(formatVersionTime(new Date(now.getTime() - 20_000), now)).toBe(
      "gerade eben"
    );
  });
  test("unter einer Stunde: vor n Min.", () => {
    expect(formatVersionTime(new Date(now.getTime() - 5 * 60_000), now)).toBe(
      "vor 5 Min."
    );
  });
  test("heute: Uhrzeit", () => {
    expect(formatVersionTime(new Date("2026-09-03T09:07:00+02:00"), now)).toBe(
      "heute, 09:07"
    );
  });
  test("früher: Datum und Uhrzeit", () => {
    expect(formatVersionTime(new Date("2026-08-30T18:30:00+02:00"), now)).toBe(
      "30.08., 18:30"
    );
  });
});

describe("TRIGGER_LABELS", () => {
  test("deckt alle Auslöser mit deutschem Text ab", () => {
    expect(TRIGGER_LABELS).toEqual({
      generation: "Erstellt",
      chat: "KI-Chat",
      panel: "Panel",
      inline: "Direkt bearbeitet",
      restore: "Wiederhergestellt",
    });
  });
});

describe("undoButtonState", () => {
  const T = new Date();
  test("ohne zweiten Stand: deaktiviert", () => {
    expect(undoButtonState([])).toEqual({
      enabled: false,
      text: "Rückgängig",
      title: "Es gibt noch keinen früheren Stand",
    });
    expect(
      undoButtonState([
        {
          id: 1,
          trigger: "generation",
          label: "Website erstellt",
          createdAt: T,
        },
      ])
    ).toMatchObject({ enabled: false });
  });
  test("normaler Stand: Rückgängig mit Label des letzten Schritts", () => {
    expect(
      undoButtonState([
        { id: 2, trigger: "panel", label: "Texte geändert", createdAt: T },
        {
          id: 1,
          trigger: "generation",
          label: "Website erstellt",
          createdAt: T,
        },
      ])
    ).toEqual({
      enabled: true,
      text: "Rückgängig",
      title: "Rückgängig: Texte geändert",
    });
  });
  test("direkt nach einem Rückgängig wird der Knopf zum Wiederholen", () => {
    expect(
      undoButtonState([
        {
          id: 3,
          trigger: "restore",
          label: "Rückgängig: Texte geändert",
          createdAt: T,
        },
        { id: 2, trigger: "panel", label: "Texte geändert", createdAt: T },
      ])
    ).toEqual({
      enabled: true,
      text: "Wiederholen",
      title: "Wiederholen: Texte geändert",
    });
  });
});
