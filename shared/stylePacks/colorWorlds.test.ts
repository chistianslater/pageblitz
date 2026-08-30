import { describe, expect, test } from "vitest";
import { PACK_IDS } from "../siteContract/packIds";
import { contrastRatio, ensureTextContrast, mix } from "./colorMath";
import {
  activeColorWorldId,
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
