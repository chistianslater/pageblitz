import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProofBar } from "./ProofBar";
import { PRICE_YEARLY } from "./primitives";

describe("ProofBar (Beweis-Streifen, Nachtschicht 2026-08-29)", () => {
  const html = renderToString(<ProofBar />);

  it("zeigt die drei Anker: Agentur-Preis, Wartezeit, Risiko", () => {
    expect(html).toContain("Statt Agentur");
    expect(html).toContain("Statt Wartezeit");
    expect(html).toContain("Dein Risiko");
    expect(html).toContain(`${PRICE_YEARLY}/Monat`);
    expect(html).toContain("3 Minuten");
    expect(html).toContain("0 €");
  });

  it("setzt die durchgestrichenen Anker als <s> mit Screenreader-Langform", () => {
    expect(html).toMatch(/<s[^>]*aria-label="statt 2\.000 bis 8\.000 Euro"/);
    expect(html).toMatch(/<s[^>]*aria-label="statt 4 bis 12 Wochen"/);
  });
});
