import { describe, expect, test } from "vitest";
import {
  AKTUELLER_DESIGN_STAND,
  DESIGN_STAND_MUSTER,
} from "./designStand";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

describe("Design-Stand", () => {
  test("der aktuelle Stand hat das Format Jahr-Monat", () => {
    expect(AKTUELLER_DESIGN_STAND).toMatch(DESIGN_STAND_MUSTER);
  });

  test("ein Dokument mit Stand ist gültig", () => {
    const doc = { ...getFixture("werkbank", "full"), designStand: "2026-09" };
    expect(WebsiteDataV2Schema.safeParse(doc).success).toBe(true);
  });

  test("bestehende Dokumente ohne Stand bleiben gültig", () => {
    // Rückwärtskompatibel: Alle Seiten vor dieser Änderung haben kein Feld.
    const { designStand, ...ohne } = {
      ...getFixture("werkbank", "full"),
      designStand: "2026-09",
    };
    expect(WebsiteDataV2Schema.safeParse(ohne).success).toBe(true);
  });

  test("Unsinn im Feld wird abgewiesen", () => {
    // Das Feld ist die Grundlage fuer spaetere Umschaltung — ein freier
    // String waere dort wertlos.
    for (const kaputt of ["September 2026", "2026-13", "2026", "v2"]) {
      const doc = { ...getFixture("werkbank", "full"), designStand: kaputt };
      expect(WebsiteDataV2Schema.safeParse(doc).success).toBe(false);
    }
  });
});
