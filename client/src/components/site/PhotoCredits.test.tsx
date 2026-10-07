import { describe, expect, it } from "vitest";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { galleryIsStock, isStockPhotoUrl } from "./PhotoCredits";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";

describe("Stock-Galerie", () => {
  it("erkennt Unsplash-Fotos und nur reine Stock-Galerien", () => {
    expect(isStockPhotoUrl("https://images.unsplash.com/photo-1?w=1")).toBe(
      true
    );
    expect(
      isStockPhotoUrl("https://media.pageblitz.de/website-1/gmb-0.jpg")
    ).toBe(false);
    const doc = getFixture("werkbank", "full");
    const withGallery = (urls: string[]): WebsiteDataV2 => ({
      ...doc,
      sections: doc.sections.map(s =>
        s.type === "gallery" ? { ...s, images: urls.map(url => ({ url })) } : s
      ) as WebsiteDataV2["sections"],
    });
    expect(
      galleryIsStock(
        withGallery([
          "https://images.unsplash.com/photo-1",
          "https://images.unsplash.com/photo-2",
        ])
      )
    ).toBe(true);
    expect(
      galleryIsStock(
        withGallery([
          "https://images.unsplash.com/photo-1",
          "https://media.pageblitz.de/x/gmb-1.jpg",
        ])
      )
    ).toBe(false);
  });
});
