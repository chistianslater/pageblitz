import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack atelier", () => {
  test("Verfassung registriert, Signatur enthält Masthead + Rot-Index", () => {
    const c = getConstitution("atelier");
    expect(c.signature.decor).toContain("newspaper-masthead");
    expect(c.signature.decor).toContain("red-index");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("atelier", "full")} />
  );

  test("Signatur-Klassen (Masthead, Meta, Index) rendern", () => {
    expect(html).toContain("pb-at-masthead");
    expect(html).toContain("pb-at-meta");
    expect(html).toContain("pb-at-idx");
  });

  test("genau eine h1 — Masthead ist kein h1, die Hero-Headline ist die h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1Match).not.toBeNull();
    expect(h1Match?.[1]).toContain("Bilder, die bleiben.");
  });

  test("deutsche Anker leistungen + kontakt vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("atelier", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
