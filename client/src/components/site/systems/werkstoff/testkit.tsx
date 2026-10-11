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

/** Systemblatt 8 links: Schreinerei, Querformat-Foto, Palette Kiefer. */
export function holtkampDoc(): Doc {
  const base = werkstoffDoc("kiefer", "schreinerei");
  const doc = patchSection(
    { ...base, businessName: "Schreinerei Holtkamp", businessCategory: "Schreinerei" },
    "contact",
    c => ({
      ...c,
      phone: "0251 555 0147",
      street: "Am Kanal 41",
      zip: "48155",
      city: "Münster",
      openingHours: [
        { day: "Mo–Do", hours: "7:00 – 17:00" },
        { day: "Fr", hours: "7:00 – 15:00" },
      ],
    })
  );
  return patchSection(doc, "hero", h => ({
    ...h,
    headline: "Gebaut, um zu bleiben.",
    subheadline:
      "Möbel, Küchen und Innenausbau nach Maß. Aus Eiche, Esche und Nussbaum.",
  }));
}

/** Systemblatt 8 Mitte: Bäckerei, früh geöffnet, Palette Ton. */
export function overbeckDoc(): Doc {
  const base = werkstoffDoc("ton", "baeckerei");
  const doc = patchSection(
    { ...base, businessName: "Bäckerei Overbeck", businessCategory: "Bäckerei" },
    "contact",
    c => ({
      ...c,
      phone: "0251 555 0262",
      street: "Idenbrockplatz 3",
      zip: "48159",
      city: "Münster",
      openingHours: [
        { day: "Mo–Fr", hours: "6:00 – 18:00" },
        { day: "Sa", hours: "6:00 – 13:00" },
        { day: "So", hours: "7:00 – 11:00" },
      ],
    })
  );
  return patchSection(doc, "hero", h => ({
    ...h,
    headline: "Brot und Brötchen, ab 6 Uhr frisch.",
  }));
}

/** Systemblatt 8 rechts: Laden ohne brauchbares Foto, Palette Leinen. */
export function ladenDoc(): Doc {
  const base = werkstoffDoc("leinen", "goldschmiede");
  const { google: _google, ...rest } = base;
  const doc = patchSection(
    { ...rest, businessName: "Laden am Markt", businessCategory: "Schreibwarengeschäft" },
    "contact",
    c => ({
      ...c,
      phone: "02581 555 0388",
      street: "Marktplatz 7",
      zip: "48231",
      city: "Warendorf",
      openingHours: [
        { day: "Mo–Fr", hours: "9:00 – 18:30" },
        { day: "Sa", hours: "9:00 – 14:00" },
      ],
    })
  );
  return patchSection(doc, "hero", h => ({
    ...h,
    imageUrl: undefined,
    headline: "Papier, Haushalt und kleine Geschenke.",
    subheadline: "Direkt am Marktplatz.",
  }));
}

/** Kontakt-Abschnitt eines Dokuments ersetzen (Zettel-Fälle). */
export const withContact = (
  doc: Doc,
  patch: Partial<Extract<Doc["sections"][number], { type: "contact" }>>
) => patchSection(doc, "contact", c => ({ ...c, ...patch }));
