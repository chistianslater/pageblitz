import { describe, expect, test } from "vitest";
import { getPackPool, FALLBACK_PACK } from "./index";
import { SEO_INDUSTRIES } from "../../server/seo/landingPages";

/**
 * Branchen-Vollabdeckung: JEDE in server/seo/landingPages.ts registrierte
 * SEO-Branche muss über getPackPool() eine echte Style-Pack-Zuordnung
 * bekommen — nicht nur zufällig den leeren-Pool-Fallback.
 *
 * FALLBACK_PACK ("klarwerk") ist gleichzeitig ein reguläres, eigenständiges
 * Pack mit eigenen `industries`-Einträgen. Das macht "echt vs. Fallback"
 * für klarwerk-Treffer mehrdeutig — deshalb die explizite Ausnahmenliste
 * unten: Branchen, deren korrekter Primär-Pack bewusst klarwerk ist
 * (generische Dienstleistungen, die zur "aufgeräumt wie gutes Werkzeug"-
 * Ästhetik passen — neben den bereits vorhandenen Einträgen
 * hausmeisterservice/umzug/dienstleistung).
 *
 * Seit Designrichtungen statt 1:1-Branchen-Templates kommuniziert werden,
 * enthält jeder Pool kompatible Nachbarn. Klarwerk darf daher als Nachbar
 * auftauchen; entscheidend ist der ERSTE Eintrag: Er muss der echte direkte
 * Branchenmatch sein (außer bei den dokumentierten Klarwerk-Primärfällen).
 */
const KLARWERK_PRIMARY_EXCEPTIONS = new Set([
  "reinigung",
  "hausreinigung",
  "reisebuero",
]);

describe("Style-Pack-Registrierung — Branchen-Vollabdeckung (SEO_INDUSTRIES)", () => {
  const industryKeys = Object.keys(SEO_INDUSTRIES);

  test("SEO_INDUSTRIES ist nicht leer (Test wäre sonst trivial grün)", () => {
    expect(industryKeys.length).toBeGreaterThan(0);
  });

  for (const key of industryKeys) {
    const isKlarwerkPrimary = KLARWERK_PRIMARY_EXCEPTIONS.has(key);

    test(
      isKlarwerkPrimary
        ? `${key}: dokumentierte klarwerk-Primär-Zuordnung`
        : `${key}: echte Nicht-Fallback-Zuordnung`,
      () => {
        const pool = getPackPool(key);
        expect(pool.length).toBeGreaterThanOrEqual(3);

        if (isKlarwerkPrimary) {
          expect(pool[0]).toBe(FALLBACK_PACK);
        } else {
          expect(pool[0]).not.toBe(FALLBACK_PACK);
        }
      }
    );
  }

  test("Ausnahmenliste enthält nur Branchen, die tatsächlich in SEO_INDUSTRIES existieren", () => {
    for (const key of KLARWERK_PRIMARY_EXCEPTIONS) {
      expect(industryKeys).toContain(key);
    }
  });
});
