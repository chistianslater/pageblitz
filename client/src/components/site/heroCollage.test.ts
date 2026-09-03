import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { collagePhotoPool, heroCollageImages } from "./heroCollage";

const PROFILE = {
  version: 1,
  heroLayout: "collage",
  servicesLayout: "list",
  aboutLayout: "image-right",
  galleryLayout: "grid",
  density: "airy",
  imageTreatment: "natural",
  seed: 1,
} as const;

const doc = (over: Partial<WebsiteDataV2> = {}): WebsiteDataV2 => ({
  version: 2,
  stylePackId: "werkbank",
  businessName: "Test",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", imageUrl: "https://x/hero.jpg" },
    {
      type: "gallery",
      images: [
        { url: "https://x/g1.jpg", alt: "" },
        { url: "https://x/hero.jpg", alt: "" },
        { url: "https://x/g2.jpg", alt: "" },
        { url: "https://x/g3.jpg", alt: "" },
      ],
    },
    { type: "about", headline: "Ü", body: "B", imageUrl: "https://x/about.jpg" },
  ],
  ...over,
});

describe("heroCollageImages", () => {
  test("nimmt die ersten zwei Galerie-Bilder, überspringt das Hero-Duplikat", () => {
    expect(heroCollageImages(doc())).toEqual([
      "https://x/g1.jpg",
      "https://x/g2.jpg",
    ]);
  });

  test("ohne Galerie fällt es auf das Über-uns-Bild zurück", () => {
    const d = doc();
    d.sections = d.sections.filter(s => s.type !== "gallery");
    expect(heroCollageImages(d)).toEqual(["https://x/about.jpg"]);
  });

  test("ohne jedes Zusatzbild bleibt die Liste leer", () => {
    const d = doc();
    d.sections = [d.sections[0]];
    expect(heroCollageImages(d)).toEqual([]);
  });

  test("ausgewählte Bilder gewinnen über die automatische Wahl", () => {
    expect(
      heroCollageImages(
        doc({
          designProfile: {
            ...PROFILE,
            heroCollageImages: ["https://x/g3.jpg", "https://x/about.jpg"],
          },
        })
      )
    ).toEqual(["https://x/g3.jpg", "https://x/about.jpg"]);
  });

  test("gelöschte oder fremde Bilder in der Auswahl werden ignoriert", () => {
    expect(
      heroCollageImages(
        doc({
          designProfile: {
            ...PROFILE,
            heroCollageImages: [
              "https://fremd/klau.jpg",
              "https://x/g2.jpg",
              "https://x/weg.jpg",
            ],
          },
        })
      )
    ).toEqual(["https://x/g2.jpg"]);
  });

  test("das Hero-Bild selbst taucht nie als Karte auf", () => {
    expect(
      heroCollageImages(
        doc({
          designProfile: {
            ...PROFILE,
            heroCollageImages: ["https://x/hero.jpg", "https://x/g1.jpg"],
          },
        })
      )
    ).toEqual(["https://x/g1.jpg"]);
  });

  test("leere Auswahl heißt bewusst keine Karten — nicht „automatisch“", () => {
    expect(
      heroCollageImages(
        doc({ designProfile: { ...PROFILE, heroCollageImages: [] } })
      )
    ).toEqual([]);
  });

  test("höchstens zwei Karten, auch wenn mehr gewählt wurden", () => {
    expect(
      heroCollageImages(
        doc({
          designProfile: {
            ...PROFILE,
            heroCollageImages: [
              "https://x/g1.jpg",
              "https://x/g2.jpg",
              "https://x/g3.jpg",
            ],
          },
        })
      )
    ).toHaveLength(2);
  });
});

describe("collagePhotoPool", () => {
  test("bietet Galerie- und Über-uns-Bilder an, ohne das Hero-Bild und ohne Dubletten", () => {
    expect(collagePhotoPool(doc())).toEqual([
      "https://x/g1.jpg",
      "https://x/g2.jpg",
      "https://x/g3.jpg",
      "https://x/about.jpg",
    ]);
  });

  test("ohne Zusatzbilder ist der Vorrat leer", () => {
    const d = doc();
    d.sections = [d.sections[0]];
    expect(collagePhotoPool(d)).toEqual([]);
  });
});
