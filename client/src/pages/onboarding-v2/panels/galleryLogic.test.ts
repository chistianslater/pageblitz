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

import {
  totalGalleryCount,
  withListUrls,
  type GalleryAlbumDraft,
} from "./galleryLogic";

describe("Galerie-Alben-Helfer", () => {
  const albums: GalleryAlbumDraft[] = [
    { title: "A", urls: ["a1"] },
    { title: "B", urls: ["b1", "b2"] },
  ];

  test("withListUrls ersetzt Hauptliste bzw. Album, ohne zu mutieren", () => {
    const main = withListUrls(["m1"], albums, "main", ["m1", "m2"]);
    expect(main.main).toEqual(["m1", "m2"]);
    expect(main.albums).toBe(albums);

    const album = withListUrls(["m1"], albums, 1, ["b1"]);
    expect(album.albums[1]!.urls).toEqual(["b1"]);
    expect(albums[1]!.urls).toEqual(["b1", "b2"]);
  });

  test("totalGalleryCount zählt Hauptliste und Alben", () => {
    expect(totalGalleryCount(["m1"], albums)).toBe(4);
    expect(totalGalleryCount([], [])).toBe(0);
  });
});
