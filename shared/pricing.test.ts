import { describe, expect, test } from "vitest";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  ADDON_PRICE_ENV_KEYS,
  addonPrice,
  BOOKABLE_ADDON_KEYS,
  calcTotalCents,
  FEATURE_ADDON_KEYS,
  formatEuro,
  PRICING,
  sanitizeAddOns,
  SECTION_ADDON_KEYS,
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

  test("sanitizeAddOns lässt alle buchbaren Keys (inkl. team seit Plan B5, subpages seit Plan B6) unverändert", () => {
    const result = sanitizeAddOns({
      contactForm: true,
      gallery: false,
      aiChat: true,
      booking: true,
      team: true,
      subpages: true,
    });
    expect(result).toEqual({
      contactForm: true,
      gallery: false,
      menu: false,
      pricelist: false,
      aiChat: true,
      booking: true,
      team: true,
      subpages: true,
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
      subpages: false,
    });
  });

  test("BOOKABLE_ADDON_KEYS enthält alle acht Extras (seit Plan B5 team, seit Plan B6 subpages)", () => {
    expect(BOOKABLE_ADDON_KEYS).toEqual([
      "contactForm",
      "gallery",
      "menu",
      "pricelist",
      "aiChat",
      "booking",
      "team",
      "subpages",
    ]);
  });

  test("addonPrice(subpages) ist der pauschale Add-on-Preis (3,90 €)", () => {
    expect(addonPrice("subpages")).toBe(390);
  });

  test("ADDON_PRICE_ENV_KEYS: je Add-on genau eine Env-Variable STRIPE_PRICE_ADDON_<KEY> (Plan B6 Task 6, Stripe-Sync)", () => {
    expect(Object.keys(ADDON_PRICE_ENV_KEYS).sort()).toEqual(
      [...ADDON_KEYS].sort()
    );
    for (const key of ADDON_KEYS) {
      expect(ADDON_PRICE_ENV_KEYS[key]).toMatch(/^STRIPE_PRICE_ADDON_[A-Z_]+$/);
    }
    expect(ADDON_PRICE_ENV_KEYS.contactForm).toBe(
      "STRIPE_PRICE_ADDON_CONTACT_FORM"
    );
    expect(ADDON_PRICE_ENV_KEYS.aiChat).toBe("STRIPE_PRICE_ADDON_AI_CHAT");
    // Eindeutig — zwei Add-ons dürfen nie dieselbe Env-Variable teilen.
    expect(new Set(Object.values(ADDON_PRICE_ENV_KEYS)).size).toBe(
      ADDON_KEYS.length
    );
  });

  test("SECTION_ADDON_KEYS (Dokument-addOns) und FEATURE_ADDON_KEYS (Dokument-features) decken zusammen alle acht Keys ab", () => {
    expect(SECTION_ADDON_KEYS).toEqual([
      "gallery",
      "menu",
      "pricelist",
      "team",
      "subpages",
    ]);
    expect(FEATURE_ADDON_KEYS).toEqual([
      "contactForm",
      "aiChat",
      "booking",
      "subpages",
    ]);
    expect(new Set([...SECTION_ADDON_KEYS, ...FEATURE_ADDON_KEYS]).size).toBe(
      ADDON_KEYS.length
    );
  });
});
