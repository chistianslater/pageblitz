import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/packIds";
import { FONT_PAIRS } from "./fontPairs";
import { getColorWorlds } from "./colorWorlds";
import {
  PACK_FONT_PAIRS,
  pickPackColorWorld,
  pickPackFontPair,
} from "./packVariants";

const FONT_IDS = new Set(FONT_PAIRS.map(p => p.id));

describe("PACK_FONT_PAIRS (kuratierte Schriftauswahl, 2026-09-05)", () => {
  test("jedes Pack hat mindestens zwei Paare — sonst gäbe es nichts zu variieren", () => {
    for (const pack of PACK_IDS) {
      expect(PACK_FONT_PAIRS[pack]?.length ?? 0).toBeGreaterThanOrEqual(2);
    }
  });

  test("nur echte Schriftpaar-Kennungen, keine Tippfehler", () => {
    for (const pack of PACK_IDS) {
      for (const id of PACK_FONT_PAIRS[pack]) {
        expect(FONT_IDS.has(id)).toBe(true);
      }
    }
  });

  test("keine Dubletten innerhalb eines Packs", () => {
    for (const pack of PACK_IDS) {
      const liste = PACK_FONT_PAIRS[pack];
      expect(new Set(liste).size).toBe(liste.length);
    }
  });
});

describe("pickPackFontPair", () => {
  test("gleicher Betrieb ergibt immer dieselbe Schrift", () => {
    expect(pickPackFontPair("werkbank", "Schreinerei Brandt")).toBe(
      pickPackFontPair("werkbank", "Schreinerei Brandt")
    );
  });

  test("liefert nur Paare aus der kuratierten Liste des Packs", () => {
    for (const pack of PACK_IDS) {
      for (const name of ["Alpha", "Beta GmbH", "Salon Céline", "Wagner"]) {
        expect(PACK_FONT_PAIRS[pack]).toContain(pickPackFontPair(pack, name));
      }
    }
  });

  test("verschiedene Betriebe bekommen nicht alle dieselbe Schrift", () => {
    const namen = ["Aras", "Haar Galerie", "Marmaris", "Hachtkemper", "Infinity", "Jaguar"];
    const gewaehlt = new Set(namen.map(n => pickPackFontPair("salon-noir", n)));
    expect(gewaehlt.size).toBeGreaterThan(1);
  });
});

describe("pickPackColorWorld", () => {
  test("liefert immer eine Welt, die das Pack tatsächlich kennt", () => {
    for (const pack of PACK_IDS) {
      const bekannt = getColorWorlds(pack).map(w => w.id);
      for (const name of ["Alpha", "Beta", "Gamma GmbH"]) {
        expect(bekannt).toContain(pickPackColorWorld(pack, name));
      }
    }
  });

  test("gleicher Betrieb ergibt immer dieselbe Welt", () => {
    expect(pickPackColorWorld("patina", "Frauke Ridder")).toBe(
      pickPackColorWorld("patina", "Frauke Ridder")
    );
  });

  test("verschiedene Betriebe streuen über mehrere Welten", () => {
    const namen = ["Aras", "Haar Galerie", "Marmaris", "Hachtkemper", "Infinity", "Jaguar", "Sondermann"];
    const gewaehlt = new Set(namen.map(n => pickPackColorWorld("werkbank", n)));
    expect(gewaehlt.size).toBeGreaterThan(1);
  });

  test("Schrift und Farbe hängen nicht aneinander — gleicher Name, andere Achse", () => {
    // Beide leiten aus demselben Namen ab, dürfen aber nicht gekoppelt sein:
    // sonst bekämen alle Betriebe mit Schrift A immer auch Welt A.
    const namen = Array.from({ length: 40 }, (_, i) => `Betrieb ${i}`);
    const paare = new Set(
      namen.map(n => `${pickPackFontPair("werkbank", n)}|${pickPackColorWorld("werkbank", n)}`)
    );
    const schriften = new Set(namen.map(n => pickPackFontPair("werkbank", n)));
    expect(paare.size).toBeGreaterThan(schriften.size);
  });
});
