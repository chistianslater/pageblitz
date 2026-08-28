import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import { OfferEditor, offerFromDoc, offerDraftsFromDoc, initialOfferMode, previewAnchorForOfferMode, offerPanelCopy, validateOffer } from "./OfferPanel";

const docWithServices: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Handwerk GmbH",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    {
      type: "services",
      headline: "Unsere Leistungen",
      intro: "Kurzer Überblick",
      items: [{ title: "Beratung", description: "Kostenlos", price: "ab 0 €" }],
    },
  ],
};

describe("offerFromDoc", () => {
  test("liest bestehende Leistungen-Sektion", () => {
    expect(offerFromDoc(docWithServices)).toEqual({
      mode: "services",
      headline: "Unsere Leistungen",
      intro: "Kurzer Überblick",
      items: [{ title: "Beratung", description: "Kostenlos", price: "ab 0 €" }],
    });
  });

  test("liest bestehende Speisekarten-Sektion", () => {
    const docWithMenu: WebsiteDataV2 = {
      ...docWithServices,
      sections: [
        { type: "hero", headline: "H" },
        {
          type: "menu",
          headline: "Speisekarte",
          categories: [
            { name: "Vorspeisen", items: [{ name: "Suppe", price: "5 €" }] },
          ],
        },
      ],
    };
    expect(offerFromDoc(docWithMenu)).toEqual({
      mode: "menu",
      headline: "Speisekarte",
      categories: [
        { name: "Vorspeisen", items: [{ name: "Suppe", price: "5 €" }] },
      ],
    });
  });

  test("ohne Angebots-Sektion → leerer Leistungen-Entwurf", () => {
    const noOffer: WebsiteDataV2 = {
      ...docWithServices,
      sections: [{ type: "hero", headline: "H" }],
    };
    expect(offerFromDoc(noOffer)).toEqual({
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "" }],
    });
  });

  test("ohne Angebots-Sektion + Gastro-Pack (prefersMenu) → leerer Speisekarten-Entwurf", () => {
    const noOfferGastro: WebsiteDataV2 = {
      ...docWithServices,
      stylePackId: "gusto",
      sections: [{ type: "hero", headline: "H" }],
    };
    expect(offerFromDoc(noOfferGastro)).toEqual({
      mode: "menu",
      categories: [{ name: "", items: [{ name: "", price: "" }] }],
    });
  });

  test("ohne Angebots-Sektion + Nicht-Gastro-Pack → weiterhin leerer Leistungen-Entwurf", () => {
    const noOfferNonGastro: WebsiteDataV2 = {
      ...docWithServices,
      stylePackId: "kanzlei",
      sections: [{ type: "hero", headline: "H" }],
    };
    expect(offerFromDoc(noOfferNonGastro)).toEqual({
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "" }],
    });
  });
});

describe("offerDraftsFromDoc", () => {
  test("hält Speisekarte neben Leistungen, damit Extra-Klick nicht leer startet", () => {
    const both: WebsiteDataV2 = {
      ...docWithServices,
      sections: [
        { type: "hero", headline: "H" },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Beratung" }],
        },
        {
          type: "menu",
          headline: "Karte",
          categories: [
            { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
          ],
        },
      ],
    };
    const drafts = offerDraftsFromDoc(both);
    expect(drafts.services.mode).toBe("services");
    if (drafts.services.mode === "services") {
      expect(drafts.services.items[0]?.title).toBe("Beratung");
    }
    expect(drafts.menu.mode).toBe("menu");
    if (drafts.menu.mode === "menu") {
      expect(drafts.menu.categories[0]?.name).toBe("Pizza");
    }
  });

  test("initialOfferMode: Speisekarte gewinnt gegen vorhandene Leistungen-Sektion", () => {
    const both: WebsiteDataV2 = {
      ...docWithServices,
      sections: [
        { type: "hero", headline: "H" },
        {
          type: "services",
          headline: "Leistungen",
          items: [{ title: "Beratung" }],
        },
        {
          type: "menu",
          headline: "Karte",
          categories: [
            { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
          ],
        },
      ],
    };
    expect(offerFromDoc(both).mode).toBe("services");
    expect(initialOfferMode(both, "menu")).toBe("menu");
    expect(initialOfferMode(both, "pricelist")).toBe("pricelist");
    expect(initialOfferMode(both)).toBe("services");
  });
});

describe("previewAnchorForOfferMode", () => {
  test("trifft die echten Sektions-IDs der Vorschau", () => {
    expect(previewAnchorForOfferMode("services")).toBe("leistungen");
    expect(previewAnchorForOfferMode("menu")).toBe("speisekarte");
    expect(previewAnchorForOfferMode("pricelist")).toBe("preise");
  });
});

describe("offerPanelCopy", () => {
  test("Extra-Speisekarte erklärt sich als eigenen Bereich, nicht als Angebotstyp", () => {
    expect(offerPanelCopy("menu").title).toBe("Speisekarte pflegen");
    expect(offerPanelCopy("menu").intro).toMatch(/Basispaket/);
    expect(offerPanelCopy("pricelist").title).toBe("Preisliste pflegen");
    expect(offerPanelCopy("services").title).toBe("Leistungen pflegen");
    expect(offerPanelCopy("services").intro).toMatch(/Extras/);
  });
});

describe("OfferEditor", () => {
  test("Leistungen-Editor hat keinen Typ-Wechsel zu Speisekarte oder Preisliste", () => {
    const html = renderToStaticMarkup(
      <OfferEditor
        value={{
          mode: "services",
          headline: "Leistungen",
          items: [{ title: "Beratung" }],
        }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Beratung");
    expect(html).not.toContain("Angebotstyp");
    expect(html).not.toContain(">Speisekarte<");
    expect(html).not.toContain(">Preisliste<");
  });

  test("Speisekarten-Editor hat keinen Tab zu Leistungen oder Preisliste", () => {
    const html = renderToStaticMarkup(
      <OfferEditor
        value={{
          mode: "menu",
          categories: [
            { name: "Vorspeisen", items: [{ name: "Suppe", price: "5 €" }] },
          ],
        }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Vorspeisen");
    expect(html).toContain("Suppe");
    expect(html).not.toContain("Angebotstyp");
    expect(html).not.toContain(">Leistungen<");
    expect(html).not.toContain(">Preisliste<");
  });

  test("Felder tragen maxLength passend zu OfferPatchSchema (Finding I2)", () => {
    const servicesHtml = renderToStaticMarkup(
      <OfferEditor
        value={{
          mode: "services",
          headline: "Leistungen",
          items: [{ title: "Beratung" }],
        }}
        onChange={() => {}}
      />
    );
    expect(servicesHtml).toContain('maxLength="80"'); // Überschrift + Titel
    expect(servicesHtml).toContain('maxLength="300"'); // Einleitung
    expect(servicesHtml).toContain('maxLength="240"'); // Beschreibung
    expect(servicesHtml).toContain('maxLength="40"'); // Preis

    const menuHtml = renderToStaticMarkup(
      <OfferEditor
        value={{
          mode: "menu",
          categories: [
            { name: "Vorspeisen", items: [{ name: "Suppe", price: "5 €" }] },
          ],
        }}
        onChange={() => {}}
      />
    );
    expect(menuHtml).toContain('maxLength="60"'); // Kategoriename
    expect(menuHtml).toContain('maxLength="200"'); // Positions-Beschreibung
  });
});

describe("validateOffer", () => {
  test("Leistungen: leerer Titel liefert eine Meldung mit Zeilennummer", () => {
    const messages = validateOffer({
      mode: "services",
      headline: "Leistungen",
      items: [{ title: "Beratung" }, { title: "" }],
    });
    expect(messages).toEqual(["Titel fehlt in Zeile 2."]);
  });

  test("Leistungen: leere Überschrift liefert eine Meldung", () => {
    expect(
      validateOffer({
        mode: "services",
        headline: "",
        items: [{ title: "Beratung" }],
      })
    ).toEqual(["Überschrift darf nicht leer sein."]);
  });

  test("Leistungen: alles ausgefüllt → keine Meldungen", () => {
    expect(
      validateOffer({
        mode: "services",
        headline: "Leistungen",
        items: [{ title: "Beratung", price: "ab 50 €" }],
      })
    ).toEqual([]);
  });

  test("Speisekarte: fehlender Preis liefert eine Meldung mit Positionsnamen", () => {
    const messages = validateOffer({
      mode: "menu",
      categories: [
        {
          name: "Vorspeisen",
          items: [{ name: "Margherita", price: "" }],
        },
      ],
    });
    expect(messages).toEqual(["Preis fehlt bei ‚Margherita‘."]);
  });

  test("Speisekarte: fehlender Kategoriename und fehlender Positionsname liefern je eine Meldung", () => {
    const messages = validateOffer({
      mode: "menu",
      categories: [{ name: "", items: [{ name: "", price: "5 €" }] }],
    });
    expect(messages).toEqual([
      "Kategoriename fehlt bei Kategorie 1.",
      "Name fehlt bei Zeile 1 in Kategorie 1.",
    ]);
  });

  test("Speisekarte: alles ausgefüllt → keine Meldungen", () => {
    expect(
      validateOffer({
        mode: "menu",
        categories: [
          { name: "Vorspeisen", items: [{ name: "Suppe", price: "5 €" }] },
        ],
      })
    ).toEqual([]);
  });
});
