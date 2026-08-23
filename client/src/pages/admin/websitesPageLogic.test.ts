import { describe, expect, test } from "vitest";
import { packNameFor, studioHrefFor } from "./websitesPageLogic";

describe("packNameFor", () => {
  test("bekannte stylePackId → Pack-Name", () => {
    expect(packNameFor({ stylePackId: "werkbank" })).toBe("Werkbank");
    expect(packNameFor({ stylePackId: "zunft" })).toBe("Zunft");
  });
  test("unbekannte stylePackId → Fallback", () => {
    expect(packNameFor({ stylePackId: "nicht-registriert" })).toBe("—");
  });
  test("keine stylePackId (v1-Website) → Fallback", () => {
    expect(packNameFor({})).toBe("—");
    expect(packNameFor(null)).toBe("—");
    expect(packNameFor(undefined)).toBe("—");
  });
});

describe("studioHrefFor", () => {
  test("vorhandener previewToken → /onboarding/<token>", () => {
    expect(studioHrefFor("abc123")).toBe("/onboarding/abc123");
  });
  test("kein previewToken → null (kein Link rendern)", () => {
    expect(studioHrefFor(null)).toBeNull();
    expect(studioHrefFor(undefined)).toBeNull();
    expect(studioHrefFor("")).toBeNull();
  });
});
