import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PackId, WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_IDS } from "../../../../shared/siteContract/types";
import "./packs/index";
import { SiteRenderer } from "./SiteRenderer";
import { reviewInitials, ReviewStars } from "./googleReview";
import { REVIEW_CHROME_CSS } from "./reviewChromeCss";

const reviewDoc = (packId: PackId): WebsiteDataV2 => ({
  version: 2,
  stylePackId: packId,
  businessName: "Probe",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "Hallo" },
    {
      type: "testimonials",
      headline: "Stimmen",
      items: [
        {
          author: "Martina Kessler",
          text: "Der Schrank sitzt auf den Millimeter.",
          rating: 5,
        },
      ],
    },
  ],
});

describe("googleReview", () => {
  test("Initialen aus Vor- und Nachname", () => {
    expect(reviewInitials("Martina Kessler")).toBe("MK");
    expect(reviewInitials("Jonas")).toBe("JO");
    expect(reviewInitials("  ")).toBe("?");
  });

  test("Sterne markieren die gefüllten Plätze", () => {
    const html = renderToStaticMarkup(<ReviewStars rating={4} />);
    expect(html).toContain('aria-label="4 von 5 Sternen"');
    expect(html.match(/data-on=""/g)).toHaveLength(4);
  });

});
