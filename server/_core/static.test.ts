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

  // Task 3 (Cutover-Redirects): /preview/:token wird VOR dem SPA-Fallback
  // serverseitig auf /preview-ssr/:token umgeleitet (registerSsrRoutes) und
  // ist deshalb bewusst KEINE SPA-Route mehr — nur die Onboarding-Unterroute
  // bleibt eine (Redirect-Komponente auf /onboarding/:token).
  test("Legacy-Route /preview/:token/onboarding wird von der SPA bedient (Redirect-Komponente)", () => {
    expect(isSpaRoute("/preview/abc123/onboarding")).toBe(true);
  });

  test("Bloßes /preview/:token ist keine SPA-Route mehr (serverseitiger Redirect greift vorher)", () => {
    expect(isSpaRoute("/preview/abc123")).toBe(false);
  });

  test("Legacy-Route /websites/:id/onboarding wird von der SPA bedient (Redirect-Komponente)", () => {
    expect(isSpaRoute("/websites/42/onboarding")).toBe(true);
  });
});
