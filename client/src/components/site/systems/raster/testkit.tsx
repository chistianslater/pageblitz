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
} from "../../../../../../shared/showcases/blueprintShowcase";

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
  const at = html.search(new RegExp(`class="rs-sec rs-${cls}[" ]`));
  if (at === -1) return "";
  const start = html.lastIndexOf("<section", at);
  return html.slice(start, html.indexOf("</section>", start));
};

type Doc = ReturnType<typeof rasterDoc>;
type Patch<T extends Doc["sections"][number]["type"]> = (
  s: Extract<Doc["sections"][number], { type: T }>
) => Extract<Doc["sections"][number], { type: T }>;

/** Abschnitt eines Typs ersetzen (Fixtures für die drei Einstiege). */
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

/**
 * Systemblatt 6, links: Kanzlei auf Papier, Hochformat-Foto → Tafel unten.
 * Aus dem Beispielbetrieb Steuerberater; `colorfield` = Foto ohne Querformat.
 */
export function kanzleiDoc(): Doc {
  const base = rasterDoc("papier", "steuerberater");
  const doc = patchSection(
    {
      ...base,
      businessName: "Kanzlei Brandt",
      businessCategory: "Steuerberatung",
      designProfile: { ...base.designProfile!, composition: "colorfield" },
    },
    "contact",
    c => ({ ...c, city: "Münster", zip: "48143" })
  );
  return patchSection(doc, "hero", h => ({
    ...h,
    headline: "Steuern. Klar geregelt.",
  }));
}

/** Systemblatt 6, Mitte: Werkstatt, Querformat-Foto vollflächig (Bühne). */
export function werkstattDoc(): Doc {
  const base = rasterDoc("werk", "werkstatt");
  return patchSection(
    { ...base, businessName: "Kfz-Meisterbetrieb Yilmaz GmbH" },
    "contact",
    c => ({ ...c, city: "Münster-Hiltrup", zip: "48165" })
  );
}

/** Systemblatt 6, rechts: Schlüsseldienst auf Kohle, kein Foto, 24 h. */
export function schluesselDoc(): Doc {
  const base = rasterDoc("kohle", "taxi");
  const { google: _google, ...rest } = base;
  const doc = patchSection(
    {
      ...rest,
      businessName: "Schlüsseldienst Nord",
      businessCategory: "Schlüsseldienst",
    },
    "contact",
    c => ({
      ...c,
      city: "Münster",
      zip: "48145",
      phone: "0251 98 76 54",
      openingHours: [{ day: "Mo–So", hours: "24 Stunden geöffnet" }],
    })
  );
  return patchSection(doc, "hero", h => ({
    ...h,
    imageUrl: undefined,
    headline: "Schlüsseldienst in Münster",
    subheadline: "Ausgesperrt? Ruf an. Wir kommen, Tag und Nacht.",
  }));
}
