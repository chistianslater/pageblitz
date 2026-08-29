import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatIsland } from "./ChatIsland";

describe("ChatIsland — SSR-Markup", () => {
  test("Button mit Label 'Chat', aria-expanded=false und aria-controls auf die Panel-Id", () => {
    const html = renderToStaticMarkup(<ChatIsland slug="brandt" />);
    expect(html).toContain('class="pb-island-fab-btn pb-island-chat-fab"');
    expect(html).toContain('aria-label="Chat"');
    expect(html).toContain(">Chat<");
    expect(html).toContain('aria-expanded="false"');
    const controls = html.match(/aria-controls="([^"]+)"/);
    expect(controls).not.toBeNull();
    const panelId = controls?.[1];
    expect(html).toContain(`id="${panelId}"`);
  });

  test("Panel ist ein hidden role=dialog mit aria-label und ohne Nachrichten", () => {
    const html = renderToStaticMarkup(
      <ChatIsland slug="brandt" businessName="Schreinerei Brandt" />
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('hidden=""');
    expect(html).toContain('aria-label="Chat mit Schreinerei Brandt"');
    // Kein Begrüßungstext im initialen SSR-Markup — Nachrichten entstehen erst
    // beim (client-seitigen) Öffnen des Panels.
    expect(html).not.toContain("pb-island-msg");
  });

  test("aria-label fällt ohne businessName auf 'Chat' zurück", () => {
    const html = renderToStaticMarkup(<ChatIsland slug="brandt" />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Chat"');
    expect(html).not.toContain("Chat mit");
  });

  test("enthält Eingabefeld, Senden- und Schließen-Button mit zugänglichen Namen", () => {
    const html = renderToStaticMarkup(<ChatIsland slug="brandt" />);
    expect(html).toContain('aria-label="Nachricht an den Chat"');
    expect(html).toContain('aria-label="Nachricht senden"');
    expect(html).toContain('aria-label="Schließen"');
    expect(html).toContain("pb-island-chat-panel");
    expect(html).toContain("pb-island-chat-composer");
  });

  test("welcomeMessage/businessName tauchen nicht ungefiltert im SSR-Markup auf (erst nach dem Öffnen relevant), aber HTML bleibt gültig bei Sonderzeichen", () => {
    const html = renderToStaticMarkup(
      <ChatIsland
        slug="brandt"
        businessName={"<script>alert(1)</script>"}
        welcomeMessage="Hallo & willkommen"
      />
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  test("Panel trägt aria-modal='true'", () => {
    const html = renderToStaticMarkup(<ChatIsland slug="brandt" />);
    expect(html).toContain('aria-modal="true"');
  });

  test("disabled=true rendert nur den ausgegrauten Button, keinen Dialog", () => {
    const html = renderToStaticMarkup(<ChatIsland slug="brandt" disabled />);
    expect(html).toContain('class="pb-island-fab-btn pb-island-chat-fab"');
    expect(html).toContain(">Chat<");
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('title="In der Vorschau nicht aktiv"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("pb-island-panel");
  });
});
