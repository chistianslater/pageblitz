import { describe, expect, test } from "vitest";
import { legalColors } from "./legalColors";
import { getFixture } from "@shared/siteContract/fixtures";
import { withDesignSystem } from "@shared/designSystems/apply";
import { getSystem } from "@shared/designSystems/registry";
import { contrastRatio } from "@shared/designSystems/colorMath";

describe("legalColors (Rechtsseiten im SPA-Pfad)", () => {
  test("Akzent kommt aus der Palette des Systems", () => {
    const doc = withDesignSystem(getFixture("salon-noir", "full"), "raster");
    const raster = getSystem("raster")!;
    const second = raster.palettes[1];
    const colors = legalColors({ ...doc, palette: second.id });
    expect(colors.primary).toBe(second.accent);
  });

  test("ohne gewählte Palette gilt die erste des Systems", () => {
    const doc = withDesignSystem(getFixture("werkbank", "full"), "journal");
    const { palette: _p, ...noPalette } = doc;
    expect(legalColors(noPalette).primary).toBe(
      getSystem("journal")!.palettes[0].accent
    );
  });

  test("ein altes Dokument (ohne System) bekommt das Hauptsystem", () => {
    const old = getFixture("gusto", "full");
    const colors = legalColors(old);
    expect(colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("Linkfarbe und Schrift auf dem Akzent sind lesbar (≥ 4,5:1)", () => {
    for (const id of ["journal", "raster", "werkstoff", "plakat", "klar", "nacht"] as const) {
      for (const p of getSystem(id)!.palettes) {
        const doc = withDesignSystem(getFixture("salon-noir", "full"), id, p.id);
        const c = legalColors(doc);
        expect(contrastRatio(c.link, "#ffffff")).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test("kein v2-Dokument → neutraler Rückfall", () => {
    expect(legalColors(null)).toEqual({
      primary: "#111111",
      link: "#111111",
      onPrimary: "#ffffff",
    });
    expect(legalColors({ businessName: "Alt" }).primary).toBe("#111111");
  });
});
