import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import { LandingNav } from "./LandingNav";

describe("LandingNav", () => {
  const html = renderToStaticMarkup(
    <Router ssrPath="/">
      <LandingNav billingYearly />
    </Router>
  );

  test("geschlossene Nav hat den Burger, kein Dialog-Portal", () => {
    expect(html).toContain("Menü öffnen");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="lp-mobile-menu"');
    expect(html).not.toContain('id="lp-mobile-menu"');
    expect(html).not.toContain("Menü schließen");
  });

  test("Anker der Mobile-Ziele existieren als Desktop-Links (gleiche hrefs)", () => {
    expect(html).toContain('href="#showcase"');
    expect(html).toContain('href="#ablauf"');
    expect(html).toContain('href="#pricing"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain('href="/login"');
  });

  test("Overlay-Markup im Source nutzt eigenes Gutter, nicht lp-container", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "LandingNav.tsx"),
      "utf8"
    );
    const overlay = src.slice(
      src.indexOf('id="lp-mobile-menu"'),
      src.indexOf("sticky top-0")
    );
    expect(overlay).toContain("lp-mobile-menu-gutter");
    expect(overlay).not.toContain("lp-container");
    expect(overlay).not.toContain("-mr-2");
  });
});
