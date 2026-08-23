import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { TeamEditor } from "./TeamEditor";
import type { TeamValue } from "./teamLogic";

/**
 * TeamEditor nutzt trpc.onboardingV2.uploadPhoto.useMutation() direkt im
 * Component-Body (Foto-Upload je Mitgliederzeile) — braucht denselben
 * trpc/QueryClient-Wrapper wie AddonsPanel.test.tsx/LegalPanel.test.tsx,
 * sonst wirft useMutation() außerhalb eines Providers.
 */
function renderWithTrpc(node: React.ReactElement): string {
  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
  });
  return renderToStaticMarkup(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>
    </trpc.Provider>
  );
}

const twoMembers: TeamValue = {
  members: [
    { name: "Anna Beispiel", role: "Meisterin" },
    { name: "Bert Muster" },
  ],
};

describe("TeamEditor", () => {
  test("rendert Name- und Rolle-Felder für vorhandene Mitglieder", () => {
    const html = renderWithTrpc(
      <TeamEditor token={"t".repeat(32)} value={twoMembers} onChange={() => {}} />
    );
    expect(html).toContain('value="Anna Beispiel"');
    expect(html).toContain('value="Meisterin"');
    expect(html).toContain('value="Bert Muster"');
  });

  test("rendert Hinzufügen/Entfernen/Sortieren-Buttons mit aria-label je Zeile", () => {
    const html = renderWithTrpc(
      <TeamEditor token={"t".repeat(32)} value={twoMembers} onChange={() => {}} />
    );
    expect(html).toContain("Mitglied hinzufügen");
    expect(html).toContain("aria-label=\"‚Anna Beispiel‘ nach oben verschieben\"");
    expect(html).toContain("aria-label=\"‚Anna Beispiel‘ nach unten verschieben\"");
    expect(html).toContain("aria-label=\"‚Anna Beispiel‘ entfernen\"");
    expect(html).toContain("Foto wählen");
  });

  test("erstes Mitglied hat den 'nach oben'-Button deaktiviert, letztes den 'nach unten'-Button", () => {
    const html = renderWithTrpc(
      <TeamEditor token={"t".repeat(32)} value={twoMembers} onChange={() => {}} />
    );
    expect(html).toContain(
      'aria-label="‚Anna Beispiel‘ nach oben verschieben" disabled=""'
    );
    expect(html).toContain(
      'aria-label="‚Bert Muster‘ nach unten verschieben" disabled=""'
    );
  });

  test("leere Liste zeigt einen Hinweistext statt Mitgliederzeilen", () => {
    const html = renderWithTrpc(
      <TeamEditor
        token={"t".repeat(32)}
        value={{ members: [] }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Noch keine Mitglieder");
    expect(html).not.toContain("aria-label=\"Name\"");
  });

  test("leerer Name erzeugt eine Fehlermeldung mit Positionsangabe", () => {
    const html = renderWithTrpc(
      <TeamEditor
        token={"t".repeat(32)}
        value={{ members: [{ name: "" }] }}
        onChange={() => {}}
      />
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Name fehlt bei Mitglied 1.");
  });

  test("gültige Mitglieder erzeugen keine Fehlermeldung", () => {
    const html = renderWithTrpc(
      <TeamEditor token={"t".repeat(32)} value={twoMembers} onChange={() => {}} />
    );
    // Kein role="alert" außerhalb evtl. Upload-Fehler (hier nicht gerendert).
    expect(html).not.toContain('role="alert"');
  });
});
