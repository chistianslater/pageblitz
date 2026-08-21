// server/ssr/renderSite.test.tsx
import { describe, expect, test } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { renderSiteHtml } from "./renderSite";

describe("renderSiteHtml", () => {
  const { html, status } = renderSiteHtml(getFixture("werkbank", "full"), {
    origin: "https://brandt.pageblitz.de",
  });
  test("liefert komplettes Dokument mit Meta und Canonical, Status 200", () => {
    expect(status).toBe(200);
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
  test("HTML enthält Body-Reset (margin:0) und Canvas-Hintergrundfarbe", () => {
    expect(html).toContain("html,body{margin:0;padding:0}body{background:");
  });
});

describe("renderSiteHtml — Rechtsseiten (Impressum/Datenschutz)", () => {
  test("pathname /impressum mit gefülltem impressumHtml rendert den Legal-Inhalt + Zurück-Link, nicht die Hauptseite, Status 200", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY, Musterstraße 1</p>" },
    };
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(200);
    expect(html).toContain("<p>Firma XY, Musterstraße 1</p>");
    expect(html).toContain('href="/"');
    expect(html).toContain("Zurück");
    expect(html).not.toContain('id="leistungen"');
    expect(html).not.toContain("Massarbeit");
  });

  test("pathname /impressum ohne legal-Feld zeigt den 404-Text mit Status 404", () => {
    const data = getFixture("werkbank", "full");
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(404);
    expect(html).toContain("nicht gefunden");
  });

  test('pathname /impressum mit leerem impressumHtml ("") zeigt trotzdem den 404-Text mit Status 404', () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "" },
    };
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(404);
    expect(html).toContain("nicht gefunden");
  });
});

describe("renderSiteHtml — basePath (/site/:slug-Form)", () => {
  test("Legal-Zurück-Link zeigt mit basePath auf /site/foo statt auf /", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY</p>" },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://pageblitz.de",
      pathname: "/impressum",
      basePath: "/site/foo",
    });
    expect(html).toContain('href="/site/foo"');
    expect(html).not.toContain('href="/"');
  });

  test("ohne basePath zeigt der Legal-Zurück-Link weiterhin auf / (Subdomain-Form)", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY</p>" },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(html).toContain('href="/"');
  });
});

describe("renderSiteHtml — Escaping", () => {
  test('businessName und seo.title mit <script> und " erscheinen nur escaped im Head, JSON-LD enthält kein rohes </script> oder <', () => {
    const base = getFixture("werkbank", "full");
    const data = {
      ...base,
      businessName: '<script>alert(1)</script>"',
      seo: {
        ...base.seo,
        title: '<script>alert(1)</script>"',
      },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;&quot;");

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    expect(jsonLdMatch).not.toBeNull();
    const jsonLd = jsonLdMatch?.[1] ?? "";
    expect(jsonLd).not.toContain("</script>");
    expect(jsonLd).not.toContain("<");
    expect(jsonLd).toContain("\\u003cscript");
  });
});
