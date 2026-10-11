import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteRenderer } from "../../SiteRenderer";
import { WERKSTOFF_CSS, step } from "./css";
import { SYSTEM_MODULES } from "../registry";
import { SYSTEMS_WITH_MOTION } from "../../../../../../shared/designSystems/registry";
import { brandParts } from "./facts";
import {
  render,
  sectionHtml,
  TEST_NOW,
  werkstoffDoc,
  werkstoffFixture,
} from "./testkit";

const styleOf = (html: string) => html.match(/<style>([\s\S]*?)<\/style>/)![1];
const body = WERKSTOFF_CSS.slice(
  WERKSTOFF_CSS.indexOf(".pb-werkstoff"),
  WERKSTOFF_CSS.indexOf("/* ende werkstoff */")
);

/** Alle Regeln als [Selektor, Deklarationen] (Media-Blöcke aufgelöst). */
function rules(css: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push([m[1].trim(), m[2]]);
  return out;
}

describe("Werkstoff: Grundgerüst", () => {
  test("registriert und rendert mit System-Attributen und Variablen (3 Paletten)", () => {
    expect(SYSTEM_MODULES.werkstoff?.id).toBe("werkstoff");
    for (const [palette, paper] of [
      ["kiefer", "#f1e6cf"],
      ["leinen", "#ebe8df"],
      ["ton", "#f4e3d3"],
    ]) {
      const html = render(werkstoffDoc(palette));
      expect(html).toContain('data-pb-system="werkstoff"');
      expect(html).toContain(`data-pb-palette="${palette}"`);
      expect(html).toContain('class="pb-site pb-werkstoff"');
      expect(html).toContain(`--sys-paper:${paper}`);
      expect(html).toContain("--sys-font-mono:");
      expect(html).toContain("--sys-data-size:");
      expect(html).toContain("--sys-image-filter:");
    }
  });

  test("Bewegung vorerst aus (W7)", () => {
    expect(SYSTEMS_WITH_MOTION).not.toContain("werkstoff");
  });

  test("@font-face je Datei genau einmal: Zilla, Karla, DM Mono", () => {
    const css = styleOf(render());
    expect(css.match(/@font-face/g)).toHaveLength(3);
    expect(css).toContain("/fonts/systems/zilla-slab-latin-700.woff2");
    expect(css).toContain("/fonts/systems/karla-latin-wght.woff2");
    expect(css).toContain("/fonts/systems/dm-mono-latin-500.woff2");
  });

  test("kein Pack- oder rev-2-CSS, packOverride wirkt nicht", () => {
    const doc = werkstoffDoc();
    const html = render(doc);
    expect(html).not.toContain(`pb-${doc.stylePackId}`);
    expect(html).not.toContain("pb-art-hero");
    const over = renderToStaticMarkup(
      <SiteRenderer data={doc} packOverride="raster" now={TEST_NOW} />
    );
    expect(over).toContain('data-pb-system="werkstoff"');
  });

  test("Modul-CSS nur mit System-Variablen, keine freien Pixelmaße", () => {
    expect(body.length).toBeGreaterThan(100);
    expect(body).not.toMatch(/var\(--pb-/);
    expect(body).not.toMatch(/var\(--(jr|rs)-/);
    expect(body.match(/\b(?!1px|2px)\d+px\b/g) ?? []).toEqual([]);
    // Keine festen Farben außer der Aufhellung des Papiers (Zettel, Karte).
    expect(body.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
  });

  test("step() kennt data (Mono) und figure", () => {
    expect(step("data")).toContain("font-family:var(--sys-font-mono)");
    expect(step("data")).toContain("text-transform:var(--sys-data-transform)");
    expect(step("figure")).toContain("font-size:var(--sys-figure-size)");
  });

  test("Hell bleiben: deep als Fläche nur im Fuß, in der Leiste und an der Zettel-Leiste", () => {
    const allowed = /ws-foot|ws-dock|ws-slip-bar|pb-photo-credits/;
    const deepBackgrounds = rules(body).filter(([, decl]) =>
      /background(-color)?:[^;]*var\(--sys-deep\)/.test(decl)
    );
    expect(deepBackgrounds.length).toBeGreaterThan(0);
    for (const [selector] of deepBackgrounds)
      expect(selector, selector).toMatch(allowed);
    // Kein Abschnitt (ws-sec, Einstieg) bekommt eine dunkle Fläche.
    expect(body).not.toMatch(/\.ws-(sec|entry)[^{]*\{[^}]*background:var\(--sys-deep\)/);
  });
});

describe("Werkstoff: Kopf", () => {
  test("Name in Slab, Gewerk in Mono, Menü als <summary>, Desktop-Navigation mit Knopf", () => {
    const html = render();
    const head = html.slice(html.indexOf('<header class="ws-head"'), html.indexOf("</header>"));
    expect(head).toContain(
      '<a class="ws-brand" href="#start"><span class="ws-brand-mark">Brandt</span><span class="ws-brand-sub">Schreinerei</span></a>'
    );
    expect(head).toMatch(/<summary class="ws-menu-toggle"><span class="ws-sr">Menü<\/span>/);
    expect(head).toContain('<nav class="ws-menu-panel" aria-label="Menü">');
    expect(head).toContain('<nav class="ws-nav" aria-label="Hauptnavigation">');
    expect(head).toMatch(/<a class="ws-btn" href="tel:[^"]+">Anrufen<\/a>/);
    expect(head).toContain('href="#leistungen"');
  });

  test("brandParts: Gewerk vorn/hinten nur einmal, sonst ganzer Name", () => {
    expect(brandParts("Schreinerei Holtkamp", "Schreinerei")).toEqual({ mark: "Holtkamp", sub: "Schreinerei" });
    expect(brandParts("Holtkamp Schreinerei", "Schreinerei")).toEqual({ mark: "Holtkamp", sub: "Schreinerei" });
    expect(brandParts("Laden am Markt", "Schreibwaren")).toEqual({ mark: "Laden am Markt", sub: "Schreibwaren" });
    expect(brandParts("Alte Schreinerei Bremer", "Schreinerei")).toEqual({ mark: "Alte Schreinerei Bremer" });
    expect(brandParts("Laden am Markt", undefined)).toEqual({ mark: "Laden am Markt" });
  });
});

describe("Werkstoff: Kapitel und Seiten", () => {
  test("Kapitelkopf: Slab-h2 mit Anker, eine h2 je Kapitel, keine Nummern", () => {
    const html = render();
    const services = sectionHtml(html, "services");
    expect(services).toContain('id="leistungen"');
    expect(services).toContain('aria-labelledby="leistungen-titel"');
    expect(services).toMatch(/<h2 class="ws-title" id="leistungen-titel">/);
    expect(services.match(/<h2[\s>]/g)).toHaveLength(1);
  });

  test("genau ein h1 in allen Fixtures, alle Abschnittstypen rendern", () => {
    for (const kind of ["full", "minimal", "features"] as const) {
      const html = render(werkstoffFixture(kind));
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    }
  });

  test("hiddenSections greifen", () => {
    const html = render({ ...werkstoffDoc(), hiddenSections: ["services"] });
    expect(html).not.toContain('class="ws-sec ws-services"');
  });
});

describe("Werkstoff: Fuß", () => {
  test("dunkel: Aufforderung, Telefon-Knopf, Spalten, Rechtslinks mit basePath, Wortmarke", () => {
    const html = render(werkstoffDoc(), false, "/site/brandt");
    const foot = html.slice(html.indexOf('<footer class="ws-foot"'));
    expect(foot).toMatch(/<p class="ws-foot-call">[^<]+<\/p>/);
    expect(foot).toMatch(/<a class="ws-btn ws-foot-btn" href="tel:\d+">0231 555 4471<\/a>/);
    for (const h of ["Adresse", "Kontakt", "Zeiten", "Seiten"])
      expect(foot).toContain(`<p class="ws-foot-h">${h}</p>`);
    expect(foot).toContain('href="/site/brandt/impressum"');
    expect(foot).toContain('href="/site/brandt/datenschutz"');
    expect(foot).toContain("© 2026");
    expect(foot).toMatch(/<p class="ws-foot-word" aria-hidden="true" style="--ws-fit:[\d.]+">Brandt<\/p>/);
    expect(foot).toContain("Montag–Freitag");
    expect(WERKSTOFF_CSS).toMatch(/\.ws-foot\{background:var\(--sys-deep\);color:var\(--sys-on-deep\)/);
  });

  test("ohne Kontakt: keine Kontakt-/Zeiten-Spalte, kein Telefon", () => {
    const html = render({ ...werkstoffDoc(), hiddenSections: ["contact"] });
    const foot = html.slice(html.indexOf('<footer class="ws-foot"'));
    expect(foot).not.toContain('<p class="ws-foot-h">Kontakt</p>');
    expect(foot).not.toContain('<p class="ws-foot-h">Zeiten</p>');
    expect(foot).not.toContain("tel:");
  });
});
