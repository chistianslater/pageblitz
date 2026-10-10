import { describe, expect, test } from "vitest";
import { renderSiteHtml, systemFontHead } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { JOURNAL } from "../../shared/designSystems/journal";

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
});
