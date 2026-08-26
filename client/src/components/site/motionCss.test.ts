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

  test("hält Sprungziele unter sticky Navigationen sichtbar", () => {
    expect(MOTION_CSS).toContain(
      ":is(section,header)[id]{scroll-margin-top:"
    );
  });

  test("animiert Lightbox und Bildwechsel in beide Richtungen", () => {
    expect(MOTION_CSS).toContain(".pb-lb.pb-lb-open");
    expect(MOTION_CSS).toContain(".pb-lb-img.pb-lb-changing");
    expect(MOTION_CSS).toContain("visibility .28s step-end");
  });
});
