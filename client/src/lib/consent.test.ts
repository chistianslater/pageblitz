import { describe, expect, it } from "vitest";
import { isInternalAnalyticsPath } from "./consent";

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

  it.each(["/", "/start", "/onboarding/abc", "/blog", "/website-erstellen/friseur"])(
    "misst den öffentlichen Funnel auf %s",
    pathname => {
      expect(isInternalAnalyticsPath(pathname)).toBe(false);
    }
  );
});
