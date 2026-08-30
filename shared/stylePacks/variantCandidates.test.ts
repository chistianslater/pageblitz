import { describe, expect, test } from "vitest";
import { getV2VariantCandidates } from "./variantCandidates";
import { getPackPool, STYLE_PACKS } from "./index";

describe("getV2VariantCandidates", () => {
  test("liefert immer genau 2 Kandidaten", () => {
    for (const key of [
      "schreinerei",
      "friseur",
      "unbekannte-branche",
      "restaurant",
    ]) {
      for (let round = 0; round < 5; round++) {
        expect(getV2VariantCandidates(key, round)).toHaveLength(2);
      }
    }
  });

  test("Splash-Modus liefert genau 3 swipebare Kandidaten", () => {
    for (let round = 0; round < 5; round++) {
      expect(getV2VariantCandidates("schreinerei", round, 3)).toHaveLength(3);
    }
  });

  test("Runde 0 enthält den Branchen-Primärmatch an erster Stelle", () => {
    const [primary] = getPackPool("schreinerei");
    expect(getV2VariantCandidates("schreinerei", 0)[0]).toBe(primary);
  });

  test("liefert nur registrierte Pack-IDs", () => {
    const registered = new Set(Object.keys(STYLE_PACKS));
    for (let round = 0; round < 8; round++) {
      for (const id of getV2VariantCandidates("friseur", round)) {
        expect(registered.has(id)).toBe(true);
      }
    }
  });

  test("ist deterministisch (rein) — gleiche Argumente, gleiches Ergebnis", () => {
    expect(getV2VariantCandidates("restaurant", 3)).toEqual(
      getV2VariantCandidates("restaurant", 3)
    );
  });

  test("rotiert bei 'Andere zeigen' (round++) durch unterschiedliche Gruppen", () => {
    const seen = new Set<string>();
    for (let round = 0; round < Object.keys(STYLE_PACKS).length; round++) {
      seen.add(getV2VariantCandidates("friseur", round).join(","));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  test("negative Runden werden sauber modulo-gewrappt (kein Crash, kein undefined)", () => {
    const result = getV2VariantCandidates("friseur", -1);
    expect(result).toHaveLength(2);
    expect(result.every(id => typeof id === "string")).toBe(true);
  });

  test("unbekannte Branche: Kandidaten kommen trotzdem aus der vollen Registry (Fallback + Rest)", () => {
    const result = getV2VariantCandidates("unbekannte-branche", 0);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(getPackPool("unbekannte-branche")[0]);
  });
});
