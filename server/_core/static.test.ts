import { describe, expect, test } from "vitest";
import { isSpaRoute } from "./static";

describe("isSpaRoute", () => {
  test("Studio-Route /onboarding/:token wird von der SPA bedient", () => {
    expect(isSpaRoute("/onboarding/abc123")).toBe(true);
  });

  test("Studio-Route mit Trailing Slash wird normalisiert", () => {
    expect(isSpaRoute("/onboarding/abc123/")).toBe(true);
  });

  // "legal" statt "impressum": isSpaRoute() ignoriert den Query-String
  // ohnehin komplett (nur der Pfad wird geprüft), aber der Beispielwert soll
  // trotzdem eine echte Panel-ID sein — CHECKLIST_ORDER in
  // shared/onboardingV2/checklist.ts kennt "style"/"photos"/"texts"/"offer"/
  // "legal"/"addons", nicht "impressum".
  test("Studio-Route mit Query-String bleibt erkannt (gültige Panel-ID)", () => {
    expect(isSpaRoute("/onboarding/abc123?panel=legal")).toBe(true);
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

  // Plan B4b, Task 1: /layout-preview/:key + LayoutPreviewStandalone.tsx sind
  // entfernt (Ersatz: /dev/site-preview) — die Route ist keine SPA-Route mehr.
  test("Entfernte Route /layout-preview/:key wird nicht mehr erkannt", () => {
    expect(isSpaRoute("/layout-preview/x")).toBe(false);
  });

  // Plan B4b, Task 3: /variant-preview + VariantPreviewPage.tsx sind entfernt
  // (Studio ersetzt den A/B-Variant-Picker) — die Route ist keine SPA-Route mehr.
  test("Entfernte Route /variant-preview wird nicht mehr erkannt", () => {
    expect(isSpaRoute("/variant-preview")).toBe(false);
  });

  // Plan B6, Task 3: /site/:slug/:page (Unterseiten-Add-on) — der Regex
  // erkennt jede einzelne Slug-artige Unterroute (nicht nur impressum/
  // datenschutz), die tatsächliche Existenz der Page prüft die SSR-
  // Middleware bzw. SitePage clientseitig.
  test("/site/:slug (Startseite einer Kundenseite) wird erkannt", () => {
    expect(isSpaRoute("/site/schreinerei-brandt")).toBe(true);
  });

  test("/site/:slug/impressum und /site/:slug/datenschutz bleiben erkannt", () => {
    expect(isSpaRoute("/site/schreinerei-brandt/impressum")).toBe(true);
    expect(isSpaRoute("/site/schreinerei-brandt/datenschutz")).toBe(true);
  });

  test("/site/:slug/<page-slug> (Unterseite) wird erkannt", () => {
    expect(isSpaRoute("/site/schreinerei-brandt/leistungen-im-detail")).toBe(
      true
    );
  });

  test("/site/:slug/<verschachtelter Pfad> (zwei Segmente) wird NICHT erkannt", () => {
    expect(isSpaRoute("/site/schreinerei-brandt/a/b")).toBe(false);
  });
});
