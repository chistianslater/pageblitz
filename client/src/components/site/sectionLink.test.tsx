import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PACK_IDS } from "../../../../shared/siteContract/types";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { SiteRenderer } from "./SiteRenderer";
import { SECTION_ANCHORS } from "./engine";
import "./packs/index";

const MENU = {
  type: "menu" as const,
  headline: "Speisekarte",
  categories: [
    { name: "Döner", items: [{ name: "Döner im Brot", price: "7,50" }] },
  ],
  link: { text: "Online bestellen", href: "https://dicle.nexorder.de/" },
};

function doc(packId: (typeof PACK_IDS)[number]): WebsiteDataV2 {
  return {
    version: 2,
    stylePackId: packId,
    businessName: "Dicle Döner",
    seo: { title: "t", description: "d" },
    addOns: { menu: true },
    sections: [{ type: "hero", headline: "Dicle Döner" }, MENU],
  };
}

/** Inhalt der Sektion mit dem Anker — der Button muss IN ihr stehen. */
function sectionHtml(html: string, anchor: string): string {
  const start = html.indexOf(`id="${anchor}"`);
  expect(start, `Sektion #${anchor} fehlt`).toBeGreaterThan(-1);
  const end = html.indexOf("</section>", start);
  return html.slice(start, end);
}

describe("Button unter der Speisekarte", () => {
  test.each(PACK_IDS)("%s zeigt den Button innerhalb der Sektion", pack => {
    const html = renderToStaticMarkup(<SiteRenderer data={doc(pack)} />);
    const menu = sectionHtml(html, SECTION_ANCHORS.menu);
    expect(menu).toContain('class="pb-section-link-btn"');
    expect(menu).toContain('href="https://dicle.nexorder.de/"');
    expect(menu).toContain('target="_blank"');
    expect(menu).toContain("Online bestellen");
  });

  test("interne Anker öffnen im selben Tab", () => {
    const data = doc("gusto");
    data.sections[1] = { ...MENU, link: { text: "Kontakt", href: "#kontakt" } };
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).toContain('href="#kontakt"');
    expect(html).not.toContain('target="_blank"');
  });

  test("ohne Link kein Button", () => {
    const { link: _link, ...ohne } = MENU;
    const data = {
      ...doc("gusto"),
      sections: [doc("gusto").sections[0], ohne],
    };
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).not.toContain('class="pb-section-link-btn"');
  });
});
