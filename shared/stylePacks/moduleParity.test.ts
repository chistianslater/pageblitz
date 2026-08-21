import { describe, expect, test } from "vitest";
import { STYLE_PACKS } from "./index";
import { getFixture } from "../siteContract/fixtures";
import { PACK_MODULES } from "../../client/src/components/site/packRegistry";
// Import-Nebenwirkung: registriert alle Pack-Module in PACK_MODULES.
import "../../client/src/components/site/packs/index";

/**
 * Registry-Invarianten-Test: für jede in STYLE_PACKS registrierte Pack-ID
 * müssen ein Client-Modul (PACK_MODULES) und eine Fixture existieren.
 * Ohne diesen Test bricht "Plan-B-Drift" — eine Verfassung ohne Modul
 * und/oder Fixture — erst zur Laufzeit (SiteRenderer/getFixture werfen),
 * nicht schon in CI.
 */
describe("Style-Pack-Registrierung — Modul- und Fixture-Parität", () => {
  const registeredPackIds = Object.keys(STYLE_PACKS);

  test("STYLE_PACKS ist nicht leer (Test wäre sonst trivial grün)", () => {
    expect(registeredPackIds.length).toBeGreaterThan(0);
  });

  for (const packId of registeredPackIds) {
    test(`${packId}: Client-Modul ist in PACK_MODULES registriert`, () => {
      expect(PACK_MODULES[packId as keyof typeof PACK_MODULES]).toBeDefined();
    });

    test(`${packId}: Fixtures (full + minimal) existieren`, () => {
      expect(() =>
        getFixture(packId as Parameters<typeof getFixture>[0], "full")
      ).not.toThrow();
      expect(() =>
        getFixture(packId as Parameters<typeof getFixture>[0], "minimal")
      ).not.toThrow();
    });
  }
});
