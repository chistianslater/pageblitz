import React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_NAME,
  HeroBuildLive,
  createHeroTimeline,
  phaseSchedule,
} from "./HeroBuildLive";

afterEach(() => {
  vi.useRealTimers();
});

describe("phaseSchedule", () => {
  it("ordnet die Phasen streng aufsteigend an", () => {
    const s = phaseSchedule(DEMO_NAME.length);
    expect(s.phase2).toBeGreaterThan(0);
    expect(s.phase3).toBeGreaterThan(s.phase2);
    expect(s.phase4).toBeGreaterThan(s.phase3);
    expect(s.loop).toBeGreaterThan(s.phase4);
  });
});

describe("createHeroTimeline", () => {
  it("tippt den Namen und feuert die Phasen 2→3→4, dann Loop zurück zu 1", () => {
    vi.useFakeTimers();
    const phases: number[] = [];
    let typed = "";
    const timeline = createHeroTimeline({
      name: DEMO_NAME,
      onType: t => {
        typed = t;
      },
      onPhase: p => {
        phases.push(p);
      },
    });
    timeline.start();
    expect(phases).toEqual([1]);
    const s = phaseSchedule(DEMO_NAME.length);
    vi.advanceTimersByTime(s.phase2 + 10);
    expect(typed).toBe(DEMO_NAME);
    expect(phases).toEqual([1, 2]);
    vi.advanceTimersByTime(s.phase4 - s.phase2);
    expect(phases).toEqual([1, 2, 3, 4]);
    vi.advanceTimersByTime(s.loop - s.phase4 + 20);
    // Loop: Zyklus beginnt von vorn
    expect(phases).toEqual([1, 2, 3, 4, 1]);
    timeline.stop();
  });

  it("räumt beim Stop alle Timer ab", () => {
    vi.useFakeTimers();
    const timeline = createHeroTimeline({
      name: DEMO_NAME,
      onType: () => {},
      onPhase: () => {},
    });
    timeline.start();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    timeline.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("HeroBuildLive (SSR)", () => {
  it("rendert die Bühne mit A11y-Label, Demo-Inhalt und Live-URL", () => {
    const html = renderToString(<HeroBuildLive />);
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-label=");
    expect(html).toContain('data-phase="1"');
    expect(html).toContain("4,8 · 214 Bewertungen");
    expect(html).toContain("trattoria-lucia.pageblitz.de");
    expect(html).toContain("Ein Tisch.");
  });
});
