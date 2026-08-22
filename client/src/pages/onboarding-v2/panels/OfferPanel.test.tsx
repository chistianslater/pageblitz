import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import { OfferEditor, offerFromDoc, validateOffer } from "./OfferPanel";

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
});

describe("OfferEditor", () => {
  test("zeigt das Modus-Segment und eine Zeile im Leistungen-Modus", () => {
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
    expect(html).toContain("Leistungen");
    expect(html).toContain("Speisekarte");
    expect(html).toContain("Preisliste");
    expect(html).toContain("Beratung");
  });

  test("zeigt Kategorien-Editor im Speisekarten-Modus", () => {
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
