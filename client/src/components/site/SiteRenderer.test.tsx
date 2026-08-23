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
    // Signal-Akzent von werkbank wurde in B4c Task 7 (a11y-Pass) von
    // #FF4D00 auf #A83600 gedunkelt (Kontrast gegen Canvas/CTA war <4,5:1).
    expect(html).toContain("--pb-accent:#A83600");
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
  });
});
