import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandImportChoices } from "./BrandImportCard";

const full = {
  domain: "brandt.example",
  logoUrl: "https://brandt.example/logo.svg",
  accent: "#a3402a",
  accentName: "Terrakotta",
  fontPairId: "elegant",
  fonts: ["Playfair Display", "Lato"],
  hasAnything: true,
};

describe("BrandImportChoices (Marken-Import, 2026-09-03)", () => {
  test("zeigt Domain, Logo-Vorschau, Farbe mit Hex und die erkannten Schriften", () => {
    const html = renderToStaticMarkup(
      <BrandImportChoices
        suggestion={full}
        picked={{ logo: true, accent: true, fontPair: true }}
        onToggle={() => {}}
        busy={false}
      />
    );
    expect(html).toContain("brandt.example");
    expect(html).toContain("https://brandt.example/logo.svg");
    expect(html).toContain("#a3402a");
    expect(html).toContain("Terrakotta");
    expect(html).toContain("Playfair Display");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(3);
  });

  test("nicht erkannte Teile erscheinen nicht", () => {
    const html = renderToStaticMarkup(
      <BrandImportChoices
        suggestion={{ ...full, logoUrl: null, fontPairId: null, fonts: [] }}
        picked={{ logo: false, accent: true, fontPair: false }}
        onToggle={() => {}}
        busy={false}
      />
    );
    expect(html).not.toContain("logo.svg");
    expect(html).not.toContain("Playfair Display");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
  });
});
