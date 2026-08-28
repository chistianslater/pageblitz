import { describe, expect, test } from "vitest";
import {
  FUNNEL_SESSION_STORAGE_KEY,
  getFunnelSessionKey,
  isFunnelSessionKey,
} from "./studioFunnel";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = { ...initial };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
    getItem(key: string) {
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
    removeItem(key: string) {
      delete data[key];
    },
    key() {
      return null;
    },
  };
}

describe("getFunnelSessionKey", () => {
  test("ohne Storage → null", () => {
    expect(getFunnelSessionKey(null)).toBeNull();
  });

  test("legt einen 64-Hex-Key an und liest ihn idempotent", () => {
    const storage = memoryStorage();
    const first = getFunnelSessionKey(storage);
    const second = getFunnelSessionKey(storage);
    expect(first).toEqual(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(storage.getItem(FUNNEL_SESSION_STORAGE_KEY)).toBe(first);
  });

  test("ungültigen Alt-Wert ersetzt er", () => {
    const storage = memoryStorage({ [FUNNEL_SESSION_STORAGE_KEY]: "nope" });
    const next = getFunnelSessionKey(storage);
    expect(isFunnelSessionKey(next ?? "")).toBe(true);
    expect(next).not.toBe("nope");
  });
});
