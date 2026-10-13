import { describe, expect, test } from "vitest";
import { legacyPackVars } from "./legacyVars";
import { systemCssVars } from "../../../../../shared/designSystems/toCss";
import { JOURNAL } from "../../../../../shared/designSystems/journal";
import { RASTER } from "../../../../../shared/designSystems/raster";
import { contrastRatio } from "../../../../../shared/designSystems/colorMath";

const vars = (def: typeof JOURNAL, palette: string) =>
  legacyPackVars(systemCssVars(def, palette));

describe("Legacy-Aliase --pb-* für rev 3", () => {
  test("Journal: helles Band und Akzent-Kontrast wie bisher", () => {
    for (const p of JOURNAL.palettes) {
      const v = vars(JOURNAL, p.id);
      expect(v["--pb-surface"]).toBe(
        `color-mix(in srgb, ${p.paper} 35%, #fff)`
      );
      expect(v["--pb-accent-contrast"]).toBe(p.onDeep);
      expect(v["--pb-canvas"]).toBe(p.paper);
    }
  });

  test("Raster Kohle (dunkles Papier): Fläche bleibt dunkel, Text auf Akzent lesbar", () => {
    const p = RASTER.palettes.find(x => x.id === "kohle")!;
    const v = vars(RASTER, "kohle");
    expect(v["--pb-surface"]).not.toContain("#fff");
    expect(v["--pb-surface"]).toContain(p.paper);
    expect(
      contrastRatio(v["--pb-accent-contrast"], v["--pb-accent"])
    ).toBeGreaterThanOrEqual(4.5);
  });

  test("Raster: Akzent-Kontrast in allen Paletten ≥ 4,5", () => {
    for (const p of RASTER.palettes) {
      const v = vars(RASTER, p.id);
      expect(
        contrastRatio(v["--pb-accent-contrast"], v["--pb-accent"])
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
