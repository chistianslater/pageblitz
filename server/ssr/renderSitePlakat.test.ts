import { describe, expect, test } from "vitest";
import { systemFontHead } from "./renderSite";
import { PLAKAT } from "../../shared/designSystems/plakat";

describe("SSR: Plakat-Schriften", () => {
  test("genau zwei Preloads: League Gothic und Hanken Grotesk", () => {
    const links = systemFontHead(PLAKAT).split("\n");
    expect(links).toHaveLength(2);
    expect(links[0]).toContain('href="/fonts/systems/league-gothic-latin-wdth.woff2"');
    expect(links[1]).toContain('href="/fonts/systems/hanken-grotesk-latin-wght.woff2"');
    for (const l of links) {
      expect(l).toContain('as="font"');
      expect(l).toContain("crossorigin");
    }
  });
});
