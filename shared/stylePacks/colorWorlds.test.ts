import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/packIds";
import { contrastRatio, ensureTextContrast, mix } from "./colorMath";
import {
  activeColorWorldId,
  buildCustomWorldOverrides,
  getColorWorld,
  getColorWorlds,
} from "./colorWorlds";
import { getConstitution } from "./index";

describe("colorMath", () => {
  test("mix entspricht CSS color-mix in srgb", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mix("#ff0000", "#0000ff", 1)).toBe("#ff0000");
  });

  test("ensureTextContrast erreicht das geforderte Verhältnis", () => {
    const fixed = ensureTextContrast("#aaaaaa", "#ffffff", 4.5);
    expect(contrastRatio(fixed, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    const onDark = ensureTextContrast("#333333", "#111111", 4.5);
    expect(contrastRatio(onDark, "#111111")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("getColorWorlds — Kontrast-Matrix über alle Packs", () => {
  for (const packId of PACK_IDS) {
    test(`${packId}: alle Welten sind lesbar`, () => {
      const worlds = getColorWorlds(packId);
      expect(worlds[0]).toMatchObject({ id: "original", overrides: {} });
      expect(new Set(worlds.map(w => w.id)).size).toBe(worlds.length);
      const accent = getConstitution(packId).palette.find(
        c => c.role === "accent"
      )!.hex;
      for (const world of worlds.slice(1)) {
        const o = world.overrides;
        // Fließtext auf Grund UND Fläche.
        expect(contrastRatio(o.ink, o.canvas)).toBeGreaterThanOrEqual(7);
        expect(contrastRatio(o.ink, o.surface)).toBeGreaterThanOrEqual(7);
        // Sekundärtext.
        expect(contrastRatio(o.muted, o.canvas)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(o.muted, o.surface)).toBeGreaterThanOrEqual(4.5);
        // Akzent als Kleintext + Text AUF dem Akzent.
        expect(
          contrastRatio(o["accent-text"], o.canvas)
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(o["accent-contrast"], accent)
        ).toBeGreaterThanOrEqual(4.5);
        expect(world.swatch).toHaveLength(3);
      }
    });
  }
});

describe("buildCustomWorldOverrides", () => {
  // Frei gewählte Grundfarben (Studio-Farbwähler): hell, dunkel, gesättigt.
  // Mittlere Luminanzen erreichen 7:1 physikalisch nicht immer — der Guard
  // liefert dann das Maximum; hier gilt die 4,5:1-Lesbarkeitsuntergrenze.
  const BASES = ["#f2e5d2", "#1a1512", "#dcebe0", "#3b1f4e", "#808080"];
  for (const packId of PACK_IDS) {
    test(`kontrastfeste Rollen für ${packId} aus jeder Basisfarbe`, () => {
      for (const base of BASES) {
        const o = buildCustomWorldOverrides(packId, base);
        expect(o.canvas).toBe(base.toLowerCase());
        expect(contrastRatio(o.ink, o.canvas)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(o.ink, o.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(o.muted, o.canvas)).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(o["accent-text"], o.canvas)
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

describe("getColorWorld / activeColorWorldId", () => {
  test("löst IDs auf und erkennt die aktive Welt am canvas-Wert", () => {
    const world = getColorWorld("werkbank", "abend");
    expect(world?.name).toBe("Abend");
    expect(activeColorWorldId("werkbank", undefined)).toBe("original");
    expect(activeColorWorldId("werkbank", world!.overrides)).toBe("abend");
    expect(activeColorWorldId("werkbank", { canvas: "#123456" })).toBe(
      "eigene"
    );
    expect(getColorWorld("werkbank", "gibts-nicht")).toBeNull();
  });
});
