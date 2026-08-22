import { describe, expect, test } from "vitest";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  addonPrice,
  BOOKABLE_ADDON_KEYS,
  calcTotalCents,
  formatEuro,
  PRICING,
  sanitizeAddOns,
} from "./pricing";

describe("pricing", () => {
  test("Basispreise und Add-on-Preise", () => {
    expect(PRICING.base.monthly).toBe(2490);
    expect(PRICING.base.yearly).toBe(1990);
    expect(addonPrice("aiChat")).toBe(990);
    expect(addonPrice("booking")).toBe(490);
    expect(addonPrice("gallery")).toBe(390);
  });
  test("calcTotalCents summiert nur aktive Add-ons", () => {
    expect(calcTotalCents("yearly", {})).toBe(1990);
    expect(
      calcTotalCents("monthly", { gallery: true, aiChat: true, menu: false })
    ).toBe(2490 + 390 + 990);
  });
  test("formatEuro deutsches Format", () => {
    expect(formatEuro(1990)).toBe("19,90 €");
  });
  test("jeder Key hat einen Namen", () => {
    for (const k of ADDON_KEYS) expect(ADDON_NAMES[k]).toBeTruthy();
  });

  test("sanitizeAddOns setzt aiChat/booking/team auf false, bindbare Keys bleiben unverändert", () => {
    const result = sanitizeAddOns({
      contactForm: true,
      gallery: false,
      aiChat: true,
      booking: true,
      team: true,
    });
    expect(result).toEqual({
      contactForm: true,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
    });
  });

  test("sanitizeAddOns ist idempotent bei leerem Input", () => {
    expect(sanitizeAddOns({})).toEqual({
      contactForm: false,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: false,
      booking: false,
      team: false,
    });
  });

  test("BOOKABLE_ADDON_KEYS enthält genau die vier buchbaren Extras", () => {
    expect(BOOKABLE_ADDON_KEYS).toEqual([
      "contactForm",
      "gallery",
      "menu",
      "pricelist",
    ]);
  });
});
