// server/ssr/renderSite.test.tsx
import { describe, expect, test } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { renderSiteHtml } from "./renderSite";

describe("renderSiteHtml", () => {
  const html = renderSiteHtml(getFixture("werkbank", "full"), {
    origin: "https://brandt.pageblitz.de",
  });
  test("liefert komplettes Dokument mit Meta und Canonical", () => {
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html lang="de">');
    expect(html).toContain("<title>");
    expect(html).toContain(
      'rel="canonical" href="https://brandt.pageblitz.de/"'
    );
  });
  test("enthält LocalBusiness-JSON-LD", () => {
    expect(html).toContain('"@type":"LocalBusiness"');
    expect(html).toContain('"aggregateRating"');
  });
  test("lädt Pack-Fonts über eine css2-URL mit display=swap", () => {
    expect(html).toContain("fonts.googleapis.com/css2?family=Archivo+Black");
    expect(html).toContain("display=swap");
  });
  test("Inhalt ist ohne JS im HTML (Anker vorhanden)", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("Massarbeit");
  });
});
