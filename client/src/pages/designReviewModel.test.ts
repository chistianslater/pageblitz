import { describe, expect, test } from "vitest";
import {
  describeLayoutOverlay,
  formatReviewExport,
  parseLayoutOverlay,
  parsePackLayoutMap,
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

  test("parsePackLayoutMap ignoriert unbekannte Packs und leere Overlays", () => {
    expect(
      parsePackLayoutMap({
        gusto: { galleryLayout: "mosaic" },
        unknown: { heroLayout: "centered" },
        werkbank: {},
      })
    ).toEqual({ gusto: { galleryLayout: "mosaic" } });
  });

  test("describeLayoutOverlay listet gesetzte Varianten auf Deutsch", () => {
    expect(
      describeLayoutOverlay({
        heroLayout: "centered",
        galleryLayout: "filmstrip",
      })
    ).toBe("Hero: Zentriert · Galerie: Filmstreifen");
  });

  test("formatReviewExport nimmt Layout-Wahlen ins Feedback", () => {
    const text = formatReviewExport({
      packs: [
        { id: "gusto", name: "Gusto" },
        { id: "werkbank", name: "Werkbank" },
      ],
      reviewFor: id =>
        id === "gusto"
          ? { verdict: "changes", note: "Hero zu laut." }
          : { verdict: "pending", note: "" },
      layouts: { werkbank: { servicesLayout: "grid" } },
      pendingCount: 1,
    });
    expect(text).toContain("Geprüft: 1/2");
    expect(text).toContain("Gusto · Korrektur");
    expect(text).toContain("Hero zu laut.");
    expect(text).toContain("Werkbank");
    expect(text).toContain("Layout: Leistungen: Raster");
    expect(text).not.toContain("Keine Anmerkung.");
  });
});
