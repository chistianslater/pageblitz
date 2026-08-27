import { describe, expect, test } from "vitest";
import { SITE_ENHANCER_JS } from "./siteEnhancer";

describe("Site Enhancer Lightbox", () => {
  test("lässt den Hero aus dem Scroll-Reveal heraus", () => {
    expect(SITE_ENHANCER_JS).toContain(
      '.pb-site section:not(:first-of-type)'
    );
  });

  test("hat einen animierbaren Open-/Close-Lifecycle", () => {
    expect(SITE_ENHANCER_JS).toContain('classList.add("pb-lb-open")');
    expect(SITE_ENHANCER_JS).toContain('classList.remove("pb-lb-open")');
    expect(SITE_ENHANCER_JS).toContain("setTimeout(finishClose,280)");
    expect(SITE_ENHANCER_JS).toContain('setAttribute("aria-hidden","false")');
  });

  test("unterstützt Crossfade, Swipe, Tastatur und Fokusfalle", () => {
    expect(SITE_ENHANCER_JS).toContain("pb-lb-changing");
    expect(SITE_ENHANCER_JS).toContain('"touchstart"');
    expect(SITE_ENHANCER_JS).toContain("Math.abs(dx)>50");
    expect(SITE_ENHANCER_JS).toContain('e.key==="ArrowRight"');
    expect(SITE_ENHANCER_JS).toContain('e.key==="Tab"');
    expect(SITE_ENHANCER_JS).toContain('e.key==="Enter"||e.key===" "');
    expect(SITE_ENHANCER_JS).toContain('setAttribute("role","button")');
  });

  test("bleibt valides Inline-JavaScript", () => {
    expect(() => new Function(SITE_ENHANCER_JS)).not.toThrow();
    expect(SITE_ENHANCER_JS).not.toContain("</script>");
  });
});
