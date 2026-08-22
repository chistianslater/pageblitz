import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import WebsiteRenderer from "./WebsiteRenderer";
import { getFixture } from "@shared/siteContract/fixtures";

describe("WebsiteRenderer (v2-only)", () => {
  test("v2-Dokument → SiteRenderer rendert Business-Namen", () => {
    const data = getFixture("werkbank", "minimal");
    const html = renderToStaticMarkup(
      <WebsiteRenderer websiteData={data} slug="test" />
    );
    expect(html).toContain(data.businessName);
  });
  test("v1-/ungültiges Dokument → Platzhalter statt Absturz", () => {
    const html = renderToStaticMarkup(
      <WebsiteRenderer
        websiteData={{ businessName: "Alt GmbH", sections: [] } as any}
        slug="alt"
      />
    );
    expect(html).toContain("wird gerade aktualisiert");
    expect(html).toContain("Alt GmbH");
  });
  test("null/undefined/String → Platzhalter ohne Absturz", () => {
    for (const bad of [null, undefined, "kaputt"]) {
      const html = renderToStaticMarkup(
        <WebsiteRenderer websiteData={bad as unknown} slug="x" />
      );
      expect(html).toContain("wird gerade aktualisiert");
    }
  });
  test("chatWelcomeMessage wird an die Inseln durchgereicht", () => {
    const data = getFixture("werkbank", "features");
    const html = renderToStaticMarkup(
      <WebsiteRenderer
        websiteData={data}
        slug="test"
        islandsMode="live"
        site={{ chatWelcomeMessage: "Moin aus der Werkbank!" }}
      />
    );
    expect(html).toContain("Moin aus der Werkbank!");
  });
});
