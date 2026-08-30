import { describe, expect, test } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import {
  ALBUM_CSS,
  albumChromeJson,
  flattenGalleryAlbums,
} from "./galleryAlbums";

function withAlbums(doc: WebsiteDataV2): WebsiteDataV2 {
  return {
    ...doc,
    sections: doc.sections.map(s =>
      s.type === "gallery"
        ? {
            ...s,
            albums: [
              {
                title: "Hochzeiten",
                images: [
                  { url: "/demo/w1.webp", alt: "a" },
                  // Duplikat einer Hauptbild-URL — Album gewinnt beim Dedupe.
                  { url: s.images[0]!.url, alt: "a" },
                ],
              },
            ],
          }
        : s
    ),
  };
}

describe("galleryAlbums", () => {
  const doc = withAlbums(getFixture("riviera", "full"));
  const gallery = doc.sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  )!;

  test("flatten hängt Albumbilder an und dedupet zugunsten des Albums", () => {
    const flat = flattenGalleryAlbums(doc);
    const flatGallery = flat.sections.find(
      (s): s is SectionOf<"gallery"> => s.type === "gallery"
    )!;
    const urls = flatGallery.images.map(i => i.url);
    expect(urls).toContain("/demo/w1.webp");
    // Duplikat genau einmal:
    expect(urls.filter(u => u === gallery.images[0]!.url)).toHaveLength(1);
    expect(flatGallery.albums).toBeUndefined();
  });

  test("ohne Alben bleibt das Dokument identisch, JSON ist null", () => {
    const plain = getFixture("riviera", "full");
    expect(flattenGalleryAlbums(plain)).toBe(plain);
    expect(albumChromeJson(plain)).toBeNull();
  });

  test("Chrome-JSON trägt Titel + URLs und escaped '<'", () => {
    const json = albumChromeJson(doc)!;
    const parsed = JSON.parse(json) as { title: string; urls: string[] }[];
    expect(parsed[0]!.title).toBe("Hochzeiten");
    expect(parsed[0]!.urls).toContain("/demo/w1.webp");
    expect(json).not.toContain("</");
  });

  test("Filter-CSS deckt alle sechs möglichen Alben ab, invertiert versteckend", () => {
    for (let i = 0; i < 6; i++) {
      expect(ALBUM_CSS).toContain(
        `[data-pb-album-filter="${i}"] [data-pb-album-item]:not([data-pb-album="${i}"])`
      );
    }
    expect(ALBUM_CSS).toContain(".pb-album-chips");
  });
});
