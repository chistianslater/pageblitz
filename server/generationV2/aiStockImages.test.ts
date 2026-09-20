import { beforeEach, describe, expect, test, vi } from "vitest";

const generateAiImage = vi.fn();
const isAiImagesConfigured = vi.fn();
const uploadPhoto = vi.fn();

vi.mock("../_core/aiImages", () => ({
  generateAiImage: (...a: unknown[]) => generateAiImage(...a),
  isAiImagesConfigured: () => isAiImagesConfigured(),
}));
vi.mock("../onboardingUpload", () => ({
  uploadPhoto: (...a: unknown[]) => uploadPhoto(...a),
}));

const { buildMotivText, generateIndustryImages } = await import(
  "./aiStockImages"
);

describe("generateIndustryImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAiImagesConfigured.mockReturnValue(true);
    generateAiImage.mockResolvedValue("base64");
    uploadPhoto.mockImplementation((_b, _m, id, i) =>
      Promise.resolve({ url: `https://r2/site-${id}/ki-${i}.jpg` })
    );
  });

  test("ohne eingerichtete KI-Bilder passiert nichts", async () => {
    isAiImagesConfigured.mockReturnValue(false);
    expect(await generateIndustryImages("Briefmarkenhandel", 7)).toBeNull();
    expect(generateAiImage).not.toHaveBeenCalled();
  });

  test("fünf Motive: Hero, Über uns und Galerie", async () => {
    const bilder = await generateIndustryImages("Briefmarkenhandel", 7);
    expect(generateAiImage).toHaveBeenCalledTimes(5);
    expect(bilder?.hero).toBe("https://r2/site-7/ki-0.jpg");
    expect(bilder?.about).toBe("https://r2/site-7/ki-1.jpg");
    expect(bilder?.gallery).toHaveLength(5);
  });

  test("die Kategorie steht im Motivtext", () => {
    expect(buildMotivText("Briefmarkenhandel", "wide interior shot")).toContain(
      "Briefmarkenhandel"
    );
    expect(buildMotivText("  ", "wide interior shot")).toContain(
      "local business"
    );
  });

  test("teilweiser Fehlschlag liefert, was da ist; ohne Bild kommt null", async () => {
    generateAiImage
      .mockResolvedValueOnce("base64")
      .mockResolvedValueOnce(null)
      .mockResolvedValue(null);
    const wenige = await generateIndustryImages("Briefmarkenhandel", 7);
    expect(wenige?.hero).toBe("https://r2/site-7/ki-0.jpg");
    expect(wenige?.gallery).toBeUndefined();

    generateAiImage.mockResolvedValue(null);
    expect(await generateIndustryImages("Briefmarkenhandel", 7)).toBeNull();
  });

  test("ein fehlgeschlagener Upload wirft nicht, sondern fällt weg", async () => {
    uploadPhoto
      .mockRejectedValueOnce(new Error("R2 weg"))
      .mockImplementation((_b, _m, id, i) =>
        Promise.resolve({ url: `https://r2/site-${id}/ki-${i}.jpg` })
      );
    const bilder = await generateIndustryImages("Briefmarkenhandel", 7);
    expect(bilder?.hero).toBe("https://r2/site-7/ki-1.jpg");
  });
});
