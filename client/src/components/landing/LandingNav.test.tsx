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
});
