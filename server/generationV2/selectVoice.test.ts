import { describe, expect, test, vi } from "vitest";
import { getVoicePool } from "../../shared/textVoices";

describe("selectVoice", () => {
  test("übergibt getVoicePool(category) exakt an die Rotation", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectVoice } = await import("./selectVoice");

    await selectVoice("schreinerei", "handwerk");

    const expectedPool = getVoicePool("schreinerei");
    expect(fn).toHaveBeenCalledWith("handwerk", expectedPool);

    vi.doUnmock("../db");
    vi.resetModules();
  });

  test("Rückgabewert ist ein Element dieses Pools", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectVoice } = await import("./selectVoice");

    const result = await selectVoice("schreinerei", "handwerk");

    expect(getVoicePool("schreinerei")).toContain(result);

    vi.doUnmock("../db");
    vi.resetModules();
  });

  test("unbekannte Branche: Rotation bekommt Fallback als erste von drei Richtungen", async () => {
    const fn = vi.fn(async (_industryKey: string, pool: string[]) => pool[0]);
    vi.doMock("../db", () => ({ getNextLayoutForIndustry: fn }));
    const { selectVoice } = await import("./selectVoice");

    const result = await selectVoice("unbekannte-branche", "default");

    expect(fn).toHaveBeenCalledWith(
      "default",
      getVoicePool("unbekannte-branche")
    );
    expect(result).toBe(getVoicePool("unbekannte-branche")[0]);

    vi.doUnmock("../db");
    vi.resetModules();
  });
});
