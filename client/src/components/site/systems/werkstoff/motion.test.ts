import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { WERKSTOFF_CSS } from "./css";
import { WERKSTOFF_MOTION_CSS } from "./motionCss";
import { mountWerkstoffMotion } from "./motion";
import { TEST_NOW, werkstoffDoc } from "./testkit";

/** Alle `@media (prefers-reduced-motion: no-preference){…}`-Blöcke entfernen. */
function outsideNoPreference(css: string): string {
  return css.replace(
    /@media screen and \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/g,
    ""
  );
}

describe("Werkstoff-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor dem Endmarker", () => {
    const i = WERKSTOFF_CSS.indexOf(WERKSTOFF_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(WERKSTOFF_CSS.indexOf("/* ende werkstoff */"));
  });

  test("Wächter: Startzustände nur unter data-ws-ready und ohne reduzierte Bewegung", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /@media screen and \(prefers-reduced-motion: no-preference\)\{[^]*\[data-ws-ready\]/
    );
    const outside = outsideNoPreference(WERKSTOFF_CSS);
    // Das Muster muss den Bewegungsblock wirklich treffen.
    expect(outside.length).toBeLessThan(
      WERKSTOFF_CSS.length - WERKSTOFF_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-ws-ready|data-ws-in/);
    expect(outside).not.toMatch(/ws-reveal|ws-rise|ws-slide/);
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset\([^)]*100%/);
    // Jede Regel im Block beginnt mit dem ready-Selektor (oder ist @keyframes).
    const block = WERKSTOFF_MOTION_CSS.slice(
      WERKSTOFF_MOTION_CSS.indexOf("{") + 1
    );
    const rules = block
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && l !== "}" && !l.startsWith("@keyframes"));
    for (const r of rules)
      for (const sel of r.slice(0, r.indexOf("{")).split(","))
        expect(sel.trim()).toMatch(/^\.pb-werkstoff\[data-ws-ready\] /);
  });

  test("Abschnitte: Startzustand nur, solange data-ws-in fehlt", () => {
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.pb-werkstoff\[data-ws-ready\] \.ws-sec:not\(\[data-ws-in\]\)>\.ws-wrap:first-child[^{]*\{opacity:0;transform:translateY\(var\(--sys-space-s\)\)\}/
    );
    const hidden = WERKSTOFF_MOTION_CSS.match(/[^\n]*opacity:0[^\n]*/g) ?? [];
    for (const h of hidden.filter(l => !l.includes("@keyframes")))
      expect(h).toContain(":not([data-ws-in])");
  });

  test("nur transform, opacity, clip-path; eine Kurve laut Systemblatt", () => {
    const transitions = WERKSTOFF_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background/
      );
    const frames =
      WERKSTOFF_MOTION_CSS.match(/@keyframes [\w-]+\{[^]*?\}\}/g) ?? [];
    expect(frames.length).toBe(3);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map(m => m[1]);
      for (const p of props)
        expect(["transform", "opacity", "clip-path"]).toContain(p);
    }
    expect(WERKSTOFF_MOTION_CSS).toContain("cubic-bezier(.23,1,.32,1)");
    expect(WERKSTOFF_MOTION_CSS).not.toMatch(
      /cubic-bezier\((?!\.23,1,\.32,1\))/
    );
    expect(WERKSTOFF_MOTION_CSS).not.toMatch(/will-change/);
  });

  test("Einstieg: Überschrift 560 ms freigelegt, Zettel 120 ms später", () => {
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-entry-head,[^{]*\.ws-entry-fit,[^{]*\.ws-entry-figure\{animation:ws-reveal 560ms/
    );
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-entry-media \.ws-slip\{animation:ws-rise 500ms [^;]* 120ms backwards\}/
    );
    const reveal = WERKSTOFF_MOTION_CSS.match(
      /@keyframes ws-reveal\{[^]*?\}\}/
    )![0];
    expect(reveal).toMatch(/from\{clip-path:inset\(0 [^)]*100%/);
    expect(reveal).not.toMatch(/opacity/);
  });

  test("Fotos (LCP) werden nie animiert oder versteckt", () => {
    expect(WERKSTOFF_MOTION_CSS).not.toMatch(
      /ws-entry-img|ws-entry-crop|ws-steps-photo|ws-about-photo|ws-bench|img/
    );
  });

  test("Ziffern: 6. und 7. Schritt fallen nicht auf 120 ms zurück", () => {
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-step:nth-child\(n\+5\) \.ws-step-no\{animation-delay:440ms\}/
    );
  });

  test("Ziffern 1·2·3: gleiche Freilegung beim Hereinscrollen, gestaffelt", () => {
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-sec\[data-ws-in\] \.ws-step-no\{animation:ws-reveal 560ms/
    );
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-step:nth-child\(2\) \.ws-step-no\{animation-delay:200ms\}/
    );
    // Ziffer 1 beginnt zuerst: Grundverzögerung 120 ms, dann je +80 ms.
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-sec\[data-ws-in\] \.ws-step-no\{animation:ws-reveal 560ms [^;]* 120ms backwards\}/
    );
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-step:nth-child\(3\) \.ws-step-no\{animation-delay:280ms\}/
    );
  });

  test("Drucken: Startzustände gelten nur am Bildschirm", () => {
    expect(WERKSTOFF_MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference){"
    );
    expect(WERKSTOFF_MOTION_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: no-preference\)/
    );
  });

  test("Zeitleiste: Versatz als Animation, bleibt nach dem Aufdecken nicht hängen", () => {
    expect(WERKSTOFF_MOTION_CSS).not.toMatch(/transition-delay/);
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-sec\[data-ws-in\] \.ws-day-card\{animation:ws-slide 500ms/
    );
    expect(WERKSTOFF_MOTION_CSS).toMatch(
      /\.ws-day-card:nth-child\(2\)\{animation-delay:60ms\}/
    );
  });

  test("Keine festen Pixel in der Bewegung", () => {
    expect(WERKSTOFF_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
  });

  test("Reduzierte Bewegung: alles aus (Systemblatt 08, Regel 8)", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.pb-werkstoff \*[^}]*animation:none!important\}/
    );
  });

  test("Fragen: Plus dreht sich zum Minus (200 ms, Systemblatt-Bild), Antwort ohne Höhenanimation", () => {
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-faq-sign::before,[^{]*::after\{[^}]*transition:transform 200ms\}/
    );
    expect(WERKSTOFF_CSS).toMatch(
      /\.ws-faq-item\[open\] \.ws-faq-sign::after\{transform:translate\(-50%,-50%\)\}/
    );
    expect(WERKSTOFF_CSS).not.toMatch(/ws-faq-a\{[^}]*transition/);
  });

  test("Wurzel trägt pb-werkstoff, SSR ohne Startzustand", () => {
    const html = renderToStaticMarkup(
      React.createElement(SiteRenderer, {
        data: werkstoffDoc(),
        now: TEST_NOW,
      } as never)
    );
    expect(html).toMatch(/<div class="pb-site pb-werkstoff"/);
    expect(html).not.toMatch(/<[^>]*\sdata-ws-(ready|in)[\s=>]/);
  });

  test("Motion-Bundle-Einstieg montiert Werkstoff neben Journal und Raster", () => {
    expect(ISLAND_MOTION.werkstoff).toBe(mountWerkstoffMotion);
    expect(ISLAND_MOTION.raster).toBeDefined();
  });
});

/** Kleine DOM-Attrappe: nur, was mountWerkstoffMotion anfasst. */
function el(extra: Record<string, unknown> = {}) {
  const attrs = new Map<string, string>();
  return {
    attrs,
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    ...extra,
  };
}

describe("mountWerkstoffMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Abschnitte einmalig, setzt data-ws-ready nach einem Frame", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".ws-sec" ? sections : []),
    });
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
      return 9;
    });
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const stop = mountWerkstoffMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-ws-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-ws-ready")).toBe(true);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-ws-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-ws-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(9);
  });

  test("ohne IntersectionObserver sind Abschnitte sofort sichtbar", () => {
    const sections = [el(), el()];
    const root = el({ querySelectorAll: () => sections });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountWerkstoffMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-ws-in"))).toBe(true);
  });
});
