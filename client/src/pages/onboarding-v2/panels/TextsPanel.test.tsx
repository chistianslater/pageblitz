import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import { TextsForm, textsFromDoc, validateTexts } from "./TextsPanel";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Café Sonne",
  seo: {
    title: "Café Sonne in Musterstadt",
    description: "Frisch gebrühter Kaffee in Musterstadt.",
  },
  sections: [
    {
      type: "hero",
      headline: "Willkommen",
      subheadline: "Kaffee mit Herz",
      ctaText: "Jetzt vorbeischauen",
    },
    { type: "about", headline: "Über uns", body: "Wir sind ein kleines Café." },
  ],
};

describe("textsFromDoc", () => {
  test("liest Hero-, Über-uns- und SEO-Felder aus dem Dokument", () => {
    expect(textsFromDoc(doc)).toEqual({
      headline: "Willkommen",
      subheadline: "Kaffee mit Herz",
      ctaText: "Jetzt vorbeischauen",
      aboutHeadline: "Über uns",
      aboutBody: "Wir sind ein kleines Café.",
      seoTitle: "Café Sonne in Musterstadt",
      seoDescription: "Frisch gebrühter Kaffee in Musterstadt.",
    });
  });

  test("ohne About-Sektion fehlen aboutHeadline/aboutBody im Patch", () => {
    const noAbout: WebsiteDataV2 = {
      ...doc,
      sections: doc.sections.filter(s => s.type !== "about"),
    };
    const result = textsFromDoc(noAbout);
    expect(result.aboutHeadline).toBeUndefined();
    expect(result.aboutBody).toBeUndefined();
    expect(result.headline).toBe("Willkommen");
  });

  test("ohne Hero-Subheadline/CTA fehlen diese Felder im Patch", () => {
    const minimalHero: WebsiteDataV2 = {
      ...doc,
      sections: [{ type: "hero", headline: "Nur Headline" }],
    };
    const result = textsFromDoc(minimalHero);
    expect(result.subheadline).toBeUndefined();
    expect(result.ctaText).toBeUndefined();
    expect(result.headline).toBe("Nur Headline");
    expect(result.seoTitle).toBe("Café Sonne in Musterstadt");
  });
});

describe("TextsForm", () => {
  test("Zähler zeigt 12/70 für den SEO-Titel", () => {
    const html = renderToStaticMarkup(
      <TextsForm
        values={{ seoTitle: "123456789012" }}
        onChange={() => {}}
        onSuggest={() => {}}
        suggesting={null}
        variants={{}}
        onPickVariant={() => {}}
      />
    );
    expect(html).toContain("12/70");
  });

  test("zeigt KI-Vorschlag-Chips, wenn Varianten für ein Feld vorhanden sind", () => {
    const html = renderToStaticMarkup(
      <TextsForm
        values={{}}
        onChange={() => {}}
        onSuggest={() => {}}
        suggesting={null}
        variants={{ headline: ["Variante A", "Variante B", "Variante C"] }}
        onPickVariant={() => {}}
      />
    );
    expect(html).toContain("Variante A");
    expect(html).toContain("Variante B");
    expect(html).toContain("Variante C");
  });

  test("markiert gewählten Vorschlag und zeigt direkten Preview-Status", () => {
    const html = renderToStaticMarkup(
      <TextsForm
        values={{ headline: "Variante B" }}
        onChange={() => {}}
        onSuggest={() => {}}
        suggesting={null}
        variants={{ headline: ["Variante A", "Variante B", "Variante C"] }}
        onPickVariant={() => {}}
        applyingVariant="headline"
      />
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("in der Vorschau aktualisiert");
    expect(html).toContain('disabled=""');
  });

  test("zeigt keinen KI-Vorschlag-Button für CTA-Text und Über-uns-Überschrift", () => {
    const html = renderToStaticMarkup(
      <TextsForm
        values={{}}
        onChange={() => {}}
        onSuggest={() => {}}
        suggesting={null}
        variants={{}}
        onPickVariant={() => {}}
      />
    );
    const suggestButtonCount = (html.match(/KI-Vorschlag/g) ?? []).length;
    // headline, subheadline, aboutBody, seoTitle, seoDescription — nicht ctaText/aboutHeadline
    expect(suggestButtonCount).toBe(5);
  });
});

describe("validateTexts", () => {
  test("leere Pflichtfelder (headline/aboutHeadline/aboutBody/seoTitle/seoDescription) liefern je eine Meldung", () => {
    const messages = validateTexts({
      headline: "  ",
      aboutHeadline: "",
      aboutBody: "",
      seoTitle: "",
      seoDescription: "",
    });
    expect(messages).toEqual([
      "Überschrift darf nicht leer sein.",
      "Über-uns-Überschrift darf nicht leer sein.",
      "Über-uns-Text darf nicht leer sein.",
      "SEO-Titel darf nicht leer sein.",
      "SEO-Beschreibung darf nicht leer sein.",
    ]);
  });

  test("alle Pflichtfelder gefüllt → keine Meldungen", () => {
    expect(
      validateTexts({
        headline: "Willkommen",
        aboutHeadline: "Über uns",
        aboutBody: "Wir sind ein kleines Café.",
        seoTitle: "Café Sonne",
        seoDescription: "Frisch gebrühter Kaffee.",
      })
    ).toEqual([]);
  });

  test("nicht gesetzte (unberührte) Felder lösen keine Meldung aus — {} bleibt speicherbar", () => {
    expect(validateTexts({})).toEqual([]);
  });

  test("nicht-pflicht Felder (ctaText/subheadline) dürfen leer sein", () => {
    expect(
      validateTexts({
        headline: "Willkommen",
        subheadline: "",
        ctaText: "",
        aboutHeadline: "Über uns",
        aboutBody: "Text",
        seoTitle: "Titel",
        seoDescription: "Beschreibung",
      })
    ).toEqual([]);
  });
});
