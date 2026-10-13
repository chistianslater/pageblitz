import { afterEach, describe, expect, test, vi } from "vitest";
import {
  TAX_RATE_ENV_KEY,
  isTaxRateError,
  resetTaxRateWarningForTests,
  resolveTaxRateId,
  taxRateIds,
  withTaxRateFallback,
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

describe("withTaxRateFallback", () => {
  const rejection = Object.assign(new Error("No such tax rate: 'txr_x'"), {
    type: "StripeInvalidRequestError",
    code: "resource_missing",
    param: "subscription_data[default_tax_rates][0]",
  });

  test("isTaxRateError erkennt abgelehnte Steuersätze, sonst nichts", () => {
    expect(isTaxRateError(rejection)).toBe(true);
    expect(
      isTaxRateError({ message: "Invalid tax_rates: livemode mismatch" })
    ).toBe(true);
    expect(isTaxRateError(new Error("card_declined"))).toBe(false);
    expect(isTaxRateError({ code: "resource_missing", param: "price" })).toBe(
      false
    );
  });

  test("Ablehnung → einmal Fehler loggen und ohne Steuersatz wiederholen", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const call = vi
      .fn()
      .mockRejectedValueOnce(rejection)
      .mockResolvedValueOnce("ok")
      .mockRejectedValueOnce(rejection)
      .mockResolvedValueOnce("ok2");
    await expect(withTaxRateFallback(["txr_x"], call)).resolves.toBe("ok");
    expect(call.mock.calls).toEqual([[["txr_x"]], [[]]]);
    await expect(withTaxRateFallback(["txr_x"], call)).resolves.toBe("ok2");
    expect(err).toHaveBeenCalledTimes(1);
  });

  test("andere Fehler und Aufrufe ohne Steuersatz werden nicht wiederholt", async () => {
    const call = vi.fn().mockRejectedValue(new Error("card_declined"));
    await expect(withTaxRateFallback(["txr_x"], call)).rejects.toThrow(
      "card_declined"
    );
    expect(call).toHaveBeenCalledTimes(1);
    const call2 = vi.fn().mockRejectedValue(rejection);
    await expect(withTaxRateFallback([], call2)).rejects.toBe(rejection);
    expect(call2).toHaveBeenCalledTimes(1);
  });
});
