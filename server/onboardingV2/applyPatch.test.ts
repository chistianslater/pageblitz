import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  addOnFlagsFromDoc,
  applyAddOnFlags,
  applyAddonHeadings,
  applyAddOns,
  applyFeatures,
  applyImages,
  applyInlineText,
  applyOffer,
  applyPages,
  applyStylePack,
  applyTeam,
  applyTexts,
  applyTheme,
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
    expect(() => parsePackId("disco")).toThrowError(
      /Unbekannte Designrichtung/
    );
  });
});
describe("applyStylePack", () => {
  test("setzt stylePackId, mutiert das Original nicht, Rest bleibt identisch", () => {
    const next = applyStylePack(doc, "kanzlei");
    expect(next.stylePackId).toBe("kanzlei");
    expect(next.designProfile).toBeDefined();
    expect(doc.stylePackId).toBe("werkbank");
    expect(next.sections).toEqual(doc.sections);
  });
});

describe("applyTheme", () => {
  test("setzt Akzent-Override und Schriftpaar, mutiert das Original nicht", () => {
    const next = applyTheme(doc, { accent: "#1D3FBF", fontPairId: "elegant" });
    expect(next.colorOverrides).toEqual({ accent: "#1D3FBF" });
    expect(next.fontPairId).toBe("elegant");
    expect(doc.colorOverrides).toBeUndefined();
    expect(doc.fontPairId).toBeUndefined();
  });
  test("null entfernt die Wahl; leere Overrides fallen ganz weg", () => {
    const themed = applyTheme(doc, {
      accent: "#1D3FBF",
      fontPairId: "modern",
    });
    const cleared = applyTheme(themed, { accent: null, fontPairId: null });
    expect(cleared.colorOverrides).toBeUndefined();
    expect(cleared.fontPairId).toBeUndefined();
  });
  test("undefined lässt die jeweilige Wahl unangetastet", () => {
    const themed = applyTheme(doc, { accent: "#1D3FBF" });
    const next = applyTheme(themed, { fontPairId: "klassisch" });
    expect(next.colorOverrides).toEqual({ accent: "#1D3FBF" });
    expect(next.fontPairId).toBe("klassisch");
  });
  test("lehnt Nicht-Hex-Akzent ab (Schema-Invariante: kein CSS-Freitext)", () => {
    expect(() =>
      applyTheme(doc, { accent: "red;background:url(x)" })
    ).toThrow();
  });
  test("setzt ein schema-valides Kompositionsprofil", () => {
    const designProfile = {
      version: 1 as const,
      heroLayout: "centered" as const,
      servicesLayout: "grid" as const,
      aboutLayout: "image-left" as const,
      galleryLayout: "mosaic" as const,
      density: "compact" as const,
      imageTreatment: "framed" as const,
      seed: 42,
    };
    const next = applyTheme(doc, { designProfile });
    expect(next.designProfile).toEqual(designProfile);
    expect(doc.designProfile).toBeUndefined();
  });
});

describe("applyInlineText", () => {
  test("ändert nur einen aus dem Dokument abgeleiteten sichtbaren Pfad", () => {
    const next = applyInlineText(
      docFull,
      "sections.1.items.0.title",
      "Neue Leistung"
    );
    const services = next.sections.find(s => s.type === "services");
    expect(services?.items[0].title).toBe("Neue Leistung");
    expect(
      (docFull.sections.find(s => s.type === "services") as any).items[0].title
    ).toBe("A");
  });

  test("weist freie/unsichtbare Pfade und leere Texte zurück", () => {
    expect(() =>
      applyInlineText(docFull, "seo.title", "Manipuliert")
    ).toThrow(/nicht direkt bearbeitet/);
    expect(() =>
      applyInlineText(docFull, "sections.1.items.0.title", "   ")
    ).toThrow(/maximal/);
  });
});

describe("applyAddonHeadings", () => {
  test("setzt und entfernt optionale Überschriften vorhandener Sektionen", () => {
    const set = applyAddonHeadings(docFull, {
      contact: "Schreib uns",
    });
    const contact = set.sections.find(section => section.type === "contact");
    expect(contact?.headline).toBe("Schreib uns");
    const cleared = applyAddonHeadings(set, { contact: "" });
    const clearedContact = cleared.sections.find(
      section => section.type === "contact"
    );
    expect(clearedContact?.headline).toBeUndefined();
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

  test("leere Quellen lassen vorhandene Hero-/About-Platzhalter stehen", () => {
    const withPhotos = applyImages(docFull, {
      hero: "https://x/h.jpg",
      about: "https://x/a.jpg",
    });
    const untouched = applyImages(withPhotos, {});
    expect((untouched.sections[0] as { imageUrl?: string }).imageUrl).toBe(
      "https://x/h.jpg"
    );
    const about = untouched.sections.find(s => s.type === "about") as {
      imageUrl?: string;
    };
    expect(about.imageUrl).toBe("https://x/a.jpg");
    const galleryOnly = applyImages(withPhotos, {
      gallery: [{ url: "https://x/g.jpg", alt: "a" }],
    });
    expect((galleryOnly.sections[0] as { imageUrl?: string }).imageUrl).toBe(
      "https://x/h.jpg"
    );
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

describe("applyAddOns (Plan B6 Task 6)", () => {
  test("setzt ein Sektions-Add-on, mutiert das Original nicht", () => {
    const next = applyAddOns(docFull, { gallery: true });
    expect(next.addOns).toEqual({ gallery: true });
    expect(docFull.addOns).toBeUndefined();
  });

  test("mergt zusätzliche Add-ons; false entfernt den Key; ohne aktives Add-on verschwindet das Objekt", () => {
    const a = applyAddOns(docFull, { gallery: true, team: true });
    const b = applyAddOns(a, { team: false, subpages: true });
    expect(b.addOns).toEqual({ gallery: true, subpages: true });
    const c = applyAddOns(b, { gallery: false, subpages: false });
    expect(c.addOns).toBeUndefined();
    expect("addOns" in c).toBe(false);
  });

  test("Sektionen/Pages bleiben beim Abschalten im Dokument (ausblenden statt löschen)", () => {
    const withTeam: WebsiteDataV2 = {
      ...docFull,
      addOns: { team: true },
      sections: [
        ...docFull.sections,
        { type: "team", members: [{ name: "Anna" }] },
      ],
    };
    const off = applyAddOns(withTeam, { team: false });
    expect(off.sections.some(s => s.type === "team")).toBe(true);
    expect(off.addOns).toBeUndefined();
  });

  test("applyAddOnFlags verteilt die acht Add-on-Flags auf features (contactForm/aiChat/booking/subpages) und addOns (gallery/menu/pricelist/team/subpages)", () => {
    const next = applyAddOnFlags(docFull, {
      contactForm: true,
      gallery: true,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: true,
      team: false,
      subpages: true,
    });
    expect(next.features).toEqual({
      contactForm: true,
      booking: true,
      subpages: true,
    });
    expect(next.addOns).toEqual({ gallery: true, subpages: true });
    // Nur übergebene Keys werden angefasst.
    const partial = applyAddOnFlags(next, { gallery: false });
    expect(partial.features).toEqual(next.features);
    expect(partial.addOns).toEqual({ subpages: true });
  });

  test("addOnFlagsFromDoc ist die Umkehrung von applyAddOnFlags: liest alle acht Flags aus features/addOns (fehlend → false)", () => {
    const flags = {
      contactForm: true,
      gallery: true,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: true,
      team: false,
      subpages: true,
    };
    expect(addOnFlagsFromDoc(applyAddOnFlags(docFull, flags))).toEqual(flags);
    expect(addOnFlagsFromDoc(docFull)).toEqual({
      contactForm: false,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
      subpages: false,
    });
  });
});

const page = {
  slug: "leistungen-im-detail",
  title: "Leistungen im Detail",
  seo: { title: "Leistungen im Detail", description: "Alle Leistungen." },
  sections: [{ type: "pageHeader" as const, title: "Leistungen im Detail" }],
};

describe("applyPages", () => {
  test("setzt pages, mutiert das Original nicht, Rest bleibt identisch", () => {
    const next = applyPages(docFull, { pages: [page] });
    expect(next.pages).toEqual([page]);
    expect(docFull.pages).toBeUndefined();
    expect(next.sections).toEqual(docFull.sections);
  });

  test("pages: [] auf einem Dokument ohne pages ist ein No-op (kein leeres Array im Dokument)", () => {
    const next = applyPages(docFull, { pages: [] });
    expect("pages" in next).toBe(false);
  });

  test("pages: [] entfernt vorhandene Pages wieder", () => {
    const withPages = applyPages(docFull, { pages: [page] });
    const removed = applyPages(withPages, { pages: [] });
    expect("pages" in removed).toBe(false);
  });

  test("ersetzt vorhandene Pages komplett (keine Merge-Logik je Page)", () => {
    const withOne = applyPages(docFull, { pages: [page] });
    const secondPage = { ...page, slug: "ueber-uns-detail", title: "Über uns" };
    const withTwo = applyPages(withOne, { pages: [secondPage] });
    expect(withTwo.pages).toEqual([secondPage]);
  });

  test("Ergebnis validiert gegen das Schema (ungültiger Slug wirft)", () => {
    expect(() =>
      applyPages(docFull, { pages: [{ ...page, slug: "Ungültig!" }] })
    ).toThrow();
  });

  test("mutiert das Original nicht", () => {
    applyPages(docFull, { pages: [page] });
    expect(docFull.pages).toBeUndefined();
  });
});
