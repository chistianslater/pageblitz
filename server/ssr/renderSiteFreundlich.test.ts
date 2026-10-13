import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { renderSiteHtml, systemFontHead, systemSchemeHead } from "./renderSite";
import { FREUNDLICH } from "../../shared/designSystems/freundlich";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { getFixture } from "../../shared/siteContract/fixtures";
import { SYSTEM_MODULES } from "../../client/src/components/site/systems/registry";
import type { SiteModule } from "../../client/src/components/site/siteModule";

const OPTS = { origin: "https://pageblitz.de", slug: "test" };

describe("SSR: Freundlich-Schriften", () => {
  test("genau zwei Preloads: Bricolage Grotesque und Instrument Sans (latin)", () => {
    const links = systemFontHead(FREUNDLICH).split("\n");
    expect(links).toHaveLength(2);
    expect(links[0]).toContain('href="/fonts/systems/bricolage-latin-wght.woff2"');
    expect(links[1]).toContain('href="/fonts/systems/instrument-sans-latin-wght.woff2"');
    for (const l of links) {
      expect(l).toContain('as="font"');
      expect(l).toContain("crossorigin");
      expect(l).not.toContain("latin-ext");
    }
  });
  test("helles System: keine Schema-Tags", () => {
    for (const p of FREUNDLICH.palettes) expect(systemSchemeHead(FREUNDLICH, p.id)).toEqual([]);
  });
});

describe("SSR: Freundlich-Seite (Stub-Modul bis F2)", () => {
  // Freundlich hat noch kein Render-Modul; ein Stub prüft nur Kopf und Hülle.
  const stub: SiteModule = { ...(SYSTEM_MODULES.klar as SiteModule) };
  beforeAll(() => {
    SYSTEM_MODULES.freundlich = stub;
  });
  afterAll(() => {
    delete SYSTEM_MODULES.freundlich;
  });
  const doc = () => withDesignSystem(getFixture("werkbank", "full"), "freundlich", "himmel");

  test("Startseite: zwei Preloads, Form-, Band- und Pastell-Variablen an der Wurzel", () => {
    const html = renderSiteHtml(doc(), OPTS).html;
    expect(html.match(/rel="preload"[^>]*as="font"/g)).toHaveLength(2);
    expect(html).not.toContain('name="theme-color"');
    const root = html.match(/<div class="pb-site pb-freundlich" style="([^"]*)"/)?.[1] ?? "";
    expect(root).toContain("--sys-band:#e9e3d6");
    expect(root).toContain("--sys-edge-color:#16233b");
    expect(root).toContain("--sys-tint-2-bg:#f7e6a6");
    expect(root).toContain("--sys-radius-l:28px");
    expect(root).toContain("--sys-tilt:1.5deg");
    expect(root).toContain("--sys-edge:cloud");
    expect(root).not.toContain("color-scheme");
  });
  test("Rechtsseiten laden dieselben zwei Schriften vor", () => {
    for (const pathname of ["/impressum", "/datenschutz"]) {
      const html = renderSiteHtml(doc(), { ...OPTS, pathname }).html;
      expect(html.match(/rel="preload"[^>]*as="font"/g), pathname).toHaveLength(2);
      expect(html, pathname).toContain("bricolage-latin-wght.woff2");
    }
  });
});
