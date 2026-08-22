import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { applyStylePack, parsePackId } from "./applyPatch";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "B",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

describe("parsePackId", () => {
  test("kennt registrierte IDs, wirft BAD_REQUEST sonst", () => {
    expect(parsePackId("kanzlei")).toBe("kanzlei");
    expect(() => parsePackId("disco")).toThrowError(/Unbekanntes Style-Pack/);
  });
});
describe("applyStylePack", () => {
  test("setzt stylePackId, mutiert das Original nicht, Rest bleibt identisch", () => {
    const next = applyStylePack(doc, "kanzlei");
    expect(next.stylePackId).toBe("kanzlei");
    expect(doc.stylePackId).toBe("werkbank");
    expect(next.sections).toEqual(doc.sections);
  });
});
