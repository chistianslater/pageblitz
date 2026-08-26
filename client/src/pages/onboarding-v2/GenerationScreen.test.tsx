import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GenerationScreen } from "./GenerationScreen";

function render(
  overrides: Partial<React.ComponentProps<typeof GenerationScreen>> = {}
): string {
  return renderToStaticMarkup(
    <GenerationScreen
      businessName="Schreinerei Brandt"
      token="tok-123"
      packId={null}
      hasDoc={false}
      progress={30}
      status="processing"
      error={null}
      onRetry={() => {}}
      {...overrides}
    />
  );
}

describe("GenerationScreen", () => {
  test("zeigt Firmenname, Fortschritt und Phase", () => {
    const html = render();
    expect(html).toContain("Schreinerei Brandt");
    expect(html).toContain('aria-valuenow="30"');
    // 30 = Bilder-Phase (Stufen aus runJob.ts: 25–54 Bilder, 55–89 Texte)
    expect(html).toContain("Bilder");
  });

  test("Phase Texte ab Fortschritt 55", () => {
    const html = render({ progress: 60 });
    expect(html).toContain("Texte");
    expect(html).toContain("Deine Texte entstehen");
    expect(html).toContain("pb-gen-writing-lines");
    expect(html).toContain("Überschrift");
  });

  test("Schreibanimation erscheint nur in der Textphase", () => {
    expect(render({ progress: 30 })).not.toContain("pb-gen-writing");
    expect(render({ progress: 90 })).not.toContain("pb-gen-writing");
  });

  test("ohne Zwischenstand: Pack-Skeleton sichtbar, kein Vorschau-iframe (Zeitmaschine, Task 4)", () => {
    const html = render({ hasDoc: false });
    expect(html).toContain("pb-studio-skeleton");
    expect(html).not.toContain("<iframe");
  });

  test("packId setzt die Pack-Farben als CSS-Variablen auf den Skeleton (toCssVars)", () => {
    const html = render({ packId: "werkbank" });
    expect(html).toContain("--pb-canvas");
    expect(html).toContain("--pb-accent");
  });

  test("mit Zwischenstand: iframe lädt /preview-ssr/<token> mit reveal=1 (Sektions-Einblendung nur im Preview-Modus)", () => {
    const html = render({ hasDoc: true, progress: 60 });
    expect(html).toContain("<iframe");
    expect(html).toContain("/preview-ssr/tok-123?");
    expect(html).toContain("reveal=1");
  });

  test("failed → Fehlermeldung + Erneut-versuchen-Button", () => {
    const html = render({ progress: 0, status: "failed", error: "LLM kaputt" });
    expect(html).toContain("LLM kaputt");
    expect(html).toContain("Erneut versuchen");
  });

  test("failed + retrying → Button gesperrt, anderer Label-Text", () => {
    const html = render({
      progress: 0,
      status: "failed",
      error: "LLM kaputt",
      retrying: true,
    });
    expect(html).toContain('disabled=""');
    expect(html).toContain("Wird erneut versucht");
  });
});
