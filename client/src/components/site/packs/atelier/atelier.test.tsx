import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { getConstitution } from "../../../../../../shared/stylePacks";
import "../index";
import { SiteRenderer } from "../../SiteRenderer";
import { ATELIER_CSS } from "./css";

describe("Pack atelier", () => {
  test("Verfassung registriert, Signatur enthält Masthead + Rot-Index", () => {
    const c = getConstitution("atelier");
    expect(c.signature.decor).toContain("newspaper-masthead");
    expect(c.signature.decor).toContain("red-index");
  });

  const html = renderToStaticMarkup(
    <SiteRenderer data={getFixture("atelier", "full")} />
  );

  test("zeigt Hero, Porträt, Markenshooting und Kontaktabzüge als Fotostrecke", () => {
    for (const asset of [
      "atelier-hero.webp",
      "atelier-detail-1.webp",
      "atelier-detail-2.webp",
      "atelier-detail-3.webp",
    ]) {
      expect(html).toContain(asset);
    }
  });
  test("Seitenwechsel-Reveal und sticky Editorial Index bleiben pack-spezifisch", () => {
    expect(ATELIER_CSS).toContain("@keyframes pb-at-page-turn");
    expect(ATELIER_CSS).toContain("@keyframes pb-at-folio-in");
    expect(ATELIER_CSS).toContain("clip-path:inset(0 100% 0 0)");
    expect(ATELIER_CSS).toContain(
      ".pb-at-index-section .pb-at-section-head{position:sticky"
    );
  });

  test("MobileNav übernimmt am Tablet-Breakpoint und Hover ist pointer-spezifisch", () => {
    expect(ATELIER_CSS).toContain("@media(max-width:840px)");
    expect(ATELIER_CSS).toContain(".pb-at-nav-links{display:none}");
    expect(ATELIER_CSS).toContain("@media(hover:hover) and (pointer:fine)");
  });

  test("deutsche Anker leistungen + kontakt vorhanden", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain('id="kontakt"');
  });

  test("versteckte Sektion wird nicht gerendert", () => {
    const data = getFixture("atelier", "full");
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
