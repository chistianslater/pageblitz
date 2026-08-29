import { describe, expect, test } from "vitest";
import {
  PLACEHOLDER_OPENING_HOURS,
  displayOpeningHours,
  withPlaceholderOpeningHours,
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
