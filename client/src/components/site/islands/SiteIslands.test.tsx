import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getFixture } from "../../../../../shared/siteContract/fixtures";
import { hasActiveFeatures, SiteIslands } from "./SiteIslands";

describe("hasActiveFeatures", () => {
  test("false, wenn features fehlt", () => {
    const data = getFixture("werkbank", "full");
    expect(hasActiveFeatures(data)).toBe(false);
  });

  test("false, wenn alle Feature-Flags auf false stehen", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { contactForm: false, aiChat: false, booking: false },
    };
    expect(hasActiveFeatures(data)).toBe(false);
  });

  test("true, wenn mindestens ein Feature-Flag aktiv ist", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { contactForm: true },
    };
    expect(hasActiveFeatures(data)).toBe(true);
  });

  test("true für die features-Fixture (alle drei aktiv)", () => {
    const data = getFixture("werkbank", "features");
    expect(hasActiveFeatures(data)).toBe(true);
  });
});

describe("SiteIslands", () => {
  test("rendert nichts, wenn keine Features aktiv sind", () => {
    const data = getFixture("werkbank", "full");
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" />
    );
    expect(html).toBe("");
  });

  test("rendert nichts ohne Slug, selbst wenn Features aktiv sind", () => {
    const data = getFixture("werkbank", "features");
    const html = renderToStaticMarkup(<SiteIslands data={data} slug="" />);
    expect(html).toBe("");
  });

  test("enthält ein <style>-Tag mit dem Inseln-CSS, wenn ein Slug vorliegt", () => {
    const data = getFixture("werkbank", "features");
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" />
    );
    expect(html).toMatch(/<style>[^<]*\.pb-island-form\{/);
  });

  test("rendert nur die aktive Insel (nur contactForm)", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { contactForm: true },
    };
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" basePath="/site/brandt" />
    );
    expect(html).toContain('data-island="contact"');
    expect(html).not.toContain('data-island="chat"');
    expect(html).not.toContain('data-island="booking"');
  });

  test("rendert alle drei Inseln mit korrekten data-Attributen (features-Fixture)", () => {
    const data = getFixture("werkbank", "features");
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" basePath="/site/brandt" />
    );
    expect(html).toContain('data-island="contact"');
    expect(html).toContain('data-island="chat"');
    expect(html).toContain('data-island="booking"');
    expect(html).toContain('data-target="#kontakt"');
    expect(html.match(/data-slug="brandt"/g)?.length).toBe(3);
  });

  test("Chat-Insel trägt data-business-name und data-welcome, wenn site.chatWelcomeMessage übergeben wird", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { aiChat: true },
    };
    const html = renderToStaticMarkup(
      <SiteIslands
        data={data}
        slug="brandt"
        site={{ chatWelcomeMessage: "Willkommen bei Brandt!" }}
      />
    );
    expect(html).toContain(`data-business-name="${data.businessName}"`);
    expect(html).toContain('data-welcome="Willkommen bei Brandt!"');
  });

  test("Chat-Insel ohne site-Prop trägt kein data-welcome-Attribut", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { aiChat: true },
    };
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" />
    );
    expect(html).not.toContain("data-welcome=");
  });

  test("Kontaktformular-Markup enthält Honeypot, Datenschutzlink und action auf /api/site/:slug/contact", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      features: { contactForm: true },
    };
    const html = renderToStaticMarkup(
      <SiteIslands data={data} slug="brandt" basePath="/site/brandt" />
    );
    expect(html).toContain('action="/api/site/brandt/contact"');
    expect(html).toContain('name="website_url"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('href="/site/brandt/datenschutz"');
    expect(html).toContain('data-hydrate="contact"');
  });
});
