import { describe, expect, test, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";
import { SiteRenderer, SYSTEM_MOTION } from "./SiteRenderer";
import { SYSTEMS_WITH_MOTION } from "../../../../shared/designSystems/registry";
// Import-Nebenwirkung: registriert alle Pack-Module (u.a. kanzlei) in
// PACK_MODULES — für die packOverride-Tests unten benötigt.
import "./packs/index";

// Referenz auf das echte werkbank-Modul sichern, BEVOR die Tests unten es
// überschreiben/löschen (vgl. "wirft verständlich bei nicht registriertem
// Pack-Modul") — damit der packOverride-Block es unabhängig von der
// Ausführungsreihenfolge der vorherigen Tests wiederherstellen kann.
const REAL_WERKBANK_MODULE = PACK_MODULES.werkbank;

const data: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Probe",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "Hallo Welt" }],
};

describe("SiteRenderer", () => {
  describe("packOverride (Variant-Picker-Preview)", () => {
    beforeEach(() => {
      // Unabhängig davon, was die Tests oben mit PACK_MODULES.werkbank
      // gemacht haben (überschrieben/gelöscht) — hier auf das echte Modul
      // zurücksetzen, damit "gespeicherter Pack bleibt aktiv" unten
      // tatsächlich rendert statt zu werfen.
      PACK_MODULES.werkbank = REAL_WERKBANK_MODULE;
    });

    test("Inhalte bleiben beim Override erhalten", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={data} packOverride="kanzlei" />
      );
      expect(html).toContain("Probe");
      // kanzlei-Modul zerlegt die Headline in <h1>Hallo <span>Welt</span></h1>
      // (letztes Wort akzentuiert) — daher getrennt statt als ein String.
      expect(html).toContain("Hallo");
      expect(html).toContain("Welt");
    });

    test("explizite Revision 1 ohne Profil nutzt handgestaltete Pack-Defaults", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={{ ...data, designRevision: 1 }} />
      );
      const root = html.match(/<div[^>]*class="pb-site[^>]*>/)?.[0] ?? "";
      expect(root).not.toContain("data-pb-hero=");
      expect(root).not.toContain("data-pb-services=");
      expect(root).not.toContain("data-pb-density=");
    });

  });

  describe("pathname / Unterseiten (Plan B6, Task 3 + Task 4: pageHeader im Pack)", () => {
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

    beforeEach(() => {
      PACK_MODULES.werkbank = REAL_WERKBANK_MODULE;
    });

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
      expect(html).not.toContain('<header class="pb-wb-page-header">');
      expect(html).not.toContain('href="/leistungen-im-detail"');
    });

    test("unbekannter pathname (keine Page) rendert die Startseite, kein Page-Header", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={dataWithPage} pathname="/nicht-vorhanden" />
      );
      expect(html).toContain("Hallo Welt");
      expect(html).not.toContain('<header class="pb-wb-page-header">');
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
      expect(html).not.toContain('<header class="pb-wb-page-header">');
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
