import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { PATINA_CSS } from "./css";

describe("Pack patina", () => {
  test("Verfassung registriert, Signatur enthält Initial-Wasserzeichen + Bogen-Bilder", () => {
    const c = getConstitution("patina");
    expect(c.signature.decor).toContain("initial-watermark");
    expect(c.signature.decor).toContain("arch-images");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("patina", "full")} />
  );

  test("Signatur-Klassen (Initial, Bogen, Randnotiz) rendern", () => {
    expect(html).toContain("pb-pa-init");
    expect(html).toContain("pb-pa-arch");
    expect(html).toContain("pb-pa-note");
  });

  test("genau eine h1, deutsche Anker leistungen + kontakt", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("patina", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });

  test("Papierseiten-Reveal und Sticky-Kapitelmarke sind responsiv", () => {
    expect(html).toContain('class="pb-pa-chapters"');
    expect(PATINA_CSS).toContain("@keyframes pb-pa-page-turn");
    expect(PATINA_CSS).toContain("scroll-margin-top");
    expect(PATINA_CSS).toContain("@media(max-width:840px)");
    expect(PATINA_CSS).toContain("prefers-reduced-motion:reduce");
    expect(PATINA_CSS).toContain("(pointer:fine)");
    expect(PATINA_CSS).not.toContain("infinite");
  });
});
