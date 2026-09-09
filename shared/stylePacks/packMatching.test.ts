import { describe, expect, test } from "vitest";
import { PACK_ACCENTS } from "./packVariants";
import {
  FALLBACK_PACK,
  getPackPool,
  hasDirectPackMatch,
  isLodgingCategory,
  normalizeCategoryKey,
  packMatchesCategory,
  SELECTIVE_PACKS,
} from "./index";

const SELECTIVE = [...SELECTIVE_PACKS];

function top3(category: string) {
  return getPackPool(category).slice(0, 3);
}

describe("Pack-Matching — Hospitality, Ranking, selektive Templates", () => {
  describe("Hospitality trifft Gastgewerbe, nicht Klarwerk/Kanzlei/Atelier", () => {
    const lodging = [
      "Hotel",
      "Boutique-Hotel",
      "Boutique Hotel",
      "Pension",
      "Lodge",
      "B&B",
      "Bed & Breakfast",
      "Gästehaus",
      "Motel",
      "Hostel",
      "Hotel garni",
      "Boardinghouse",
      "Resort",
      "Gasthof",
    ];

    for (const category of lodging) {
      test(`${category}: Primär Gastgewerbe, Top-3 ohne neue Templates`, () => {
        const pool = getPackPool(category);
        expect(["patina", "landgut", "gusto"]).toContain(pool[0]);
        expect(top3(category)).not.toEqual(expect.arrayContaining(SELECTIVE));
        for (const id of SELECTIVE) {
          expect(top3(category), `${category} Top-3`).not.toContain(id);
        }
      });
    }
  });

  test("Restaurant → gusto", () => {
    expect(getPackPool("Restaurant")[0]).toBe("gusto");
    expect(getPackPool("restaurant")[0]).toBe("gusto");
  });

  test("Café (Akzent) → gusto", () => {
    expect(getPackPool("Café")[0]).toBe("gusto");
    expect(getPackPool("Cafe")[0]).toBe("gusto");
  });

  test("Anlageservice → kanzlei-ähnlich", () => {
    expect(getPackPool("Anlageservice")[0]).toBe("kanzlei");
    expect(getPackPool("Anlageberatung")[0]).toBe("kanzlei");
  });

  test("Handwerker → werkbank, nicht klarwerk", () => {
    expect(getPackPool("Handwerk")[0]).toBe("werkbank");
    expect(getPackPool("Handwerker")[0]).toBe("werkbank");
    expect(top3("Handwerk")).not.toContain("klarwerk");
    expect(top3("Handwerker")).not.toContain("klarwerk");
  });

  test("unbekannte Branche: neutrale Allround-Packs, keine Handwerker-/neuen Templates", () => {
    expect(FALLBACK_PACK).toBe("werkbank");
    expect(top3("unbekannte-branche")).toEqual([
      "patina",
      "fundament",
      "morgenlicht",
    ]);
    for (const id of SELECTIVE) {
      expect(top3("unbekannte-branche")).not.toContain(id);
    }
  });

  test("unsicherer Match füllt nicht Klarwerk/Kanzlei/Atelier als Top-3", () => {
    const pool = top3("irgendwas-unspezifisches-xyz");
    expect(pool).toEqual(["patina", "fundament", "morgenlicht"]);
    for (const id of SELECTIVE) {
      expect(pool).not.toContain(id);
    }
  });

  test("Hotel-Top-3 enthält weder werkbank noch zunft", () => {
    const pool = top3("Hotel");
    expect(pool).not.toContain("werkbank");
    expect(pool).not.toContain("zunft");
  });

  test("IT-Service darf klarwerk als Primärmatch", () => {
    expect(getPackPool("IT-Service")[0]).toBe("klarwerk");
    expect(getPackPool("EDV")[0]).toBe("klarwerk");
    expect(packMatchesCategory("klarwerk", "Softwareentwicklung")).toBe(true);
  });

  test("Fotograf darf atelier als Primärmatch", () => {
    expect(getPackPool("Fotograf")[0]).toBe("atelier");
    expect(getPackPool("Fotostudio")[0]).toBe("atelier");
  });

  test("Schreinerei-Pool bleibt werkbank + bewährte Nachbarn", () => {
    // Seit der Pool-Verbreiterung (2026-09-09) kommt eine kuratierte
    // Nachbarrichtung dazu. Die Reihenfolge der Handwerks-Packs vorn und
    // die Abwesenheit branchenfremder Packs bleiben die eigentliche Zusage.
    expect(getPackPool("schreinerei").slice(0, 3)).toEqual([
      "werkbank",
      "fundament",
      "zunft",
    ]);
    expect(getPackPool("schreinerei")).toEqual([
      "werkbank",
      "fundament",
      "zunft",
      "patina",
    ]);
  });
});

describe("isLodgingCategory", () => {
  test("Hotel und Pension ja, Restaurant und Café nein", () => {
    expect(isLodgingCategory("Hotel")).toBe(true);
    expect(isLodgingCategory("Boutique-Hotel")).toBe(true);
    expect(isLodgingCategory("Pension")).toBe(true);
    expect(isLodgingCategory("Gästehaus")).toBe(true);
    expect(isLodgingCategory("Restaurant")).toBe(false);
    expect(isLodgingCategory("Trattoria")).toBe(false);
    expect(isLodgingCategory("Café")).toBe(false);
    expect(isLodgingCategory("")).toBe(false);
    expect(isLodgingCategory(undefined)).toBe(false);
  });
});

describe("hasDirectPackMatch (Branchen-Lücken-Logging)", () => {
  test("abgedeckte Branchen zählen nicht als Lücke", () => {
    expect(hasDirectPackMatch("Friseursalon")).toBe(true);
    expect(hasDirectPackMatch("Tischlerei")).toBe(true);
    expect(hasDirectPackMatch("Kfz-Werkstatt")).toBe(true);
  });

  test("Hotellerie zählt als abgedeckt (eigener Hospitality-Fallback)", () => {
    expect(hasDirectPackMatch("Hotel")).toBe(true);
    expect(hasDirectPackMatch("Pension")).toBe(true);
  });

  test("unbekannte Branchen sind Lücken", () => {
    expect(hasDirectPackMatch("Naturschutzbund")).toBe(false);
    expect(hasDirectPackMatch("Verein")).toBe(false);
  });

  test("leere Eingabe ist keine Lücke", () => {
    expect(hasDirectPackMatch("")).toBe(true);
    expect(hasDirectPackMatch("   ")).toBe(true);
  });
});

describe("normalizeCategoryKey", () => {
  test("dedupliziert Schreibvarianten wie das Matching", () => {
    expect(normalizeCategoryKey("Naturschutzbund")).toBe("naturschutzbund");
    expect(normalizeCategoryKey("NATURSCHUTZBUND")).toBe("naturschutzbund");
    expect(normalizeCategoryKey("Café")).toBe("cafe");
    expect(normalizeCategoryKey("")).toBe("");
  });
});

describe("Pool-Breite (Betreiber-Befund 2026-09-09)", () => {
  // Zwoelf Friseur-Seiten liefen auf genau drei Packs (4/4/4), weil der
  // Pool bei drei direkten Treffern sofort abbrach und der Zaehler nur
  // darueber rotierte. Fuenf Kandidaten geben demselben Ort sichtbar
  // verschiedene Seiten, ohne die kuratierte Richtung zu verlassen.
  const branchen = [
    "Friseur",
    "Restaurant",
    "Elektriker",
    "Zahnarzt",
    "Rechtsanwalt",
  ];

  // Vier, nicht fuenf: `atelier`, `karat` und die uebrigen selektiven Packs
  // duerfen laut Kuratierung nur bei direktem Branchen-Treffer erscheinen,
  // nie als Nachbar. Diese Grenze bleibt bewusst stehen.
  test("jede Branche hat mindestens vier Kandidaten", () => {
    for (const branche of branchen) {
      expect(getPackPool(branche).length).toBeGreaterThanOrEqual(4);
    }
  });

  test("keine generischen Fueller in einer gut getroffenen Branche", () => {
    // werkbank ist der erste SAFE_FILL-Eintrag — im Friseur-Pool waere er
    // ein Zeichen dafuer, dass die Erweiterung wieder verwaessert.
    expect(getPackPool("Friseur")).not.toContain("werkbank");
  });

  test("keine Dubletten im Pool", () => {
    for (const branche of branchen) {
      const pool = getPackPool(branche);
      expect(new Set(pool).size).toBe(pool.length);
    }
  });
});

describe("Akzente innerhalb eines Branchen-Pools", () => {
  test("kein Ton kommt in zwei Packs derselben Branche vor", () => {
    // Sonst koennten zwei Salons am selben Ort trotz verschiedener Packs
    // exakt dieselbe Akzentfarbe bekommen — der Befund, der die ganze
    // Umstellung ausgeloest hat.
    for (const branche of ["Friseur", "Zahnarzt", "Restaurant", "Elektriker"]) {
      const toene = getPackPool(branche).flatMap(id => [...PACK_ACCENTS[id]]);
      const doppelt = toene.filter((h, i) => toene.indexOf(h) !== i);
      expect({ branche, doppelt: [...new Set(doppelt)] }).toEqual({
        branche,
        doppelt: [],
      });
    }
  });
});
