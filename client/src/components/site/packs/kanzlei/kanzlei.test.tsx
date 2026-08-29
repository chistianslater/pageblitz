import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { KANZLEI_CSS } from "./css";

describe("Pack kanzlei", () => {
  test("Verfassung registriert, Signatur enthält Dossier + Folio", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).toContain("dossier-split");
    expect(c.signature.decor).toContain("folio-stamp");
    expect(c.signature.decor).toContain("leather-rule");
    expect(c.signature.decor).not.toContain("column-grid");
  });
  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("kanzlei", "full")} />
  );
  test("eine h1, deutsche Anker, Signatur-Klassen", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("pb-kz-split");
    expect(html).toContain("pb-kz-photo");
    expect(html).toContain("pb-kz-idx");
    expect(html).not.toContain("pb-kz-grid");
  });
  test("Kennzahlen-Leiste rendert", () => {
    expect(html).toContain("pb-kz-facts");
  });
  test("Hero-Foto und Dossier-Motion, responsive Motion-Fallbacks", () => {
    expect(html).toContain("/demo/kanzlei-hero.webp");
    expect(html).not.toContain('class="pb-kz-section-index"');
    expect(html).not.toContain("pb-kz-watermark");
    expect(KANZLEI_CSS).toContain("@keyframes pb-kz-dossier-in");
    expect(KANZLEI_CSS).toContain("@keyframes pb-kz-folio");
    expect(KANZLEI_CSS).toContain("position:sticky");
    expect(KANZLEI_CSS).toContain("scroll-margin-top");
    expect(KANZLEI_CSS).toContain("@media(max-width:840px)");
    expect(KANZLEI_CSS).toContain("prefers-reduced-motion:reduce");
    expect(KANZLEI_CSS).toContain("(pointer:fine)");
    expect(KANZLEI_CSS).not.toContain("infinite");
  });

  test("Chrome ist beratungstauglich, nicht nur Anwaltskanzlei", () => {
    const c = getConstitution("kanzlei");
    expect(c.signature.decor).not.toContain("paragraph-watermark");
    expect(c.signature.decor).not.toContain("frame-watermark");
    expect(html).not.toContain("§");
    expect(html).toContain("Kundenstimmen");
    expect(html).not.toContain("Mandantenstimmen");
    expect(html).not.toContain("Fachgebiete");
    expect(html).not.toContain("Mandant");
    expect(html).not.toContain("Klage");
  });
});
