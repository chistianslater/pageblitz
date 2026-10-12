import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteRenderer } from "../../SiteRenderer";
import { RASTER_CSS, step } from "./css";
import { rasterChapterNo } from "./sections";
import { RASTER_MENU_JS } from "./Chrome";
import { JOURNAL_MENU_JS } from "../journal/Chrome";
import { SYSTEM_MODULES } from "../registry";
import { orderedSections } from "../../engine";
import { systemShows } from "../shared";
import {
  rasterDoc,
  rasterFixture,
  render,
  sectionHtml,
  TEST_NOW,
} from "./testkit";

const styleOf = (html: string) => html.match(/<style>([\s\S]*?)<\/style>/)![1];

describe("Raster: Grundgerüst", () => {
  test("registriert und rendert mit System-Attributen und System-Variablen", () => {
    expect(SYSTEM_MODULES.raster?.id).toBe("raster");
    for (const [palette, paper] of [
      ["papier", "#f1f0ec"],
      ["werk", "#f7f7f6"],
      ["kohle", "#141414"],
    ]) {
      const html = render(rasterDoc(palette));
      expect(html).toContain('data-pb-system="raster"');
      expect(html).toContain(`data-pb-palette="${palette}"`);
      expect(html).toContain('class="pb-site pb-raster"');
      expect(html).toContain(`--sys-paper:${paper}`);
      expect(html).toContain("--sys-signal:");
      expect(html).toContain("--sys-figure-size:");
    }
  });

  test("@font-face genau einmal, Geist selbst gehostet", () => {
    const css = styleOf(render());
    expect(css.match(/@font-face/g)).toHaveLength(1);
    expect(css).toContain("/fonts/systems/geist-latin-wght.woff2");
    expect(css).toContain("font-weight:100 900");
  });

  test("kein Pack- oder rev-2-CSS, keine Pack-Layout-Attribute", () => {
    const doc = rasterDoc();
    const html = render(doc);
    expect(html).not.toContain(`pb-${doc.stylePackId}`);
    expect(html).not.toContain("pb-art-hero");
    expect(html).not.toContain("pb-entry-");
    expect(html).not.toMatch(
      /data-pb-(hero|services|about|gallery|deco|density|image|he)=/
    );
  });

  test("packOverride wirkt bei rev 3 nicht", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer data={rasterDoc()} packOverride="werkbank" now={TEST_NOW} />
    );
    expect(html).toContain('data-pb-system="raster"');
    expect(html).not.toContain("pb-werkbank");
  });

  test("Modul-CSS nutzt nur System-Variablen, keine Pack-Variablen", () => {
    const part = RASTER_CSS.slice(
      RASTER_CSS.indexOf(".pb-raster"),
      RASTER_CSS.indexOf("/* ende raster */")
    );
    expect(part.length).toBeGreaterThan(100);
    expect(part).not.toMatch(/var\(--pb-/);
    expect(part).not.toMatch(/var\(--jr-/);
    // Keine festen Pixelmaße außer Haarlinien und Fokusring.
    expect(part.match(/\b(?!1px|2px)\d+px\b/g) ?? []).toEqual([]);
  });

  test("step() nutzt figure aus den Raster-Tokens", () => {
    expect(step("figure")).toContain("font-size:var(--sys-figure-size)");
    expect(step("mark")).toContain("text-transform:var(--sys-mark-transform)");
  });

  test("Legacy-Aliase für Inseln in Palette Kohle: dunkle Fläche, dunkle Schrift auf Gelb", () => {
    const html = render(rasterDoc("kohle"));
    expect(html).toContain("--pb-canvas:#141414");
    expect(html).toContain(
      "--pb-surface:color-mix(in srgb, #141414 92%, #f3f3f0)"
    );
    expect(html).toContain("--pb-accent-contrast:#141414");
  });
});

describe("Raster: Kopf", () => {
  test("Wortmarke links (ohne Rechtsform), Menü als <summary>, Desktop-Navigation mit Knopf", () => {
    const html = render();
    const head = html.slice(
      html.indexOf('class="rs-head'),
      html.indexOf("</header>")
    );
    expect(head).toMatch(
      /<a class="rs-brand" href="#start">Kfz-Service Brandt<\/a>/
    );
    expect(head).toContain('<summary class="rs-menu-toggle">Menü</summary>');
    expect(head).toContain('<nav class="rs-menu-panel" aria-label="Menü">');
    expect(head).toContain('<nav class="rs-nav" aria-label="Hauptnavigation">');
    expect(head).toMatch(/<a class="rs-btn" href="[^"]+">[^<]+<\/a>/);
    expect(head).toContain('href="#leistungen"');
    // Reihenfolge: Marke, Navigation, Menü (Menü rechts).
    expect(head.indexOf("rs-brand")).toBeLessThan(head.indexOf("rs-menu"));
  });

  test("Menü-Script wie Journal, nur mit Raster-Klassen", () => {
    expect(RASTER_MENU_JS).toBe(JOURNAL_MENU_JS.replace(/\.jr-/g, ".rs-"));
  });
});

describe("Raster: Kapitel-Raster", () => {
  test("Kapitel nummerieren lückenlos ab 01 über sichtbare Abschnitte", () => {
    const doc = rasterDoc();
    const list = orderedSections(doc).filter(systemShows);
    const numbered = list.filter(s => rasterChapterNo(list, s.type) > 0);
    expect(numbered.map(s => rasterChapterNo(list, s.type))).toEqual(
      numbered.map((_, i) => i + 1)
    );
    const html = render(doc);
    const first = numbered[0];
    const anchor = html.search(
      new RegExp(`class="rs-sec rs-${first.type}[" ]`)
    );
    expect(anchor).toBeGreaterThan(-1);
    expect(html.slice(anchor, anchor + 600)).toContain(
      '<span class="rs-no" aria-hidden="true">01</span>'
    );
  });

  test("Kapitel im 12er-Raster: Label links, Inhalt rechts, eine h2 je Kapitel", () => {
    const html = render();
    const services = sectionHtml(html, "services");
    expect(services).toContain('id="leistungen"');
    expect(services).toContain('class="rs-wrap rs-g12"');
    expect(services).toMatch(/class="rs-lab"/);
    expect(services).toMatch(/class="rs-body/);
    expect(services.match(/<h2[\s>]/g)).toHaveLength(1);
    expect(services).toContain('aria-labelledby="leistungen-titel"');
    expect(services).toContain('id="leistungen-titel"');
  });

  test("Startseite: genau ein h1 (Name ohne Rechtsform), alle Abschnittstypen rendern", () => {
    for (const kind of ["full", "minimal", "features"] as const) {
      const html = render(rasterFixture(kind));
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    }
    const html = render(rasterDoc());
    expect(html).toMatch(/<h1 id="start-titel"[^>]*>Kfz-Service Brandt<\/h1>/);
  });

  test("hiddenSections greifen", () => {
    const doc = rasterDoc();
    const html = render({ ...doc, hiddenSections: ["services"] });
    expect(html).not.toContain('class="rs-sec rs-services"');
  });
});

describe("Raster: Fuß", () => {
  test("dunkles Band mit Aufforderung, Spalten, Rechtslinks mit basePath, Jahr", () => {
    const html = render(rasterDoc(), false, "/site/brandt");
    const foot = html.slice(html.indexOf('class="rs-foot"'));
    expect(foot).toMatch(
      /<p class="rs-foot-call" data-sys-actions=""><a href="[^"]+">[^<]+<\/a><\/p>/
    );
    expect(foot).toContain('<p class="rs-foot-h">Leistungen</p>');
    expect(foot).toContain('<p class="rs-foot-h">Kontakt</p>');
    expect(foot).toContain('<p class="rs-foot-h">Rechtliches</p>');
    expect(foot).toContain('href="/site/brandt/impressum"');
    expect(foot).toContain('href="/site/brandt/datenschutz"');
    expect(foot).toContain("© 2026");
    expect(RASTER_CSS).toMatch(
      /\.rs-foot\{background:var\(--sys-deep\);color:var\(--sys-on-deep\)/
    );
  });

  test("ausgeblendete Leistungen und Aufruf erscheinen nicht im Fuß", () => {
    const doc = rasterDoc();
    const withCta = {
      ...doc,
      sections: [
        ...doc.sections,
        {
          type: "cta" as const,
          headline: "Versteckter Aufruf",
          ctaText: "Los",
        },
      ],
    };
    const shown = render(withCta);
    expect(shown.slice(shown.indexOf('class="rs-foot"'))).toContain(
      "Versteckter Aufruf"
    );
    const html = render({ ...withCta, hiddenSections: ["services", "cta"] });
    const foot = html.slice(html.indexOf('class="rs-foot"'));
    expect(foot).not.toContain('<p class="rs-foot-h">Leistungen</p>');
    expect(foot).not.toContain("#leistungen");
    expect(foot).not.toContain("Versteckter Aufruf");
    expect(foot).toMatch(
      /<p class="rs-foot-call" data-sys-actions=""><a href="[^"]+">[^<]+<\/a><\/p>/
    );
  });

  test("ohne echte Zeiten keine Zeiten-Spalte", () => {
    const doc = rasterDoc();
    const html = render({
      ...doc,
      sections: doc.sections.map(s =>
        s.type === "contact" ? { ...s, openingHours: undefined } : s
      ),
    });
    expect(html).not.toContain('<p class="rs-foot-h">Zeiten</p>');
  });

  test("Fuß fasst gleiche Folgetage zusammen und lässt Platz für die Leiste im Fuß", () => {
    const html = render(rasterDoc("papier"));
    const foot = html.slice(html.indexOf(`<footer class="rs-foot"`));
    expect(foot).toContain(
      'Montag–Freitag <span class="rs-nowrap">7–17 Uhr</span>'
    );
    expect(foot).not.toContain("Dienstag");
    expect(RASTER_CSS).toMatch(
      /\.pb-raster:has\(\.rs-dock\) \.rs-foot\{padding-bottom:calc\([^}]*var\(--rs-dock\)/
    );
    expect(RASTER_CSS).toMatch(
      /\.rs-foot-call a::before\{[^}]*var\(--rs-tap\)/
    );
  });
});
