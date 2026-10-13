import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { SYSTEM_MOTION } from "../../SiteRenderer";
import {
  RELEASED_SYSTEMS,
  SYSTEMS_WITH_MOTION,
} from "../../../../../../shared/designSystems/registry";
import { FREUNDLICH_CSS } from "./css";
import { FREUNDLICH_MOTION_CSS } from "./motionCss";
import { mountFreundlichMotion } from "./motion";
import { fellfreundeDoc, gelatoDoc, pusteblumeDoc, render } from "./testkit";

const EASE = "cubic-bezier(.22,1,.36,1)";
const SPRING = "cubic-bezier(.3,1.22,.6,1)";
const P = ".pb-freundlich[data-fr-ready]";

/** Alle `@media screen and (prefers-reduced-motion: no-preference){…}`-Blöcke entfernen. */
function outsideNoPreference(css: string): string {
  return css.replace(
    /@media screen and \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/g,
    ""
  );
}

/** Regeln des Bewegungsblocks (ohne @keyframes und @media). */
function motionRules(): string[] {
  const block = FREUNDLICH_MOTION_CSS.slice(FREUNDLICH_MOTION_CSS.indexOf("{") + 1);
  return block
    .split("\n")
    .map(l => l.trim())
    .filter(
      l =>
        l && l !== "}" && !l.startsWith("@keyframes") && !l.startsWith("@media")
    );
}

describe("Freundlich-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor der Abschaltung bei reduzierter Bewegung und dem Endmarker", () => {
    const i = FREUNDLICH_CSS.indexOf(FREUNDLICH_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(
      FREUNDLICH_CSS.indexOf("@media (prefers-reduced-motion:reduce)")
    );
    expect(i).toBeLessThan(FREUNDLICH_CSS.indexOf("/* ende freundlich */"));
  });

  test("Wächter: Startzustände nur unter data-fr-ready und ohne reduzierte Bewegung", () => {
    const outside = outsideNoPreference(FREUNDLICH_CSS);
    // Das Muster muss den Bewegungsblock wirklich treffen.
    expect(outside.length).toBeLessThan(
      FREUNDLICH_CSS.length - FREUNDLICH_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-fr-ready|data-fr-in/);
    expect(outside).not.toMatch(/fr-settle|@keyframes/);
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset/);
    // Jede Regel im Block beginnt mit dem ready-Selektor.
    const rules = motionRules();
    expect(rules.length).toBeGreaterThan(4);
    for (const r of rules)
      for (const sel of r.slice(0, r.indexOf("{")).split(","))
        expect(sel.trim()).toMatch(/^\.pb-freundlich\[data-fr-ready\] /);
  });

  test("Kapitel: versteckt nur, solange data-fr-in fehlt (16 px, 0,7 s), Insel geht mit, Fokus zeigt sofort", () => {
    const hidden = motionRules().filter(r => /opacity:0[;}]/.test(r));
    expect(hidden).toEqual([
      `${P} .fr-sec:not([data-fr-in])>.fr-wrap,${P} .fr-sec:not([data-fr-in])>.pb-island{opacity:0;transform:translateY(var(--sys-space-s))}`,
    ]);
    expect(FREUNDLICH_MOTION_CSS).toContain(
      `${P} .fr-sec:focus-within>.fr-wrap,${P} .fr-sec:focus-within>.pb-island{opacity:1;transform:none}`
    );
    expect(FREUNDLICH_MOTION_CSS).toContain(
      `${P} .fr-sec>.fr-wrap,${P} .fr-sec>.pb-island{transition:opacity 700ms ${EASE},transform 700ms ${EASE}}`
    );
  });

  test("ein Federmoment: Einstiegsfoto und kleines Foto, 0,9 s, 200 ms verzögert — LCP nie versteckt", () => {
    const photoRules = motionRules().filter(r => /fr-settle/.test(r));
    expect(photoRules).toEqual([
      `${P} .fr-heroimg .fr-frame,${P} .fr-entry .fr-smallpic{animation:fr-settle 900ms ${SPRING} 200ms backwards}`,
    ]);
    const settle = FREUNDLICH_MOTION_CSS.match(/@keyframes fr-settle\{[^]*?\}\}/)![0];
    expect(settle).toBe(
      "@keyframes fr-settle{from{transform:translateY(calc(var(--sys-space-s) * 1.25)) rotate(0deg) scale(.96)}}"
    );
    // Kein „to": das Foto landet in seiner eigenen Lage (ab Desktop gekippt).
    expect(settle).not.toMatch(/opacity|clip-path|\bto\{/);
    // Nur ein Federmoment, nur eine Keyframe-Folge.
    expect(FREUNDLICH_MOTION_CSS.match(/@keyframes/g)).toHaveLength(1);
    expect(FREUNDLICH_MOTION_CSS.split(SPRING)).toHaveLength(2);
    // Andere Fotos (Über uns, Galerie, Team) bewegen sich nicht eigens.
    expect(FREUNDLICH_MOTION_CSS).not.toMatch(/fr-pic|fr-gal|fr-avatar/);
  });

  test("Farbkarte hebt sich nur bei Mauszeiger: −4 px und −0,6°", () => {
    expect(FREUNDLICH_MOTION_CSS).toContain(
      `  @media (hover:hover) and (pointer:fine){\n    ${P} .fr-offer:hover{transform:translateY(calc(var(--sys-space-2xs) * -1)) rotate(calc(var(--sys-tilt) * -.4))}\n  }`
    );
  });

  test("nur transform und opacity; nur die zwei Kurven des Systemblatts; keine Schleife", () => {
    const transitions = FREUNDLICH_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background|box-shadow/
      );
    const props = [
      ...FREUNDLICH_MOTION_CSS.matchAll(/@keyframes [\w-]+\{[^]*?\}\}/g),
    ].flatMap(m => [...m[0].matchAll(/([a-z-]+):/g)].map(x => x[1]));
    for (const p of props) expect(["transform", "opacity"]).toContain(p);
    const curves = FREUNDLICH_MOTION_CSS.match(/cubic-bezier\([^)]*\)/g) ?? [];
    for (const c of curves) expect([EASE, SPRING]).toContain(c);
    expect(FREUNDLICH_MOTION_CSS).not.toMatch(/will-change|infinite|alternate|linear/);
  });

  test("Drucken: Startzustände gelten nur am Bildschirm; keine festen Pixel; Leiste ohne Animation", () => {
    expect(FREUNDLICH_MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference){"
    );
    expect(FREUNDLICH_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: ?no-preference\)/
    );
    expect(FREUNDLICH_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
    expect(FREUNDLICH_MOTION_CSS).not.toMatch(/fr-dock/);
  });

  test("Reduzierte Bewegung: alles aus (auch Knopf-Heben und Kippen-Animation)", () => {
    expect(FREUNDLICH_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.pb-freundlich \*[^}]*transition:none!important;animation:none!important\}/
    );
  });

  test("Knöpfe: heben 2 px (Kante 6), sinken 3 px (Kante 1), 140 ms — Druckkante wie im Blatt", () => {
    expect(FREUNDLICH_CSS).toContain(
      ".pb-freundlich .fr-btn:active{transform:translateY(calc(var(--sys-press) * .75))}"
    );
    expect(FREUNDLICH_CSS).toContain(
      ".pb-freundlich .fr-btn:hover{transform:translateY(calc(var(--sys-press) * -.5))}"
    );
    expect(FREUNDLICH_CSS).toMatch(
      /\.fr-btn--p:hover\{box-shadow:inset 0 0 0 1\.5px var\(--sys-edge-color\),0 calc\(var\(--sys-press\) \* 1\.5\) 0 var\(--sys-edge-color\)\}/
    );
    expect(FREUNDLICH_CSS).toMatch(
      /\.fr-btn--p:active\{box-shadow:inset 0 0 0 1\.5px var\(--sys-edge-color\),0 calc\(var\(--sys-press\) \* \.25\) 0 var\(--sys-edge-color\)\}/
    );
    expect(FREUNDLICH_CSS).toMatch(/\.fr-btn\{[^}]*transition:transform 140ms/);
    // Heben nur mit Maus (kein „klebendes" Hover am Handy)
    expect(FREUNDLICH_CSS).toMatch(
      /@media \(hover:hover\) and \(pointer:fine\)\{\n  \.pb-freundlich \.fr-btn:hover/
    );
  });

  test("SSR: Wurzel ohne Startzustand, alle drei Einstiege tragen die bewegten Klassen", () => {
    for (const doc of [pusteblumeDoc(), fellfreundeDoc(), gelatoDoc()]) {
      const html = render(doc);
      expect(html).toMatch(/<div class="pb-site pb-freundlich"/);
      expect(html).toContain('data-pb-system="freundlich"');
      expect(html).not.toMatch(/<[^>]*\sdata-fr-(ready|in)[\s=>]/);
      expect(html).toContain('class="fr-sec ');
    }
    expect(render(fellfreundeDoc())).toContain('class="fr-heroimg"');
    expect(render(gelatoDoc())).toContain('class="fr-smallpic"');
  });

  test("Anbindung: Motion-Bundle, Chunk und SYSTEMS_WITH_MOTION — freigeschaltet", () => {
    expect(ISLAND_MOTION.freundlich).toBe(mountFreundlichMotion);
    expect(SYSTEM_MOTION.freundlich).toBeDefined();
    expect(SYSTEMS_WITH_MOTION).toContain("freundlich");
    expect(RELEASED_SYSTEMS).toContain("freundlich");
  });
});

/** Kleine DOM-Attrappe: nur, was mountFreundlichMotion anfasst. */
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

describe("mountFreundlichMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Kapitel einmalig (threshold 0, -15 %), setzt data-fr-ready nach einem Frame", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".fr-sec" ? sections : []),
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

    const stop = mountFreundlichMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-fr-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-fr-ready")).toBe(true);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-fr-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-fr-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    // Einmalig: wieder hinausscrollen nimmt nichts zurück.
    cb([{ isIntersecting: false, target: sections[0] }]);
    expect(sections[0].attrs.has("data-fr-in")).toBe(true);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  test("ohne IntersectionObserver sind Kapitel sofort sichtbar", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".fr-sec" ? sections : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountFreundlichMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-fr-in"))).toBe(true);
  });
});
