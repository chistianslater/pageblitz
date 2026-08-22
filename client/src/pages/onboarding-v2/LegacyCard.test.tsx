import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LegacyCard } from "./LegacyCard";

describe("LegacyCard", () => {
  test("zeigt Hinweis und aktiven Button", () => {
    const html = renderToStaticMarkup(
      <LegacyCard onRegenerate={() => {}} pending={false} error={null} />
    );
    expect(html).toContain(
      "Diese Website wurde mit dem alten System erstellt."
    );
    expect(html).toContain("Website neu erstellen");
    expect(html).not.toContain("disabled");
  });
  test("pending → Button gesperrt, anderer Label-Text", () => {
    const html = renderToStaticMarkup(
      <LegacyCard onRegenerate={() => {}} pending error={null} />
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain("Wird erstellt…");
  });
  test("error → Fehlermeldung sichtbar", () => {
    const html = renderToStaticMarkup(
      <LegacyCard
        onRegenerate={() => {}}
        pending={false}
        error="Verkaufte Websites werden nicht automatisch neu erstellt — bitte Support kontaktieren."
      />
    );
    expect(html).toContain("bitte Support kontaktieren");
  });
});
