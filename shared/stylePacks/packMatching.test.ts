import { describe, expect, test } from "vitest";
import {
  FALLBACK_PACK,
  getPackPool,
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

  test("unbekannte Branche: Fallback werkbank, Top-3 ohne neue Templates", () => {
    expect(FALLBACK_PACK).toBe("werkbank");
    expect(getPackPool("unbekannte-branche")[0]).toBe("werkbank");
    for (const id of SELECTIVE) {
      expect(top3("unbekannte-branche")).not.toContain(id);
    }
  });

  test("unsicherer Match füllt nicht Klarwerk/Kanzlei/Atelier als Top-3", () => {
    const pool = top3("irgendwas-unspezifisches-xyz");
    expect(pool[0]).toBe("werkbank");
    for (const id of SELECTIVE) {
      expect(pool).not.toContain(id);
    }
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
