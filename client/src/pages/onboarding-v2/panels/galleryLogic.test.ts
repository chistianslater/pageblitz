import { describe, expect, test } from "vitest";
import { moveGalleryImage, removeGalleryImage } from "./galleryLogic";

const urls = [
  "https://example.com/a.jpg",
  "https://example.com/b.jpg",
  "https://example.com/c.jpg",
];

describe("moveGalleryImage", () => {
  test("verschiebt ein mittleres Bild nach oben", () => {
    expect(moveGalleryImage(urls, 1, "up")).toEqual([
      "https://example.com/b.jpg",
      "https://example.com/a.jpg",
      "https://example.com/c.jpg",
    ]);
  });

  test("verschiebt ein mittleres Bild nach unten", () => {
    expect(moveGalleryImage(urls, 1, "down")).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/c.jpg",
      "https://example.com/b.jpg",
    ]);
  });

  test("erstes Bild nach oben und letztes nach unten sind No-ops (gleiche Referenz)", () => {
    expect(moveGalleryImage(urls, 0, "up")).toBe(urls);
    expect(moveGalleryImage(urls, 2, "down")).toBe(urls);
  });

  test("mutiert die Ausgangsliste nicht", () => {
    moveGalleryImage(urls, 1, "up");
    expect(urls).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/b.jpg",
      "https://example.com/c.jpg",
    ]);
  });
});

describe("removeGalleryImage", () => {
  test("entfernt das Bild am Index", () => {
    expect(removeGalleryImage(urls, 1)).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/c.jpg",
    ]);
  });

  test("mutiert die Ausgangsliste nicht", () => {
    removeGalleryImage(urls, 0);
    expect(urls).toHaveLength(3);
  });
});
