import { afterEach, describe, expect, test, vi } from "vitest";
import {
  TAX_RATE_ENV_KEY,
  resetTaxRateWarningForTests,
  resolveTaxRateId,
  taxRateIds,
} from "./stripeTax";

afterEach(() => {
  resetTaxRateWarningForTests();
  vi.restoreAllMocks();
});

describe("resolveTaxRateId", () => {
  test("liest STRIPE_TAX_RATE_ID (getrimmt)", () => {
    expect(TAX_RATE_ENV_KEY).toBe("STRIPE_TAX_RATE_ID");
    expect(resolveTaxRateId({ STRIPE_TAX_RATE_ID: "  txr_abc " })).toBe(
      "txr_abc"
    );
    expect(taxRateIds({ STRIPE_TAX_RATE_ID: "txr_abc" })).toEqual(["txr_abc"]);
  });

  test("fehlt die Env: null, leere Liste und genau EINE Warnung pro Prozess", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveTaxRateId({})).toBeNull();
    expect(taxRateIds({ STRIPE_TAX_RATE_ID: "  " })).toEqual([]);
    expect(resolveTaxRateId({})).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("STRIPE_TAX_RATE_ID");
  });
});
