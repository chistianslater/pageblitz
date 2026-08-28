import { describe, expect, test } from "vitest";
import { PLACEHOLDER_OPENING_HOURS } from "../../shared/onboardingV2/openingHours";
import { mapGmbOpeningHoursToV2, resolveOpeningHours } from "./gmbOpeningHours";

describe("mapGmbOpeningHoursToV2", () => {
  test("splitet weekday_text am ersten ': '", () => {
    expect(
      mapGmbOpeningHoursToV2([
        "Montag: 09:00–17:00 Uhr",
        "Dienstag: 09:00–17:00 Uhr",
      ])
    ).toEqual([
      { day: "Montag", hours: "09:00–17:00 Uhr" },
      { day: "Dienstag", hours: "09:00–17:00 Uhr" },
    ]);
  });

  test("leer/null → undefined (kein Platzhalter auf dieser Stufe)", () => {
    expect(mapGmbOpeningHoursToV2(null)).toBeUndefined();
    expect(mapGmbOpeningHoursToV2([])).toBeUndefined();
  });
});

describe("resolveOpeningHours", () => {
  test("GMB-Zeiten gewinnen", () => {
    expect(resolveOpeningHours(["Samstag: 10:00–14:00 Uhr"])).toEqual([
      { day: "Samstag", hours: "10:00–14:00 Uhr" },
    ]);
  });

  test("ohne GMB → Mo–Fr-Platzhalter", () => {
    expect(resolveOpeningHours(null)).toEqual(PLACEHOLDER_OPENING_HOURS);
    expect(resolveOpeningHours([])).toEqual(PLACEHOLDER_OPENING_HOURS);
  });

  test("nur Montag (unvollständige GMB-/LLM-Zeile) → Mo–Fr-Platzhalter", () => {
    expect(resolveOpeningHours(["Montag: 09:00–17:00 Uhr"])).toEqual(
      PLACEHOLDER_OPENING_HOURS
    );
  });
});
