import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GoalPicker, GoalStep } from "./GoalStep";

describe("GoalStep (Ziel der Website, 2026-09-03)", () => {
  test("zeigt vier Kacheln mit Label und Erklärung, Überspringen-Knopf und den Betriebsnamen", () => {
    const html = renderToStaticMarkup(
      <GoalStep
        businessName="Schreinerei Brandt"
        onPick={() => {}}
        onSkip={() => {}}
        pending={false}
        error={null}
      />
    );
    expect(html.match(/class="pb-goal-tile"/g)).toHaveLength(4);
    for (const label of ["Anrufe", "Anfragen", "Termine", "Verkauf"]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain("Später entscheiden");
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
  });

  test("GoalPicker markiert das gewählte Ziel", () => {
    const html = renderToStaticMarkup(
      <GoalPicker value="termine" onPick={() => {}} />
    );
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>[\s\S]*?Termine/);
  });
});
