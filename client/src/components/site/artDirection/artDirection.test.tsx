import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import "../packs";
import { SiteRenderer } from "../SiteRenderer";
import { getFixture } from "../../../../../shared/siteContract/fixtures";
import { PACK_IDS } from "../../../../../shared/siteContract/packIds";
import { withArtDirection } from "../../../../../shared/stylePacks/artDirection";

describe("production art direction", () => {
  test.each(PACK_IDS)(
    "%s renders one genuine hero and keeps contact/sections",
    id => {
      const data = withArtDirection(getFixture(id, "full"));
      const html = renderToStaticMarkup(
        <SiteRenderer data={data} islandsMode="preview" />
      );
      expect(html.match(/<h1\b/g)?.length).toBe(1);
      expect(html).toContain('class="pb-art-hero"');
      expect(html).toContain('id="kontakt"');
      expect(html).not.toContain("Designstudie");
      expect(html).not.toContain("Anfrage ausprobieren");
    }
  );
  test("explicit revision 1 keeps legacy rendering", () => {
    const data = getFixture("gusto", "full");
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).not.toContain('class="pb-art-hero"');
  });
  test("unversioned documents adopt the new default without mutating saved content", () => {
    const data = { ...getFixture("gusto", "full"), designRevision: undefined };
    const before = JSON.stringify(data);
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).toContain('class="pb-art-hero"');
    expect(html).toContain('data-pb-revision="2"');
    expect(JSON.stringify(data)).toBe(before);
  });
  test("hidden hero media removes the secondary image as well", () => {
    const data = withArtDirection(getFixture("salon-noir", "full"));
    data.designProfile!.hiddenElements = ["hero-media"];
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).toContain('data-art-image="no"');
    expect(html).not.toContain('<figure class="pb-art-secondary"');
  });
});
