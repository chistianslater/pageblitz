import { describe, expect, test } from "vitest";
import {
  FALLBACK_VOICE,
  getVoicePool,
  hasDirectVoiceMatch,
  isLodgingCategory,
  normalizeCategoryKey,
  voiceMatchesCategory,
  SELECTIVE_VOICES,
} from "./index";

const SELECTIVE = [...SELECTIVE_VOICES];

function top3(category: string) {
  return getVoicePool(category).slice(0, 3);
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
        const pool = getVoicePool(category);
        expect(["patina", "landgut", "gusto"]).toContain(pool[0]);
        expect(top3(category)).not.toEqual(expect.arrayContaining(SELECTIVE));
        for (const id of SELECTIVE) {
          expect(top3(category), `${category} Top-3`).not.toContain(id);
        }
      });
    }
  });

  test("Restaurant → gusto", () => {
    expect(getVoicePool("Restaurant")[0]).toBe("gusto");
    expect(getVoicePool("restaurant")[0]).toBe("gusto");
  });

  test("Café (Akzent) → gusto", () => {
    expect(getVoicePool("Café")[0]).toBe("gusto");
    expect(getVoicePool("Cafe")[0]).toBe("gusto");
  });

  test("Anlageservice → kanzlei-ähnlich", () => {
    expect(getVoicePool("Anlageservice")[0]).toBe("kanzlei");
    expect(getVoicePool("Anlageberatung")[0]).toBe("kanzlei");
  });

  test("Handwerker → werkbank, nicht klarwerk", () => {
    expect(getVoicePool("Handwerk")[0]).toBe("werkbank");
    expect(getVoicePool("Handwerker")[0]).toBe("werkbank");
    expect(top3("Handwerk")).not.toContain("klarwerk");
    expect(top3("Handwerker")).not.toContain("klarwerk");
  });

  test("unbekannte Branche: neutrale Allround-Packs, keine Handwerker-/neuen Templates", () => {
    expect(FALLBACK_VOICE).toBe("werkbank");
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
    expect(getVoicePool("IT-Service")[0]).toBe("klarwerk");
    expect(getVoicePool("EDV")[0]).toBe("klarwerk");
    expect(voiceMatchesCategory("klarwerk", "Softwareentwicklung")).toBe(true);
  });

  test("Fotograf darf atelier als Primärmatch", () => {
    expect(getVoicePool("Fotograf")[0]).toBe("atelier");
    expect(getVoicePool("Fotostudio")[0]).toBe("atelier");
  });

  test("Schreinerei-Pool bleibt werkbank + bewährte Nachbarn", () => {
    // Seit der Pool-Verbreiterung (2026-09-09) kommt eine kuratierte
    // Nachbarrichtung dazu. Die Reihenfolge der Handwerks-Packs vorn und
    // die Abwesenheit branchenfremder Packs bleiben die eigentliche Zusage.
    expect(getVoicePool("schreinerei").slice(0, 3)).toEqual([
      "werkbank",
      "fundament",
      "zunft",
    ]);
    expect(getVoicePool("schreinerei")).toEqual([
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

describe("hasDirectVoiceMatch (Branchen-Lücken-Logging)", () => {
  test("abgedeckte Branchen zählen nicht als Lücke", () => {
    expect(hasDirectVoiceMatch("Friseursalon")).toBe(true);
    expect(hasDirectVoiceMatch("Tischlerei")).toBe(true);
    expect(hasDirectVoiceMatch("Kfz-Werkstatt")).toBe(true);
  });

  test("Hotellerie zählt als abgedeckt (eigener Hospitality-Fallback)", () => {
    expect(hasDirectVoiceMatch("Hotel")).toBe(true);
    expect(hasDirectVoiceMatch("Pension")).toBe(true);
  });

  test("unbekannte Branchen sind Lücken", () => {
    expect(hasDirectVoiceMatch("Naturschutzbund")).toBe(false);
    expect(hasDirectVoiceMatch("Verein")).toBe(false);
  });

  test("leere Eingabe ist keine Lücke", () => {
    expect(hasDirectVoiceMatch("")).toBe(true);
    expect(hasDirectVoiceMatch("   ")).toBe(true);
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
      expect(getVoicePool(branche).length).toBeGreaterThanOrEqual(4);
    }
  });

  test("keine generischen Fueller in einer gut getroffenen Branche", () => {
    // werkbank ist der erste SAFE_FILL-Eintrag — im Friseur-Pool waere er
    // ein Zeichen dafuer, dass die Erweiterung wieder verwaessert.
    expect(getVoicePool("Friseur")).not.toContain("werkbank");
  });

  test("keine Dubletten im Pool", () => {
    for (const branche of branchen) {
      const pool = getVoicePool(branche);
      expect(new Set(pool).size).toBe(pool.length);
    }
  });
});
