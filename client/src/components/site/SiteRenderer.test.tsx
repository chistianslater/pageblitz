import { describe, expect, test, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";
import { SiteRenderer } from "./SiteRenderer";
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
  test("rendert registriertes Pack mit CSS und CSS-Variablen", () => {
    PACK_MODULES.werkbank = {
      id: "werkbank",
      css: ".pb-test{color:red}",
      Page: ({ data }) => <main>{data.businessName}</main>,
    };
    const html = renderToStaticMarkup(<SiteRenderer data={data} />);
    expect(html).toContain("Probe");
    expect(html).toContain(".pb-test{color:red}");
    // werkbank: Original-Signal als Fläche (B6 Task 9), dunkler
    // Kleintext-Ton `accent-text` separat emittiert.
    expect(html).toContain("--pb-accent:#FF4D00");
    expect(html).toContain("--pb-accent-text:#A83600");
  });
  test("wirft verständlich bei nicht registriertem Pack-Modul", () => {
    delete PACK_MODULES.werkbank;
    expect(() => renderToStaticMarkup(<SiteRenderer data={data} />)).toThrow(
      /Pack-Modul nicht registriert/
    );
  });

  describe("packOverride (Variant-Picker-Preview)", () => {
    beforeEach(() => {
      // Unabhängig davon, was die Tests oben mit PACK_MODULES.werkbank
      // gemacht haben (überschrieben/gelöscht) — hier auf das echte Modul
      // zurücksetzen, damit "gespeicherter Pack bleibt aktiv" unten
      // tatsächlich rendert statt zu werfen.
      PACK_MODULES.werkbank = REAL_WERKBANK_MODULE;
    });

    test("registrierter Override rendert das andere Pack-CSS statt des gespeicherten", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={data} packOverride="kanzlei" />
      );
      expect(html).toContain("pb-kz-");
      expect(html).not.toContain("pb-wb-hero");
      expect(html).toContain("pb-site pb-kanzlei");
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

    test("nicht registrierter Override wird ignoriert — gespeicherter Pack bleibt aktiv", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={data} packOverride={"nicht-registriert" as any} />
      );
      expect(html).toContain("pb-site pb-werkbank");
    });

    test("ohne Override bleibt der gespeicherte Pack aktiv", () => {
      const html = renderToStaticMarkup(<SiteRenderer data={data} />);
      expect(html).toContain("pb-site pb-werkbank");
    });

    test("bestehendes Dokument ohne Profil nutzt ausschließlich handgestaltete Pack-Defaults", () => {
      const html = renderToStaticMarkup(<SiteRenderer data={data} />);
      const root = html.match(/<div[^>]*class="pb-site[^>]*>/)?.[0] ?? "";
      expect(root).not.toContain("data-pb-hero=");
      expect(root).not.toContain("data-pb-services=");
      expect(root).not.toContain("data-pb-density=");
    });

    test("persistiertes Profil landet als Kompositionsattribute am Site-Root", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer
          data={{
            ...data,
            designProfile: {
              version: 1,
              heroLayout: "centered",
              servicesLayout: "grid",
              aboutLayout: "image-left",
              galleryLayout: "mosaic",
              density: "compact",
              imageTreatment: "framed",
              seed: 42,
            },
          }}
        />
      );
      expect(html).toContain('data-pb-hero="centered"');
      expect(html).toContain('data-pb-services="grid"');
      expect(html).toContain('data-pb-about="image-left"');
      expect(html).toContain('data-pb-gallery="mosaic"');
      expect(html).toContain('data-pb-density="compact"');
      expect(html).toContain('data-pb-image="framed"');
      expect(html).toContain('data-pb-services="grid"] #leistungen');
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

    test("pathname einer bekannten Page rendert den pageHeader des Packs (Titel + Intro) — seit Task 4 im Pack-Modul selbst, kein SiteRenderer-Fallback mehr", () => {
      const html = renderToStaticMarkup(
        <SiteRenderer data={dataWithPage} pathname="/leistungen-im-detail" />
      );
      // werkbank rendert die pageHeader-Sektion selbst (Klasse
      // pb-wb-page-header, siehe packs/werkbank/index.tsx) — der generische
      // Fallback in SiteRenderer wurde entfernt (Task 4), sonst gäbe es zwei
      // <h1> (a11y-Regression).
      expect(html).toContain('<header class="pb-wb-page-header">');
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain("Leistungen im Detail");
      expect(html).toContain("Ein genauerer Blick.");
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
