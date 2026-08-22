import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LegacySitePlaceholder } from "./LegacySitePlaceholder";

describe("LegacySitePlaceholder", () => {
  test("zeigt Hinweis und Business-Namen", () => {
    const html = renderToStaticMarkup(<LegacySitePlaceholder businessName="Schreinerei Brandt" />);
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain("wird gerade aktualisiert");
  });
  test("funktioniert ohne Namen", () => {
    const html = renderToStaticMarkup(<LegacySitePlaceholder />);
    expect(html).toContain("wird gerade aktualisiert");
  });
});
