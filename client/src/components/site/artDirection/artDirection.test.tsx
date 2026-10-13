import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import "../packs";
import { SiteRenderer } from "../SiteRenderer";
import { getFixture } from "../../../../../shared/siteContract/fixtures";
import { PACK_IDS } from "../../../../../shared/siteContract/packIds";
import { withArtDirection } from "../../../../../shared/stylePacks/artDirection";

describe("production art direction", () => {
  test("ohne Google-Daten keine Bewertungszeile im Kopf", () => {
    const data = {
      ...withArtDirection(getFixture("patina", "full")),
      google: undefined,
    };
    const html = renderToStaticMarkup(
      <SiteRenderer data={data} islandsMode="preview" />
    );
    expect(html).not.toContain('class="pb-art-rating"');
  });
  test("explicit revision 1 keeps legacy rendering", () => {
    const data = getFixture("gusto", "full");
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).not.toContain('class="pb-art-hero"');
  });
});
