import { describe, expect, test } from "vitest";
import { previewCtaTag } from "./previewCta";

describe("previewCtaTag (Postkarten-Funnel, 2026-09-05)", () => {
  const tag = previewCtaTag({
    businessName: "Haar Galerie",
    studioHref: "/onboarding/abc123",
  });

  test("nennt den Betrieb und führt ins Studio", () => {
    expect(tag).toContain("Haar Galerie");
    expect(tag).toContain('href="/onboarding/abc123"');
    expect(tag).toContain("Website übernehmen");
  });

  test("startet versteckt und zeigt sich nur im obersten Fenster — im Studio-iframe bleibt sie weg", () => {
    expect(tag).toContain("hidden");
    expect(tag).toContain("window.top === window.self");
  });

  test("hidden schlaegt die eigene display-Regel — sonst bliebe die Leiste im iframe sichtbar", () => {
    // Befund 2026-09-05: #pb-preview-cta{display:flex} hat hoehere
    // Spezifitaet als die Browser-Regel [hidden]{display:none}. Im Studio
    // wurde die Leiste dadurch trotz hidden gerendert (241 px hoch).
    expect(tag).toContain("#pb-preview-cta[hidden]{display:none}");
  });

  test("Firmenname wird escaped — er stammt aus dem Dokument", () => {
    const böse = previewCtaTag({
      businessName: '"><script>alert(1)</script>',
      studioHref: "/onboarding/x",
    });
    expect(böse).not.toContain("<script>alert(1)</script>");
    expect(böse).toContain("&lt;script&gt;");
  });

  test("auch das Ziel wird escaped", () => {
    const tag2 = previewCtaTag({
      businessName: "X",
      studioHref: '/onboarding/a"onmouseover="alert(1)',
    });
    expect(tag2).not.toContain('onmouseover="alert(1)"');
  });

  test("ohne Angaben kommt nichts zurück", () => {
    expect(previewCtaTag(null)).toBe("");
  });
});
