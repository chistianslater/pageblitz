import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LoginShell } from "./LoginShell";

describe("LoginShell", () => {
  test("rendert gemeinsame Pageblitz-Chrome mit Titel, Inhalt und Footer", () => {
    const html = renderToStaticMarkup(
      <LoginShell
        eyebrow="Kundenbereich"
        title="Willkommen zurück."
        description="Sicher anmelden."
        footer={<a href="/start">Website erstellen</a>}
      >
        <form>
          <input aria-label="E-Mail" />
        </form>
      </LoginShell>
    );
    expect(html).toContain("bg-lp-canvas");
    expect(html).toContain("border-lp-line");
    expect(html).toContain("Pageblitz");
    expect(html).toContain("Kundenbereich");
    expect(html).toContain("Willkommen zurück.");
    expect(html).toContain("Website erstellen");
  });
});
