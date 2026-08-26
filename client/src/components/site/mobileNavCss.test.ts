import { describe, expect, test } from "vitest";
import { MOBILE_NAV_CSS } from "./mobileNavCss";

describe("MobileNav CSS", () => {
  test("wechselt bereits auf Tabletbreite zu 44px-Touchzielen", () => {
    expect(MOBILE_NAV_CSS).toContain("@media(max-width:840px)");
    expect(MOBILE_NAV_CSS).toContain("width:44px;height:44px");
    expect(MOBILE_NAV_CSS).toContain("min-height:44px");
  });
});
