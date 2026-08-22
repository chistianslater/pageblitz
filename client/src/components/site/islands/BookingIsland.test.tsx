import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BookingIsland } from "./BookingIsland";

describe("BookingIsland — SSR-Markup", () => {
  test("Button mit Label 'Termin', aria-expanded=false und aria-controls auf die Panel-Id", () => {
    const html = renderToStaticMarkup(<BookingIsland slug="brandt" />);
    expect(html).toContain('class="pb-island-fab-btn"');
    expect(html).toContain(">Termin<");
    expect(html).toContain('aria-expanded="false"');
    const controls = html.match(/aria-controls="([^"]+)"/);
    expect(controls).not.toBeNull();
    const panelId = controls?.[1];
    expect(html).toContain(`id="${panelId}"`);
  });

  test("Panel ist ein hidden role=dialog ohne Schritt-Inhalt (Settings noch nicht geladen)", () => {
    const html = renderToStaticMarkup(
      <BookingIsland slug="brandt" businessName="Schreinerei Brandt" />
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('hidden=""');
    // Vor dem (client-seitigen) Öffnen werden weder Datumsliste noch
    // Fehlermeldung gerendert — Einstellungen werden erst beim Öffnen geladen.
    expect(html).not.toContain("pb-island-dates");
    expect(html).not.toContain("pb-island-status");
  });

  test("aria-label fällt ohne businessName auf 'Termin buchen' zurück", () => {
    const html = renderToStaticMarkup(<BookingIsland slug="brandt" />);
    expect(html).toContain('aria-label="Termin buchen"');
  });

  test("aria-label nutzt businessName, solange keine Settings geladen sind", () => {
    const html = renderToStaticMarkup(
      <BookingIsland slug="brandt" businessName="Schreinerei Brandt" />
    );
    expect(html).toContain('aria-label="Termin bei Schreinerei Brandt"');
  });

  test("enthält den Schließen-Button im Panel-Header", () => {
    const html = renderToStaticMarkup(<BookingIsland slug="brandt" />);
    expect(html).toContain(">Schließen<");
  });

  test("businessName wird HTML-escaped, kein XSS über Props möglich", () => {
    const html = renderToStaticMarkup(
      <BookingIsland slug="brandt" businessName={"<script>alert(1)</script>"} />
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
