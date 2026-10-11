import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../../shared/stylePacks/blueprintShowcase";

/** Testhilfen für Raster: Beispielbetrieb (Werkstatt) als rev-3-Dokument. */
export const rasterDoc = (palette?: string, showcase = "werkstatt") =>
  systemShowcaseDoc(findShowcase(showcase)!, "raster", palette);

/** Fixture-Dokument (Unterseiten, Extras) im Raster. */
export const rasterFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("salon-noir", kind), "raster", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = rasterDoc(),
  preview = false,
  basePath = "",
  pathname?: string,
  slug = ""
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug={slug}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      pathname={pathname}
      now={TEST_NOW}
    />
  );

/** Markup des ersten Abschnitts mit Klasse `rs-<cls>`. */
export const sectionHtml = (html: string, cls: string) => {
  const at = html.indexOf(`class="rs-sec rs-${cls}"`);
  if (at === -1) return "";
  const start = html.lastIndexOf("<section", at);
  return html.slice(start, html.indexOf("</section>", start));
};
