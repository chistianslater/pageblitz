import { describe, expect, test } from "vitest";
import { isSpaRoute } from "./static";

describe("isSpaRoute", () => {
  test("Studio-Route /onboarding/:token wird von der SPA bedient", () => {
    expect(isSpaRoute("/onboarding/abc123")).toBe(true);
  });

  test("Studio-Route mit Trailing Slash wird normalisiert", () => {
    expect(isSpaRoute("/onboarding/abc123/")).toBe(true);
  });

  test("Studio-Route mit Query-String bleibt erkannt", () => {
    expect(isSpaRoute("/onboarding/abc123?panel=impressum")).toBe(true);
  });

  test("Studio-Route mit verschachteltem Pfad wird NICHT erkannt (nur ein Token-Segment)", () => {
    expect(isSpaRoute("/onboarding/abc123/extra")).toBe(false);
  });

  test("Root-Route bleibt erkannt", () => {
    expect(isSpaRoute("/")).toBe(true);
  });

  test("unbekannter Pfad wird nicht erkannt", () => {
    expect(isSpaRoute("/gibtsnicht-xyz")).toBe(false);
  });
});
