import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KLARWERK_CSS } from "./css";

describe("Pack klarwerk", () => {
  test("Verfassung registriert, Signatur enthält Readout statt Bento", () => {
    const c = getConstitution("klarwerk");
    expect(c.signature.decor).toContain("instrument-readout");
    expect(c.signature.decor).toContain("copper-rule");
    expect(c.signature.decor).toContain("spec-sheet");
    expect(c.signature.decor).not.toContain("irregular-bento");
    expect(c.signature.decor).not.toContain("terminal-cell");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("klarwerk", "full")} />
  );

  test("genau eine h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  test("deutsche Anker leistungen + kontakt vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("Kennzahlen-Panel zeigt Fixture-Werte ohne Terminal-/Quellcode-Ästhetik", () => {
    expect(html).toContain("4,9");
    expect(html).toContain("Leistungen");
    expect(html).toContain("/demo/klarwerk-hero.webp");
    expect(html).not.toContain("leistungen --list");
    expect(html).not.toContain("google --rating");
    expect(html).not.toContain('class="dim">$');
    expect(html).not.toContain("pb-kw-cursor");
    expect(KLARWERK_CSS).not.toContain("#7EE787");
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("klarwerk", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

});
