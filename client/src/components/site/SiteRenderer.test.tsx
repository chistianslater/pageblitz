import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { SiteRenderer, SYSTEM_MOTION } from "./SiteRenderer";
import { SYSTEMS_WITH_MOTION } from "../../../../shared/designSystems/registry";
import { SYSTEM_MODULES } from "./systems/registry";

const data: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Probe",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "Hallo Welt" }],
};

describe("SiteRenderer", () => {
  describe("nur Designsysteme", () => {
    test("ein Dokument ohne Revision rendert als System, ohne Pack-Layout-Attribute", () => {
      const html = renderToStaticMarkup(<SiteRenderer data={data} />);
      const root = html.match(/<div[^>]*class="pb-site[^>]*>/)?.[0] ?? "";
      expect(root).toContain('data-pb-revision="3"');
      expect(root).toMatch(/data-pb-system="[a-z]+"/);
      expect(root).toMatch(/data-pb-palette="[a-z-]+"/);
      for (const attr of [
        "data-pb-texture",
        "data-pb-hero",
        "data-pb-services",
        "data-pb-density",
        "data-pb-deco",
        "data-pb-he",
      ]) {
        expect(root).not.toContain(`${attr}=`);
      }
      expect(html).toContain("Hallo Welt");
      expect(html).not.toContain("pb-entry-dock");
      expect(html).not.toContain("pb-art-");
    });

    test("ein nicht registriertes System-Modul wirft verständlich", () => {
      const real = SYSTEM_MODULES.raster;
      delete SYSTEM_MODULES.raster;
      try {
        expect(() =>
          renderToStaticMarkup(
            <SiteRenderer
              data={{ ...data, designRevision: 3, system: "raster" }}
            />
          )
        ).toThrow("System-Modul nicht registriert: raster");
      } finally {
        SYSTEM_MODULES.raster = real;
      }
    });
  });

  describe("pathname / Unterseiten (Plan B6, Task 3)", () => {
    const dataWithPage: WebsiteDataV2 = {
      ...data,
      sections: [
        { type: "hero", headline: "Hallo Welt" },
        { type: "services", headline: "Leistungen", items: [{ title: "A" }] },
      ],
      // Unterseiten sind Add-on-Inhalt (Plan B6 Task 6): ohne
      // `addOns.subpages` rendert SiteRenderer die Startseite.
      addOns: { subpages: true },
      pages: [
        {
          slug: "leistungen-im-detail",
          title: "Leistungen im Detail",
          seo: { title: "Leistungen im Detail", description: "Details." },
          sections: [
            {
              type: "pageHeader",
              title: "Leistungen im Detail",
              intro: "Ein genauerer Blick.",
            },
            {
              type: "services",
              headline: "Leistungen",
              items: [{ title: "B" }],
            },
          ],
        },
      ],
    };

    test("ohne pathname (Default) rendert weiterhin die Startseite", () => {
      const html = renderToStaticMarkup(<SiteRenderer data={dataWithPage} />);
      expect(html).toContain("Hallo Welt");
      expect(html).not.toContain("Ein genauerer Blick.");
    });

    test("pathname einer bekannten Page rendert die Page-Sektionen statt der Startseiten-Sektionen", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={dataWithPage} pathname="/leistungen-im-detail" />
      );
      // "B" (Page-Service) statt "A" (Startseiten-Service) — Hero (nur
      // Startseite) fehlt.
      expect(html).toContain(">B<");
      expect(html).not.toContain("Hallo Welt");
    });

    test("Page vorhanden, aber addOns.subpages nicht gebucht → Startseite statt Page (Gating, Plan B6 Task 6)", () => {
      const { addOns: _a, ...ungated } = dataWithPage;
      const html = renderToStaticMarkup(
        <SiteRenderer data={ungated} pathname="/leistungen-im-detail" />
      );
      expect(html).toContain("Hallo Welt");
      expect(html).not.toContain("Ein genauerer Blick.");
      expect(html).not.toContain('href="/leistungen-im-detail"');
    });

    test("unbekannter pathname (keine Page) rendert die Startseite, kein Page-Header", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={dataWithPage} pathname="/nicht-vorhanden" />
      );
      expect(html).toContain("Hallo Welt");
      expect(html).not.toContain("Ein genauerer Blick.");
    });

    test("Page ohne eigene pageHeader-Sektion → kein Page-Header", () => {
      const withoutHeader: WebsiteDataV2 = {
        ...dataWithPage,
        pages: [
          {
            ...dataWithPage.pages![0],
            sections: [
              {
                type: "services",
                headline: "Leistungen",
                items: [{ title: "B" }],
              },
            ],
          },
        ],
      };
      const html = renderToStaticMarkup(
        <SiteRenderer data={withoutHeader} pathname="/leistungen-im-detail" />
      );
      expect(html).toContain(">B<");
      expect(html).not.toContain("Ein genauerer Blick.");
    });
  });
});

describe("Bewegung je Designsystem", () => {
  test("SYSTEM_MOTION deckt genau SYSTEMS_WITH_MOTION ab", () => {
    expect(Object.keys(SYSTEM_MOTION).sort()).toEqual(
      [...SYSTEMS_WITH_MOTION].sort()
    );
  });
});
