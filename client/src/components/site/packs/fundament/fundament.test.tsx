import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { FUNDAMENT_CSS } from "./css";

describe("Pack fundament", () => {
  test("Verfassung registriert, Signatur enthält Katasterraster + Grenz-Overlap", () => {
    const c = getConstitution("fundament");
    expect(c.signature.decor).toContain("cadastral-grid");
    expect(c.signature.decor).toContain("boundary-crossing");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("fundament", "full")} />
  );
  test("eine h1, Panel-/Foto-/Stats-Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("pb-fd-panel");
    expect(html).toContain("pb-fd-photo");
    expect(html).toContain("pb-fd-stats");
  });
  test("deutsche Anker vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });
  test("Grundriss-Motion, sticky Kontakt und Clipping-Vertrag für 768/390", () => {
    expect(html).toContain("pb-fd-contact-sticky");
    expect(FUNDAMENT_CSS).toContain("@keyframes pb-fd-plan");
    expect(FUNDAMENT_CSS).toContain("@media(prefers-reduced-motion:reduce)");
    expect(FUNDAMENT_CSS).toContain("@media(pointer:fine)");
    expect(FUNDAMENT_CSS).toContain("@media(max-width:840px)");
    expect(FUNDAMENT_CSS).toContain("@media(max-width:390px)");
    expect(FUNDAMENT_CSS).toContain("width:calc(100% - 64px)");
    expect(FUNDAMENT_CSS).toContain("box-sizing:border-box");
  });
  test("minimal-Fixture rendert ohne Wurf", () => {
    expect(() =>
      renderToStaticMarkup(
        <SiteRenderer data={getFixture("fundament", "minimal")} />
      )
    ).not.toThrow();
  });
});
