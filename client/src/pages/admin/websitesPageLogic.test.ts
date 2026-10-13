import { describe, expect, test } from "vitest";
import { designNameFor, studioHrefFor } from "./websitesPageLogic";
import { getFixture } from "@shared/siteContract/fixtures";
import { withDesignSystem } from "@shared/designSystems/apply";
import { getSystem } from "@shared/designSystems/registry";

describe("designNameFor", () => {
  test("System-Dokument → „System · Farbstimmung“", () => {
    const raster = getSystem("raster")!;
    const doc = withDesignSystem(
      getFixture("werkbank", "full"),
      "raster",
      raster.palettes[2].id
    );
    expect(designNameFor(doc)).toBe(
      `${raster.name} · ${raster.palettes[2].name}`
    );
  });

  test("ohne gewählte Palette gilt die erste Farbstimmung", () => {
    const journal = getSystem("journal")!;
    const { palette: _p, ...doc } = withDesignSystem(
      getFixture("salon-noir", "full"),
      "journal"
    );
    expect(designNameFor(doc)).toBe(
      `${journal.name} · ${journal.palettes[0].name}`
    );
  });

  test("Dokument ohne System (alt) → Fallback, nie der Pack-Name", () => {
    expect(designNameFor(getFixture("zunft", "full"))).toBe("—");
    expect(designNameFor({ system: "gibtsnicht" })).toBe("—");
  });

  test("kein v2-Dokument → Fallback", () => {
    expect(designNameFor({})).toBe("—");
    expect(designNameFor({ stylePackId: "werkbank" })).toBe("—");
    expect(designNameFor(null)).toBe("—");
    expect(designNameFor(undefined)).toBe("—");
  });
});

describe("studioHrefFor", () => {
  test("vorhandener previewToken → /onboarding/<token>", () => {
    expect(studioHrefFor("abc123")).toBe("/onboarding/abc123");
  });
  test("kein previewToken → null (kein Link rendern)", () => {
    expect(studioHrefFor(null)).toBeNull();
    expect(studioHrefFor(undefined)).toBeNull();
    expect(studioHrefFor("")).toBeNull();
  });
});
