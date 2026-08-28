import { describe, expect, test } from "vitest";
import {
  PLACEHOLDER_OPENING_HOURS,
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
});
