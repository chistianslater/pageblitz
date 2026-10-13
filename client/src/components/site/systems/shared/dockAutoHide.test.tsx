// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import {
  SHOWCASES,
  systemShowcaseDoc,
} from "../../../../../../shared/showcases/blueprintShowcase";
import { DOCK_HIDDEN_ATTR, mountDockAutoHide } from "./dockAutoHide";

/* ---------- Helfer: IntersectionObserver-Attrappe ---------- */

type Callback = (entries: IntersectionObserverEntry[]) => void;
let observers: FakeObserver[] = [];
class FakeObserver {
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public cb: Callback,
    public options?: IntersectionObserverInit
  ) {
    observers.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  /** Meldet einen Sichtbarkeitsstand für ein beobachtetes Element. */
  fire(target: Element, ratio: number, height = 40, view = 800) {
    this.cb([
      {
        target,
        isIntersecting: ratio > 0,
        intersectionRatio: ratio,
        intersectionRect: { height: ratio > 0 ? height : 0 },
        rootBounds: { height: view },
      } as unknown as IntersectionObserverEntry,
    ]);
  }
}

function page(html: string): HTMLElement {
  document.body.innerHTML = `<div class="pb-site">${html}</div>`;
  return document.querySelector<HTMLElement>(".pb-site")!;
}

const DOCK = `<nav class="x-dock" data-sys-dock><a href="#kontakt">Termin</a><a href="tel:0251">Anrufen</a></nav>`;
const dockOf = (root: HTMLElement) =>
  root.querySelector<HTMLElement>("[data-sys-dock]")!;

describe("mountDockAutoHide", () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false }))
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  test("blendet aus, solange eine Knopfgruppe spürbar sichtbar ist, und wieder ein", () => {
    const root = page(
      `<p class="entry" data-sys-actions><a href="#kontakt">Termin</a></p>${DOCK}`
    );
    mountDockAutoHide(root);
    const [io] = observers;
    const group = root.querySelector(".entry")!;
    const dock = dockOf(root);
    expect(io.observed).toEqual([group]);
    expect(dock.hasAttribute(DOCK_HIDDEN_ATTR)).toBe(false);

    io.fire(group, 0.6);
    expect(dock.hasAttribute(DOCK_HIDDEN_ATTR)).toBe(true);
    expect(dock.getAttribute("aria-hidden")).toBe("true");
    expect(dock.hasAttribute("inert")).toBe(true);
    expect(dock.style.opacity).toBe("0");
    expect(dock.style.pointerEvents).toBe("none");
    expect(dock.style.visibility).toBe("hidden");
    expect(dock.style.transform).toContain("translateY");

    io.fire(group, 0);
    expect(dock.hasAttribute(DOCK_HIDDEN_ATTR)).toBe(false);
    expect(dock.hasAttribute("aria-hidden")).toBe(false);
    expect(dock.hasAttribute("inert")).toBe(false);
    expect(dock.style.opacity).toBe("");
    expect(dock.style.visibility).toBe("");
  });

  test("knapp angeschnitten zählt nicht, große Gruppe mit einem Viertel Sichtfenster schon", () => {
    const root = page(
      `<p class="a" data-sys-actions><a href="tel:0251">x</a></p>${DOCK}`
    );
    mountDockAutoHide(root);
    const [io] = observers;
    const group = root.querySelector(".a")!;
    io.fire(group, 0.2, 40, 800);
    expect(dockOf(root).hasAttribute(DOCK_HIDDEN_ATTR)).toBe(false);
    io.fire(group, 0.3, 240, 800);
    expect(dockOf(root).hasAttribute(DOCK_HIDDEN_ATTR)).toBe(true);
  });

  test("bleibt aus, solange irgendeine Gruppe sichtbar ist", () => {
    const root = page(
      `<p class="a" data-sys-actions><a href="#kontakt">x</a></p><a class="b" data-sys-actions href="tel:0251">y</a>${DOCK}`
    );
    mountDockAutoHide(root);
    const [io] = observers;
    const a = root.querySelector(".a")!;
    const b = root.querySelector(".b")!;
    expect(io.observed).toEqual([a, b]);
    io.fire(a, 1);
    io.fire(b, 1);
    io.fire(a, 0);
    expect(dockOf(root).hasAttribute(DOCK_HIDDEN_ATTR)).toBe(true);
    io.fire(b, 0);
    expect(dockOf(root).hasAttribute(DOCK_HIDDEN_ATTR)).toBe(false);
  });

  test("Gruppen ohne gemeinsamen Weg mit der Leiste zählen nicht", () => {
    const root = page(
      `<p data-sys-actions><a href="mailto:a@b.example">Mail</a></p>${DOCK}`
    );
    const cleanup = mountDockAutoHide(root);
    expect(observers).toHaveLength(0);
    cleanup();
  });

  test("ohne Leiste oder ohne IntersectionObserver passiert nichts", () => {
    const root = page(`<p data-sys-actions><a href="#kontakt">x</a></p>`);
    mountDockAutoHide(root)();
    expect(observers).toHaveLength(0);
    vi.stubGlobal("IntersectionObserver", undefined);
    const withDock = page(
      `<p data-sys-actions><a href="#kontakt">x</a></p>${DOCK}`
    );
    mountDockAutoHide(withDock)();
    expect(dockOf(withDock).getAttribute("style")).toBeNull();
  });

  test("bewegt sich weich, bei reduzierter Bewegung ohne Übergang", () => {
    const root = page(
      `<p class="a" data-sys-actions><a href="#kontakt">x</a></p>${DOCK}`
    );
    mountDockAutoHide(root);
    observers[0].fire(root.querySelector(".a")!, 1);
    const t = dockOf(root).style.transition;
    expect(t).toContain("transform");
    expect(t).toContain("opacity");
    expect(t).not.toMatch(/width|height|top|bottom|margin|padding/);

    observers = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true }))
    );
    const calm = page(
      `<p class="a" data-sys-actions><a href="#kontakt">x</a></p>${DOCK}`
    );
    mountDockAutoHide(calm);
    observers[0].fire(calm.querySelector(".a")!, 1);
    expect(dockOf(calm).style.transition).toBe("none");
    expect(dockOf(calm).hasAttribute(DOCK_HIDDEN_ATTR)).toBe(true);
  });

  test("Aufräumen trennt den Beobachter und zeigt die Leiste wie vorher", () => {
    const root = page(
      `<p class="a" data-sys-actions><a href="#kontakt">x</a></p>${DOCK}`
    );
    const cleanup = mountDockAutoHide(root);
    const [io] = observers;
    io.fire(root.querySelector(".a")!, 1);
    cleanup();
    const dock = dockOf(root);
    expect(io.disconnected).toBe(true);
    expect(dock.hasAttribute(DOCK_HIDDEN_ATTR)).toBe(false);
    expect(dock.hasAttribute("inert")).toBe(false);
    expect(dock.getAttribute("style") ?? "").toBe("");
  });
});

/* ---------- Markup aller vier Systeme ---------- */

const SYSTEMS = ["journal", "raster", "werkstoff", "plakat"] as const;
type Sys = (typeof SYSTEMS)[number];

const render = (data: ReturnType<typeof systemShowcaseDoc>) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug=""
      basePath=""
      islandsMode="live"
      preview={false}
      now={new Date("2026-10-13T10:00:00+02:00")}
    />
  );

/** Beispielbetrieb mit Aufruf-Abschnitt vor dem Kontakt. */
function withCta(sys: Sys) {
  const doc = systemShowcaseDoc(SHOWCASES[0], sys);
  const at = doc.sections.findIndex(s => s.type === "contact");
  const cta = { type: "cta", headline: "Stuhl frei?", ctaText: "Termin buchen" };
  return {
    ...doc,
    sections: [
      ...doc.sections.slice(0, at),
      cta as (typeof doc.sections)[number],
      ...doc.sections.slice(at),
    ],
  };
}

function docs(sys: Sys): Document[] {
  const all = [
    ...SHOWCASES.map(sc => systemShowcaseDoc(sc, sys)),
    withDesignSystem(getFixture("werkbank", "full"), sys),
    withDesignSystem(getFixture("werkbank", "features"), sys),
    withCta(sys),
  ];
  return all.map(d => {
    const doc = document.implementation.createHTMLDocument("");
    doc.body.innerHTML = render(d as ReturnType<typeof systemShowcaseDoc>);
    return doc;
  });
}

/** Knopfgruppen, die die Wege der Leiste anbieten (Einstieg, Aufruf, Kontakt, Fuß). */
const GROUPS: Record<Sys, string[]> = {
  journal: [
    ".jr-entry-actions",
    ".jr-cta-action",
    ".jr-contact-links",
    ".jr-foot-contact",
    ".jr-foot .jr-links",
  ],
  raster: ["#anfrage .rs-body > p", ".rs-visit-reach", ".rs-foot-call"],
  werkstoff: [
    ".ws-entry-actions",
    ".ws-cta-action",
    ".ws-visit-reach",
    ".ws-foot-btn",
  ],
  plakat: [
    ".pk-entry-actions",
    "#anfrage .pk-more",
    ".pk-visit-reach",
    ".pk-foot ul",
  ],
};

const DOCK_CLASS: Record<Sys, string> = {
  journal: ".jr-dock",
  raster: ".rs-dock",
  werkstoff: ".ws-dock",
  plakat: ".pk-dock",
};

describe("Knopfgruppen und Leiste tragen die Markierungen", () => {
  for (const sys of SYSTEMS) {
    test(`${sys}: Leiste data-sys-dock, Einstieg/Aufruf/Kontakt/Fuß data-sys-actions`, () => {
      const rendered = docs(sys);
      const docks = rendered.flatMap(d =>
        Array.from(d.querySelectorAll(DOCK_CLASS[sys]))
      );
      expect(docks.length).toBeGreaterThan(0);
      for (const dock of docks) expect(dock.hasAttribute("data-sys-dock")).toBe(true);
      for (const sel of GROUPS[sys]) {
        const found = rendered.flatMap(d => Array.from(d.querySelectorAll(sel)));
        expect(found.length, `${sys} ${sel}`).toBeGreaterThan(0);
        for (const g of found)
          expect(g.hasAttribute("data-sys-actions"), `${sys} ${sel}`).toBe(true);
      }
    });

    test(`${sys}: mindestens eine markierte Gruppe teilt einen Weg mit der Leiste`, () => {
      for (const d of docs(sys).slice(0, SHOWCASES.length)) {
        const dock = d.querySelector("[data-sys-dock]");
        if (!dock) continue;
        const hrefs = new Set(
          Array.from(dock.querySelectorAll("a"), a => a.getAttribute("href"))
        );
        const shared = Array.from(d.querySelectorAll("[data-sys-actions]")).filter(g =>
          (g.tagName === "A" ? [g] : Array.from(g.querySelectorAll("a"))).some(a =>
            hrefs.has(a.getAttribute("href"))
          )
        );
        expect(shared.length).toBeGreaterThan(0);
      }
    });
  }
});

/* ---------- Wächter: ohne JS bleibt die Leiste sichtbar ---------- */

describe("Wächter: kein CSS versteckt die Leiste", () => {
  for (const sys of SYSTEMS) {
    test(sys, () => {
      const d = docs(sys)[0];
      const css = Array.from(d.querySelectorAll("style"), s => s.textContent ?? "").join("\n");
      expect(css.length).toBeGreaterThan(1000);
      expect(css).not.toContain("data-sys-dock");
      const dockClass = DOCK_CLASS[sys].slice(1);
      const rules = css
        .split("}")
        .map(r => r.split("{"))
        .filter(parts => parts.length >= 2)
        .map(parts => ({
          selector: parts[parts.length - 2],
          body: parts[parts.length - 1],
        }))
        .filter(r => r.selector.includes(dockClass));
      expect(rules.length).toBeGreaterThan(0);
      for (const r of rules) {
        expect(r.body, r.selector).not.toMatch(
          /opacity:\s*0(?![.\d])|visibility:\s*hidden|pointer-events:\s*none|translate|clip-path/
        );
      }
    });
  }
});
