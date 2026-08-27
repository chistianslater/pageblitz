import { afterEach, describe, expect, test, vi } from "vitest";
import { motionSafeScrollBehavior, prefersReducedMotion } from "./motion";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Motion-Präferenz", () => {
  test.each([
    [true, "auto"],
    [false, "smooth"],
  ] as const)(
    "liefert bei reduce=%s Scroll-Verhalten %s",
    (matches, behavior) => {
      vi.stubGlobal("window", {
        matchMedia: vi.fn().mockReturnValue({ matches }),
      });

      expect(prefersReducedMotion()).toBe(matches);
      expect(motionSafeScrollBehavior()).toBe(behavior);
    }
  );
});
