import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  applyFeatures,
  applyImages,
  applyOffer,
  applyStylePack,
  applyTexts,
  parsePackId,
} from "./applyPatch";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "B",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

describe("parsePackId", () => {
  test("kennt registrierte IDs, wirft BAD_REQUEST sonst", () => {
    expect(parsePackId("kanzlei")).toBe("kanzlei");
    expect(() => parsePackId("disco")).toThrowError(/Unbekanntes Style-Pack/);
  });
});
describe("applyStylePack", () => {
  test("setzt stylePackId, mutiert das Original nicht, Rest bleibt identisch", () => {
    const next = applyStylePack(doc, "kanzlei");
    expect(next.stylePackId).toBe("kanzlei");
    expect(doc.stylePackId).toBe("werkbank");
    expect(next.sections).toEqual(doc.sections);
  });
});

const docFull: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "B",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "about", headline: "Ü", body: "Text" },
    { type: "contact", phone: "1" },
  ],
};

describe("applyImages", () => {
  test("setzt hero/about und legt Galerie nach about an", () => {
    const next = applyImages(docFull, {
      hero: "https://x/h.jpg",
      about: "https://x/a.jpg",
      gallery: [{ url: "https://x/g.jpg", alt: "Werkstatt" }],
    });
    expect((next.sections[0] as any).imageUrl).toBe("https://x/h.jpg");
    expect(next.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "about",
      "gallery",
      "contact",
    ]);
  });

  test("gallery: [] entfernt die Sektion; fehlende about-Sektion → about-Bild ignoriert", () => {
    const withGallery = applyImages(docFull, {
      gallery: [{ url: "https://x/g.jpg", alt: "a" }],
    });
    expect(
      applyImages(withGallery, { gallery: [] }).sections.some(
        s => s.type === "gallery"
      )
    ).toBe(false);
    const noAbout = {
      ...docFull,
      sections: docFull.sections.filter(s => s.type !== "about"),
    };
    expect(
      applyImages(noAbout, { about: "https://x/a.jpg" }).sections.some(
        s => s.type === "about"
      )
    ).toBe(false);
  });
});

describe("applyTexts", () => {
  test("ändert nur die übergebenen Felder", () => {
    const next = applyTexts(docFull, { headline: "Neu", seoTitle: "SEO" });
    expect((next.sections[0] as any).headline).toBe("Neu");
    expect((next.sections[0] as any).subheadline).toBeUndefined();
    expect(next.seo).toEqual({ title: "SEO", description: "d" });
    expect(docFull.seo.title).toBe("t");
  });
});

describe("applyOffer", () => {
  test("ersetzt services durch menu an gleicher Position", () => {
    const next = applyOffer(docFull, {
      mode: "menu",
      categories: [
        { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
      ],
    });
    expect(next.sections.map(s => s.type)).toEqual([
      "hero",
      "menu",
      "about",
      "contact",
    ]);
  });

  test("ohne vorhandene Angebotssektion wird nach hero eingefügt; es bleibt genau eine Angebotssektion", () => {
    const bare = {
      ...docFull,
      sections: [docFull.sections[0], docFull.sections[3]],
    };
    const next = applyOffer(bare, {
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "A" }],
    });
    expect(next.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "contact",
    ]);
    const twice = applyOffer(next, {
      mode: "pricelist",
      categories: [
        { name: "Haare", items: [{ name: "Schnitt", price: "25 €" }] },
      ],
    });
    expect(
      twice.sections.filter(s =>
        ["services", "menu", "pricelist"].includes(s.type)
      )
    ).toHaveLength(1);
  });
});

describe("applyFeatures", () => {
  test("setzt ein neues Feature, mutiert das Original nicht", () => {
    const next = applyFeatures(docFull, { aiChat: true });
    expect(next.features).toEqual({ aiChat: true });
    expect(docFull.features).toBeUndefined();
  });

  test("mergt zusätzliche Features zum bestehenden Objekt", () => {
    const withChat = applyFeatures(docFull, { aiChat: true });
    const withBoth = applyFeatures(withChat, { contactForm: true });
    expect(withBoth.features).toEqual({ aiChat: true, contactForm: true });
  });

  test("false entfernt ein Feature; bleibt keins aktiv, verschwindet das ganze Objekt", () => {
    const withChat = applyFeatures(docFull, { aiChat: true });
    const removed = applyFeatures(withChat, { aiChat: false });
    expect(removed.features).toBeUndefined();
    expect("features" in removed).toBe(false);
  });

  test("false neben aktiven Features bleibt das Objekt ohne den false-Key", () => {
    const withBoth = applyFeatures(docFull, {
      aiChat: true,
      contactForm: true,
    });
    const next = applyFeatures(withBoth, { aiChat: false });
    expect(next.features).toEqual({ contactForm: true });
  });

  test("Ergebnis validiert gegen das Schema", () => {
    const next = applyFeatures(docFull, { booking: true });
    expect(next.version).toBe(2);
  });
});
