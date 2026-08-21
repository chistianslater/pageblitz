import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

const NOW = new Date("2026-08-21T10:00:00");

describe("Pack zunft", () => {
  test("Verfassung registriert, theme light, Signatur enthält Ornament-Bordüre + Kipp-Stempel", () => {
    const c = getConstitution("zunft");
    expect(c.theme).toBe("light");
    expect(c.signature.decor).toContain("ornament-border");
    expect(c.signature.decor).toContain("tilted-stamp");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("zunft", "full")} now={NOW} />
  );

  test("Signatur-Klassen (Bordüre, Stempel, Preistafel) rendern", () => {
    expect(html).toContain("pb-zf-borde");
    expect(html).toContain("pb-zf-stamp");
    expect(html).toContain("pb-zf-tafel");
  });

  test("Preistafel-Sektion rendert Kategorienamen und Preise aus der Fixture", () => {
    const fixture = getFixture("zunft", "full");
    const priceSection = fixture.sections.find(s => s.type === "pricelist");
    if (!priceSection || priceSection.type !== "pricelist") {
      throw new Error("Fixture 'zunft' full braucht eine pricelist-Sektion");
    }
    const htmlEntityEncoded = (s: string): string => s.replace(/&/g, "&amp;");
    for (const category of priceSection.categories) {
      expect(html).toContain(htmlEntityEncoded(category.name));
      for (const item of category.items) {
        expect(html).toContain(htmlEntityEncoded(item.name));
        expect(html).toContain(item.price);
      }
    }
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("ohne erkennbares Jahr in footerNote wird kein Stempel gerendert", () => {
    const data = getFixture("zunft", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer
        data={{ ...data, footerNote: "Bäckerei Steinofen · Augsburg" }}
        now={NOW}
      />
    );
    expect(h).not.toContain('<span class="pb-zf-stamp"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("zunft", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} now={NOW} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("minimal-Fixture rendert ohne Fehler mit genau einer h1", () => {
    const hMin = renderToStaticMarkup(
      <SiteRenderer data={getFixture("zunft", "minimal")} now={NOW} />
    );
    expect(hMin.match(/<h1/g)).toHaveLength(1);
  });
});
