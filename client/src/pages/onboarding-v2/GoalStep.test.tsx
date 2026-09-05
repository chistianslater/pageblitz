import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GoalPicker, GoalStep } from "./GoalStep";

describe("GoalStep (Ziel der Website, 2026-09-03)", () => {
  test("zeigt fuenf Kacheln mit Label und Erklaerung, Ueberspringen-Knopf und den Betriebsnamen", () => {
    const html = renderToStaticMarkup(
      <GoalStep
        businessName="Schreinerei Brandt"
        onPick={() => {}}
        onSkip={() => {}}
        pending={false}
        error={null}
      />
    );
    // Seit 2026-09-05 fuenf: „Nur Praesenz" fuer rein repraesentative Seiten.
    expect(html.match(/class="pb-goal-tile"/g)).toHaveLength(5);
    for (const label of [
      "Anrufe",
      "Anfragen",
      "Termine",
      "Verkauf",
      "Nur Präsenz",
    ]) {
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
