import { describe, expect, test } from "vitest";
import {
  describeLayoutOverlay,
  describePackLayouts,
  formatReviewExport,
  parseLayoutOverlay,
  parsePackLayoutEntry,
  parsePackLayoutMap,
  patchPackLayoutEntry,
} from "./designReviewModel";

describe("designReviewModel", () => {
  test("parseLayoutOverlay lässt nur bekannte Varianten durch", () => {
    expect(
      parseLayoutOverlay({
        heroLayout: "centered",
        servicesLayout: "nope",
        extra: "x",
      })
    ).toEqual({ heroLayout: "centered" });
  });

  test("parsePackLayoutMap migriert flache v1-Overlays auf Desktop", () => {
    expect(
      parsePackLayoutMap({
        gusto: { galleryLayout: "mosaic" },
        unknown: { heroLayout: "centered" },
        werkbank: {},
      })
    ).toEqual({ gusto: { desktop: { galleryLayout: "mosaic" } } });
  });

  test("parsePackLayoutEntry liest Desktop und Mobil getrennt", () => {
    expect(
      parsePackLayoutEntry({
        desktop: { heroLayout: "centered" },
        mobile: { servicesLayout: "list", galleryLayout: "filmstrip" },
      })
    ).toEqual({
      desktop: { heroLayout: "centered" },
      mobile: { servicesLayout: "list", galleryLayout: "filmstrip" },
    });
  });

  test("describeLayoutOverlay listet gesetzte Varianten auf Deutsch", () => {
    expect(
      describeLayoutOverlay({
        heroLayout: "centered",
        galleryLayout: "filmstrip",
      })
    ).toBe("Hero: Zentriert · Galerie: Filmstreifen");
  });

  test("describePackLayouts trennt Desktop und Mobil", () => {
    expect(
      describePackLayouts({
        desktop: { heroLayout: "centered" },
        mobile: { galleryLayout: "filmstrip" },
      })
    ).toBe("Desktop: Hero: Zentriert · Mobil: Galerie: Filmstreifen");
  });

  test("patchPackLayoutEntry ändert nur den aktuellen Viewport", () => {
    const next = patchPackLayoutEntry(
      { desktop: { heroLayout: "centered" } },
      "mobile",
      { servicesLayout: "grid" }
    );
    expect(next).toEqual({
      desktop: { heroLayout: "centered" },
      mobile: { servicesLayout: "grid" },
    });
    expect(patchPackLayoutEntry(next, "desktop", {})).toEqual({
      mobile: { servicesLayout: "grid" },
    });
  });

  test("formatReviewExport nimmt Layout-Wahlen je Viewport ins Feedback", () => {
    const text = formatReviewExport({
      packs: [
        { id: "gusto", name: "Gusto" },
        { id: "werkbank", name: "Werkbank" },
      ],
      reviewFor: id =>
        id === "gusto"
          ? { verdict: "changes", note: "Hero zu laut." }
          : { verdict: "pending", note: "" },
      layouts: {
        werkbank: {
          desktop: { servicesLayout: "grid" },
          mobile: { heroLayout: "compact" },
        },
      },
      pendingCount: 1,
    });
    expect(text).toContain("Geprüft: 1/2");
    expect(text).toContain("Gusto · Korrektur");
    expect(text).toContain("Hero zu laut.");
    expect(text).toContain("Werkbank");
    expect(text).toContain("Desktop: Leistungen: Raster");
    expect(text).toContain("Mobil: Hero: Kompakt");
    expect(text).not.toContain("Keine Anmerkung.");
  });
});
