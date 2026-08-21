import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack marktplatz", () => {
  test("Verfassung registriert, Signatur enthält Sticker + Kritzel-Unterstreichung", () => {
    const c = getConstitution("marktplatz");
    expect(c.signature.decor).toContain("stickers");
    expect(c.signature.decor).toContain("squiggle-underline");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("marktplatz", "full")} />
  );

  test("Signatur-Klassen (Karte, Sticker, Kritzel, Scallop) rendern", () => {
    expect(html).toContain("pb-mp-card");
    expect(html).toContain("pb-mp-sticker");
    expect(html).toContain("pb-mp-squiggle");
    expect(html).toContain("pb-mp-scallop");
  });

  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("marktplatz", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
