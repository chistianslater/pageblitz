import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  applyFeatures,
  applyImages,
  applyOffer,
  applyStylePack,
  applyTeam,
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

describe("applyTeam", () => {
  test("2 Mitglieder → Sektion team mit members im Dokument, nach about eingefügt, Schema-valide", () => {
    const next = applyTeam(docFull, {
      headline: "Unser Team",
      members: [
        { name: "Anna Beispiel", role: "Meisterin" },
        { name: "Ben Beispiel" },
      ],
    });
    expect(next.sections.map(s => s.type)).toEqual([
      "hero",
      "services",
      "about",
      "team",
      "contact",
    ]);
    const team = next.sections.find(s => s.type === "team") as any;
    expect(team.headline).toBe("Unser Team");
    expect(team.members).toEqual([
      { name: "Anna Beispiel", role: "Meisterin" },
      { name: "Ben Beispiel" },
    ]);
    expect(() => WebsiteDataV2Schema.parse(next)).not.toThrow();
  });

  test("Mitglieder leer → vorhandene Sektion wird entfernt", () => {
    const withTeam = applyTeam(docFull, {
      members: [{ name: "Anna Beispiel" }],
    });
    expect(withTeam.sections.some(s => s.type === "team")).toBe(true);
    const removed = applyTeam(withTeam, { members: [] });
    expect(removed.sections.some(s => s.type === "team")).toBe(false);
    expect(removed.sections.map(s => s.type)).toEqual(
      docFull.sections.map(s => s.type)
    );
  });

  test("members: [] ohne vorhandene Sektion ist ein No-op", () => {
    const next = applyTeam(docFull, { members: [] });
    expect(next.sections.map(s => s.type)).toEqual(
      docFull.sections.map(s => s.type)
    );
  });

  test("vorhandene Sektion wird ersetzt (Position bleibt), andere Sektionen unverändert", () => {
    const withTeam = applyTeam(docFull, {
      headline: "Unser Team",
      members: [{ name: "Anna Beispiel" }],
    });
    const next = applyTeam(withTeam, { members: [{ name: "Ben Beispiel" }] });
    expect(next.sections.map(s => s.type)).toEqual(
      withTeam.sections.map(s => s.type)
    );
    const team = next.sections.find(s => s.type === "team") as any;
    expect(team.members).toEqual([{ name: "Ben Beispiel" }]);
    // Ohne neue headline im Patch bleibt die vorhandene erhalten.
    expect(team.headline).toBe("Unser Team");
    const others = next.sections.filter(s => s.type !== "team");
    expect(others).toEqual(withTeam.sections.filter(s => s.type !== "team"));
  });

  test("mutiert das Original nicht", () => {
    applyTeam(docFull, { members: [{ name: "Anna" }] });
    expect(docFull.sections.some(s => s.type === "team")).toBe(false);
  });

  test("leere/nur-Leerzeichen-Überschrift im Patch → Sektion ohne headline (Renderer-Fallback greift)", () => {
    const withEmpty = applyTeam(docFull, {
      headline: "",
      members: [{ name: "Anna Beispiel" }],
    });
    const team = withEmpty.sections.find(s => s.type === "team") as any;
    expect(team.headline).toBeUndefined();
    expect("headline" in team).toBe(false);

    const withWhitespace = applyTeam(docFull, {
      headline: "   ",
      members: [{ name: "Anna Beispiel" }],
    });
    const team2 = withWhitespace.sections.find(s => s.type === "team") as any;
    expect(team2.headline).toBeUndefined();
  });

  test("leere Überschrift löscht eine vorhandene Überschrift (statt sie zu behalten)", () => {
    const withHeadline = applyTeam(docFull, {
      headline: "Unser Team",
      members: [{ name: "Anna Beispiel" }],
    });
    const cleared = applyTeam(withHeadline, {
      headline: "",
      members: [{ name: "Anna Beispiel" }],
    });
    const team = cleared.sections.find(s => s.type === "team") as any;
    expect(team.headline).toBeUndefined();
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
