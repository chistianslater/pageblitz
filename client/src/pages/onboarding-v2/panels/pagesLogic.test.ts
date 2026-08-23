import { describe, expect, test } from "vitest";
import type { Page, WebsiteDataV2 } from "@shared/siteContract/types";
import {
  MAX_PAGES,
  MAX_PAGE_SECTIONS,
  addPage,
  addSectionFromTemplate,
  movePage,
  moveSection,
  removePage,
  removeSection,
  slugFromTitle,
  syncLinkedSections,
  updatePage,
  updateSection,
  validatePages,
} from "./pagesLogic";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    {
      type: "about",
      headline: "Über uns",
      body: "Seit 1990.",
      imageUrl: "/a.jpg",
    },
    {
      type: "gallery",
      images: [{ url: "https://x/g1.jpg", alt: "Werkstatt" }],
    },
    {
      type: "contact",
      phone: "0231 1",
      email: "info@brandt.de",
      street: "Weg 1",
      zip: "44135",
      city: "Dortmund",
    },
  ],
};

const docWithoutGallery: WebsiteDataV2 = {
  ...doc,
  sections: doc.sections.filter(s => s.type !== "gallery"),
};

function page(slug: string, title = slug): Page {
  return {
    slug,
    title,
    seo: { title, description: "" },
    sections: [{ type: "pageHeader", title }],
  };
}

describe("slugFromTitle", () => {
  test("Umlaute und ß werden transkribiert, Leerzeichen zu Bindestrichen", () => {
    expect(slugFromTitle("Über uns")).toBe("ueber-uns");
    expect(slugFromTitle("Größenübersicht")).toBe("groessenuebersicht");
    expect(slugFromTitle("Straße & Weg")).toBe("strasse-weg");
    expect(slugFromTitle("Ärzte/Öffnungszeiten")).toBe(
      "aerzte-oeffnungszeiten"
    );
  });

  test("Sonderzeichen entfallen, Mehrfach-Bindestriche werden zusammengefasst, Ränder bereinigt", () => {
    expect(slugFromTitle("  Leistungen im Detail!  ")).toBe(
      "leistungen-im-detail"
    );
    expect(slugFromTitle("---Preise---")).toBe("preise");
    expect(slugFromTitle("a   --  b")).toBe("a-b");
  });

  test("schneidet auf 40 Zeichen (Slug-Regex) und lässt keinen Bindestrich am Ende stehen", () => {
    const long = "Ein sehr langer Seitentitel der bestimmt die Grenze sprengt";
    const slug = slugFromTitle(long);
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  test("leer/unbrauchbar → leerer String", () => {
    expect(slugFromTitle("")).toBe("");
    expect(slugFromTitle("!!!")).toBe("");
  });
});

describe("addPage", () => {
  test("legt Page mit Slug aus Titel, SEO-Titel und pageHeader-Sektion an", () => {
    const r = addPage([], "Leistungen im Detail");
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error("unreachable");
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0]).toEqual({
      slug: "leistungen-im-detail",
      title: "Leistungen im Detail",
      seo: { title: "Leistungen im Detail", description: "" },
      sections: [{ type: "pageHeader", title: "Leistungen im Detail" }],
    });
  });

  test("ist immutabel — Eingabeliste bleibt unverändert", () => {
    const input: Page[] = [page("a-seite")];
    const r = addPage(input, "Neu");
    expect(r.ok).toBe(true);
    expect(input).toHaveLength(1);
  });

  test("doppelter Slug → eindeutiger Suffix (-2, -3)", () => {
    const r1 = addPage([page("leistungen")], "Leistungen");
    if (!r1.ok) throw new Error("unreachable");
    expect(r1.pages[1].slug).toBe("leistungen-2");
    const r2 = addPage(r1.pages, "Leistungen");
    if (!r2.ok) throw new Error("unreachable");
    expect(r2.pages[2].slug).toBe("leistungen-3");
  });

  test("reservierter Slug (z. B. „Impressum“) → deutsche Fehlermeldung, keine Page", () => {
    const r = addPage([], "Impressum");
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/reserviert/);
  });

  test("leerer Titel → Fehlermeldung", () => {
    const r = addPage([], "   ");
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/Titel/);
  });

  test("Titel ohne brauchbare Zeichen → Fehlermeldung zum Pfad", () => {
    const r = addPage([], "!!!");
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/Pfad/);
  });

  test("maximal 5 Unterseiten", () => {
    const five = ["a1", "a2", "a3", "a4", "a5"].map(s => page(s));
    expect(five).toHaveLength(MAX_PAGES);
    const r = addPage(five, "Sechste");
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/maximal 5/);
  });
});

describe("updatePage / removePage / movePage", () => {
  const three = [page("aa"), page("bb"), page("cc")];

  test("updatePage ersetzt Felder immutabel", () => {
    const next = updatePage(three, 1, { title: "Neu", navLabel: "Kurz" });
    expect(next[1].title).toBe("Neu");
    expect(next[1].navLabel).toBe("Kurz");
    expect(three[1].title).toBe("bb");
  });

  test("removePage entfernt die Seite am Index", () => {
    expect(removePage(three, 1).map(p => p.slug)).toEqual(["aa", "cc"]);
  });

  test("movePage vertauscht mit dem Nachbarn, No-op am Rand", () => {
    expect(movePage(three, 1, "up").map(p => p.slug)).toEqual([
      "bb",
      "aa",
      "cc",
    ]);
    expect(movePage(three, 1, "down").map(p => p.slug)).toEqual([
      "aa",
      "cc",
      "bb",
    ]);
    expect(movePage(three, 0, "up")).toBe(three);
    expect(movePage(three, 2, "down")).toBe(three);
  });
});

describe("addSectionFromTemplate", () => {
  const base = page("leistungen-im-detail", "Leistungen im Detail");

  test("services-detail → Leistungen-Sektion mit einer leeren Zeile", () => {
    const r = addSectionFromTemplate(base, "services-detail", doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections).toHaveLength(2);
    expect(r.page.sections[1]).toEqual({
      type: "services",
      headline: "Leistungen im Detail",
      items: [{ title: "" }],
    });
    expect(base.sections).toHaveLength(1); // immutabel
  });

  test("about → übernimmt Text und Bild der Startseiten-Sektion als Startpunkt", () => {
    const r = addSectionFromTemplate(base, "about", doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections[1]).toEqual({
      type: "about",
      headline: "Über uns",
      body: "Seit 1990.",
      imageUrl: "/a.jpg",
    });
  });

  test("about ohne Startseiten-Sektion → leere Vorlage", () => {
    const r = addSectionFromTemplate(base, "about", {
      ...doc,
      sections: [{ type: "hero", headline: "H" }],
    });
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections[1]).toEqual({
      type: "about",
      headline: "Über uns",
      body: "",
    });
  });

  test("gallery → kopiert die Galerie-Bilder der Startseite", () => {
    const r = addSectionFromTemplate(base, "gallery", doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections[1]).toEqual({
      type: "gallery",
      images: [{ url: "https://x/g1.jpg", alt: "Werkstatt" }],
    });
  });

  test("gallery ohne Galerie-Bilder auf der Startseite → Hinweis aufs Fotos-Panel", () => {
    const r = addSectionFromTemplate(base, "gallery", docWithoutGallery);
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/Fotos/);
  });

  test("faq → eine leere Frage/Antwort", () => {
    const r = addSectionFromTemplate(base, "faq", doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections[1]).toEqual({
      type: "faq",
      headline: "Häufige Fragen",
      items: [{ question: "", answer: "" }],
    });
  });

  test("contact → übernimmt die Kontaktdaten der Startseite", () => {
    const r = addSectionFromTemplate(base, "contact", doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.page.sections[1]).toEqual({
      type: "contact",
      headline: "Kontakt",
      phone: "0231 1",
      email: "info@brandt.de",
      street: "Weg 1",
      zip: "44135",
      city: "Dortmund",
    });
  });

  test("jeder Sektionstyp höchstens einmal je Seite", () => {
    const once = addSectionFromTemplate(base, "faq", doc);
    if (!once.ok) throw new Error(once.error);
    const twice = addSectionFromTemplate(once.page, "faq", doc);
    expect(twice.ok).toBe(false);
    if (twice.ok) throw new Error("unreachable");
    expect(twice.error).toMatch(/schon/);
  });

  test("maximal 8 Sektionen je Seite", () => {
    const stuffed: Page = {
      ...base,
      sections: Array.from({ length: MAX_PAGE_SECTIONS }, (_, i) => ({
        type: "pageHeader" as const,
        title: `T${i}`,
      })),
    };
    const r = addSectionFromTemplate(stuffed, "faq", doc);
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.error).toMatch(/maximal 8/);
  });
});

describe("updateSection / removeSection / moveSection", () => {
  const withTwo: Page = {
    ...page("p"),
    sections: [
      { type: "pageHeader", title: "P" },
      { type: "faq", items: [{ question: "Q", answer: "A" }] },
    ],
  };

  test("updateSection ersetzt die Sektion am Index", () => {
    const next = updateSection(withTwo, 0, {
      type: "pageHeader",
      title: "Neu",
      intro: "I",
    });
    expect(next.sections[0]).toEqual({
      type: "pageHeader",
      title: "Neu",
      intro: "I",
    });
    expect(withTwo.sections[0]).toEqual({ type: "pageHeader", title: "P" });
  });

  test("removeSection entfernt, moveSection vertauscht (No-op am Rand)", () => {
    expect(removeSection(withTwo, 1).sections.map(s => s.type)).toEqual([
      "pageHeader",
    ]);
    expect(moveSection(withTwo, 1, "up").sections.map(s => s.type)).toEqual([
      "faq",
      "pageHeader",
    ]);
    expect(moveSection(withTwo, 0, "up")).toBe(withTwo);
  });
});

describe("validatePages", () => {
  test("gültige Seiten → keine Meldungen", () => {
    const r = addPage([], "Leistungen im Detail");
    if (!r.ok) throw new Error("unreachable");
    expect(validatePages(r.pages)).toEqual([]);
  });

  test("leerer Seitentitel → deutsche Meldung mit Seitennummer", () => {
    const pages = updatePage([page("a-seite")], 0, { title: "  " });
    expect(validatePages(pages)).toContain("Titel fehlt bei Seite 1.");
  });

  test("ungültiger Slug (Großbuchstaben/Leerzeichen) → Meldung zum Pfad", () => {
    const pages = updatePage([page("a-seite")], 0, { slug: "Mein Pfad" });
    const messages = validatePages(pages);
    expect(messages.some(m => /Pfad bei Seite 1/.test(m))).toBe(true);
    expect(messages.join(" ").toLowerCase()).not.toContain("invalid");
  });

  test("reservierter Slug → Meldung „reserviert“", () => {
    const pages = updatePage([page("a-seite")], 0, { slug: "impressum" });
    expect(validatePages(pages).some(m => /reserviert/.test(m))).toBe(true);
  });

  test("doppelter Slug über zwei Seiten → Meldung", () => {
    const pages = [page("gleich"), page("anders")];
    const dup = updatePage(pages, 1, { slug: "gleich" });
    expect(validatePages(dup).some(m => /mehrfach|doppelt/.test(m))).toBe(true);
  });

  test("Seite ohne Sektion → Meldung", () => {
    const pages: Page[] = [{ ...page("leer"), sections: [] }];
    expect(
      validatePages(pages).some(m => /mindestens eine Sektion/.test(m))
    ).toBe(true);
  });

  test("leere Pflichtfelder in Sektionen → Meldung mit Seiten- und Sektionsnummer", () => {
    const pages: Page[] = [
      {
        ...page("p"),
        sections: [
          { type: "pageHeader", title: "" },
          { type: "services", headline: "L", items: [{ title: "" }] },
          { type: "faq", items: [{ question: "", answer: "A" }] },
          { type: "about", headline: "", body: "" },
        ],
      },
    ];
    const messages = validatePages(pages);
    expect(messages).toContain("Titel fehlt bei Sektion 1 auf Seite 1.");
    expect(messages).toContain(
      "Titel fehlt in Zeile 1 bei Sektion 2 auf Seite 1."
    );
    expect(messages).toContain(
      "Frage fehlt in Zeile 1 bei Sektion 3 auf Seite 1."
    );
    expect(messages).toContain("Überschrift fehlt bei Sektion 4 auf Seite 1.");
    expect(messages).toContain("Text fehlt bei Sektion 4 auf Seite 1.");
  });

  test("zu lange Felder (Schema) → lesbare Meldung statt zod-Rohtext", () => {
    const pages = updatePage([page("a-seite")], 0, { title: "x".repeat(61) });
    const messages = validatePages(pages);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.join(" ")).toMatch(/zu lang/);
    expect(messages.join(" ")).not.toContain("too_big");
  });
});

describe("syncLinkedSections", () => {
  test("Kontakt- und Galerie-Sektionen der Seiten werden aus der Startseite aufgefrischt", () => {
    const stale: Page[] = [
      {
        ...page("p"),
        sections: [
          { type: "pageHeader", title: "P" },
          { type: "contact", headline: "Kontakt", phone: "alt" },
          { type: "gallery", images: [{ url: "/alt.jpg", alt: "alt" }] },
        ],
      },
    ];
    const synced = syncLinkedSections(stale, doc);
    expect(synced[0].sections[1]).toEqual({
      type: "contact",
      headline: "Kontakt",
      phone: "0231 1",
      email: "info@brandt.de",
      street: "Weg 1",
      zip: "44135",
      city: "Dortmund",
    });
    expect(synced[0].sections[2]).toEqual({
      type: "gallery",
      images: [{ url: "https://x/g1.jpg", alt: "Werkstatt" }],
    });
    // immutabel
    expect((stale[0].sections[1] as { phone?: string }).phone).toBe("alt");
  });

  test("ohne Galerie auf der Startseite bleibt die Galerie-Sektion der Seite unverändert", () => {
    const pages: Page[] = [
      {
        ...page("p"),
        sections: [
          { type: "gallery", images: [{ url: "/alt.jpg", alt: "a" }] },
        ],
      },
    ];
    expect(syncLinkedSections(pages, docWithoutGallery)[0].sections[0]).toEqual(
      pages[0].sections[0]
    );
  });
});
