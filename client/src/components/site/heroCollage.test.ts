import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { heroCollageImages } from "./heroCollage";

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
});
