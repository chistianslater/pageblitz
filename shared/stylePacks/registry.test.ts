import { describe, expect, test } from "vitest";
import {
  FALLBACK_PACK,
  getConstitution,
  getPackPool,
  packMatchesCategory,
  STYLE_PACKS,
} from "./index";
import { getV2VariantCandidates } from "./variantCandidates";

const OFFICE_IT_PACKS = ["klarwerk", "kanzlei", "atelier"] as const;

describe("stylePacks registry", () => {
  test("werkbank ist registriert und vollständig", () => {
    const c = getConstitution("werkbank");
    expect(c.palette.length).toBeGreaterThanOrEqual(4);
    expect(c.palette.some(p => p.role === "canvas")).toBe(true);
    expect(c.palette.some(p => p.role === "accent")).toBe(true);
    expect(c.signature.decor.length).toBeGreaterThanOrEqual(2);
  });
  test("unbekannte Branche fällt auf FALLBACK_PACK zurück", () => {
    expect(getPackPool("unbekannte-branche")[0]).toBe(FALLBACK_PACK);
    expect(getPackPool("unbekannte-branche")).toHaveLength(3);
  });
  test("FALLBACK_PACK ist werkbank, nicht klarwerk (kein IT-Generic)", () => {
    expect(FALLBACK_PACK).toBe("werkbank");
    expect(getPackPool("unbekannte-branche")[0]).toBe("werkbank");
    expect(getPackPool("unbekannte-branche")[0]).not.toBe("klarwerk");
    expect(getPackPool("Dienstleistung")[0]).toBe("werkbank");
    expect(getPackPool("Dienstleistung")[0]).not.toBe("klarwerk");
    const unknownTop = getPackPool("unbekannte-branche").slice(0, 3);
    for (const id of OFFICE_IT_PACKS) {
      expect(unknownTop).not.toContain(id);
    }
  });
  test("Schreinerei landet bei werkbank", () => {
    expect(getPackPool("schreinerei")[0]).toBe("werkbank");
    expect(getPackPool("schreinerei")).toEqual([
      "werkbank",
      "fundament",
      "zunft",
    ]);
  });
  test("jede registrierte Verfassung hat konsistente id", () => {
    for (const [id, c] of Object.entries(STYLE_PACKS)) expect(c!.id).toBe(id);
  });

  describe("getPackPool — Transliteration und Wortgrenzen-Matching", () => {
    test("Logopädie (Umlaut) matched morgenlicht via logopaedie", () => {
      expect(getPackPool("Logopädie")).toContain("morgenlicht");
    });
    test("Wirtschaftsprüfer (Umlaut) matched kanzlei via wirtschaftspruefer", () => {
      expect(getPackPool("Wirtschaftsprüfer")).toContain("kanzlei");
    });
    test("Barbershop matched NICHT gusto (kein reiner Substring-Treffer von 'bar')", () => {
      expect(getPackPool("Barbershop")).not.toContain("gusto");
    });
    test("Sanitärinstallateur matched werkbank via sanitaer-Präfix (Länge ≥ 4)", () => {
      expect(getPackPool("Sanitärinstallateur")).toContain("werkbank");
    });
    test("Anlageservice matched kanzlei (benachbarte B2B-Beratung)", () => {
      expect(getPackPool("Anlageservice")[0]).toBe("kanzlei");
      expect(getPackPool("Anlageberatung")[0]).toBe("kanzlei");
    });
  });

  describe("getPackPool — Hotel / Beherbergung", () => {
    const hotelCategories = [
      "Hotel",
      "Hotel garni",
      "Boutique-Hotel",
      "Boardinghouse",
      "lodging",
      "Hotel & Unterkunft",
    ];

    test.each(hotelCategories)(
      "%s: Patina zuerst, kein Klarwerk/Kanzlei/Atelier in den ersten drei",
      category => {
        const pool = getPackPool(category);
        expect(pool[0]).toBe("patina");
        expect(packMatchesCategory("patina", category)).toBe(true);
        const firstThree = pool.slice(0, 3);
        for (const id of OFFICE_IT_PACKS) {
          expect(firstThree).not.toContain(id);
        }
      }
    );

    test("Pension und Gästehaus landen bei Landgut, nicht bei Klarwerk", () => {
      expect(getPackPool("Pension")[0]).toBe("landgut");
      expect(getPackPool("Gästehaus")[0]).toBe("landgut");
      expect(getPackPool("Pension").slice(0, 3)).not.toContain("klarwerk");
      expect(getPackPool("Pension").slice(0, 3)).not.toContain("kanzlei");
      expect(getPackPool("Pension").slice(0, 3)).not.toContain("atelier");
    });

    test("Splash-Vorschläge (3er) für Hotel starten mit Patina, ohne Office/IT", () => {
      const splash = getV2VariantCandidates("Hotel", 0, 3);
      expect(splash[0]).toBe("patina");
      for (const id of OFFICE_IT_PACKS) {
        expect(splash).not.toContain(id);
      }
    });
  });

  describe("getPackPool — bekannte Branchen bleiben stabil", () => {
    test("Restaurant bleibt gusto", () => {
      expect(getPackPool("restaurant")[0]).toBe("gusto");
      expect(getPackPool("Restaurant")[0]).toBe("gusto");
    });
    test("Klempner / plumber / unbekannter Installateur → werkbank, nicht klarwerk", () => {
      expect(getPackPool("Klempner")[0]).toBe("werkbank");
      expect(getPackPool("plumber")[0]).toBe("werkbank");
      expect(getPackPool("Sanitär & Heizung")[0]).toBe("werkbank");
      expect(getPackPool("Klempner")[0]).not.toBe("klarwerk");
    });
    test("IT-Dienstleister bleibt klarwerk", () => {
      expect(getPackPool("IT-Dienstleister")[0]).toBe("klarwerk");
      expect(getPackPool("Softwareentwicklung")[0]).toBe("klarwerk");
    });
  });
});
