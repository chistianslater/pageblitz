import { afterEach, describe, expect, test, vi } from "vitest";
import { ISLAND_MOTION } from "../../../../site-islands/mountMotion";
import { PLAKAT_CSS } from "./css";
import { PLAKAT_MOTION_CSS } from "./motionCss";
import { mountPlakatMotion } from "./motion";
import { entryOf, kanteDoc, pulsDoc, render } from "./testkit";

/** Alle `@media screen and (prefers-reduced-motion: no-preference){…}`-Blöcke entfernen. */
function outsideNoPreference(css: string): string {
  return css.replace(
    /@media screen and \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/g,
    ""
  );
}

/** Regeln des Bewegungsblocks (ohne @keyframes und innere @media-Klammern). */
function motionRules(): string[] {
  const block = PLAKAT_MOTION_CSS.slice(PLAKAT_MOTION_CSS.indexOf("{") + 1);
  return block
    .split("\n")
    .map(l => l.trim())
    .filter(
      l =>
        l && l !== "}" && !l.startsWith("@keyframes") && !l.startsWith("@media")
    );
}

describe("Plakat-Bewegung (CSS)", () => {
  test("hängt im Modul-CSS, vor dem Endmarker", () => {
    const i = PLAKAT_CSS.indexOf(PLAKAT_MOTION_CSS);
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(PLAKAT_CSS.indexOf("/* ende plakat */"));
  });

  test("Wächter: Startzustände und Laufband nur unter data-pk-ready und ohne reduzierte Bewegung", () => {
    const outside = outsideNoPreference(PLAKAT_CSS);
    // Das Muster muss den Bewegungsblock wirklich treffen.
    expect(outside.length).toBeLessThan(
      PLAKAT_CSS.length - PLAKAT_MOTION_CSS.length / 2
    );
    expect(outside).not.toMatch(/data-pk-ready|data-pk-in|data-pk-paused/);
    expect(outside).not.toMatch(
      /pk-line|pk-open|pk-rise|pk-settle|pk-stick|@keyframes pk-tick|animation:pk-/
    );
    // Kein Element ist außerhalb des Blocks per opacity:0 oder clip-path versteckt.
    expect(outside).not.toMatch(/opacity:0[;}]/);
    expect(outside).not.toMatch(/clip-path:inset\([^)]*100%/);
    // Jede Regel im Block beginnt mit dem ready-Selektor.
    for (const r of motionRules())
      for (const sel of r.slice(0, r.indexOf("{")).split(","))
        expect(sel.trim()).toMatch(/^\.pb-plakat\[data-pk-ready\] /);
  });

  test("Abschnitte: versteckt nur, solange data-pk-in fehlt", () => {
    const hidden =
      PLAKAT_MOTION_CSS.match(
        /[^\n]*(opacity:0|clip-path:inset\([^)]*100%)[^\n]*/g
      ) ?? [];
    expect(hidden.length).toBeGreaterThan(0);
    for (const h of hidden.filter(l => !l.includes("@keyframes")))
      expect(h).toContain(":not([data-pk-in])");
  });

  test("nur transform, opacity, clip-path; eine Kurve laut Systemblatt", () => {
    const transitions = PLAKAT_MOTION_CSS.match(/transition:[^;}]*/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions)
      expect(t.replace(/cubic-bezier\([^)]*\)/g, "")).not.toMatch(
        /width|height|top|left|margin|padding|filter|background/
      );
    const frames =
      PLAKAT_MOTION_CSS.match(/@keyframes [\w-]+\{[^]*?\}\}/g) ?? [];
    expect(frames.length).toBe(6);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map(m => m[1]);
      for (const p of props)
        expect(["transform", "opacity", "clip-path"]).toContain(p);
    }
    expect(PLAKAT_MOTION_CSS).toContain("cubic-bezier(.23,1,.32,1)");
    expect(PLAKAT_MOTION_CSS).not.toMatch(/cubic-bezier\((?!\.23,1,\.32,1\))/);
    expect(PLAKAT_MOTION_CSS).not.toMatch(/will-change/);
  });

  test("Einstieg: Zeilen wachsen einzeln (600 ms, 70 ms Versatz)", () => {
    expect(PLAKAT_MOTION_CSS).toContain(
      ".pb-plakat[data-pk-ready] .pk-entry .pk-display span,.pb-plakat[data-pk-ready] .pk-entry .pk-display--flow{animation:pk-line 600ms cubic-bezier(.23,1,.32,1) backwards}"
    );
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-display span:nth-of-type\(2\)\{animation-delay:70ms\}/
    );
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-display span:nth-of-type\(3\)\{animation-delay:140ms\}/
    );
    const line = PLAKAT_MOTION_CSS.match(/@keyframes pk-line\{[^]*?\}\}/)![0];
    expect(line).toMatch(/from\{clip-path:inset\(0 [^)]*100%/);
    expect(line).not.toMatch(/opacity/);
  });

  test("Einstiegsfoto (LCP) wird nie versteckt oder beschnitten, nur gesetzt", () => {
    const photoRules = motionRules().filter(r =>
      /pk-entry-media|pk-entry .pk-shape|img/.test(r.slice(0, r.indexOf("{")))
    );
    expect(photoRules).toEqual([
      ".pb-plakat[data-pk-ready] .pk-entry-media .pk-shape img{animation:pk-settle 900ms cubic-bezier(.23,1,.32,1) backwards}",
    ]);
    const settle = PLAKAT_MOTION_CSS.match(
      /@keyframes pk-settle\{[^]*?\}\}/
    )![0];
    expect(settle).not.toMatch(/opacity|clip-path/);
    // Formen-Öffnung nur in Abschnitten (.pk-sec), nie im Einstieg (.pk-entry).
    for (const r of motionRules().filter(r => r.includes("pk-open")))
      expect(r).toContain(".pk-sec[data-pk-in] .pk-shape");
  });

  test("Sticker setzt sich einmal: scale .92 + −2° → −9°, 420 ms, kein Dauerdrehen", () => {
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-entry \.pk-stk\{animation:pk-stick 420ms [^;]* 280ms backwards\}/
    );
    expect(PLAKAT_MOTION_CSS).toContain(
      "@keyframes pk-stick{from{transform:scale(.92) rotate(-2deg)}to{transform:scale(1) rotate(-9deg)}}"
    );
    expect(PLAKAT_MOTION_CSS).not.toMatch(/pk-stick[^}]*infinite/);
  });

  test("Laufband: läuft nur mit Script, hält bei Hover und Pause-Knopf; Knopf nur dann sichtbar", () => {
    expect(PLAKAT_MOTION_CSS).toContain(
      ".pb-plakat[data-pk-ready] .pk-tick-track{animation:pk-tick 38s linear infinite}"
    );
    expect(PLAKAT_MOTION_CSS).toContain(
      ".pb-plakat[data-pk-ready] .pk-tick[data-pk-paused] .pk-tick-track{animation-play-state:paused}"
    );
    expect(PLAKAT_MOTION_CSS).toContain(
      ".pb-plakat[data-pk-ready] .pk-tick-toggle{display:grid}"
    );
    expect(PLAKAT_CSS).toMatch(/\.pb-plakat \.pk-tick-toggle\{display:none;/);
    // Knopf ≥ 44 px (Tap-Maß) und 2px-Fokusring.
    expect(PLAKAT_CSS).toMatch(
      /\.pk-tick-toggle\{[^}]*width:var\(--pk-tap\);height:var\(--pk-tap\)/
    );
  });

  test("Ziffern 01·02·03: gleiche Freilegung beim Hereinscrollen, gestaffelt", () => {
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-sec\[data-pk-in\] \.pk-step-no\{animation:pk-line 600ms [^;]* 120ms backwards\}/
    );
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-step:nth-child\(2\) \.pk-step-no\{animation-delay:200ms\}/
    );
    expect(PLAKAT_MOTION_CSS).toMatch(
      /\.pk-step:nth-child\(n\+5\) \.pk-step-no\{animation-delay:440ms\}/
    );
  });

  test("Drucken: Startzustände gelten nur am Bildschirm", () => {
    expect(PLAKAT_MOTION_CSS).toContain(
      "@media screen and (prefers-reduced-motion: no-preference){"
    );
    expect(PLAKAT_MOTION_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: ?no-preference\)/
    );
    expect(PLAKAT_CSS).not.toMatch(
      /@media \(prefers-reduced-motion: ?no-preference\)/
    );
  });

  test("Keine festen Pixel in der Bewegung", () => {
    expect(PLAKAT_MOTION_CSS.match(/\b\d+px\b/g) ?? []).toEqual([]);
  });

  test("Reduzierte Bewegung: alles aus", () => {
    expect(PLAKAT_CSS).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{\.pb-plakat \*[^}]*animation:none!important\}/
    );
  });

  test("SSR: Wurzel ohne Startzustand, Pause-Knopf mit Name und aria-pressed", () => {
    const html = render(kanteDoc());
    expect(html).toMatch(/<div class="pb-site pb-plakat"/);
    expect(html).not.toMatch(/<[^>]*\sdata-pk-(ready|in|paused)[\s=>]/);
    expect(html).toContain(
      '<button type="button" class="pk-tick-toggle" aria-pressed="false" aria-label="Laufband anhalten" title="Laufband anhalten"><i aria-hidden="true"></i></button>'
    );
    expect(html.match(/class="pk-tick-toggle"/g)).toHaveLength(1);
    // Schrift-Einstieg ohne Foto: keine Form im Einstieg.
    expect(entryOf(render(pulsDoc()))).not.toContain("pk-shape");
  });

  test("Motion-Bundle-Einstieg montiert Plakat neben den anderen Systemen", () => {
    expect(ISLAND_MOTION.plakat).toBe(mountPlakatMotion);
  });
});

/** Kleine DOM-Attrappe: nur, was mountPlakatMotion anfasst. */
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

function button(tick: ReturnType<typeof el>) {
  const listeners = new Map<string, () => void>();
  const b = el({
    closest: () => tick,
    addEventListener: (t: string, f: () => void) => listeners.set(t, f),
    removeEventListener: (t: string) => listeners.delete(t),
  });
  b.attrs.set("aria-pressed", "false");
  return Object.assign(b, { listeners });
}

describe("mountPlakatMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Abschnitte einmalig, setzt data-pk-ready nach einem Frame", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".pk-sec" ? sections : []),
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

    const stop = mountPlakatMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-pk-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-pk-ready")).toBe(true);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-pk-in")).toBe(false);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-pk-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith(9);
  });

  test("ohne IntersectionObserver sind Abschnitte sofort sichtbar", () => {
    const sections = [el(), el()];
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".pk-sec" ? sections : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountPlakatMotion(root as unknown as HTMLElement);
    expect(sections.every(s => s.attrs.has("data-pk-in"))).toBe(true);
  });

  test("Pause-Knopf: aria-pressed, Tooltip und data-pk-paused im Wechsel; Aufräumen löst den Klick", () => {
    const tick = el();
    const b = button(tick);
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".pk-tick-toggle" ? [b] : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const stop = mountPlakatMotion(root as unknown as HTMLElement);
    b.listeners.get("click")!();
    expect(b.attrs.get("aria-pressed")).toBe("true");
    expect(b.attrs.get("title")).toBe("Laufband abspielen");
    expect(tick.attrs.has("data-pk-paused")).toBe(true);
    b.listeners.get("click")!();
    expect(b.attrs.get("aria-pressed")).toBe("false");
    expect(b.attrs.get("title")).toBe("Laufband anhalten");
    expect(tick.attrs.has("data-pk-paused")).toBe(false);
    stop();
    expect(b.listeners.size).toBe(0);
  });
});
