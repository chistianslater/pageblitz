import { describe, expect, test } from "vitest";
import { designNameFor, studioHrefFor } from "./websitesPageLogic";
import { getFixture } from "@shared/siteContract/fixtures";
import {
  withDesignSystem,
  withPrimarySystem,
} from "@shared/designSystems/apply";
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

  test("altes Dokument (ohne System) zeigt sein Hauptsystem, nie den Pack-Namen", () => {
    const old = getFixture("zunft", "full");
    const primary = withPrimarySystem(old);
    const def = getSystem(primary.system!)!;
    const name = designNameFor(old);
    expect(name.startsWith(`${def.name} · `)).toBe(true);
    expect(name).not.toContain("Zunft");
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
