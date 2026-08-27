import { describe, expect, test } from "vitest";
import { MOTION_CSS } from "./motionCss";

describe("pack-spezifische Motion-Grundlage", () => {
  test("stellt Reveal-Achsen als überschreibbare Variablen bereit", () => {
    for (const token of [
      "--pb-enter-x",
      "--pb-enter-y",
      "--pb-enter-scale",
      "--pb-enter-blur",
    ]) {
      expect(MOTION_CSS).toContain(token);
    }
  });

  test("überlässt den Hero dem Pack und revealed erst folgende Sektionen", () => {
    expect(MOTION_CSS).toContain("section:not(:first-of-type)");
    expect(MOTION_CSS).not.toContain("pb-hero-in");
    expect(MOTION_CSS).not.toContain(".pb-site h1{animation:");
  });

  test("animiert nur performante visuelle Eigenschaften und respektiert Reduced Motion", () => {
    expect(MOTION_CSS).toContain("translate3d");
    expect(MOTION_CSS).toContain("prefers-reduced-motion:no-preference");
    expect(MOTION_CSS).toContain("prefers-reduced-motion:reduce");
    expect(MOTION_CSS).not.toContain("transition:all");
  });

  test("hält Sprungziele unter sticky Navigationen sichtbar", () => {
    expect(MOTION_CSS).toContain(":is(section,header)[id]{scroll-margin-top:");
  });

  test("animiert Lightbox und Bildwechsel in beide Richtungen", () => {
    expect(MOTION_CSS).toContain(".pb-lb.pb-lb-open");
    expect(MOTION_CSS).toContain(".pb-lb-img.pb-lb-changing");
    expect(MOTION_CSS).toContain("visibility .28s step-end");
  });
});
