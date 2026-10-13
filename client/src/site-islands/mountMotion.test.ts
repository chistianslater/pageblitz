import { describe, expect, test, vi } from "vitest";
import { SYSTEMS_WITH_MOTION } from "../../../shared/designSystems/registry";
import {
  cleanupOnPageExit,
  mountSiteMotion,
  systemRootSelector,
} from "./mountMotion";

/** Fenster-Attrappe: merkt sich Listener und feuert pagehide von Hand. */
function fakeWindow() {
  const listeners = new Set<(e: PageTransitionEvent) => void>();
  return {
    addEventListener: vi.fn(
      (type: string, fn: (e: PageTransitionEvent) => void) => {
        if (type === "pagehide") listeners.add(fn);
      }
    ),
    removeEventListener: vi.fn(
      (type: string, fn: (e: PageTransitionEvent) => void) => {
        if (type === "pagehide") listeners.delete(fn);
      }
    ),
    hide(persisted: boolean) {
      for (const fn of Array.from(listeners))
        fn({ type: "pagehide", persisted } as PageTransitionEvent);
    },
    get count() {
      return listeners.size;
    },
  };
}

describe("Aufräumen beim Verlassen (Back/Forward-Cache)", () => {
  test("pagehide mit persisted: nichts wird abgebaut, Listener bleibt", () => {
    const win = fakeWindow();
    const cleanup = vi.fn();
    cleanupOnPageExit(win as unknown as Window, [cleanup]);
    win.hide(true);
    expect(cleanup).not.toHaveBeenCalled();
    expect(win.count).toBe(1);
  });

  test("nach Rückkehr aus dem Cache räumt echtes Verlassen genau einmal auf", () => {
    const win = fakeWindow();
    const a = vi.fn();
    const b = vi.fn();
    cleanupOnPageExit(win as unknown as Window, [a, b]);
    win.hide(true); // in den Cache …
    win.hide(true); // … und noch einmal
    win.hide(false); // jetzt wirklich weg
    win.hide(false);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(win.count).toBe(0);
  });

  test("echtes Verlassen ohne Cache räumt sofort auf", () => {
    const win = fakeWindow();
    const cleanup = vi.fn();
    cleanupOnPageExit(win as unknown as Window, [cleanup]);
    win.hide(false);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe("Montage nur an echten Designsystem-Wurzeln", () => {
  test("Selektor verlangt data-pb-system mit derselben ID", () => {
    expect(systemRootSelector("plakat")).toBe(
      '.pb-plakat[data-pb-system="plakat"]'
    );
    expect(systemRootSelector("raster")).toBe(
      '.pb-raster[data-pb-system="raster"]'
    );
  });

  test("mountSiteMotion fragt keine nackten Systemklassen ab", () => {
    const asked: string[] = [];
    const doc = {
      querySelectorAll: (sel: string) => {
        asked.push(sel);
        return [] as unknown as NodeListOf<HTMLElement>;
      },
    } as unknown as ParentNode;
    expect(mountSiteMotion(doc)).toEqual([]);
    for (const id of SYSTEMS_WITH_MOTION) {
      expect(asked).toContain(systemRootSelector(id));
      expect(asked).not.toContain(`.pb-${id}`);
    }
  });

  test("keine rev-2-Einstiegsbewegung mehr (Packs entfernt)", () => {
    const asked: string[] = [];
    const doc = {
      querySelectorAll: (sel: string) => {
        asked.push(sel);
        return [] as unknown as NodeListOf<HTMLElement>;
      },
    } as unknown as ParentNode;
    mountSiteMotion(doc);
    expect(asked.some(sel => sel.includes("data-pb-revision"))).toBe(false);
    expect(
      asked.every(
        sel => sel.includes("[data-pb-system") || sel === ".pb-site[data-pb-system]"
      )
    ).toBe(true);
  });
});
