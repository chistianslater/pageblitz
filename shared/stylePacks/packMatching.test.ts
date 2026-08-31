import { describe, expect, test } from "vitest";
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
    expect(getPackPool("schreinerei")).toEqual([
      "werkbank",
      "fundament",
      "zunft",
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
