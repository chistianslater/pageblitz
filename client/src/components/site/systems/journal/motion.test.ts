import { afterEach, describe, expect, test, vi } from "vitest";
import { JOURNAL_CSS } from "./css";
import { mountJournalMotion } from "./motion";

/** Kleine DOM-Attrappe: nur, was mountJournalMotion anfasst. */
function el(extra: Record<string, unknown> = {}) {
  const attrs = new Map<string, string>();
  const listeners = new Map<string, () => void>();
  return {
    attrs,
    listeners,
    style: {} as Record<string, string>,
    scrollLeft: 0,
    scrollWidth: 1000,
    clientWidth: 400,
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    removeAttribute: (k: string) => attrs.delete(k),
    addEventListener: (t: string, f: () => void) => listeners.set(t, f),
    removeEventListener: (t: string) => listeners.delete(t),
    insertAdjacentElement: vi.fn(),
    append: vi.fn(),
    ...extra,
  };
}

describe("Journal-Bewegung (CSS)", () => {
  test("Startzustände nur unter data-jr-ready und ohne reduzierte Bewegung", () => {
    expect(JOURNAL_CSS).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)\{[^]*\[data-jr-ready\]/
    );
    const outside = JOURNAL_CSS.replace(
      /@media \(prefers-reduced-motion: no-preference\)\{[^]*?\n\}\n/,
      ""
    );
    expect(outside).not.toMatch(/\.jr-section:not\(\[data-jr-in\]\)/);
    expect(outside).not.toMatch(/@keyframes jr-rise/);
  });
  test("nur transform, opacity, clip-path; Systemblatt-Werte", () => {
    expect(JOURNAL_CSS).not.toMatch(
      /transition:[^;}]*(width|height|top|left|margin|padding)/
    );
    expect(JOURNAL_CSS).toMatch(/jr-rise \.7s cubic-bezier\(\.16,1,\.3,1\)/);
    expect(JOURNAL_CSS).toMatch(/inset\(0 0 100% 0\)/);
    expect(JOURNAL_CSS).toMatch(/jr-reveal 1s/);
  });
  test("Foto bekommt kein opacity:0 (LCP)", () => {
    const m = JOURNAL_CSS.match(/@keyframes jr-reveal\{[^}]*\}[^}]*\}/);
    expect(m?.[0]).not.toMatch(/opacity/);
  });
  test("Fortschrittsleiste ohne JS unsichtbar", () => {
    expect(JOURNAL_CSS).toMatch(/\.jr-strip-bar\{[^}]*display:none/);
    expect(JOURNAL_CSS).toMatch(/\[data-jr-ready\] \.jr-strip-bar/);
  });
});

describe("mountJournalMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("beobachtet Abschnitte einmalig und setzt data-jr-ready", () => {
    const sections = [el(), el()];
    const strip = el();
    const root = el({
      querySelectorAll: (sel: string) =>
        sel === ".jr-section" ? sections : sel === ".jr-strip" ? [strip] : [],
    });
    let cb: (e: unknown[]) => void = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(f: typeof cb, public opts: { threshold: number }) {
          cb = f;
          expect(opts.threshold).toBe(0.15);
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      }
    );
    let frame: (() => void) | undefined;
    vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
      frame = f;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("document", { createElement: () => el() });

    const stop = mountJournalMotion(root as unknown as HTMLElement);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(root.attrs.has("data-jr-ready")).toBe(false);
    frame?.();
    expect(root.attrs.has("data-jr-ready")).toBe(true);
    cb([{ isIntersecting: true, target: sections[0] }]);
    expect(sections[0].attrs.has("data-jr-in")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(sections[0]);
    cb([{ isIntersecting: false, target: sections[1] }]);
    expect(sections[1].attrs.has("data-jr-in")).toBe(false);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(strip.listeners.size).toBe(0);
  });

  test("ohne IntersectionObserver sind Abschnitte sofort sichtbar", () => {
    const section = el();
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".jr-section" ? [section] : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    mountJournalMotion(root as unknown as HTMLElement);
    expect(section.attrs.has("data-jr-in")).toBe(true);
  });

  test("Streifen: Fortschritt per transform aus scrollLeft", () => {
    const strip = el({ scrollLeft: 300 });
    const bar = el();
    const fill = el();
    const root = el({
      querySelectorAll: (sel: string) => (sel === ".jr-strip" ? [strip] : []),
    });
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
      f();
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    let n = 0;
    vi.stubGlobal("document", { createElement: () => (n++ === 0 ? bar : fill) });
    mountJournalMotion(root as unknown as HTMLElement);
    expect(strip.insertAdjacentElement).toHaveBeenCalledWith("afterend", bar);
    // 300 / (1000-400) = 0.5
    expect(fill.style.transform).toBe("scaleX(0.5)");
    strip.scrollLeft = 600;
    strip.listeners.get("scroll")?.();
    expect(fill.style.transform).toBe("scaleX(1)");
  });
});
