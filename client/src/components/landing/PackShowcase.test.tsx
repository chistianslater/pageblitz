import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PACK_IDS } from "@shared/siteContract/types";
import { getConstitution } from "@shared/stylePacks";
import { PackShowcase } from "./PackShowcase";

describe("PackShowcase", () => {
  const html = renderToStaticMarkup(<PackShowcase isDark={true} />);

  test("rendert genau 14 Karten (eine je Style Pack), als <article> mit aria-label", () => {
    const articleCount = (html.match(/<article/g) ?? []).length;
    expect(articleCount).toBe(PACK_IDS.length);
    expect(articleCount).toBe(14);
  });

  test("jede Karte verlinkt/lädt die öffentliche Demo-Route /demo/<pack> und zeigt Name + Essenz", () => {
    for (const packId of PACK_IDS) {
      const constitution = getConstitution(packId);
      expect(html).toContain(`/demo/${packId}`);
      expect(html).toContain(constitution.name);
      expect(html).toContain(constitution.essence);
    }
  });

  test("iframes sind lazy, nicht fokussierbar und klickunempfindlich (dekorative Vorschau)", () => {
    expect(html).toContain('loading="lazy"');
    expect(html).toMatch(/<iframe[^>]*tabindex="-1"/);
    expect(html).toContain("pointer-events-none");
  });

  test("kein interaktives <iframe> innerhalb des <a>-Links (gültiges HTML, iframe liegt dekorativ daneben)", () => {
    expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<iframe/);
  });

  test("'Ansehen'-Link öffnet in neuem Tab mit sicherem rel-Attribut", () => {
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  test("Heading-Hierarchie: genau ein <h2> (Sektionsüberschrift), Kicker ist kein Heading, Karten nutzen <h3> (kein Sprung h2→h4)", () => {
    const h2Count = (html.match(/<h2[ >]/g) ?? []).length;
    const h3Count = (html.match(/<h3[ >]/g) ?? []).length;
    const h4Count = (html.match(/<h4[ >]/g) ?? []).length;
    expect(h2Count).toBe(1);
    expect(html).toContain(">Ein Look für jedes Handwerk.<");
    expect(h3Count).toBe(14);
    expect(h4Count).toBe(0);
    // Kicker "14 Stilwelten" ist bewusst kein Heading (Label, nicht Struktur).
    expect(html).not.toMatch(/<h[1-6][^>]*>14 Stilwelten</);
  });
});
