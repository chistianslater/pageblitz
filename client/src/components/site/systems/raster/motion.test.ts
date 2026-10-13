import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { RASTER_CSS } from "./css";
import { RASTER_MOTION_CSS } from "./motionCss";
import { mountRasterMotion } from "./motion";
import { rasterDoc, TEST_NOW } from "./testkit";

/** Alle `@media (prefers-reduced-motion: no-preference){…}`-Blöcke entfernen. */
function outsideNoPreference(css: string): string {
  return css.replace(
    /@media \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/g,
    ""
  );
}

describe("Raster-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor dem Endmarker", () => {
    const i = RASTER_CSS.indexOf(RASTER_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(RASTER_CSS.indexOf("/* ende raster */"));
  });

  test("Startzustände nur unter data-rs-ready und ohne reduzierte Bewegung", () => {
    expect(RASTER_CSS).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)\{[^]*\[data-rs-ready\]/
    );
    const outside = outsideNoPreference(RASTER_CSS);
    // Wächter: das Muster muss den Bewegungsblock wirklich treffen, sonst
    // prüften die Erwartungen unten ins Leere.
    expect(outside.length).toBeLessThan(
      RASTER_CSS.length - RASTER_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-rs-ready|data-rs-in/);
    expect(outside).not.toMatch(/rs-mask|rs-rise|rs-settle|rs-cover|rs-dim/);
    expect(outside).not.toMatch(/animation-timeline|view-timeline/);
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset\(0[^)]*100%/);
  });

  test("Abschnitte: Startzustand nur, solange data-rs-in fehlt", () => {
    expect(RASTER_MOTION_CSS).toMatch(
      /\.pb-raster\[data-rs-ready\] \.rs-sec:not\(\[data-rs-in\]\)>\.rs-wrap:first-child\{opacity:0;transform:translateY\(var\(--sys-space-s\)\)\}/
    );
  });

  test("nur transform, opacity, clip-path; eine Kurve laut Systemblatt", () => {
    const transitions = RASTER_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background/
      );
    const frames =
      RASTER_MOTION_CSS.match(/@keyframes [\w-]+\{[^]*?\}\}/g) ?? [];
    expect(frames.length).toBeGreaterThanOrEqual(4);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map(m => m[1]);
      for (const p of props)
        expect(["transform", "opacity", "clip-path"]).toContain(p);
    }
    expect(RASTER_MOTION_CSS).toContain("cubic-bezier(.23,1,.32,1)");
    expect(RASTER_MOTION_CSS).not.toMatch(/cubic-bezier\((?!\.23,1,\.32,1\))/);
    expect(RASTER_MOTION_CSS).not.toMatch(/will-change/);
  });

  test("Wortmarke: Masken-Reveal, Dauer wächst je Zeile um 60 ms, ohne Rest-Clip", () => {
    expect(RASTER_MOTION_CSS).toMatch(
      /\.rs-wordmark\{animation:rs-mask calc\(700ms \+ 60ms \* \(var\(--rs-wm-lines,1\) - 1\)\)[^;}]*backwards/
    );
    const mask = RASTER_MOTION_CSS.match(/@keyframes rs-mask\{[^]*?\}\}/)![0];
    expect(mask).toMatch(/from\{clip-path:inset\(0 [^)]*100%/);
    expect(mask).not.toMatch(/opacity/);
  });

  test("Fotos (LCP) nie opacity 0 — nur scale(1.04) → 1", () => {
    const settle = RASTER_MOTION_CSS.match(
      /@keyframes rs-settle\{[^]*?\}\}/
    )![0];
    expect(settle).toContain("transform:scale(1.04)");
    expect(settle).not.toMatch(/opacity|clip-path/);
    expect(RASTER_MOTION_CSS).toMatch(
      /\.rs-entry-bg,[^{]*\.rs-entry-plate img\{animation:rs-settle 900ms/
    );
  });

  test("Bänder: Abdunkeln/Skalieren nur mit Scroll-Zeitleiste, nie beim Fließen", () => {
    expect(RASTER_MOTION_CSS).toMatch(
      /@supports \(animation-timeline: view\(\)\)\{/
    );
    const supports = RASTER_MOTION_CSS.slice(
      RASTER_MOTION_CSS.indexOf("@supports (animation-timeline: view())")
    );
    expect(supports).toMatch(
      /timeline-scope:--rs-b2,--rs-b3,--rs-b4,--rs-b5,--rs-b6/
    );
    expect(supports).toMatch(
      /\.rs-band:nth-child\(2\)\{view-timeline-name:--rs-b2\}/
    );
    expect(supports).toMatch(
      /\.rs-band:nth-child\(1\)[^{]*\{animation-timeline:--rs-b2\}/
    );
    // einzelnes Band und fließende Bänder (Handy/breit) bleiben ohne Effekt
    expect(supports).toMatch(
      /\.rs-bands--one>\.rs-band[^{]*\{animation:none\}/
    );
    expect(supports).toMatch(
      /@media \(max-width:55\.99rem\)\{[^}]*\.rs-bands--flow>\.rs-band[^{]*\{animation:none\}/
    );
    expect(supports).toMatch(
      /@media \(min-width:56\.25rem\)\{[^}]*\.rs-bands--flow-wide>\.rs-band[^{]*\{animation:none\}/
    );
    // kein Scroll-Listener-Ersatz: keine JS-Variable steuert die Bänder
    expect(supports).not.toMatch(/var\(--rs-band-p/);
  });

  test("Reduzierte Bewegung: Bänder stapeln nicht (Systemblatt 08, Regel 7)", () => {
    expect(RASTER_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{[^]*\.pb-raster \.rs-band\{position:relative\}/
    );
  });

  test("Keine festen Pixel in der Bewegung", () => {
    expect(RASTER_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
  });

  test("Wurzel trägt pb-raster (Motion-Bundle sucht .pb-raster)", () => {
    const html = renderToStaticMarkup(
      React.createElement(SiteRenderer, {
        data: rasterDoc(),
        now: TEST_NOW,
      } as never)
    );
    expect(html).toMatch(/<div class="pb-site pb-raster"/);
    // SSR-Markup trägt keinen Startzustand: erst das Script setzt ihn.
    expect(html).not.toMatch(/<[^>]*\sdata-rs-(ready|in)[\s=>]/);
  });

  test("Motion-Bundle-Einstieg montiert Raster neben Journal", () => {
    expect(ISLAND_MOTION.raster).toBe(mountRasterMotion);
    expect(ISLAND_MOTION.journal).toBeDefined();
  });
});

/** Kleine DOM-Attrappe: nur, was mountRasterMotion anfasst. */
function el(extra: Record<string, unknown> = {}) {
  const attrs = new Map<string, string>();
  const props = new Map<string, string>();
  return {
    attrs,
    props,
    style: { setProperty: (k: string, v: string) => props.set(k, v) },
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    removeAttribute: (k: string) => attrs.delete(k),
    ...extra,
  };
}

describe("mountRasterMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  function setup(height = 300, lineHeight = "96px") {
    const sections = [el(), el()];
    const fit = el();
    const wordmark = el({
      parentElement: fit,
      getBoundingClientRect: () => ({ height }),
    });
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".rs-sec" ? sections : []),
      querySelector: (sel: string) =>
        sel === ".rs-entry .rs-wordmark" ? wordmark : null,
    });
    vi.stubGlobal("getComputedStyle", () => ({ lineHeight }));
    return { root, sections, fit };
  }

  test("beobachtet Abschnitte einmalig, misst Zeilen, setzt data-rs-ready", () => {
    const { root, sections, fit } = setup(300, "96px");
    let cb: (e: unknown[]) => void = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(
          f: typeof cb,
          opts: { threshold: number; rootMargin: string }
        ) {
          cb = f;
          expect(opts.threshold).toBe(0);
          expect(opts.rootMargin).toBe("0px 0px -15% 0px");
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      }
    );
    let frame: (() => void) | undefined;
    vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
      frame = f;
      return 7;
    });
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const stop = mountRasterMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-rs-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-rs-ready")).toBe(true);
    // 300 / 96 ≈ 3 Zeilen
    expect(fit.props.get("--rs-wm-lines")).toBe("3");
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-rs-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-rs-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  test("ohne IntersectionObserver sind Abschnitte sofort sichtbar", () => {
    const { root, sections } = setup();
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountRasterMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-rs-in"))).toBe(true);
  });

  test("Zeilenzahl ohne messbare Zeilenhöhe: 1; begrenzt auf 6", () => {
    for (const [h, lh, want] of [
      [300, "normal", "1"],
      [2000, "50px", "6"],
    ] as const) {
      const { root, fit } = setup(h, lh);
      vi.stubGlobal("IntersectionObserver", undefined);
      vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
        f();
        return 0;
      });
      vi.stubGlobal("cancelAnimationFrame", vi.fn());
      mountRasterMotion(root as unknown as HTMLElement);
      expect(fit.props.get("--rs-wm-lines")).toBe(want);
    }
  });

  test("ohne Einstieg (Unterseite) läuft alles ohne Fehler", () => {
    const root = el({ querySelectorAll: () => [], querySelector: () => null });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
      f();
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    expect(() =>
      mountRasterMotion(root as unknown as HTMLElement)()
    ).not.toThrow();
    expect(root.attrs.has("data-rs-ready")).toBe(true);
  });
});
