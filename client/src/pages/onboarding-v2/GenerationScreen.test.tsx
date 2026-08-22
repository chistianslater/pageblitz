import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GenerationScreen } from "./GenerationScreen";

describe("GenerationScreen", () => {
  test("zeigt Firmenname, Fortschritt und Phase", () => {
    const html = renderToStaticMarkup(
      <GenerationScreen
        businessName="Schreinerei Brandt"
        progress={30}
        status="processing"
        error={null}
        onRetry={() => {}}
      />
    );
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain('aria-valuenow="30"');
    expect(html).toContain("Texte");
  });
  test("failed → Fehlermeldung + Erneut-versuchen-Button", () => {
    const html = renderToStaticMarkup(
      <GenerationScreen
        businessName="B"
        progress={0}
        status="failed"
        error="LLM kaputt"
        onRetry={() => {}}
      />
    );
    expect(html).toContain("LLM kaputt");
    expect(html).toContain("Erneut versuchen");
  });
  test("failed + retrying → Button gesperrt, anderer Label-Text", () => {
    const html = renderToStaticMarkup(
      <GenerationScreen
        businessName="B"
        progress={0}
        status="failed"
        error="LLM kaputt"
        onRetry={() => {}}
        retrying
      />
    );
    expect(html).toContain("disabled=\"\"");
    expect(html).toContain("Wird erneut versucht");
  });
});
