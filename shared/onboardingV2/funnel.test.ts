import { describe, expect, test } from "vitest";
import {
  aggregateStudioFunnel,
  isStudioFunnelPublicStep,
  isStudioFunnelStep,
  STUDIO_FUNNEL_LABELS,
  STUDIO_FUNNEL_STEPS,
} from "./funnel";

describe("isStudioFunnelStep", () => {
  test("kennt lineare und Side-Steps, lehnt Unbekanntes ab", () => {
    expect(isStudioFunnelStep("landing_start")).toBe(true);
    expect(isStudioFunnelStep("abandoned_preview")).toBe(true);
    expect(isStudioFunnelStep("paid_or_live")).toBe(true);
    expect(isStudioFunnelStep("email")).toBe(false);
    expect(isStudioFunnelPublicStep("paid_or_live")).toBe(false);
    expect(isStudioFunnelPublicStep("studio_opened")).toBe(true);
  });
});

describe("aggregateStudioFunnel", () => {
  test("ordnet in der definierten Reihenfolge und rechnet Drop-off", () => {
    const result = aggregateStudioFunnel({
      landing_start: 100,
      studio_opened: 60,
      step_style: 40,
      email_captured: 20,
      checkout_started: 10,
      paid_or_live: 8,
      abandoned_preview: 12,
    });

    expect(result.steps.map(s => s.step)).toEqual([...STUDIO_FUNNEL_STEPS]);
    expect(result.steps[0]).toMatchObject({
      step: "landing_start",
      count: 100,
      dropOffCount: 0,
      dropOffRate: null,
    });
    expect(result.steps[1]).toMatchObject({
      step: "studio_opened",
      count: 60,
      dropOffCount: 40,
      dropOffRate: 0.4,
    });
    expect(result.steps[2]).toMatchObject({
      step: "step_style",
      count: 40,
      dropOffCount: 20,
      dropOffRate: 1 / 3,
    });
    const email = result.steps.find(s => s.step === "email_captured");
    expect(email?.count).toBe(20);
    expect(result.abandoned).toMatchObject({
      step: "abandoned_preview",
      label: STUDIO_FUNNEL_LABELS.abandoned_preview,
      count: 12,
      dropOffCount: 0,
      dropOffRate: null,
    });
  });

  test("fehlende Steps zählen 0, negatives Drop-off wird geklemmt", () => {
    const result = aggregateStudioFunnel({
      landing_start: 10,
      email_captured: 12,
    });
    const landing = result.steps[0];
    const opened = result.steps[1];
    const email = result.steps.find(s => s.step === "email_captured");
    expect(landing.count).toBe(10);
    expect(opened.count).toBe(0);
    expect(opened.dropOffCount).toBe(10);
    expect(opened.dropOffRate).toBe(1);
    expect(email?.count).toBe(12);
    expect(email?.dropOffCount).toBe(0);
    expect(email?.dropOffRate).toBeNull();
  });

  test("leere Eingabe → alle Counts 0", () => {
    const result = aggregateStudioFunnel({});
    expect(result.steps.every(s => s.count === 0)).toBe(true);
    expect(result.abandoned.count).toBe(0);
    expect(result.steps[0].dropOffRate).toBeNull();
  });
});
