import { describe, expect, test } from "vitest";
import {
  FALLBACK_VOICE,
  getVoice,
  getVoicePool,
  voiceMatchesCategory,
  rankVoices,
  TEXT_VOICES,
} from "./index";
import { PACK_IDS } from "../siteContract/packIds";

const OFFICE_IT_PACKS = ["klarwerk", "kanzlei", "atelier"] as const;

describe("Textstimmen-Register", () => {
  test("werkbank ist registriert, nur Text-Felder", () => {
    const v = getVoice("werkbank");
    expect(v.essence.length).toBeGreaterThan(10);
    expect(v.llmHints.do.length).toBeGreaterThan(0);
    expect(v.llmHints.dont.length).toBeGreaterThan(0);
    expect(Object.keys(v).sort()).toEqual(
      ["essence", "id", "industries", "llmHints", "name"].sort()
    );
  });
  test("alle 20 Stimmen registriert, unbekannte ID wirft", () => {
    expect(Object.keys(TEXT_VOICES).sort()).toEqual([...PACK_IDS].sort());
    expect(() => getVoice("gibtsnicht" as never)).toThrow(/nicht registriert/);
  });
  test("Gastro-Stimmen starten im Speisekarten-Modus", () => {
    const menu = Object.values(TEXT_VOICES)
      .filter(v => v!.prefersMenu)
      .map(v => v!.id)
      .sort();
    expect(menu).toContain("gusto");
    expect(menu).not.toContain("werkbank");
  });
  test("Kontext-Signale engen den Pool ein, ohne fremde Stimmen", () => {
    const pool = getVoicePool("Friseur");
    expect(rankVoices(pool, "Exklusiver Boutique Salon mit Balayage")).toEqual([
      "salon-noir",
    ]);
    expect(rankVoices(pool, "Software und Technologie")).toEqual(pool);
  });
  test("unbekannte Branche fällt auf branchenneutrale Allround-Packs zurück", () => {
    // Fuehrende Richtung bleibt; seit der Pool-Verbreiterung (2026-09-09)
    // haengen kuratierte Nachbarn dahinter.
    expect(getVoicePool("unbekannte-branche").slice(0, 3)).toEqual([
      "patina",
      "fundament",
      "morgenlicht",
    ]);
  });
  test("FALLBACK_VOICE ist werkbank, nicht klarwerk (kein IT-Generic)", () => {
    expect(FALLBACK_VOICE).toBe("werkbank");
    expect(getVoicePool("unbekannte-branche")[0]).not.toBe("klarwerk");
    expect(getVoicePool("Dienstleistung")[0]).not.toBe("klarwerk");
    const unknownTop = getVoicePool("unbekannte-branche").slice(0, 3);
    for (const id of OFFICE_IT_PACKS) {
      expect(unknownTop).not.toContain(id);
    }
    expect(unknownTop).not.toContain("werkbank");
    expect(unknownTop).not.toContain("zunft");
  });
  test("Schreinerei landet bei werkbank", () => {
    expect(getVoicePool("schreinerei")[0]).toBe("werkbank");
    expect(getVoicePool("schreinerei").slice(0, 3)).toEqual([
      "werkbank",
      "fundament",
      "zunft",
    ]);
  });
  test("jede registrierte Verfassung hat konsistente id", () => {
    for (const [id, c] of Object.entries(TEXT_VOICES)) expect(c!.id).toBe(id);
  });

  describe("getVoicePool — Transliteration und Wortgrenzen-Matching", () => {
    test("Logopädie (Umlaut) matched morgenlicht via logopaedie", () => {
      expect(getVoicePool("Logopädie")).toContain("morgenlicht");
    });
    test("Wirtschaftsprüfer (Umlaut) matched kanzlei via wirtschaftspruefer", () => {
      expect(getVoicePool("Wirtschaftsprüfer")).toContain("kanzlei");
    });
    test("Barbershop matched NICHT gusto (kein reiner Substring-Treffer von 'bar')", () => {
      expect(getVoicePool("Barbershop")).not.toContain("gusto");
    });
    test("Sanitärinstallateur matched werkbank via sanitaer-Präfix (Länge ≥ 4)", () => {
      expect(getVoicePool("Sanitärinstallateur")).toContain("werkbank");
    });
    test("Anlageservice matched kanzlei (benachbarte B2B-Beratung)", () => {
      expect(getVoicePool("Anlageservice")[0]).toBe("kanzlei");
      expect(getVoicePool("Anlageberatung")[0]).toBe("kanzlei");
    });
  });

  describe("getVoicePool — Hotel / Beherbergung", () => {
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
        const pool = getVoicePool(category);
        expect(pool[0]).toBe("patina");
        expect(voiceMatchesCategory("patina", category)).toBe(true);
        const firstThree = pool.slice(0, 3);
        for (const id of OFFICE_IT_PACKS) {
          expect(firstThree).not.toContain(id);
        }
      }
    );

    test("Pension und Gästehaus landen bei Landgut, nicht bei Klarwerk", () => {
      expect(getVoicePool("Pension")[0]).toBe("landgut");
      expect(getVoicePool("Gästehaus")[0]).toBe("landgut");
      expect(getVoicePool("Pension").slice(0, 3)).not.toContain("klarwerk");
      expect(getVoicePool("Pension").slice(0, 3)).not.toContain("kanzlei");
      expect(getVoicePool("Pension").slice(0, 3)).not.toContain("atelier");
    });
  });

  describe("getVoicePool — bekannte Branchen bleiben stabil", () => {
    test("Restaurant bleibt gusto", () => {
      expect(getVoicePool("restaurant")[0]).toBe("gusto");
      expect(getVoicePool("Restaurant")[0]).toBe("gusto");
    });
    test("Klempner / plumber / unbekannter Installateur → werkbank, nicht klarwerk", () => {
      expect(getVoicePool("Klempner")[0]).toBe("werkbank");
      expect(getVoicePool("plumber")[0]).toBe("werkbank");
      expect(getVoicePool("Sanitär & Heizung")[0]).toBe("werkbank");
      expect(getVoicePool("Klempner")[0]).not.toBe("klarwerk");
    });
    test("IT-Dienstleister bleibt klarwerk", () => {
      expect(getVoicePool("IT-Dienstleister")[0]).toBe("klarwerk");
      expect(getVoicePool("Softwareentwicklung")[0]).toBe("klarwerk");
    });
  });
});
