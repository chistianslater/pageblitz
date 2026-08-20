import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";
import { SiteRenderer } from "./SiteRenderer";

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
    expect(html).toContain("--pb-accent:#FF4D00");
  });
  test("wirft verständlich bei nicht registriertem Pack-Modul", () => {
    delete PACK_MODULES.werkbank;
    expect(() => renderToStaticMarkup(<SiteRenderer data={data} />)).toThrow(
      /Pack-Modul nicht registriert/
    );
  });
});
