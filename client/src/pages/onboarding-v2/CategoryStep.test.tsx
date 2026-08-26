import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryStep } from "./CategoryStep";

function render(
  overrides: Partial<React.ComponentProps<typeof CategoryStep>> = {}
): string {
  return renderToStaticMarkup(
    <CategoryStep
      businessName="Testbetrieb"
      onSubmit={() => {}}
      pending={false}
      error={null}
      {...overrides}
    />
  );
}

describe("CategoryStep", () => {
  test("zeigt Kicker, Frage und Business-Namen im Studio-Look", () => {
    const html = render({ businessName: "Schau und Horch" });
    expect(html).toContain("Bevor es losgeht");
    expect(html).toContain("Was macht dein Betrieb?");
    expect(html).toContain("Schau und Horch");
    expect(html).toContain("pb-studio-gen");
  });

  test("Suchfeld ist eine beschriftete Combobox mit Freitext-Placeholder", () => {
    const html = render();
    expect(html).toContain('role="combobox"');
    expect(html).toContain(">Branche</label>");
    expect(html).toContain("Friseursalon");
    // Liste ist initial zu (keine Eingabe) — keine Options im Markup.
    expect(html).not.toContain('role="option"');
  });

  test("Weiter-Button ist ohne Eingabe deaktiviert", () => {
    const html = render();
    expect(html).toContain("Weiter");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Weiter<\/button>/);
  });

  test("pending → Button gesperrt mit Fortschrittstext", () => {
    const html = render({ pending: true });
    expect(html).toContain("Wird gespeichert …");
  });

  test("erkannte Branche wird vorbefüllt und muss bestätigt werden", () => {
    const html = render({ initialCategory: "IT-Dienstleister" });
    expect(html).toContain('value="IT-Dienstleister"');
    expect(html).toContain("Wir haben");
    expect(html).toContain("Branche bestätigen &amp; Website erstellen");
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>Branche best/);
  });

  test("error → role=alert mit deutscher Meldung", () => {
    const html = render({ error: "Bitte gib an, was dein Betrieb macht." });
    expect(html).toContain('role="alert"');
    expect(html).toContain("Bitte gib an, was dein Betrieb macht.");
  });
});
