import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { renderSiteHtml, systemFontHead, systemSchemeHead } from "./renderSite";
import { NACHT } from "../../shared/designSystems/nacht";
import { getSystem } from "../../shared/designSystems/registry";
import type { DesignSystemId } from "../../shared/designSystems/types";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { getFixture } from "../../shared/siteContract/fixtures";
import { SYSTEM_MODULES } from "../../client/src/components/site/systems/registry";
import type { SiteModule } from "../../client/src/components/site/siteModule";

const LIVE: DesignSystemId[] = ["journal", "raster", "werkstoff", "plakat", "klar"];
const OPTS = { origin: "https://pageblitz.de", slug: "test" };

describe("SSR: Nacht-Schriften", () => {
  test("genau zwei Preloads: Gilda Display und Jost (latin)", () => {
    const links = systemFontHead(NACHT).split("\n");
    expect(links).toHaveLength(2);
    expect(links[0]).toContain('href="/fonts/systems/gilda-display-latin.woff2"');
    expect(links[1]).toContain('href="/fonts/systems/jost-latin-wght.woff2"');
    for (const l of links) {
      expect(l).toContain('as="font"');
      expect(l).toContain("crossorigin");
      expect(l).not.toContain("latin-ext");
    }
  });
});

describe("SSR: Schema nur für Systeme, die es setzen", () => {
  test("Nacht: color-scheme dark und theme-color = Papier der Palette", () => {
    for (const p of NACHT.palettes)
      expect(systemSchemeHead(NACHT, p.id)).toEqual([
        '<meta name="color-scheme" content="dark" />',
        `<meta name="theme-color" content="${p.paper}" />`,
      ]);
    // Unbekannte Palette: erste.
    expect(systemSchemeHead(NACHT, "gibtsnicht")[1]).toContain("#1c2a2a");
  });
  test.each(LIVE)("%s: keine Schema-Tags", id => {
    const def = getSystem(id)!;
    for (const p of def.palettes) expect(systemSchemeHead(def, p.id)).toEqual([]);
    const html = renderSiteHtml(withDesignSystem(getFixture("werkbank", "full"), id), OPTS).html;
    expect(html).not.toContain('name="theme-color"');
    expect(html).not.toContain('name="color-scheme"');
    expect(html).not.toContain("color-scheme:");
  });
});

describe("SSR: Nacht-Seite (Stub-Modul bis N2)", () => {
  // Nacht hat noch kein Render-Modul; ein Stub prüft nur Kopf und Hülle.
  const stub: SiteModule = {
    ...(SYSTEM_MODULES.klar as SiteModule),
  };
  beforeAll(() => {
    SYSTEM_MODULES.nacht = stub;
  });
  afterAll(() => {
    delete SYSTEM_MODULES.nacht;
  });
  const doc = () => withDesignSystem(getFixture("werkbank", "full"), "nacht", "nachtblau");

  test("Startseite: zwei Preloads, Schema-Tags, color-scheme und Schein an der Wurzel", () => {
    const html = renderSiteHtml(doc(), OPTS).html;
    expect(html.match(/rel="preload"[^>]*as="font"/g)).toHaveLength(2);
    expect(html).toContain('<meta name="color-scheme" content="dark" />');
    expect(html).toContain('<meta name="theme-color" content="#151d2a" />');
    const root = html.match(/<div class="pb-site pb-nacht" style="([^"]*)"/)?.[1] ?? "";
    expect(root).toContain("--sys-glow-1:#2c4a6e");
    expect(root).toContain("--sys-glow-2:#6d6a58");
    expect(root).toContain("--sys-scheme:dark");
    expect(root).toMatch(/color-scheme:dark$/);
  });
  test("Unterseite und Rechtsseiten tragen dieselben Schema-Tags", () => {
    const d = doc();
    for (const pathname of [...(d.pages ?? []).map(p => `/${p.slug}`), "/impressum", "/datenschutz"]) {
      const html = renderSiteHtml(d, { ...OPTS, pathname }).html;
      expect(html, pathname).toContain('<meta name="color-scheme" content="dark" />');
      expect(html, pathname).toContain('<meta name="theme-color" content="#151d2a" />');
    }
  });
});
