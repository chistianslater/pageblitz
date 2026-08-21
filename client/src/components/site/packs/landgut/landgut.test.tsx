import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack landgut", () => {
  test("Verfassung registriert, Signatur enthält Pflanzreihen-Bögen + Saison-Ticker", () => {
    const c = getConstitution("landgut");
    expect(c.signature.decor).toContain("plant-row-arches");
    expect(c.signature.decor).toContain("season-ticker");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("landgut", "full")} />
  );

  test("Signatur-Klassen (Pflanzreihen, Ticker) rendern", () => {
    expect(html).toContain("pb-lg-rows");
    expect(html).toContain("pb-lg-ticker");
  });

  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("landgut", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
