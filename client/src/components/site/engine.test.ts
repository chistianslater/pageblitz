import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { getFixture } from "../../../../shared/siteContract/fixtures";
import { ADDON_EDITORS } from "../../../../shared/onboardingV2/addonEditors";
import {
  ADDON_GATED_SECTION_TYPES,
  FREIE_GALERIEBILDER,
  SECTION_ANCHORS,
  applyNavLabels,
  buildNavItems,
  isSectionBooked,
  linkPageSections,
  orderedSections,
  pageContentSections,
  pageForPathname,
  pageHeaderSection,
  visiblePageSections,
  visiblePages,
  visibleSections,
  withAboutFallbackImage,
  withGalleryLimit,
} from "./engine";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Test",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "contact", city: "Dortmund" },
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
  ],
};

// Seit Plan B6 Task 6 sind Unterseiten Add-on-Inhalt: ohne
// `addOns.subpages: true` werden sie weder aufgelöst noch verlinkt.
const withPages: WebsiteDataV2 = {
  ...base,
  addOns: { subpages: true },
  pages: [
    {
      slug: "leistungen-im-detail",
      title: "Leistungen im Detail",
      seo: { title: "Leistungen im Detail", description: "Details." },
      sections: [
        {
          type: "pageHeader",
          title: "Leistungen im Detail",
          intro: "Mehr dazu.",
        },
        { type: "services", headline: "Leistungen", items: [{ title: "A" }] },
        { type: "contact", city: "Dortmund" },
      ],
    },
    {
      slug: "ueber-das-team",
      title: "Über das Team",
      navLabel: "Team",
      seo: { title: "Über das Team", description: "Wer wir sind." },
      sections: [
        { type: "about", headline: "Team", body: "Wir sind ein Team." },
      ],
    },
  ],
};

describe("orderedSections", () => {
  test("ohne sectionOrder: hero immer zuerst, Rest in Dokument-Reihenfolge", () => {
    expect(orderedSections(base).map(s => s.type)).toEqual([
      "hero",
      "contact",
      "services",
    ]);
  });
  test("sectionOrder wird angewendet, hiddenSections gefiltert", () => {
    const d: WebsiteDataV2 = {
      ...base,
      sectionOrder: ["hero", "services", "contact"],
      hiddenSections: ["contact"],
    };
    expect(orderedSections(d).map(s => s.type)).toEqual(["hero", "services"]);
  });
  test("einzelner Montag-Stub wird als Mo–Fr-Platzhalter gerendert", () => {
    const d: WebsiteDataV2 = {
      ...base,
      sections: [
        { type: "hero", headline: "H" },
        {
          type: "contact",
          city: "Dortmund",
          openingHours: [{ day: "Montag", hours: "09:00–17:00" }],
        },
      ],
    };
    const contact = orderedSections(d).find(s => s.type === "contact");
    expect(contact).toMatchObject({
      type: "contact",
      openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
    });
  });
  test("bewusst geleerte Öffnungszeiten werden nicht wiederbelebt", () => {
    const d: WebsiteDataV2 = {
      ...base,
      sections: [
        { type: "hero", headline: "H" },
        { type: "contact", city: "Dortmund", openingHours: [] },
      ],
    };
    const contact = orderedSections(d).find(s => s.type === "contact");
    expect(contact).toMatchObject({ type: "contact", openingHours: [] });
  });
  test("Anker sind deutsch und vollständig", () => {
    expect(SECTION_ANCHORS.services).toBe("leistungen");
    expect(SECTION_ANCHORS.about).toBe("ueber-uns");
    // Seit Plan B6 zusätzlich "pageHeader" (nur innerhalb Page.sections
    // gültig, siehe schema.ts) — Platzhalter für die Exhaustivität von
    // Record<SectionType, string>, echte Unterseiten-Navigation baut Task 3.
    // Seit 2026-08-30/31 zusätzlich story/usp/notice (Zusatz-Sektionen).
    expect(SECTION_ANCHORS.story).toBe("geschichte");
    expect(SECTION_ANCHORS.usp).toBe("vorteile");
    expect(SECTION_ANCHORS.notice).toBe("hinweis");
    expect(SECTION_ANCHORS.stats).toBe("zahlen");
    expect(SECTION_ANCHORS.process).toBe("ablauf");
    expect(SECTION_ANCHORS.quote).toBe("zitat");
    expect(SECTION_ANCHORS.partners).toBe("partner");
    expect(Object.keys(SECTION_ANCHORS)).toHaveLength(19);
  });
});

describe("pageForPathname", () => {
  test('Startseite ("/") → null', () => {
    expect(pageForPathname(withPages, "/")).toBeNull();
  });
  test("leerer Pfad → null", () => {
    expect(pageForPathname(withPages, "")).toBeNull();
  });
  test("bekannter Page-Slug → die Page", () => {
    const page = pageForPathname(withPages, "/leistungen-im-detail");
    expect(page?.title).toBe("Leistungen im Detail");
  });
  test("Slug ohne führenden Slash wird trotzdem gefunden", () => {
    expect(pageForPathname(withPages, "leistungen-im-detail")?.slug).toBe(
      "leistungen-im-detail"
    );
  });
  test("unbekannter Slug → null", () => {
    expect(pageForPathname(withPages, "/nicht-vorhanden")).toBeNull();
  });
  test("kein pages[] im Dokument → immer null", () => {
    expect(pageForPathname(base, "/leistungen-im-detail")).toBeNull();
  });
  test("pages[] vorhanden, aber addOns.subpages nicht gebucht → null (Gating, Plan B6 Task 6)", () => {
    const { addOns: _a, ...ungated } = withPages;
    expect(pageForPathname(ungated, "/leistungen-im-detail")).toBeNull();
    expect(
      pageForPathname(
        { ...ungated, addOns: { gallery: true } },
        "/leistungen-im-detail"
      )
    ).toBeNull();
  });
});

describe("Add-on-Gating (Plan B6 Task 6): visibleSections / visiblePages", () => {
  const gatedDoc: WebsiteDataV2 = {
    ...base,
    sections: [
      { type: "hero", headline: "H" },
      { type: "services", headline: "L", items: [{ title: "A" }] },
      { type: "about", headline: "Ü", body: "B" },
      {
        type: "gallery",
        headline: "G",
        images: [{ url: "https://x/g.jpg", alt: "g" }],
      },
      {
        type: "menu",
        headline: "M",
        categories: [{ name: "K", items: [{ name: "Gericht", price: "9 €" }] }],
      },
      {
        type: "pricelist",
        headline: "P",
        categories: [
          { name: "K", items: [{ name: "Leistung", price: "9 €" }] },
        ],
      },
      { type: "team", headline: "T", members: [{ name: "Anna" }] },
      { type: "contact", city: "Dortmund" },
    ],
  };
  const GATED = ["menu", "pricelist", "team"] as const;
  // Die Galerie ist seit 2026-09-20 frei sichtbar (auf drei Fotos begrenzt).
  const FREE = ["hero", "services", "about", "gallery", "contact"] as const;

  test("ADDON_GATED_SECTION_TYPES bildet genau menu/pricelist/team auf ihr Add-on ab", () => {
    expect(ADDON_GATED_SECTION_TYPES).toEqual({
      menu: "menu",
      pricelist: "pricelist",
      team: "team",
    });
    // Galerie bewusst nicht mehr gesperrt, sondern begrenzt.
    expect(ADDON_GATED_SECTION_TYPES.gallery).toBeUndefined();
  });

  test("Extra-Editor-Anker treffen die echten Sektions-IDs (sonst scrollt die Vorschau ins Leere)", () => {
    expect(ADDON_EDITORS.gallery.previewAnchor).toBe(SECTION_ANCHORS.gallery);
    expect(ADDON_EDITORS.menu.previewAnchor).toBe(SECTION_ANCHORS.menu);
    expect(ADDON_EDITORS.pricelist.previewAnchor).toBe(
      SECTION_ANCHORS.pricelist
    );
    expect(ADDON_EDITORS.team.previewAnchor).toBe(SECTION_ANCHORS.team);
  });

  test("ohne addOns: gebuchte Sektionstypen werden ausgeblendet, freie bleiben (Dokument bleibt unverändert)", () => {
    const types = visibleSections(gatedDoc).map(s => s.type);
    expect(types).toEqual(["hero", "services", "about", "gallery", "contact"]);
    // Kein Datenverlust: das Dokument selbst behält alle Sektionen.
    expect(gatedDoc.sections).toHaveLength(8);
  });

  test("Matrix: je Add-on genau eine Sektion sichtbar; andere gebuchte bleiben aus", () => {
    for (const key of GATED) {
      const doc: WebsiteDataV2 = { ...gatedDoc, addOns: { [key]: true } };
      const types = visibleSections(doc).map(s => s.type);
      for (const other of GATED) {
        expect(types.includes(other)).toBe(other === key);
      }
      for (const free of FREE) expect(types).toContain(free);
      expect(isSectionBooked(doc, key)).toBe(true);
    }
  });

  test("alle addOns true → alle Sektionen sichtbar, Reihenfolge wie im Dokument; orderedSections hält den Hero vorn und respektiert das Gating", () => {
    const doc: WebsiteDataV2 = {
      ...gatedDoc,
      addOns: { menu: true, pricelist: true, team: true },
    };
    expect(visibleSections(doc).map(s => s.type)).toEqual(
      gatedDoc.sections.map(s => s.type)
    );
    const partly: WebsiteDataV2 = {
      ...gatedDoc,
      addOns: { team: true },
      sectionOrder: ["contact", "team", "services", "hero"],
    };
    expect(orderedSections(partly).map(s => s.type)).toEqual([
      "hero",
      "contact",
      "team",
      "services",
      "about",
      "gallery",
    ]);
  });

  test("hiddenSections greift weiterhin zusätzlich zum Gating", () => {
    const doc: WebsiteDataV2 = {
      ...gatedDoc,
      addOns: { gallery: true },
      hiddenSections: ["gallery"],
    };
    expect(visibleSections(doc).map(s => s.type)).not.toContain("gallery");
  });

  test("freie Sektionstypen sind nie gebucht-abhängig", () => {
    for (const free of FREE) expect(isSectionBooked(base, free)).toBe(true);
    expect(isSectionBooked(base, "faq")).toBe(true);
    expect(isSectionBooked(base, "testimonials")).toBe(true);
    expect(isSectionBooked(base, "cta")).toBe(true);
  });

  test("visiblePages: nur mit addOns.subpages; sonst leer — und buildNavItems verlinkt dann keine Seiten", () => {
    expect(visiblePages(withPages).map(p => p.slug)).toEqual([
      "leistungen-im-detail",
      "ueber-das-team",
    ]);
    const { addOns: _a, ...ungated } = withPages;
    expect(visiblePages(ungated)).toEqual([]);
    expect(visiblePages(base)).toEqual([]);
    const items = buildNavItems(ungated, { pathname: "/", basePath: "" });
    expect(items.some(i => i.key.startsWith("page-"))).toBe(false);
    // Auf einer (nicht gebuchten) Unterseiten-URL bleibt die Nav die der
    // Startseite (kein Anker-Präfix, kein current).
    const onPage = buildNavItems(ungated, {
      pathname: "/leistungen-im-detail",
      basePath: "",
    });
    expect(onPage.map(i => i.href)).toEqual(["#kontakt", "#leistungen"]);
  });

  test("Nav-Anker folgen dem Gating: nicht gebuchte Speisekarte bekommt keinen Anker, die freie Galerie schon", () => {
    const items = buildNavItems(
      { ...gatedDoc, addOns: { team: true } },
      { pathname: "/", basePath: "" }
    );
    expect(items.map(i => i.key)).toEqual([
      "anchor-services",
      "anchor-about",
      "anchor-gallery",
      "anchor-team",
      "anchor-contact",
    ]);
    expect(items.map(i => i.key)).not.toContain("anchor-menu");
  });

  test("linkPageSections: Kontakt/Galerie auf Unterseiten lesen beim Rendern die Startseite (Fakten/Bilder), Überschrift der Seite bleibt; ohne Startseiten-Pendant bleibt die Kopie", () => {
    const home: WebsiteDataV2 = {
      ...base,
      addOns: { subpages: true, gallery: true },
      sections: [
        { type: "hero", headline: "H" },
        {
          type: "gallery",
          headline: "Einblicke",
          images: [{ url: "https://x/neu.jpg", alt: "neu" }],
        },
        { type: "contact", city: "Essen", phone: "0201 1" },
      ],
    };
    const pageSections = [
      { type: "pageHeader" as const, title: "Seite" },
      {
        type: "gallery" as const,
        headline: "Seiten-Galerie",
        images: [{ url: "https://x/alt.jpg", alt: "alt" }],
      },
      {
        type: "contact" as const,
        headline: "So erreichst du uns",
        city: "Dortmund",
      },
    ];
    const linked = linkPageSections(home, pageSections);
    expect(linked[1]).toEqual({
      type: "gallery",
      headline: "Seiten-Galerie",
      images: [{ url: "https://x/neu.jpg", alt: "neu" }],
    });
    expect(linked[2]).toEqual({
      type: "contact",
      headline: "So erreichst du uns",
      city: "Essen",
      phone: "0201 1",
      openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
    });
    expect(linked[0]).toBe(pageSections[0]);
    // Ohne eigene Überschrift: Standard „Kontakt" wie die Studio-Kopie
    // (pagesLogic contactFromDoc), NICHT die Startseiten-Überschrift.
    const homeWithHeadline: WebsiteDataV2 = {
      ...home,
      sections: [
        { type: "hero", headline: "H" },
        { type: "contact", headline: "So erreichst du uns", city: "Essen" },
      ],
    };
    expect(
      linkPageSections(homeWithHeadline, [{ type: "contact", city: "Alt" }])
    ).toEqual([
      {
        type: "contact",
        headline: "Kontakt",
        city: "Essen",
        openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
      },
    ]);
    // Startseite ohne Galerie/Kontakt → Seiten-Kopie bleibt unverändert.
    const bare: WebsiteDataV2 = {
      ...base,
      sections: [{ type: "hero", headline: "H" }],
    };
    expect(linkPageSections(bare, pageSections)).toEqual(pageSections);
    // Eingabe unverändert.
    expect(pageSections[1].images[0]!.url).toBe("https://x/alt.jpg");
  });

  test("visiblePageSections: pageHeader bleibt, gebuchte Typen auf Unterseiten folgen demselben Gating", () => {
    const page = {
      slug: "galerie-seite",
      title: "Galerie",
      seo: { title: "Galerie", description: "Bilder." },
      sections: [
        { type: "pageHeader" as const, title: "Galerie" },
        {
          type: "gallery" as const,
          headline: "G",
          images: [{ url: "https://x/g.jpg", alt: "g" }],
        },
        { type: "contact" as const, city: "Dortmund" },
      ],
    };
    const docOff: WebsiteDataV2 = { ...base, addOns: { subpages: true } };
    // Die Galerie bleibt auch ohne Add-on sichtbar (begrenzt auf drei Fotos).
    expect(visiblePageSections(docOff, page).map(s => s.type)).toEqual([
      "pageHeader",
      "gallery",
      "contact",
    ]);
    const docOn: WebsiteDataV2 = {
      ...base,
      addOns: { subpages: true, gallery: true },
    };
    expect(visiblePageSections(docOn, page).map(s => s.type)).toEqual([
      "pageHeader",
      "gallery",
      "contact",
    ]);
    // Unverändertes Eingabeobjekt.
    expect(page.sections).toHaveLength(3);
  });
});

describe("buildNavItems", () => {
  test("Startseite ohne pages[] → nur Anker, kein Präfix", () => {
    const items = buildNavItems(base, { pathname: "/", basePath: "" });
    expect(items.map(i => i.href)).toEqual(["#kontakt", "#leistungen"]);
    expect(items.every(i => i.current === undefined)).toBe(true);
  });
  test("Startseite mit pages[] → Anker (ohne Präfix) + je Page ein Link, keine current", () => {
    const items = buildNavItems(withPages, { pathname: "/", basePath: "" });
    const pageLinks = items.filter(i => i.key.startsWith("page-"));
    expect(pageLinks.map(i => i.href)).toEqual([
      "/leistungen-im-detail",
      "/ueber-das-team",
    ]);
    // navLabel-Override wird verwendet, wenn vorhanden — sonst der Titel.
    expect(pageLinks.map(i => i.label)).toEqual([
      "Leistungen im Detail",
      "Team",
    ]);
    expect(
      items.every(i => i.current === undefined || i.current === false)
    ).toBe(true);
  });
  test("Unterseite → Anker zeigen mit Präfix zurück zur Startseite, eigener Page-Link ist current", () => {
    const items = buildNavItems(withPages, {
      pathname: "/leistungen-im-detail",
      basePath: "",
    });
    const anchor = items.find(i => i.key === "anchor-services");
    expect(anchor?.href).toBe("/#leistungen");
    const own = items.find(i => i.key === "page-leistungen-im-detail");
    expect(own?.current).toBe(true);
    const other = items.find(i => i.key === "page-ueber-das-team");
    expect(other?.current).toBe(false);
  });
  test("Unterseite mit gesetztem basePath → Anker-Präfix ist basePath, Page-Links ebenfalls", () => {
    const items = buildNavItems(withPages, {
      pathname: "/leistungen-im-detail",
      basePath: "/site/schreinerei-brandt",
    });
    const anchor = items.find(i => i.key === "anchor-contact");
    expect(anchor?.href).toBe("/site/schreinerei-brandt#kontakt");
    const own = items.find(i => i.key === "page-leistungen-im-detail");
    expect(own?.href).toBe("/site/schreinerei-brandt/leistungen-im-detail");
  });
});

describe("pageHeaderSection / pageContentSections", () => {
  const page = withPages.pages![0];
  test("pageHeaderSection liefert die pageHeader-Sektion", () => {
    expect(pageHeaderSection(page)?.title).toBe("Leistungen im Detail");
  });
  test("pageHeaderSection liefert null ohne pageHeader-Sektion", () => {
    expect(pageHeaderSection(withPages.pages![1])).toBeNull();
  });
  test("pageContentSections filtert pageHeader heraus, Rest bleibt in Reihenfolge", () => {
    expect(pageContentSections(page).map(s => s.type)).toEqual([
      "services",
      "contact",
    ]);
  });
});

describe("applyNavLabels", () => {
  test("ersetzt nur Anker-Labels (sectionType gesetzt), Page-Links bleiben; mutiert nichts", () => {
    const items = [
      {
        key: "anchor-testimonials",
        href: "#bewertungen",
        label: "Bewertungen",
        sectionType: "testimonials" as const,
      },
      {
        key: "anchor-faq",
        href: "#faq",
        label: "FAQ",
        sectionType: "faq" as const,
      },
      { key: "page-x", href: "/x", label: "Bewertungen", current: true },
    ];
    const out = applyNavLabels(items, { testimonials: "Mandantenstimmen" });
    expect(out.map(i => i.label)).toEqual([
      "Mandantenstimmen",
      "FAQ",
      "Bewertungen",
    ]);
    expect(items[0]!.label).toBe("Bewertungen");
    expect(out[2]).toBe(items[2]);
  });
});

describe("withAboutFallbackImage", () => {
  const basis = () => {
    const doc = getFixture("patina", "full");
    return {
      ...doc,
      sections: doc.sections.map(s =>
        s.type === "about" ? { ...s, imageUrl: undefined } : s
      ),
    } as typeof doc;
  };

  test("fehlt das Über-uns-Foto, rückt das erste Galeriebild nach", () => {
    const doc = basis();
    const galerie = doc.sections.find(s => s.type === "gallery");
    const ergebnis = withAboutFallbackImage(doc);
    const about = ergebnis.sections.find(s => s.type === "about");
    expect(about && "imageUrl" in about ? about.imageUrl : undefined).toBe(
      galerie && "images" in galerie ? galerie.images[0].url : "fehlt"
    );
  });

  test("das Kopfbild wird nicht doppelt verwendet", () => {
    const doc = basis();
    const galerie = doc.sections.find(s => s.type === "gallery");
    const erstes =
      galerie && "images" in galerie ? galerie.images[0].url : "x";
    const mitDublette = {
      ...doc,
      sections: doc.sections.map(s =>
        s.type === "hero" ? { ...s, imageUrl: erstes } : s
      ),
    } as typeof doc;
    const about = withAboutFallbackImage(mitDublette).sections.find(
      s => s.type === "about"
    );
    const gesetzt =
      about && "imageUrl" in about ? about.imageUrl : undefined;
    expect(gesetzt).not.toBe(erstes);
    expect(gesetzt).toBeTruthy();
  });

  test("bewusst ausgeblendetes Foto bleibt aus", () => {
    const doc = basis();
    const versteckt = {
      ...doc,
      designProfile: { ...doc.designProfile, hiddenElements: ["about-media"] },
    } as typeof doc;
    const about = withAboutFallbackImage(versteckt).sections.find(
      s => s.type === "about"
    );
    expect(about && "imageUrl" in about ? about.imageUrl : "x").toBeUndefined();
  });

  test("vorhandenes Foto bleibt unangetastet", () => {
    const doc = getFixture("patina", "full");
    expect(withAboutFallbackImage(doc)).toBe(doc);
  });
});

describe("withGalleryLimit", () => {
  const fuenfBilder = Array.from({ length: 5 }, (_, i) => ({
    url: `https://x/g${i + 1}.jpg`,
    alt: `Bild ${i + 1}`,
  }));
  const mitGalerie = (): WebsiteDataV2 => {
    const doc = getFixture("patina", "full");
    return {
      ...doc,
      addOns: undefined,
      sections: doc.sections.map(s =>
        s.type === "gallery" ? { ...s, images: fuenfBilder } : s
      ),
    };
  };
  const bilder = (doc: WebsiteDataV2) => {
    const g = doc.sections.find(s => s.type === "gallery");
    return g && "images" in g ? g.images.length : 0;
  };

  test("ohne Add-on bleiben genau drei Fotos", () => {
    expect(FREIE_GALERIEBILDER).toBe(3);
    expect(bilder(withGalleryLimit(mitGalerie()))).toBe(3);
  });

  test("mit gebuchtem Add-on bleiben alle Fotos", () => {
    const voll = { ...mitGalerie(), addOns: { gallery: true } };
    expect(bilder(withGalleryLimit(voll))).toBe(5);
    expect(withGalleryLimit(voll)).toBe(voll);
  });

  test("Unterseiten folgen derselben Grenze", () => {
    const doc = mitGalerie();
    const galerie = doc.sections.find(s => s.type === "gallery");
    const gekuerzt = withGalleryLimit({
      ...doc,
      pages: [
        {
          slug: "impressionen",
          title: "Impressionen",
          seo: { title: "Impressionen", description: "Bilder." },
          sections: [
            { type: "pageHeader" as const, title: "Impressionen" },
            galerie!,
          ],
        },
      ],
    } as WebsiteDataV2);
    const g = gekuerzt.pages?.[0].sections.find(s => s.type === "gallery");
    expect(g && "images" in g ? g.images.length : 0).toBe(3);
  });

  test("das Dokument selbst bleibt unangetastet", () => {
    const doc = mitGalerie();
    withGalleryLimit(doc);
    expect(bilder(doc)).toBe(5);
  });
});
