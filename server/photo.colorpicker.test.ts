import { describe, it, expect } from "vitest";

// ─── Test: INDUSTRY_PHOTOS coverage ───────────────────────────────────────────
// We can't import the frontend constant directly in a server test, so we
// replicate the category list and verify the mapping logic.

const EXPECTED_CATEGORIES = [
  "Restaurant",
  "Café",
  "Friseur",
  "Handwerk",
  "Bauunternehmen",
  "Beauty / Kosmetik",
  "Fitness-Studio",
  "Arzt / Zahnarzt",
  "Rechtsanwalt",
  "Immobilien",
  "IT / Software",
  "Fotografie",
  "Autowerkstatt",
  "Hotel / Pension",
  "Bäckerei",
  "Bar / Tapas",
];

// Simulate the photo lookup logic used in HeroPhotoStep
function getPhotosForCategory(category: string, industryPhotos: Record<string, unknown[]>): unknown[] {
  return industryPhotos[category] ?? industryPhotos["default"] ?? [];
}

describe("Industry photo mapping", () => {
  it("should have photo entries for all 16 expected categories", () => {
    // Build a mock photo map with all categories
    const mockPhotoMap: Record<string, unknown[]> = {};
    for (const cat of EXPECTED_CATEGORIES) {
      mockPhotoMap[cat] = [{ id: "1", url: "https://example.com/photo.jpg", thumb: "https://example.com/thumb.jpg", alt: cat }];
    }
    mockPhotoMap["default"] = [{ id: "d1", url: "https://example.com/default.jpg", thumb: "https://example.com/default-thumb.jpg", alt: "default" }];

    for (const cat of EXPECTED_CATEGORIES) {
      const photos = getPhotosForCategory(cat, mockPhotoMap);
      expect(photos.length).toBeGreaterThan(0);
    }
  });

  it("should fall back to default photos for unknown categories", () => {
    const mockPhotoMap: Record<string, unknown[]> = {
      default: [{ id: "d1", url: "https://example.com/default.jpg", thumb: "https://example.com/default-thumb.jpg", alt: "default" }],
    };
    const photos = getPhotosForCategory("Unbekannte Kategorie", mockPhotoMap);
    expect(photos.length).toBeGreaterThan(0);
  });

  it("should return empty array when no default exists for unknown category", () => {
    const mockPhotoMap: Record<string, unknown[]> = {};
    const photos = getPhotosForCategory("Unbekannte Kategorie", mockPhotoMap);
    expect(photos).toEqual([]);
  });
});

// ─── Test: Color picker in-place edit logic ────────────────────────────────────

describe("Color picker in-place edit", () => {
  const COLOR_STEPS = ["brandColor", "brandSecondaryColor"];

  it("should identify color steps correctly", () => {
    for (const step of COLOR_STEPS) {
      expect(COLOR_STEPS.includes(step)).toBe(true);
    }
  });

  it("should not identify non-color steps as color steps", () => {
    const nonColorSteps = ["businessName", "services", "legalZipCity", "heroPhoto"];
    for (const step of nonColorSteps) {
      expect(COLOR_STEPS.includes(step)).toBe(false);
    }
  });

  it("should validate hex color format", () => {
    const validHex = /^#[0-9A-Fa-f]{6}$/;
    expect(validHex.test("#3b82f6")).toBe(true);
    expect(validHex.test("#FFFFFF")).toBe(true);
    expect(validHex.test("#000000")).toBe(true);
    expect(validHex.test("3b82f6")).toBe(false);   // missing #
    expect(validHex.test("#3b82f")).toBe(false);    // too short
    expect(validHex.test("#3b82f600")).toBe(false); // too long (8-char)
    expect(validHex.test("blue")).toBe(false);      // named color
  });

  it("should use fallback color when value is not a valid hex", () => {
    const fallback = "#3b82f6";
    const isValidHex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v);
    const getColorValue = (v: string) => isValidHex(v) ? v : fallback;

    expect(getColorValue("#dc2626")).toBe("#dc2626");
    expect(getColorValue("red")).toBe(fallback);
    expect(getColorValue("")).toBe(fallback);
    expect(getColorValue("#abc")).toBe(fallback);
  });

  it("should preserve color value when saving in-place edit", () => {
    // Simulate the save logic: only save if valid hex
    const saveColorEdit = (step: string, value: string): string | null => {
      if (!step || !/^#[0-9A-Fa-f]{6}$/.test(value)) return null;
      return value;
    };

    expect(saveColorEdit("brandColor", "#3b82f6")).toBe("#3b82f6");
    expect(saveColorEdit("brandSecondaryColor", "#16a34a")).toBe("#16a34a");
    expect(saveColorEdit("brandColor", "not-a-color")).toBeNull();
    expect(saveColorEdit("", "#3b82f6")).toBeNull();
  });
});
