import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import "../index"; // registriert alle Pack-Module
import { SiteRenderer } from "../../SiteRenderer";
import { WERKBANK_CSS } from "./css";

const data: WebsiteDataV2 = {
  version: 2,
  designRevision: 1, // Legacy signature regression; revision 2 is covered in artDirection tests.
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
  test("technische Indizes und Messlinien setzen sich gestaffelt", () => {
    expect(WERKBANK_CSS).toContain("@keyframes pb-wb-index-set");
    expect(WERKBANK_CSS).toContain("@keyframes pb-wb-gauge");
    expect(WERKBANK_CSS).toContain("animation-delay:.2s");
  });
  test("versteckte Sektion wird nicht gerendert", () => {
    const h = renderToStaticMarkup(
      <SiteRenderer data={{ ...data, hiddenSections: ["about"] }} />
    );
    expect(h).not.toContain('id="ueber-uns"');
  });
});
