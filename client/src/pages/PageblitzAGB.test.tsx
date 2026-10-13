import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import PageblitzAGB from "./PageblitzAGB";
import { AGB_SECTIONS, AGB_STAND, AGB_VERSION } from "@shared/agb";

describe("PageblitzAGB (/agb)", () => {
  // wouter braucht ohne Browser einen festen Pfad (SSR).
  const html = renderToStaticMarkup(
    <Router ssrPath="/agb">
      <PageblitzAGB />
    </Router>
  );

  test("zeigt Titel, Fassung und Stand", () => {
    expect(html).toContain("Allgemeine Geschäftsbedingungen");
    expect(html).toContain(`Fassung ${AGB_VERSION}`);
    expect(html).toContain(`Stand: ${AGB_STAND}`);
  });

  test("rendert jeden Paragraphen mit Nummer und Anker", () => {
    AGB_SECTIONS.forEach((section, i) => {
      expect(html).toContain(`id="${section.id}"`);
      expect(html).toContain(`§ ${i + 1} ${section.title}`);
    });
  });

  test("Fuß verlinkt Impressum und Datenschutz", () => {
    expect(html).toContain('href="/impressum"');
    expect(html).toContain('href="/datenschutz"');
  });
});
