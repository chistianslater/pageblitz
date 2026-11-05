import { describe, expect, test } from "vitest";
import { renderSiteHtml } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../shared/designSystems/apply";
import { RELEASED_SYSTEMS } from "../../shared/designSystems/registry";

const LOGO_URL = "https://cdn.example/logo.png";

describe.each(RELEASED_SYSTEMS)("Firmenlogo in %s", system => {
  test("ersetzt die Textmarke in Kopf und Fuß", () => {
    const base = getFixture("werkbank", "full");
    const doc = withDesignSystem(
      { ...base, logo: { kind: "image" as const, url: LOGO_URL } },
      system
    );
    const html = renderSiteHtml(doc, {
      origin: "https://pageblitz.de",
      pathname: "/",
    }).html;

    expect(
      html.match(new RegExp(`src="${LOGO_URL}"`, "g"))?.length
    ).toBeGreaterThanOrEqual(2);
    expect(html).toContain("pb-site-logo--foot");
    expect(html).toContain(`${doc.businessName} Logo`);
  });

  test("ohne Bildlogo bleibt das bestehende Markup", () => {
    const html = renderSiteHtml(
      withDesignSystem(getFixture("werkbank", "full"), system),
      { origin: "https://pageblitz.de", pathname: "/" }
    ).html;
    expect(html).not.toContain("pb-site-logo");
  });
});
