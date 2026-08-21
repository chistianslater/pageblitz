import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

const NOW = new Date("2026-08-21T10:00:00");

describe("Pack salon-noir", () => {
  test("Verfassung registriert, theme dark, Signatur enthält Passepartout-Rahmen + Vertikal-Label", () => {
    const c = getConstitution("salon-noir");
    expect(c.theme).toBe("dark");
    expect(c.signature.decor).toContain("passepartout-frame");
    expect(c.signature.decor).toContain("vertical-label");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("salon-noir", "full")} now={NOW} />
  );

  test("Signatur-Klassen (Passepartout-Rahmen, Vertikal-Label) rendern", () => {
    expect(html).toContain("pb-sn-frame");
    expect(html).toContain("pb-sn-vert");
  });

  test("Preisliste rendert Kategorienamen und Preise aus der Fixture", () => {
    const fixture = getFixture("salon-noir", "full");
    const pricelistSection = fixture.sections.find(s => s.type === "pricelist");
    if (!pricelistSection || pricelistSection.type !== "pricelist") {
      throw new Error(
        "Fixture 'salon-noir' full braucht eine pricelist-Sektion"
      );
    }
    const htmlEntityEncoded = (s: string): string => s.replace(/&/g, "&amp;");
    for (const category of pricelistSection.categories) {
      expect(html).toContain(htmlEntityEncoded(category.name));
      for (const item of category.items) {
        expect(html).toContain(htmlEntityEncoded(item.name));
        expect(html).toContain(item.price);
      }
    }
  });

  test("genau eine h1, deutscher Anker kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("salon-noir", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} now={NOW} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
