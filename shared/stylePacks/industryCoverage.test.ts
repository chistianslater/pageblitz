import { describe, expect, test } from "vitest";
import { getPackPool, packMatchesCategory } from "./index";
import { SEO_INDUSTRIES } from "../../server/seo/landingPages";

/**
 * Branchen-Vollabdeckung: JEDE in server/seo/landingPages.ts registrierte
 * SEO-Branche muss über getPackPool() eine echte Style-Pack-Zuordnung
 * bekommen — der erste Eintrag muss die Kategorie direkt über `industries`
 * treffen, nicht nur den leeren-Pool-Fallback auffüllen.
 *
 * FALLBACK_PACK ("werkbank") ist gleichzeitig ein reguläres Pack. Deshalb
 * reicht „erster Eintrag != Fallback" nicht: Handwerk/Reinigung matchen
 * werkbank zu Recht. Entscheidend ist packMatchesCategory().
 */
describe("Style-Pack-Registrierung — Branchen-Vollabdeckung (SEO_INDUSTRIES)", () => {
  const industryKeys = Object.keys(SEO_INDUSTRIES);

  test("SEO_INDUSTRIES ist nicht leer (Test wäre sonst trivial grün)", () => {
    expect(industryKeys.length).toBeGreaterThan(0);
  });

  for (const key of industryKeys) {
    test(`${key}: echter direkter Branchenmatch`, () => {
      const pool = getPackPool(key);
      expect(pool.length).toBeGreaterThanOrEqual(3);
      expect(
        packMatchesCategory(pool[0], key),
        `${key} → ${pool[0]} muss ein direkter Industry-Treffer sein`
      ).toBe(true);
    });
  }
});
