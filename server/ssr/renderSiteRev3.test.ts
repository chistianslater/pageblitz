import { describe, expect, test } from "vitest";
import { renderSiteHtml, systemFontHead } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { JOURNAL } from "../../shared/designSystems/journal";
import { generateImpressum } from "../legalGenerator";

const origin = "https://x.pageblitz.de";

describe("SSR rev 3", () => {
  test("lädt Schriften selbst gehostet vor, kein Google Fonts", () => {
    const { html } = renderSiteHtml(
      withDesignSystem(getFixture("salon-noir", "full"), "journal"),
      { origin }
    );
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("fonts.gstatic.com");
    const preloads =
      html.match(/<link rel="preload"[^>]+as="font"[^>]*>/g) ?? [];
    expect(preloads).toHaveLength(2);
    expect(preloads.join("\n")).toContain(
      'href="/fonts/systems/newsreader-latin-o36-wght.woff2"'
    );
    expect(preloads.join("\n")).toContain(
      'href="/fonts/systems/newsreader-latin-o36-wght-italic.woff2"'
    );
    expect(preloads.join("\n")).not.toContain("source-sans-3-latin-wght.woff2");
    expect(html).toContain('data-pb-system="journal"');
  });

  test("Unterseiten-Kopf nutzt dieselben Vorlade-Links", () => {
    const base = withDesignSystem(getFixture("salon-noir", "full"), "journal");
    const doc = {
      ...base,
      addOns: { ...base.addOns, subpages: true },
      pages: [
        {
          slug: "preise",
          title: "Preise",
          seo: { title: "Preise", description: "Preise" },
          sections: [
            { type: "faq" as const, items: [{ question: "Q?", answer: "A." }] },
          ],
        },
      ],
    };
    const { html } = renderSiteHtml(doc as typeof base, {
      origin,
      pathname: "/preise",
    });
    expect(html).toContain("<title>Preise</title>");
    expect(html).not.toContain("fonts.googleapis.com");
    expect((html.match(/rel="preload"[^>]+as="font"/g) ?? []).length).toBe(2);
  });

  test("systemFontHead escapt und nutzt den Systempfad", () => {
    const head = systemFontHead(JOURNAL);
    expect(head.split("\n")).toHaveLength(2);
    expect(head).toContain("crossorigin");
    expect(head).toContain('type="font/woff2"');
  });

  test("rev 2 bleibt bei Google Fonts", () => {
    const { html } = renderSiteHtml(getFixture("salon-noir", "full"), {
      origin,
    });
    expect(html).toContain("fonts.googleapis.com");
    expect(html).not.toContain("/fonts/systems/");
  });

  test("Motion-Bundle: Journal (rev 3), rev 2 und unversioniert ja", () => {
    const rev3 = renderSiteHtml(
      withDesignSystem(getFixture("salon-noir", "full"), "journal"),
      { origin }
    ).html;
    const rev2 = renderSiteHtml(
      { ...getFixture("salon-noir", "full"), designRevision: 2 },
      { origin }
    ).html;
    const unversioned = renderSiteHtml(
      { ...getFixture("salon-noir", "full"), designRevision: undefined },
      { origin }
    ).html;
    const motion = /<script type="module" src="[^"]*motion[^"]*">/;
    expect(rev2).toMatch(motion);
    expect(unversioned).toMatch(motion);
    expect(rev3).toMatch(motion);
  });

  test("rev 3: Body-Hintergrund und Rechtsseiten in Papier/Tinte der Palette", () => {
    const doc = withDesignSystem(
      getFixture("salon-noir", "full"),
      "journal",
      "salbei"
    );
    expect(renderSiteHtml(doc, { origin }).html).toContain(
      "body{background:#eef0ea}"
    );
    const legal = renderSiteHtml(doc, { origin, pathname: "/impressum" }).html;
    expect(legal).toContain("body{background:#eef0ea;color:#232924}");
  });
});

describe("SSR rev 3: Rechtsseiten und Unterseiten im Journal-Rahmen", () => {
  const impressum =
    "<h1>Impressum</h1><h2>Angaben gemäß § 5 TMG</h2><p>NOIR Haarstudio, Türkenstraße 42</p>";
  const doc = () => ({
    ...withDesignSystem(getFixture("salon-noir", "full"), "journal"),
    legal: {
      impressumHtml: impressum,
      datenschutzHtml: "<p>Wir speichern nichts.</p>",
    },
  });

  test("Impressum einer Journal-Seite nutzt Journal-Schrift, -Kopf und -Fuß", () => {
    const { html, status } = renderSiteHtml(doc(), {
      origin,
      pathname: "/impressum",
    });
    expect(status).toBe(200);
    expect(html).toContain('data-pb-system="journal"');
    expect(html).toContain('class="jr-head"');
    expect(html).toContain('class="jr-foot"');
    expect(html).toContain('class="jr-wrap jr-legal"');
    expect(html).not.toContain("fonts.googleapis.com");
    expect((html.match(/rel="preload"[^>]+as="font"/g) ?? []).length).toBe(2);
    expect(html).toContain("<title>Impressum — NOIR Haarstudio</title>");
    expect(html).toContain(`rel="canonical" href="${origin}/impressum"`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1 id="seite-titel">Impressum<\/h1>/);
    expect(html).toContain("<h2>Angaben gemäß § 5 TMG</h2>");
    expect(html).toContain("body{background:#f3eee7;color:#2f2e2c}");
  });

  test("Generator-Impressum: kein <style>, kein Zurück-Link, Inhalt vollständig", () => {
    const generated = generateImpressum({
      businessName: "NOIR Haarstudio",
      legalOwner: "Lena Noir",
      legalStreet: "Türkenstraße 42",
      legalZip: "80799",
      legalCity: "München",
      legalEmail: "hallo@noir.de",
      legalPhone: "089 123 456",
    } as never);
    const { html } = renderSiteHtml(
      { ...doc(), legal: { impressumHtml: generated } },
      { origin, pathname: "/impressum" }
    );
    const article = html.slice(
      html.indexOf('class="jr-wrap jr-legal"'),
      html.indexOf("</article>")
    );
    expect(article).not.toMatch(/<style/i);
    expect(article).not.toContain("back-link");
    expect(html).not.toContain("max-width: 800px");
    expect(html).not.toContain("javascript:history.back()");
    expect(article).toContain("<h2>Angaben gemäß § 5 TMG</h2>");
    expect(article).toContain("Türkenstraße 42");
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1 id="seite-titel">Impressum<\/h1>/);
  });

  test("Datenschutz ohne h1 im Text bekommt den Seitentitel als h1", () => {
    const { html } = renderSiteHtml(doc(), {
      origin,
      pathname: "/datenschutz",
    });
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(">Datenschutz</h1>");
    expect(html).toContain("Wir speichern nichts.");
  });

  test("Anker der Rechtsseite zeigen auf die Startseite (mit basePath)", () => {
    const { html } = renderSiteHtml(doc(), {
      origin,
      pathname: "/impressum",
      basePath: "/site/noir",
    });
    const head = html.slice(
      html.indexOf('class="jr-head"'),
      html.indexOf("</header>")
    );
    expect(head).not.toMatch(/href="#/);
    expect(head).toContain('href="/site/noir#leistungen"');
  });

  test("leere Rechtsseite live: 404, Vorschau: Hinweis mit 200", () => {
    const empty = { ...doc(), legal: undefined };
    expect(
      renderSiteHtml(empty, { origin, pathname: "/impressum" }).status
    ).toBe(404);
    const preview = renderSiteHtml(empty, {
      origin,
      pathname: "/impressum",
      basePath: "/preview-ssr/abc",
    });
    expect(preview.status).toBe(200);
    expect(preview.html).toContain("Keine Sorge");
    expect(preview.html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  test("Unterseite einer Journal-Seite hat Typo-Kopf und genau ein h1", () => {
    const base = withDesignSystem(getFixture("salon-noir", "full"), "journal");
    const data = {
      ...base,
      addOns: { ...base.addOns, subpages: true },
      pages: [
        {
          slug: "leistungen",
          title: "Leistungen",
          seo: { title: "Leistungen", description: "Alle Leistungen" },
          sections: [
            {
              type: "pageHeader" as const,
              title: "Unsere Leistungen",
              intro: "Alles im Detail.",
            },
            {
              type: "services" as const,
              headline: "Leistungen",
              items: [
                {
                  title: "Damenschnitt",
                  description: "Waschen, Schnitt, Föhnen.",
                },
              ],
            },
          ],
        },
      ],
    };
    const { html } = renderSiteHtml(data as typeof base, {
      origin,
      pathname: "/leistungen",
    });
    expect(html).toContain('class="jr-page-head"');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(">Unsere Leistungen</h1>");
    expect(html).toContain("Damenschnitt");
    expect(html).not.toContain('class="jr-entry');
  });
});
