import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

describe("Pack morgenlicht", () => {
  test("Verfassung registriert, Signatur enthält Blob + Schwebekarten", () => {
    const c = getConstitution("morgenlicht");
    expect(c.signature.decor).toContain("image-blob");
    expect(c.signature.decor).toContain("float-cards");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("morgenlicht", "full")} />
  );
  test("Signatur-Klassen (Blob, Floats, Welle) rendern", () => {
    expect(html).toContain("pb-ml-blob");
    expect(html).toContain("pb-ml-float");
    expect(html).toContain("pb-ml-wave");
  });
  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
});
