import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import type { StudioLegal } from "../../../../../server/onboardingV2/state";
import { LegalPanel, legalDefaults } from "./LegalPanel";

/**
 * LegalPanel nutzt trpc.onboardingV2.updateLegal.useMutation() direkt im
 * Component-Body (kein separates, mutationsfreies Sub-Component wie bei
 * TextsPanel/AddonsPanel) — braucht also denselben trpc/QueryClient-Wrapper
 * wie CheckoutBar.test.tsx, sonst wirft useMutation() außerhalb eines
 * Providers.
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

const initial: StudioLegal = {
  legalOwner: "Café Sonnenblick GmbH",
  legalStreet: "Hauptstraße 12",
  legalZip: "80331",
  legalCity: "München",
  legalEmail: "kontakt@sonnenblick-cafe.de",
  legalPhone: "089 1234567",
  legalVatId: "",
};

describe("legalDefaults", () => {
  test("übernimmt initial und openingHours unverändert als Formular-Startwert (E-Mail vorbelegt)", () => {
    const openingHours = [{ day: "Mo–Fr", hours: "9–18 Uhr" }];
    const result = legalDefaults(initial, openingHours);
    expect(result).toEqual({ ...initial, openingHours });
    expect(result.legalEmail).toBe("kontakt@sonnenblick-cafe.de");
  });

  test("leere Öffnungszeiten → Mo–Fr-Platzhalter", () => {
    const result = legalDefaults(initial, []);
    expect(result.openingHours).toEqual([
      { day: "Mo–Fr", hours: "09:00–17:00" },
    ]);
  });

  test("nur Montag → Mo–Fr-Platzhalter", () => {
    const result = legalDefaults(initial, [
      { day: "Montag", hours: "09:00–17:00" },
    ]);
    expect(result.openingHours).toEqual([
      { day: "Mo–Fr", hours: "09:00–17:00" },
    ]);
  });
});

describe("LegalPanel", () => {
  test("rendert das E-Mail-Feld mit Label und Typ 'email'", () => {
    const html = renderWithTrpc(
      <LegalPanel
        token={"t".repeat(32)}
        initial={initial}
        openingHours={[]}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain(
      '<label for="pb-legal-legalEmail">E-Mail (für das Impressum)</label>'
    );
    expect(html).toContain('id="pb-legal-legalEmail" type="email"');
  });

  test("alle Pflichtfelder sind als <label> mit zugehörigem Input vorhanden", () => {
    const html = renderWithTrpc(
      <LegalPanel
        token={"t".repeat(32)}
        initial={initial}
        openingHours={[]}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    for (const label of [
      "Inhaber/Firma",
      "Straße und Hausnummer",
      "PLZ",
      "Ort",
      "E-Mail (für das Impressum)",
      "Telefon",
    ]) {
      expect(html).toContain(`<label for="pb-legal-`);
      expect(html).toContain(`>${label}</label>`);
    }
  });

  test("rendert eine Zeile pro Öffnungszeiten-Eintrag aus den Props (react-hook-form befüllt den Wert per ref, nicht als value-Attribut — deshalb wird hier die Zeilenzahl geprüft, der Inhalt über legalDefaults oben)", () => {
    const openingHours = [
      { day: "Mo–Fr", hours: "9–18 Uhr" },
      { day: "Sa", hours: "10–14 Uhr" },
    ];
    const html = renderWithTrpc(
      <LegalPanel
        token={"t".repeat(32)}
        initial={initial}
        openingHours={openingHours}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    const rowMatches = html.match(/class="pb-studio-hours-row"/g) ?? [];
    expect(rowMatches.length).toBe(openingHours.length);
    expect(html).toContain('name="openingHours.0.day"');
    expect(html).toContain('name="openingHours.1.day"');
  });

  test("Öffnungszeiten-Zeile hat einen kompakten Entfernen-Button mit aria-label (Finding F1)", () => {
    const html = renderWithTrpc(
      <LegalPanel
        token={"t".repeat(32)}
        initial={initial}
        openingHours={[{ day: "Mo–Fr", hours: "9–18 Uhr" }]}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain('aria-label="Zeile entfernen"');
    expect(html).toContain("pb-studio-hours-row");
  });

  test("ohne GMB-Öffnungszeiten steht der Mo–Fr-Platzhalter als Zeile bereit", () => {
    const html = renderWithTrpc(
      <LegalPanel
        token={"t".repeat(32)}
        initial={initial}
        openingHours={[]}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("pb-studio-hours-row");
    expect(html).toContain("+ Zeile");
  });
});
