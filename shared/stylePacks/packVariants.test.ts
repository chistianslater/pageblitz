import { describe, expect, test } from "vitest";
import { contrastRatio } from "./colorMath";
import { toCssVars } from "./toCssVars";
import { getConstitution } from "./index";
import { PACK_IDS } from "../siteContract/packIds";
import { FONT_PAIRS } from "./fontPairs";
import { getColorWorlds } from "./colorWorlds";
import {
  PACK_ACCENTS,
  PACK_FONT_PAIRS,
  packAccentHex,
  pickPackAccent,
  pickPackColorWorld,
  pickPackFontPair,
  weltMitAkzent,
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

describe("PACK_ACCENTS (kuratierte Akzente, 2026-09-09)", () => {
  test("jedes Pack hat genau fuenf Toene", () => {
    for (const packId of PACK_IDS) {
      expect(PACK_ACCENTS[packId]).toHaveLength(5);
    }
  });

  test("keine Dubletten innerhalb eines Packs", () => {
    for (const packId of PACK_IDS) {
      const toene = PACK_ACCENTS[packId];
      expect(new Set(toene).size).toBe(toene.length);
    }
  });

  test("nur gueltige Hex-Werte", () => {
    for (const packId of PACK_IDS) {
      for (const ton of PACK_ACCENTS[packId]) {
        expect(ton).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  test("der Original-Akzent des Packs steht an erster Stelle", () => {
    // Sonst verschwindet die kuratierte Pack-Identitaet aus der Mischung.
    for (const packId of PACK_IDS) {
      expect(PACK_ACCENTS[packId][0].toLowerCase()).toBe(
        packAccentHex(packId).toLowerCase()
      );
    }
  });
});

describe("pickPackAccent", () => {
  const namen = Array.from({ length: 40 }, (_, i) => `Betrieb ${i}`);

  test("gleicher Betrieb ergibt immer denselben Akzent", () => {
    expect(pickPackAccent("salon-noir", "Manfred Wagner")).toBe(
      pickPackAccent("salon-noir", "Manfred Wagner")
    );
  });

  test("liefert nur Toene aus der Tafel des Packs", () => {
    for (const packId of PACK_IDS) {
      for (const name of namen) {
        expect(PACK_ACCENTS[packId]).toContain(pickPackAccent(packId, name));
      }
    }
  });

  test("nutzt ueber 40 Betriebe mindestens vier der fuenf Toene", () => {
    for (const packId of PACK_IDS) {
      const genutzt = new Set(namen.map(n => pickPackAccent(packId, n)));
      expect(genutzt.size).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("weltMitAkzent", () => {
  test("entfernt die abgeleiteten Texttoene der Farbwelt", () => {
    // Sonst bliebe accent-text auf dem ALTEN Pack-Akzent stehen und der
    // gedrehte Akzent stuende neben einem Kleintext in der alten Farbe.
    const welt = {
      canvas: "#ffffff",
      surface: "#f0f0f0",
      ink: "#111111",
      "accent-text": "#A4493D",
      "accent-contrast": "#ffffff",
    };
    const ergebnis = weltMitAkzent(welt, "#3D6BA4");
    expect(ergebnis.accent).toBe("#3D6BA4");
    expect(ergebnis["accent-text"]).toBeUndefined();
    expect(ergebnis["accent-contrast"]).toBeUndefined();
    expect(ergebnis.canvas).toBe("#ffffff");
  });

  test("Kleintext bleibt auf allen Packs und Welten lesbar (4,5:1)", () => {
    for (const packId of PACK_IDS) {
      for (const welt of getColorWorlds(packId)) {
        for (const akzent of PACK_ACCENTS[packId]) {
          const vars = toCssVars(
            getConstitution(packId),
            weltMitAkzent(welt.overrides, akzent)
          );
          expect(
            contrastRatio(vars["--pb-accent-text"], vars["--pb-canvas"])
          ).toBeGreaterThanOrEqual(4.49);
          expect(
            contrastRatio(vars["--pb-accent-contrast"], vars["--pb-accent"])
          ).toBeGreaterThanOrEqual(4.49);
        }
      }
    }
  });
});
