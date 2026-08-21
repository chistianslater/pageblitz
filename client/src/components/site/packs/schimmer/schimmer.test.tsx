import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";

const NOW = new Date("2026-08-21T10:00:00");

describe("Pack schimmer", () => {
  test("Verfassung registriert, theme light, Signatur enthält Flat-Orbs + Glaskarte", () => {
    const c = getConstitution("schimmer");
    expect(c.theme).toBe("light");
    expect(c.signature.decor).toContain("flat-orbs");
    expect(c.signature.decor).toContain("glass-card");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("schimmer", "full")} now={NOW} />
  );

  test("Signatur-Klassen (Orbs, Glaskarte, Chip) rendern", () => {
    expect(html).toContain("pb-sc-orb");
    expect(html).toContain("pb-sc-glass");
    expect(html).toContain("pb-sc-chip");
  });

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("Glas-Chip nennt die erste Leistung aus der Fixture", () => {
    const fixture = getFixture("schimmer", "full");
    const services = fixture.sections.find(s => s.type === "services");
    if (!services || services.type !== "services") {
      throw new Error("Fixture 'schimmer' full braucht eine services-Sektion");
    }
    expect(html).toContain(services.items[0].title);
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("schimmer", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} now={NOW} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("minimal-Fixture rendert ohne Fehler mit genau einer h1", () => {
    const hMin = renderToStaticMarkup(
      <SiteRenderer data={getFixture("schimmer", "minimal")} now={NOW} />
    );
    expect(hMin.match(/<h1/g)).toHaveLength(1);
  });
});
