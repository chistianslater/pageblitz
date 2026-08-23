import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import {
  buildNavItems,
  orderedSections,
  pageContentSections,
  pageForPathname,
  pageHeaderSection,
  SECTION_ANCHORS,
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

const withPages: WebsiteDataV2 = {
  ...base,
  pages: [
    {
      slug: "leistungen-im-detail",
      title: "Leistungen im Detail",
      seo: { title: "Leistungen im Detail", description: "Details." },
      sections: [
        { type: "pageHeader", title: "Leistungen im Detail", intro: "Mehr dazu." },
        { type: "services", headline: "Leistungen", items: [{ title: "A" }] },
        { type: "contact", city: "Dortmund" },
      ],
    },
    {
      slug: "ueber-das-team",
      title: "Über das Team",
      navLabel: "Team",
      seo: { title: "Über das Team", description: "Wer wir sind." },
      sections: [{ type: "about", headline: "Team", body: "Wir sind ein Team." }],
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
  test("Anker sind deutsch und vollständig", () => {
    expect(SECTION_ANCHORS.services).toBe("leistungen");
    expect(SECTION_ANCHORS.about).toBe("ueber-uns");
    // Seit Plan B6 zusätzlich "pageHeader" (nur innerhalb Page.sections
    // gültig, siehe schema.ts) — Platzhalter für die Exhaustivität von
    // Record<SectionType, string>, echte Unterseiten-Navigation baut Task 3.
    expect(Object.keys(SECTION_ANCHORS)).toHaveLength(12);
  });
});

describe("pageForPathname", () => {
  test("Startseite (\"/\") → null", () => {
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
    expect(items.every(i => i.current === undefined || i.current === false)).toBe(
      true
    );
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
