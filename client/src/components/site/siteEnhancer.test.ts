// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { SITE_ENHANCER_JS } from "./siteEnhancer";

describe("Site Enhancer Lightbox", () => {
  test("lässt den Hero aus dem Scroll-Reveal heraus", () => {
    expect(SITE_ENHANCER_JS).toContain(".pb-site section:not(:first-of-type)");
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

  /**
   * jsdom kennt kein matchMedia; der Enhancer fragt gleich in der ersten
   * Zeile nach `prefers-reduced-motion`. Ohne die Attrappe bricht er ab,
   * bevor er das Badge überhaupt anfasst.
   */
  function enhancerAusfuehren(): void {
    (window as unknown as { matchMedia: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
    new Function(SITE_ENHANCER_JS)();
  }

  test("hängt das Branding-Badge in den Seitenfuß, nicht in eine Bewertung", () => {
    // Betreiber-Befund 2026-09-13: Das Badge stand mitten in einer
    // Kundenstimme. Ursache war querySelector auf den ERSTEN <footer> —
    // werkbank und atelier setzen einen <footer> in die Bewertungskarte.
    document.body.innerHTML = `
      <div class="pb-site">
        <section id="bewertungen">
          <blockquote><p>Sehr zufrieden.</p><footer>Maria K.</footer></blockquote>
        </section>
        <footer class="pb-wb-footer"><span>Impressum</span></footer>
      </div>
      <a class="pb-made-with" href="https://pageblitz.de">Mit ♥ erstellt mit Pageblitz</a>`;
    enhancerAusfuehren();
    const badge = document.querySelector(".pb-made-with")!;
    expect(badge.parentElement?.className).toBe("pb-wb-footer");
    expect(badge.closest("blockquote")).toBeNull();
  });

  test("kommt ohne Seitenfuß aus, statt zu werfen", () => {
    // Ohne passenden <footer> bleibt das Badge, wo es steht — die schmale
    // Zeile unter der Seite ist der dokumentierte Fallback.
    document.body.innerHTML = `
      <div class="pb-site"><section><p>Ohne Fuß</p></section></div>
      <a class="pb-made-with" href="https://pageblitz.de">Pageblitz</a>`;
    expect(() => enhancerAusfuehren()).not.toThrow();
    expect(document.querySelector(".pb-made-with")?.parentElement).toBe(
      document.body
    );
  });

  test("bleibt valides Inline-JavaScript", () => {
    expect(() => new Function(SITE_ENHANCER_JS)).not.toThrow();
    expect(SITE_ENHANCER_JS).not.toContain("</script>");
  });
});
