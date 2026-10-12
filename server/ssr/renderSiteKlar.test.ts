import { describe, expect, test } from "vitest";
import { systemFontHead } from "./renderSite";
import { KLAR } from "../../shared/designSystems/klar";

describe("SSR: Klar-Schriften", () => {
  test("genau zwei Preloads: DM Sans und Atkinson Hyperlegible Next (latin)", () => {
    const links = systemFontHead(KLAR).split("\n");
    expect(links).toHaveLength(2);
    expect(links[0]).toContain('href="/fonts/systems/dm-sans-latin-wght.woff2"');
    expect(links[1]).toContain('href="/fonts/systems/atkinson-next-latin-wght.woff2"');
    for (const l of links) {
      expect(l).toContain('as="font"');
      expect(l).toContain("crossorigin");
      expect(l).not.toContain("latin-ext");
    }
  });
});
