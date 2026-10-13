import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { MORGENLICHT_CSS } from "./css";

// Mittwoch, deckt sich mit dem Fixture-Öffnungszeitenbereich "Mo–Fr".
const WEDNESDAY = new Date("2026-08-19T10:00:00");
// Samstag — außerhalb von "Mo–Fr", kein "Heute geöffnet"-Treffer.
const SATURDAY = new Date("2026-08-22T10:00:00");

describe("Pack morgenlicht", () => {
  test("Verfassung registriert warme Wellness-Fotografie + Schwebekarten", () => {
    const c = getConstitution("morgenlicht");
    expect(c.signature.decor).toContain("wellness-photo");
    expect(c.signature.decor).toContain("serif-editorial");
    expect(c.signature.decor).toContain("float-cards");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("morgenlicht", "full")} now={WEDNESDAY} />
  );
  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

});
