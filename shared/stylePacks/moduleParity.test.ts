import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { STYLE_PACKS } from "./index";
import { getFixture } from "../siteContract/fixtures";
import { PACK_MODULES } from "../../client/src/components/site/packRegistry";
import { SiteRenderer } from "../../client/src/components/site/SiteRenderer";
import type { PageSectionOf } from "../siteContract/types";
// Import-Nebenwirkung: registriert alle Pack-Module in PACK_MODULES.
import "../../client/src/components/site/packs/index";

/**
 * Registry-Invarianten-Test: für jede in STYLE_PACKS registrierte Pack-ID
 * müssen ein Client-Modul (PACK_MODULES) und eine Fixture existieren.
 * Ohne diesen Test bricht "Plan-B-Drift" — eine Verfassung ohne Modul
 * und/oder Fixture — erst zur Laufzeit (SiteRenderer/getFixture werfen),
 * nicht schon in CI.
 */
describe("Style-Pack-Registrierung — Modul- und Fixture-Parität", () => {
  const registeredPackIds = Object.keys(STYLE_PACKS);

  test("STYLE_PACKS ist nicht leer (Test wäre sonst trivial grün)", () => {
    expect(registeredPackIds.length).toBeGreaterThan(0);
  });

  for (const packId of registeredPackIds) {
    test(`${packId}: Client-Modul ist in PACK_MODULES registriert`, () => {
      expect(PACK_MODULES[packId as keyof typeof PACK_MODULES]).toBeDefined();
    });

    test(`${packId}: Fixtures (full + minimal) existieren`, () => {
      expect(() =>
        getFixture(packId as Parameters<typeof getFixture>[0], "full")
      ).not.toThrow();
      expect(() =>
        getFixture(packId as Parameters<typeof getFixture>[0], "minimal")
      ).not.toThrow();
    });
  }
});

/**
 * Plan B6, Task 4: jedes Pack-Modul muss `case "pageHeader"` selbst
 * behandeln (Titel + Intro, kein CTA) und `navItems` (inkl. `aria-current`
 * auf dem aktiven Seiten-Link) rendern statt der alten pack-internen
 * Anker-Liste. Rendert dazu die "full"-Fixture jedes Packs auf ihrer echten
 * Demo-Unterseite (`pages[0]`, seit Task 2 identisch für alle 14 Packs, siehe
 * `DEMO_PAGES` in shared/siteContract/fixtures.ts) über den echten
 * `SiteRenderer` — kein Pack-Modul wird isoliert aufgerufen, damit der Test
 * dieselbe Renderkette wie SSR/CSR durchläuft.
 *
 * Ohne diesen Test bräche ein Pack, das die Umstellung auf `navItems`/
 * `case "pageHeader"` vergisst oder falsch macht, erst optisch in den
 * Playwright-Baselines auf — hier bricht es schon in vitest, mit einer
 * Fehlermeldung je Pack statt einem Pixel-Diff.
 */
describe("Style-Pack-Registrierung — pageHeader + navItems auf Unterseiten (Plan B6, Task 4)", () => {
  const registeredPackIds = Object.keys(STYLE_PACKS);

  for (const packId of registeredPackIds) {
    const data = getFixture(packId as Parameters<typeof getFixture>[0], "full");
    const page = data.pages?.[0];

    test(`${packId}: Fixture "full" hat eine Demo-Unterseite (Testvoraussetzung)`, () => {
      expect(page).toBeDefined();
    });

    if (!page) continue;

    const headerSection = page.sections.find(
      (s): s is PageSectionOf<"pageHeader"> => s.type === "pageHeader"
    );

    test(`${packId}: rendert die pageHeader-Sektion selbst (Klasse pb-<pack>-page-header, genau ein <h1>)`, () => {
      expect(headerSection).toBeDefined();
      const html = renderToStaticMarkup(
        React.createElement(SiteRenderer, {
          data,
          pathname: `/${page.slug}`,
        })
      );
      // Klassenname pack-spezifisch (z. B. pb-wb-page-header,
      // pb-salon-noir-page-header wäre falsch — Präfix ist die Kurzform,
      // nicht die Pack-ID — deshalb hier bewusst NICHT auf `pb-${packId}-`
      // geprüft, sondern generisch auf das Namensmuster).
      expect(html).toMatch(/<header class="pb-[a-z0-9-]+-page-header">/);
      // Kein SiteRenderer-Fallback mehr (Task 4 hat ihn entfernt) — sonst
      // zwei <h1> (a11y-Regression).
      expect(html).not.toContain("pb-page-header-fallback");
      expect(html.match(/<h1[^>]*>/g)?.length).toBe(1);
      if (headerSection) {
        expect(html).toContain(headerSection.title);
        if (headerSection.intro) {
          expect(html).toContain(headerSection.intro);
        }
      }
    });

    test(`${packId}: navItems zeigen aria-current="page" auf der aktiven Unterseite`, () => {
      const html = renderToStaticMarkup(
        React.createElement(SiteRenderer, {
          data,
          pathname: `/${page.slug}`,
        })
      );
      expect(html).toMatch(
        new RegExp(`<a\\s[^>]*href="/${page.slug}"[^>]*\\saria-current="page"`)
      );
    });

    test(`${packId}: navItems ohne aria-current auf der Startseite (kein Fehlalarm)`, () => {
      const html = renderToStaticMarkup(
        React.createElement(SiteRenderer, { data })
      );
      // "not.toContain('aria-current=\"page\"')" wäre hier ein Fehlalarm:
      // die Pack-CSS enthält den Selektor `a[aria-current="page"]` als
      // reinen Text im <style>-Block, unabhängig davon, ob ein Link ihn
      // tatsächlich trägt — deshalb Regex auf ein echtes <a ...>-Element.
      expect(html).not.toMatch(/<a\s[^>]*\saria-current="page"/);
      expect(html).toContain(`href="/${page.slug}"`);
    });
  }
});

/**
 * Review-Fund Task 4: `buildNavItems` liefert generische Anker-Labels
 * („Bewertungen", „Leistungen", „Galerie", „Preise"); jedes Pack hat aber
 * eigene Wortwahl und ersetzt sie über `applyNavLabels` — die Startseiten-
 * Navigation muss exakt so bleiben wie vor Plan B6. Stichproben mit Labels,
 * die sich vom generischen Default unterscheiden.
 */
describe("Pack-eigene Nav-Labels bleiben erhalten (applyNavLabels)", () => {
  const samples: Array<[Parameters<typeof getFixture>[0], string, string]> = [
    ["kanzlei", "Mandantenstimmen", "Bewertungen"],
    ["landgut", "Sortiment", "Leistungen"],
    ["gusto", "Impressionen", "Galerie"],
  ];
  for (const [packId, ownLabel, genericLabel] of samples) {
    test(`${packId}: Nav zeigt „${ownLabel}" statt generisch „${genericLabel}"`, () => {
      const data = getFixture(packId, "full");
      const html = renderToStaticMarkup(
        React.createElement(SiteRenderer, { data, pathname: "/" })
      );
      const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? "";
      expect(nav).toContain(`>${ownLabel}<`);
      expect(nav).not.toContain(`>${genericLabel}<`);
    });
  }
});
