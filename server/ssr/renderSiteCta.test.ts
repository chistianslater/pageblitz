import { describe, expect, test } from "vitest";
import { renderSiteHtml } from "./renderSite";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Haar Galerie",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "contact" },
  ],
};

const opts = {
  origin: "https://pageblitz.de",
  slug: "haar-galerie",
  previewCta: {
    businessName: "Haar Galerie",
    studioHref: "/onboarding/tok",
  },
};

describe("renderSiteHtml mit Vorschau-Leiste (Befund 2026-09-05)", () => {
  test("Startseite trägt die Leiste — sie lief über einen zweiten Body-Zusammenbau", () => {
    const { html } = renderSiteHtml(doc, { ...opts, pathname: "/" });
    expect(html).toContain("pb-preview-cta");
    expect(html).toContain("Website übernehmen");
  });

  test("ohne die Option bleibt die Seite unverändert — Kundenseiten sehen nichts", () => {
    const { html } = renderSiteHtml(doc, {
      origin: opts.origin,
      slug: opts.slug,
      pathname: "/",
    });
    expect(html).not.toContain("pb-preview-cta");
  });
});
