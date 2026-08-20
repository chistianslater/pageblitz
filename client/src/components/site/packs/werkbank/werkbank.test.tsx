import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import "../index"; // registriert alle Pack-Module
import { SiteRenderer } from "../../SiteRenderer";

const data: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  businessCategory: "Schreinerei",
  tagline: "Massarbeit seit 2004",
  seo: { title: "t", description: "d" },
  sections: [
    {
      type: "hero",
      headline: "Massarbeit aus Massivholz.",
      ctaText: "Projekt anfragen",
    },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau" }, { title: "Innenausbau" }],
    },
    { type: "about", headline: "Über uns", body: "Seit 2004 in Dortmund." },
    {
      type: "contact",
      phone: "0231 1",
      email: "post@brandt.de",
      city: "Dortmund",
    },
  ],
};

describe("Pack werkbank", () => {
  const html = renderToStaticMarkup(<SiteRenderer data={data} />);
  test("genau eine h1 mit Hero-Headline", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Massarbeit aus Massivholz.");
  });
  test("deutsche Anker vorhanden", () => {
    for (const id of ["leistungen", "ueber-uns", "kontakt"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });
  test("Signatur-Elemente vorhanden (Rail + Marquee)", () => {
    expect(html).toContain("pb-wb-rail");
    expect(html).toContain("pb-wb-marquee");
  });
  test("Outline-Mittelzeile bei der Fixture-Headline vorhanden (3-Wort-Headline)", () => {
    const h1Match = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
    expect(h1Match).not.toBeNull();
    expect(h1Match?.[0]).toContain('class="outline"');
  });
  test("versteckte Sektion wird nicht gerendert", () => {
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
