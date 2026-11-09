// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetPurchaseTracking,
  trackCtaClick,
  trackPurchaseOnce,
} from "./tracking";

describe("Sales-Tracking", () => {
  const gtag = vi.fn();
  const consentStorage = new Map<string, string>();

  beforeEach(() => {
    gtag.mockReset();
    (window as any).gtag = gtag;
    sessionStorage.clear();
    consentStorage.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => consentStorage.get(key) ?? null,
      setItem: (key: string, value: string) => consentStorage.set(key, value),
      removeItem: (key: string) => consentStorage.delete(key),
      clear: () => consentStorage.clear(),
    });
    localStorage.setItem(
      "pageblitz_site_consent_v1",
      JSON.stringify({ analytics: true, marketing: false, timestamp: 1 })
    );
    history.replaceState(null, "", "/");
  });

  it("sendet CTA-Text und Pfad an GA4", () => {
    trackCtaClick("  Kostenlos starten  ");

    expect(gtag).toHaveBeenCalledWith("event", "cta_clicked", {
      cta_text: "Kostenlos starten",
      cta_location: "/",
      transport_type: "beacon",
    });
  });

  it("sendet ohne Analytics-Einwilligung kein CTA-Ereignis", () => {
    localStorage.clear();
    trackCtaClick("Kostenlos starten");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("sendet purchase je Checkout nur einmal und lässt einen neuen Checkout zu", () => {
    expect(trackPurchaseOnce()).toBe(true);
    expect(trackPurchaseOnce()).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);

    resetPurchaseTracking();
    expect(trackPurchaseOnce()).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});
