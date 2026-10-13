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

});
