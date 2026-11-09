import { describe, expect, it } from "vitest";
import {
  isInternalAnalyticsPath,
  shouldIgnoreAnalyticsReferrer,
} from "./consent";

describe("isInternalAnalyticsPath", () => {
  it.each([
    "/admin",
    "/admin/websites",
    "/admin-login",
    "/design-review",
    "/login",
    "/my-account",
    "/my-website",
    "/welcome-back",
  ])("schließt %s von den Vertriebsdaten aus", pathname => {
    expect(isInternalAnalyticsPath(pathname)).toBe(true);
  });

  it.each([
    "/admin?tab=websites",
    "/login?next=%2Fmy-website",
    "/my-account#billing",
    "/my-website?tab=leads",
  ])("schließt auch Query-/Hash-Varianten %s aus", pathname => {
    expect(isInternalAnalyticsPath(pathname)).toBe(true);
  });

  it("misst die Stripe-Erfolgsrückkehr als Teil des Sales-Funnels", () => {
    expect(isInternalAnalyticsPath("/my-website?checkout=success")).toBe(false);
  });

  it.each(["/", "/start", "/onboarding/abc", "/blog", "/website-erstellen/friseur"])(
    "misst den öffentlichen Funnel auf %s",
    pathname => {
      expect(isInternalAnalyticsPath(pathname)).toBe(false);
    }
  );
});

describe("shouldIgnoreAnalyticsReferrer", () => {
  it("ignoriert ausschließlich den Stripe-Checkout als Referrer", () => {
    expect(
      shouldIgnoreAnalyticsReferrer(
        "https://checkout.stripe.com/c/pay/cs_test_123"
      )
    ).toBe(true);
    expect(shouldIgnoreAnalyticsReferrer("https://www.google.de/search?q=x")).toBe(
      false
    );
    expect(shouldIgnoreAnalyticsReferrer("https://stripe.com/")).toBe(false);
    expect(shouldIgnoreAnalyticsReferrer("kein-url-wert")).toBe(false);
  });
});
