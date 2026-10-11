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

/** Testhilfen für Werkstoff: Beispielbetrieb (Schreinerei) als rev-3-Dokument. */
export const werkstoffDoc = (palette?: string, showcase = "schreinerei") =>
  systemShowcaseDoc(findShowcase(showcase)!, "werkstoff", palette);

/** Fixture-Dokument (Unterseiten, Extras) im Werkstoff. */
export const werkstoffFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "werkstoff", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = werkstoffDoc(),
  preview = false,
  basePath = "",
  pathname?: string,
  slug = "",
  now = TEST_NOW
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug={slug}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      pathname={pathname}
      now={now}
    />
  );

/** Markup des ersten Abschnitts mit Klasse `ws-<cls>`. */
export const sectionHtml = (html: string, cls: string) => {
  const at = html.search(new RegExp(`class="ws-sec ws-${cls}[" ]`));
  if (at === -1) return "";
  const start = html.lastIndexOf("<section", at);
  return html.slice(start, html.indexOf("</section>", start));
};

type Doc = ReturnType<typeof werkstoffDoc>;
type Patch<T extends Doc["sections"][number]["type"]> = (
  s: Extract<Doc["sections"][number], { type: T }>
) => Extract<Doc["sections"][number], { type: T }>;

/** Abschnitt eines Typs ersetzen. */
export function patchSection<T extends Doc["sections"][number]["type"]>(
  doc: Doc,
  type: T,
  patch: Patch<T>
): Doc {
  return {
    ...doc,
    sections: doc.sections.map(s =>
      s.type === type ? patch(s as Extract<typeof s, { type: T }>) : s
    ),
  };
}
