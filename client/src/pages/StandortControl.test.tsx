import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StandortControl } from "./StandortControl";

describe("StandortControl", () => {
  test("hidden rendert nichts", () => {
    expect(
      renderToStaticMarkup(<StandortControl mode="hidden" onClick={() => {}} />)
    ).toBe("");
  });

  test("button: deutsche Copy, kein Auto-Prompt-Text", () => {
    const html = renderToStaticMarkup(
      <StandortControl mode="button" onClick={() => {}} />
    );
    expect(html).toContain("Standort nutzen");
    expect(html).toContain("Wir speichern deinen Standort nicht");
    expect(html).toContain("<button");
  });

  test("loading / active ohne Button", () => {
    const loading = renderToStaticMarkup(
      <StandortControl mode="loading" onClick={() => {}} />
    );
    expect(loading).toContain("Standort wird ermittelt");
    expect(loading).not.toContain("<button");

    const active = renderToStaticMarkup(
      <StandortControl mode="active" onClick={() => {}} />
    );
    expect(active).toContain("Treffer in deiner Nähe");
    expect(active).not.toContain("<button");
  });
});
