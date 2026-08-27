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

  test("Signatur-Klassen (Masthead, Meta, Index) rendern", () => {
    expect(html).toContain("pb-at-masthead");
    expect(html).toContain("pb-at-meta");
    expect(html).toContain("pb-at-idx");
    expect(html).toContain("Living Editorial Index");
  });
  test("Living-Editorial-DOM enthält Projektindex, Spread und nummerierte Bildstrecke", () => {
    expect(html).toContain("pb-at-project-index");
    expect(html).toContain("Index / Projekte &amp; Leistungen");
    expect(html).toContain("pb-at-about-copy");
    expect(html).toContain("pb-at-gallery-image");
    expect(html).toMatch(/<figcaption><b>01<\/b><span>/);
  });
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
  test("Stimmen und Kontakt rendern als redaktionelle Seiten", () => {
    expect(html).toContain("pb-at-voice-pages");
    expect(html).toContain("pb-at-folio");
    expect(html).toContain("pb-at-contact-page");
    expect(html).toContain("Impressum / Gespräch");
  });
  test("mobile Galerie bleibt vertikale Story und Motion ist reduziert", () => {
    expect(html).toContain(".pb-at-gallery{display:flex;flex-direction:column");
    expect(html).not.toContain(".pb-at-meta span:last-child{display:none}");
    expect(html).toContain("@media(prefers-reduced-motion:reduce)");
    expect(html).toContain(".pb-at-gallery figure:hover img");
    expect(ATELIER_CSS).toContain("animation:none!important");
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

  test("genau eine h1 — Masthead ist kein h1, die Hero-Headline ist die h1", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1Match).not.toBeNull();
    expect(h1Match?.[1]).toContain("Bilder, die bleiben.");
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
