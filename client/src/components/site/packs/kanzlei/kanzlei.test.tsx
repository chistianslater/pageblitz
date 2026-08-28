import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KANZLEI_CSS } from "./css";

describe("Pack kanzlei", () => {
  test("Verfassung registriert, Signatur enthält Raster + Mono-Index", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).toContain("column-grid");
    expect(c.signature.decor).toContain("mono-index");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("kanzlei", "full")} />
  );
  test("eine h1, deutsche Anker, Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("pb-kz-grid");
    expect(html).toContain("pb-kz-idx");
  });
  test("Kennzahlen-Leiste rendert", () => {
    expect(html).toContain("pb-kz-facts");
  });
  test("Raster-Motion, Sticky-Index und responsive Motion-Fallbacks", () => {
    expect(html).toContain('class="pb-kz-section-index"');
    expect(KANZLEI_CSS).toContain("@keyframes pb-kz-grid-build");
    expect(KANZLEI_CSS).toContain("position:sticky");
    expect(KANZLEI_CSS).toContain("scroll-margin-top");
    expect(KANZLEI_CSS).toContain("@media(max-width:840px)");
    expect(KANZLEI_CSS).toContain("prefers-reduced-motion:reduce");
    expect(KANZLEI_CSS).toContain("(pointer:fine)");
    expect(KANZLEI_CSS).not.toContain("infinite");
  });

  test("Chrome ist beratungstauglich, nicht nur Anwaltskanzlei", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).toContain("frame-watermark");
    expect(c.signature.decor).not.toContain("paragraph-watermark");
    expect(html).toContain("pb-kz-watermark");
    expect(html).not.toContain("§");
    expect(html).toContain("Kundenstimmen");
    expect(html).not.toContain("Mandantenstimmen");
    expect(html).toContain("Übersicht");
    expect(html).not.toContain("Fachgebiete");
    expect(html).not.toContain("Mandant");
    expect(html).not.toContain("Klage");
  });
});
