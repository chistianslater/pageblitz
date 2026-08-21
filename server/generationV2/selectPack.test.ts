import { describe, expect, test, vi } from "vitest";
import { getPackPool, FALLBACK_PACK } from "../../shared/stylePacks";

describe("selectPack", () => {
  test("übergibt getPackPool(category) exakt an die Rotation", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectPack } = await import("./selectPack");

    await selectPack("schreinerei", "handwerk");

    const expectedPool = getPackPool("schreinerei");
    expect(fn).toHaveBeenCalledWith("handwerk", expectedPool);

    vi.doUnmock("../db");
    vi.resetModules();
  });

  test("Rückgabewert ist ein Element dieses Pools", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectPack } = await import("./selectPack");

    const result = await selectPack("schreinerei", "handwerk");

    expect(getPackPool("schreinerei")).toContain(result);

    vi.doUnmock("../db");
    vi.resetModules();
  });

  test("unbekannte Branche: Rotation bekommt den Fallback-Pool", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectPack } = await import("./selectPack");

    const result = await selectPack("unbekannte-branche", "default");

    expect(fn).toHaveBeenCalledWith("default", [FALLBACK_PACK]);
    expect(result).toBe(FALLBACK_PACK);

    vi.doUnmock("../db");
    vi.resetModules();
  });
});
