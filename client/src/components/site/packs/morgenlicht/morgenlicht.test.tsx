import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

// Mittwoch, deckt sich mit dem Fixture-Öffnungszeitenbereich "Mo–Fr".
const WEDNESDAY = new Date("2026-08-19T10:00:00");
// Samstag — außerhalb von "Mo–Fr", kein "Heute geöffnet"-Treffer.
const SATURDAY = new Date("2026-08-22T10:00:00");

describe("Pack morgenlicht", () => {
  test("Verfassung registriert, Signatur enthält Blob + Schwebekarten", () => {
    const c = getConstitution("morgenlicht");
    expect(c.signature.decor).toContain("image-blob");
    expect(c.signature.decor).toContain("float-cards");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("morgenlicht", "full")} now={WEDNESDAY} />
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

  describe("Heute-geöffnet-Karte hängt vom übergebenen now ab", () => {
    test("Mittwoch (innerhalb Mo–Fr): Karte rendert mit Öffnungszeit", () => {
      const wedHtml = renderToStaticMarkup(
        <SiteRenderer
          data={getFixture("morgenlicht", "full")}
          now={WEDNESDAY}
        />
      );
      expect(wedHtml).toContain("Heute geöffnet");
      expect(wedHtml).toContain("8:00 – 18:00");
    });
    test("Samstag (außerhalb Mo–Fr): Karte rendert nicht", () => {
      const satHtml = renderToStaticMarkup(
        <SiteRenderer data={getFixture("morgenlicht", "full")} now={SATURDAY} />
      );
      expect(satHtml).not.toContain("Heute geöffnet");
    });
  });
});
