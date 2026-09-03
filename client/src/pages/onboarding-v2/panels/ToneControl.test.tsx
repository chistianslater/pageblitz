import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ToneSlider } from "./ToneControl";

describe("ToneSlider (Tonalität, 2026-09-03)", () => {
  test("rendert fünf Stufen, markiert die gewählte und zeigt ihren Beispielsatz", () => {
    const html = renderToStaticMarkup(
      <ToneSlider value="professionell" onChange={() => {}} />
    );
    expect(html.match(/class="pb-tone-step"/g)).toHaveLength(5);
    expect(html).toMatch(/aria-pressed="true"[^>]*>[\s\S]*?Professionell/);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain("Wir bieten Ihnen erstklassige Lösungen.");
    expect(html).toContain('value="3"');
    expect(html).toContain("Sie-Form");
  });

  test("ohne gesetzte Tonalität ist keine Stufe gedrückt und ein Hinweis erscheint", () => {
    const html = renderToStaticMarkup(
      <ToneSlider value={null} onChange={() => {}} />
    );
    expect(html.match(/aria-pressed="true"/g)).toBeNull();
    expect(html).toContain("Designrichtung entscheidet");
  });
});
