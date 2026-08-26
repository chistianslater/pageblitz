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
  addOns: { gallery: true },
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
      type: "gallery",
      headline: "Werkstücke",
      images: [{ url: "/tisch.jpg", alt: "Esstisch aus Eiche" }],
    },
    {
      type: "testimonials",
      headline: "Stimmen",
      items: [
        { text: "Präzise bis ins Detail.", author: "M. Kern", rating: 5 },
      ],
    },
    {
      type: "contact",
      phone: "0231 1",
      email: "post@brandt.de",
      city: "Dortmund",
      openingHours: [{ day: "Montag", hours: "08:00–17:00" }],
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
  test("Tactile-Industrial-DOM bildet Arbeitsfolge, Material und Werkstücke", () => {
    expect(html).toContain("pb-wb-process-list");
    expect(html).toContain("Arbeitsfolge / 01—02");
    expect(html).toContain("pb-wb-material");
    expect(html).toContain("pb-wb-image-frame");
    expect(html).toContain("W/01");
    expect(html).toContain("Werkstück 01");
  });
  test("Testimonials und Kontakt sind charakteristische Prüf- und Projektblöcke", () => {
    expect(html).toContain("pb-wb-proof-grid");
    expect(html).toContain("Belastungsprobe");
    expect(html).toContain("pb-wb-contact-sheet");
    expect(html).toContain("Projektaufnahme / Kontakt");
  });
  test("mobile Inhalte bleiben sichtbar und Motion respektiert reduced motion", () => {
    expect(html).not.toContain(".pb-wb-photo{display:none}");
    expect(html).toContain(".pb-wb-gallery{grid-template-columns:1fr");
    expect(html).toContain("@media(prefers-reduced-motion:reduce)");
    expect(html).toContain(".pb-wb-gallery figure:hover img{transform:none");
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
