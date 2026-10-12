import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { KLAR_CSS } from "./css";
import { KLAR_MOTION_CSS } from "./motionCss";
import { mountKlarMotion } from "./motion";
import { kanzleiDoc, physioDoc, render, zahnDoc } from "./testkit";

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
  const block = KLAR_MOTION_CSS.slice(KLAR_MOTION_CSS.indexOf("{") + 1);
  return block
    .split("\n")
    .map(l => l.trim())
    .filter(
      l =>
        l && l !== "}" && !l.startsWith("@keyframes") && !l.startsWith("@media")
    );
}

const keyframes = (name: string) =>
  KLAR_MOTION_CSS.match(new RegExp(`@keyframes ${name}\\{[^]*?\\}\\}`))![0];

describe("Klar-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor der Abschaltung bei reduzierter Bewegung und dem Endmarker", () => {
    const i = KLAR_CSS.indexOf(KLAR_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(
      KLAR_CSS.indexOf("@media (prefers-reduced-motion:reduce)")
    );
    expect(i).toBeLessThan(KLAR_CSS.indexOf("/* ende klar */"));
  });

  test("Wächter: Startzustände nur unter data-kl-ready und ohne reduzierte Bewegung", () => {
    const outside = outsideNoPreference(KLAR_CSS);
    // Das Muster muss den Bewegungsblock wirklich treffen.
    expect(outside.length).toBeLessThan(
      KLAR_CSS.length - KLAR_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-kl-ready|data-kl-in/);
    expect(outside).not.toMatch(
      /kl-rise|@keyframes kl-|kl-card|kl-fade|animation:kl-|--kl-clip-r/
    );
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset/);
    // Jede Regel im Block beginnt mit dem ready-Selektor.
    for (const r of motionRules())
      for (const sel of r.slice(0, r.indexOf("{")).split(","))
        expect(sel.trim()).toMatch(/^\.pb-klar\[data-kl-ready\] /);
  });

  test("Abschnitte: versteckt nur, solange data-kl-in fehlt (16 px, 360 ms)", () => {
    const hidden = motionRules().filter(r => /opacity:0[;}]/.test(r));
    expect(hidden).toEqual([
      ".pb-klar[data-kl-ready] .kl-sec:not([data-kl-in])>.kl-wrap{opacity:0;transform:translateY(var(--sys-space-s))}",
    ]);
    expect(KLAR_MOTION_CSS).toContain(
      `.pb-klar[data-kl-ready] .kl-sec>.kl-wrap{transition:opacity 360ms ${EASE},transform 360ms ${EASE}}`
    );
  });

  test("nur transform, opacity, clip-path; eine Kurve laut Systemblatt", () => {
    const transitions = KLAR_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background/
      );
    const frames = KLAR_MOTION_CSS.match(/@keyframes [\w-]+\{[^]*?\}\}/g) ?? [];
    expect(frames.length).toBe(4);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map(m => m[1]);
      for (const p of props)
        expect(["transform", "opacity", "clip-path"]).toContain(p);
    }
    expect(KLAR_MOTION_CSS).not.toMatch(/cubic-bezier\((?!\.23,1,\.32,1\))/);
    expect(KLAR_MOTION_CSS).not.toMatch(/will-change|infinite|linear/);
  });

  test("Einstieg: 12 px hoch und einblenden, 320 ms, 60 ms Abstand in Lesereihenfolge", () => {
    const order = [
      ".kl-entry .kl-pill{animation:kl-rise 320ms cubic-bezier(.23,1,.32,1) backwards}",
      ".kl-entry .kl-display{animation:kl-rise 320ms cubic-bezier(.23,1,.32,1) 60ms backwards}",
      ".kl-entry-lede{animation:kl-rise 320ms cubic-bezier(.23,1,.32,1) 120ms backwards}",
      ".kl-entry-actions{animation:kl-rise 320ms cubic-bezier(.23,1,.32,1) 180ms backwards}",
      ".kl-entry-facts{animation:kl-rise 320ms cubic-bezier(.23,1,.32,1) 240ms backwards}",
    ];
    for (const o of order)
      expect(KLAR_MOTION_CSS).toContain(`.pb-klar[data-kl-ready] ${o}`);
    // 12 px = 1rem × .75
    expect(keyframes("kl-rise")).toBe(
      "@keyframes kl-rise{from{opacity:0;transform:translateY(calc(var(--sys-space-s) * .75))}}"
    );
  });

  test("Foto (LCP) wird nie versteckt: nur clip-path von 8 % auf voll, 520 ms, keine Deckkraft", () => {
    const photoRules = motionRules().filter(r =>
      /kl-frame|img/.test(r.slice(0, r.indexOf("{")))
    );
    expect(photoRules).toEqual([
      ".pb-klar[data-kl-ready] .kl-entry-media .kl-frame{--kl-clip-r:calc(var(--sys-space-l) * .65);animation:kl-frame 520ms cubic-bezier(.23,1,.32,1) 60ms backwards}",
      ".pb-klar[data-kl-ready] .kl-entry-media .kl-duo .kl-frame{--kl-clip-r:calc(var(--sys-space-s) * 1.375)}",
    ]);
    const frame = keyframes("kl-frame");
    expect(frame).toBe(
      "@keyframes kl-frame{from{clip-path:inset(8% round var(--kl-clip-r))}to{clip-path:inset(0 round var(--kl-clip-r))}}"
    );
    expect(frame).not.toMatch(/opacity/);
    // Fotos außerhalb des Einstiegs (Team, Galerie) bewegen sich nicht eigens.
    expect(KLAR_MOTION_CSS).not.toMatch(/kl-team|kl-gallery|kl-portrait/);
  });

  test("Heute-Karte 160 ms nach dem Foto, 8 px von unten; Zeiten-Karte ohne Foto im Foto-Takt", () => {
    expect(KLAR_MOTION_CSS).toContain(
      ".pb-klar[data-kl-ready] .kl-entry-media .kl-todaycard,.pb-klar[data-kl-ready] .kl-entry-media .kl-side{animation:kl-card 320ms cubic-bezier(.23,1,.32,1) 220ms backwards}"
    );
    expect(KLAR_MOTION_CSS).toContain(
      ".pb-klar[data-kl-ready] .kl-entry-media .kl-hours--entry{animation:kl-card 320ms cubic-bezier(.23,1,.32,1) 60ms backwards}"
    );
    expect(keyframes("kl-card")).toBe(
      "@keyframes kl-card{from{opacity:0;transform:translateY(var(--sys-space-xs))}}"
    );
  });

  test("FAQ: Antwort blendet nur ein, keine Höhe", () => {
    expect(KLAR_MOTION_CSS).toContain(
      ".pb-klar[data-kl-ready] .kl-faq-item[open] .kl-faq-a{animation:kl-fade 240ms cubic-bezier(.23,1,.32,1)}"
    );
    expect(keyframes("kl-fade")).toBe("@keyframes kl-fade{from{opacity:0}}");
  });

  test("Drucken: Startzustände gelten nur am Bildschirm", () => {
    expect(KLAR_MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference){"
    );
    expect(KLAR_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: ?no-preference\)/
    );
  });

  test("Keine festen Pixel in der Bewegung", () => {
    expect(KLAR_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
  });

  test("Reduzierte Bewegung: alles aus", () => {
    expect(KLAR_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.pb-klar \*[^}]*animation:none!important\}/
    );
  });

  test("SSR: Wurzel ohne Startzustand, alle drei Einstiege tragen die bewegten Klassen", () => {
    for (const doc of [zahnDoc(), physioDoc(), kanzleiDoc()]) {
      const html = render(doc);
      expect(html).toMatch(/<div class="pb-site pb-klar"/);
      expect(html).not.toMatch(/<[^>]*\sdata-kl-(ready|in)[\s=>]/);
      expect(html).toContain('class="kl-sec ');
      expect(html).toContain("kl-entry-media");
    }
    expect(render(zahnDoc())).toContain("kl-todaycard");
    expect(render(physioDoc())).toMatch(/class="kl-duo/);
    expect(render(kanzleiDoc())).toContain("kl-hours--entry");
  });

  test("Motion-Bundle-Einstieg montiert Klar neben den anderen Systemen", () => {
    expect(ISLAND_MOTION.klar).toBe(mountKlarMotion);
  });
});

/** Kleine DOM-Attrappe: nur, was mountKlarMotion anfasst. */
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

describe("mountKlarMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Abschnitte einmalig, setzt data-kl-ready nach einem Frame", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".kl-sec" ? sections : []),
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

    const stop = mountKlarMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-kl-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-kl-ready")).toBe(true);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-kl-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-kl-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  test("ohne IntersectionObserver sind Abschnitte sofort sichtbar", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".kl-sec" ? sections : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountKlarMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-kl-in"))).toBe(true);
  });
});
