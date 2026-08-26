import { describe, expect, test } from "vitest";
import { MOTION_CSS } from "./motionCss";

describe("pack-spezifische Motion-Grundlage", () => {
  test("stellt Hero- und Reveal-Achsen als überschreibbare Variablen bereit", () => {
    for (const token of [
      "--pb-hero-dur",
      "--pb-hero-y",
      "--pb-hero-scale",
      "--pb-reveal-x",
      "--pb-reveal-y",
      "--pb-reveal-scale",
      "--pb-reveal-blur",
    ]) {
      expect(MOTION_CSS).toContain(token);
    }
  });

  test("animiert nur performante visuelle Eigenschaften und respektiert Reduced Motion", () => {
    expect(MOTION_CSS).toContain("translate3d");
    expect(MOTION_CSS).toContain("prefers-reduced-motion:no-preference");
    expect(MOTION_CSS).toContain("prefers-reduced-motion:reduce");
    expect(MOTION_CSS).not.toContain("transition:all");
  });
});
