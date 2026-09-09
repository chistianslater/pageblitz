import { describe, expect, test } from "vitest";
import { contrastRatio, hexToHsl } from "./colorMath";
import { toCssVars } from "./toCssVars";
import { getConstitution } from "./index";
import { PACK_IDS } from "../siteContract/packIds";
import { FONT_PAIRS } from "./fontPairs";
import { getColorWorlds } from "./colorWorlds";
import {
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

describe("pickPackAccent (Akzent-Streuung, 2026-09-09)", () => {
  // Befund des Betreibers: 12 Friseur-Seiten, davon 8 in Terracotta-Toenen.
  // Ursache war, dass die Farbwelten nur Grund und Flaeche variieren — der
  // Akzent, den man in der Typografie sieht, blieb der Pack-Akzent.
  const namen = Array.from({ length: 40 }, (_, i) => `Betrieb ${i}`);

  test("gleicher Betrieb ergibt immer denselben Akzent", () => {
    expect(pickPackAccent("salon-noir", "Manfred Wagner")).toBe(
      pickPackAccent("salon-noir", "Manfred Wagner")
    );
  });

  test("mindestens sechs verschiedene Farbtoene ueber 40 Betriebe", () => {
    const toene = new Set(namen.map(n => pickPackAccent("salon-noir", n)));
    expect(toene.size).toBeGreaterThanOrEqual(6);
  });

  test("dreht nur den Farbton, Saettigung und Helligkeit bleiben", () => {
    const basis = hexToHsl(packAccentHex("salon-noir"));
    for (const name of namen) {
      const hsl = hexToHsl(pickPackAccent("salon-noir", name));
      expect(Math.abs(hsl.s - basis.s)).toBeLessThan(0.06);
      expect(Math.abs(hsl.l - basis.l)).toBeLessThan(0.06);
    }
  });

  test("bleibt in der Nachbarschaft des Pack-Akzents (max 80 Grad)", () => {
    const basis = hexToHsl(packAccentHex("salon-noir")).h;
    for (const name of namen) {
      const h = hexToHsl(pickPackAccent("salon-noir", name)).h;
      const diff = Math.min(Math.abs(h - basis), 1 - Math.abs(h - basis));
      expect(diff * 360).toBeLessThanOrEqual(80.5);
    }
  });

  test("funktioniert fuer jedes der 20 Packs", () => {
    for (const packId of PACK_IDS) {
      expect(pickPackAccent(packId, "Testbetrieb")).toMatch(/^#[0-9a-f]{6}$/i);
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
        const akzent = pickPackAccent(packId, "Salon Beispiel");
        const vars = toCssVars(
          getConstitution(packId),
          weltMitAkzent(welt.overrides, akzent)
        );
        const ratio = contrastRatio(
          vars["--pb-accent-text"],
          vars["--pb-canvas"]
        );
        expect(ratio).toBeGreaterThanOrEqual(4.49);
      }
    }
  });
});
