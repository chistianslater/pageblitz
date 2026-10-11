import { describe, expect, test } from "vitest";
import { renderSiteHtml, systemFontHead } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { RASTER } from "../../shared/designSystems/raster";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../shared/stylePacks/blueprintShowcase";

const origin = "https://x.pageblitz.de";
const rasterDoc = (palette?: string) =>
  systemShowcaseDoc(findShowcase("werkstatt")!, "raster", palette);

describe("SSR rev 3: Raster", () => {
  test("genau ein Preload (Geist), kein Google Fonts, @font-face einmal", () => {
    const { html, status } = renderSiteHtml(rasterDoc(), { origin });
    expect(status).toBe(200);
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("fonts.gstatic.com");
    const preloads =
      html.match(/<link rel="preload"[^>]+as="font"[^>]*>/g) ?? [];
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toContain(
      'href="/fonts/systems/geist-latin-wght.woff2"'
    );
    expect(html.match(/@font-face/g)).toHaveLength(1);
    expect(html).toContain('data-pb-system="raster"');
    expect(systemFontHead(RASTER).split("\n")).toHaveLength(1);
  });

  test("Body-Hintergrund und Rechtsseite in Papier/Tinte der Palette Kohle", () => {
    const doc = {
      ...rasterDoc("kohle"),
      legal: {
        impressumHtml: "<h1>Impressum</h1><p>x</p>",
        datenschutzHtml: "<p>y</p>",
      },
    };
    expect(renderSiteHtml(doc, { origin }).html).toContain(
      "body{background:#141414}"
    );
    const legal = renderSiteHtml(doc, { origin, pathname: "/impressum" });
    expect(legal.status).toBe(200);
    expect(legal.html).toContain("body{background:#141414;color:#f3f3f0}");
    expect(legal.html).toContain('class="rs-head"');
    expect(legal.html).toContain('class="rs-foot"');
    expect(legal.html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test("Rechtsseite im Raster-Rahmen: Anker zeigen auf die Startseite", () => {
    const doc = {
      ...rasterDoc(),
      legal: {
        impressumHtml: "<h1>Impressum</h1><p>x</p>",
        datenschutzHtml: "<p>y</p>",
      },
    };
    const { html } = renderSiteHtml(doc, {
      origin,
      pathname: "/impressum",
      basePath: "/site/brandt",
    });
    const head = html.slice(
      html.indexOf('class="rs-head"'),
      html.indexOf("</header>")
    );
    expect(head).toContain('href="/site/brandt#leistungen"');
    expect(html).toContain('class="rs-wrap rs-legal"');
    expect(html).toMatch(/<h1 id="seite-titel">Impressum<\/h1>/);
  });

  test("Motion-Bundle: Raster (noch) nicht, Journal weiter ja", () => {
    const motion = /<script type="module" src="[^"]*motion[^"]*">/;
    expect(renderSiteHtml(rasterDoc(), { origin }).html).not.toMatch(motion);
    expect(
      renderSiteHtml(
        withDesignSystem(getFixture("salon-noir", "full"), "journal"),
        { origin }
      ).html
    ).toMatch(motion);
  });
});
