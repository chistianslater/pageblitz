import { describe, expect, it } from "vitest";
import {
  renderSeoConsentBody,
  renderSeoTrackingHead,
  SEO_COOKIE_SETTINGS_BUTTON,
} from "./tracking";

describe("SEO consent tracking", () => {
  it("lädt GA4 erst nach Statistik-Einwilligung", () => {
    const html = renderSeoTrackingHead() + renderSeoConsentBody();
    expect(html).toContain("analytics_storage:'denied'");
    expect(html).toContain("if(value.analytics)loadAnalytics()");
    expect(html).toContain("G-3ZF2WR4VWF");
    expect(html).toContain("pageblitz_site_consent_v1");
  });

  it("misst den Übergang zum Builder ohne personenbezogene Daten", () => {
    const html = renderSeoConsentBody();
    expect(html).toContain("cta_clicked");
    expect(html).toContain("cta_location:w.location.pathname");
    expect(html).not.toMatch(/email|phone|token/i);
  });

  it("macht die Auswahl später wieder erreichbar", () => {
    expect(SEO_COOKIE_SETTINGS_BUTTON).toContain("data-pb-cookie-settings");
    expect(renderSeoConsentBody()).toContain("Auswahl speichern");
  });
});
