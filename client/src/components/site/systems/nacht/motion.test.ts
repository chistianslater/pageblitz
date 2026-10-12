import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { NACHT_CSS } from "./css";
import { NACHT_MOTION_CSS } from "./motionCss";
import { mountNachtMotion } from "./motion";
import { hausDoc, noirDoc, render, weinbergDoc } from "./testkit";

const EASE = "cubic-bezier(.23,1,.32,1)";

/** Alle `@media screen and (prefers-reduced-motion: no-preference){…}`-Blöcke entfernen. */
function outsideNoPreference(css: string): string {
  return css.replace(
    /@media screen and \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/g,
    ""
  );
}

/** Regeln des Bewegungsblocks (ohne @keyframes). */
function motionRules(): string[] {
  const block = NACHT_MOTION_CSS.slice(NACHT_MOTION_CSS.indexOf("{") + 1);
  return block
    .split("\n")
    .map(l => l.trim())
    .filter(
      l =>
        l && l !== "}" && !l.startsWith("@keyframes") && !l.startsWith("@media")
    );
}

const keyframes = (name: string) =>
  NACHT_MOTION_CSS.match(new RegExp(`@keyframes ${name}\\{[^]*?\\}\\}`))![0];

describe("Nacht-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor der Abschaltung bei reduzierter Bewegung und dem Endmarker", () => {
    const i = NACHT_CSS.indexOf(NACHT_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(
      NACHT_CSS.indexOf("@media (prefers-reduced-motion:reduce)")
    );
    expect(i).toBeLessThan(NACHT_CSS.indexOf("/* ende nacht */"));
  });

  test("Wächter: Startzustände nur unter data-nc-ready und ohne reduzierte Bewegung", () => {
    const outside = outsideNoPreference(NACHT_CSS);
    // Das Muster muss den Bewegungsblock wirklich treffen.
    expect(outside.length).toBeLessThan(
      NACHT_CSS.length - NACHT_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-nc-ready|data-nc-in/);
    expect(outside).not.toMatch(/nc-settle|nc-mask|@keyframes nc-/);
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset/);
    // Jede Regel im Block beginnt mit dem ready-Selektor.
    const rules = motionRules();
    expect(rules.length).toBeGreaterThan(3);
    for (const r of rules)
      for (const sel of r.slice(0, r.indexOf("{")).split(","))
        expect(sel.trim()).toMatch(/^\.pb-nacht\[data-nc-ready\] /);
  });

  test("Kapitel: versteckt nur, solange data-nc-in fehlt (24 px, 900 ms), Insel geht mit", () => {
    const hidden = motionRules().filter(r => /opacity:0[;}]/.test(r));
    expect(hidden).toEqual([
      ".pb-nacht[data-nc-ready] .nc-sec:not([data-nc-in])>.nc-wrap,.pb-nacht[data-nc-ready] .nc-sec:not([data-nc-in])>.pb-island{opacity:0;transform:translateY(var(--sys-space-m))}",
    ]);
    expect(NACHT_MOTION_CSS).toContain(
      `.pb-nacht[data-nc-ready] .nc-sec>.nc-wrap,.pb-nacht[data-nc-ready] .nc-sec>.pb-island{transition:opacity 900ms ${EASE},transform 900ms ${EASE}}`
    );
  });

  test("nur transform, opacity, clip-path; eine Kurve laut Systemblatt", () => {
    const transitions = NACHT_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background/
      );
    const frames =
      NACHT_MOTION_CSS.match(/@keyframes [\w-]+\{[^]*?\}\}/g) ?? [];
    expect(frames.length).toBe(2);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map(m => m[1]);
      for (const p of props)
        expect(["transform", "opacity", "clip-path"]).toContain(p);
    }
    expect(NACHT_MOTION_CSS).not.toMatch(/cubic-bezier\((?!\.23,1,\.32,1\))/);
    expect(NACHT_MOTION_CSS).not.toMatch(/will-change|infinite|linear|alternate/);
  });

  test("Foto (LCP) wird nie versteckt: setzt sich nur von 106 % auf 100 %, 1,6 s", () => {
    const photoRules = motionRules().filter(r =>
      /img/.test(r.slice(0, r.indexOf("{")))
    );
    expect(photoRules).toEqual([
      `.pb-nacht[data-nc-ready] .nc-bg img,.pb-nacht[data-nc-ready] .nc-entry .nc-pic img{animation:nc-settle 1600ms ${EASE} backwards}`,
    ]);
    const settle = keyframes("nc-settle");
    expect(settle).toBe("@keyframes nc-settle{from{transform:scale(1.06)}}");
    expect(settle).not.toMatch(/opacity|clip-path/);
    // Fotos außerhalb des Einstiegs (Bildpaar, Galerie, Team) bewegen sich nicht eigens.
    expect(NACHT_MOTION_CSS).not.toMatch(/nc-pair|nc-gal|nc-portrait|nc-pic-frame/);
  });

  test("Name wird von unten aufgedeckt: clip-path, 1,1 s, 150 ms nach dem Foto", () => {
    expect(NACHT_MOTION_CSS).toContain(
      `.pb-nacht[data-nc-ready] .nc-entry .nc-display{animation:nc-mask 1100ms ${EASE} 150ms backwards}`
    );
    expect(keyframes("nc-mask")).toBe(
      "@keyframes nc-mask{from{clip-path:inset(0 0 100% 0);transform:translateY(var(--sys-space-xs))}to{clip-path:inset(0 0 0 0);transform:none}}"
    );
  });

  test("Drucken: Startzustände gelten nur am Bildschirm", () => {
    expect(NACHT_MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference){"
    );
    expect(NACHT_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: ?no-preference\)/
    );
  });

  test("Keine festen Pixel in der Bewegung, Handy-Leiste ohne Animation", () => {
    expect(NACHT_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
    expect(NACHT_MOTION_CSS).not.toMatch(/nc-dock/);
  });

  test("Reduzierte Bewegung: alles aus", () => {
    expect(NACHT_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.pb-nacht \*[^}]*animation:none!important\}/
    );
  });

  test("SSR: Wurzel ohne Startzustand, alle drei Einstiege tragen die bewegten Klassen", () => {
    for (const doc of [weinbergDoc(), noirDoc(), hausDoc()]) {
      const html = render(doc);
      expect(html).toMatch(/<div class="pb-site pb-nacht"/);
      expect(html).toContain('data-pb-system="nacht"');
      expect(html).not.toMatch(/<[^>]*\sdata-nc-(ready|in)[\s=>]/);
      expect(html).toContain('class="nc-sec ');
      expect(html).toMatch(/class="nc-title[^"]*"/);
      expect(html).toContain("nc-display");
    }
    expect(render(weinbergDoc())).toContain('class="nc-bg"');
    expect(render(noirDoc())).toMatch(/class="nc-pic/);
  });

  test("Motion-Bundle-Einstieg montiert Nacht neben den anderen Systemen", () => {
    expect(ISLAND_MOTION.nacht).toBe(mountNachtMotion);
  });
});

/** Kleine DOM-Attrappe: nur, was mountNachtMotion anfasst. */
function el(extra: Record<string, unknown> = {}) {
  const attrs = new Map<string, string>();
  return {
    attrs,
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    removeAttribute: (k: string) => attrs.delete(k),
    getAttribute: (k: string) => attrs.get(k) ?? null,
    ...extra,
  };
}

describe("mountNachtMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Kapitel einmalig (threshold 0, -15 %), setzt data-nc-ready nach einem Frame", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".nc-sec" ? sections : []),
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
      return 7;
    });
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const stop = mountNachtMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-nc-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-nc-ready")).toBe(true);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-nc-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-nc-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    // Einmalig: wieder hinausscrollen nimmt nichts zurück.
    cb([{ isIntersecting: false, target: sections[0] }]);
    expect(sections[0].attrs.has("data-nc-in")).toBe(true);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  test("ohne IntersectionObserver sind Kapitel sofort sichtbar", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".nc-sec" ? sections : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountNachtMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-nc-in"))).toBe(true);
  });
});
