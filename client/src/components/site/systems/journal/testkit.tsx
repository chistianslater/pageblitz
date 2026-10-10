import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";

/** Testhilfen für Journal: Fixture als rev-3-Dokument und SSR-Markup. */
export const journalDoc = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("salon-noir", kind), "journal", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = journalDoc(),
  preview = false,
  basePath = "",
  pathname?: string
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      pathname={pathname}
      now={TEST_NOW}
    />
  );

/** Markup des ersten Abschnitts mit Klasse `jr-<cls>`. */
export const sectionHtml = (html: string, cls: string) => {
  const at = html.indexOf(`class="jr-section jr-${cls}`);
  if (at === -1) return "";
  const start = html.lastIndexOf("<section", at);
  if (start === -1) return "";
  return html.slice(start, html.indexOf("</section>", start));
};
