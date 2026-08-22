import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { AddonsList, AddonsPanel } from "./AddonsPanel";

/**
 * AddonsPanel nutzt trpc.onboardingV2.updateAddons.useMutation() direkt im
 * Component-Body — braucht denselben trpc/QueryClient-Wrapper wie
 * LegalPanel.test.tsx/CheckoutBar.test.tsx, sonst wirft useMutation()
 * außerhalb eines Providers. Die Mutation feuert nur bei .mutate(), nicht
 * beim reinen Rendern — renderToStaticMarkup mit ungenutztem Client ist
 * daher sicher.
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

describe("AddonsList", () => {
  test("Summe für gallery + menu jährlich zeigt 27,70 €", () => {
    // 19,90 € Basis (jährlich) + 3,90 € Galerie + 3,90 € Speisekarte.
    // Abweichung vom Task-Brief (dort: gallery+aiChat = 33,70 €): laut
    // Controller-Ruling zählt aiChat nicht in die Summe (siehe unten).
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ gallery: true, menu: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    expect(html).toContain("27,70 €");
  });

  test("team ist als 'bald verfügbar' gesperrt und zählt nie in die Summe", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ team: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    const lockedMatches = html.match(/bald verfügbar/g) ?? [];
    expect(lockedMatches.length).toBe(1);
    // Nur Basispreis — team darf nicht mitzählen, obwohl `value` es
    // (defensiv getestet) auf true stehen hat.
    expect(html).toContain("19,90 €");

    const disabledMatches = html.match(/disabled=""/g) ?? [];
    expect(disabledMatches.length).toBe(1);
  });

  test("aiChat und booking sind seit Plan B3 buchbar, umschaltbar und zählen in die Summe", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ aiChat: true, booking: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    // 19,90 € Basis + 9,90 € KI-Chat + 4,90 € Terminbuchung = 34,70 €.
    expect(html).toContain("34,70 €");
    const lockedMatches = html.match(/bald verfügbar/g) ?? [];
    expect(lockedMatches.length).toBe(1); // nur team
  });

  test("bindbare Add-ons sind umschaltbar und als aktiv markiert", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ contactForm: true }}
        onToggle={() => {}}
        interval="monthly"
      />
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
});

describe("AddonsPanel", () => {
  test("Finding F1: zeigt den Hinweistext zu Kontaktformular (sofort) vs. KI-Chat/Terminbuchung (nach Freischaltung)", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        addOns={{}}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Kontaktformular erscheint sofort in der Vorschau");
    expect(html).toContain("Team folgt.");
  });
});
