import { describe, expect, test } from "vitest";
import { DEFAULT_DESIGN_PROFILE, designSeed } from "./designProfile";

describe("DesignProfile", () => {
  test("Default erhält bestehende Websites beim bisherigen Aufbau", () => {
    expect(DEFAULT_DESIGN_PROFILE).toEqual({
      version: 1,
      heroLayout: "split",
      servicesLayout: "list",
      aboutLayout: "image-right",
      galleryLayout: "grid",
      density: "airy",
      imageTreatment: "natural",
      seed: 0,
    });
  });

  test("designSeed ist stabil (FNV-1a)", () => {
    expect(designSeed("Schreinerei Brandt")).toBe(designSeed("Schreinerei Brandt"));
    expect(designSeed("a")).not.toBe(designSeed("b"));
  });
});
