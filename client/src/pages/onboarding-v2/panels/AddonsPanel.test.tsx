import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import type { WebsiteDataV2 } from "@shared/siteContract/types";
import {
  AddonsList,
  AddonsPanel,
  pagesFromDoc,
  teamFromDoc,
} from "./AddonsPanel";

const blankDoc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Handwerk GmbH",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

const docWithTeam: WebsiteDataV2 = {
  ...blankDoc,
  sections: [
    ...blankDoc.sections,
    {
      type: "team",
      headline: "Unser Team",
      members: [{ name: "Anna Beispiel", role: "Meisterin" }],
    },
  ],
};

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

  test("team ist seit Plan B5 buchbar, umschaltbar und zählt in die Summe", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ team: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    // Keine "bald verfügbar"-Zeile mehr — alle sieben Extras sind buchbar
    // (BOOKABLE_ADDON_KEYS, @shared/pricing).
    const lockedMatches = html.match(/bald verfügbar/g) ?? [];
    expect(lockedMatches.length).toBe(0);
    // 19,90 € Basis (jährlich) + 3,90 € Team.
    expect(html).toContain("23,80 €");
    expect(html).toContain('aria-pressed="true"');
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
    expect(lockedMatches.length).toBe(0); // keine gesperrten Extras mehr
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
        doc={blankDoc}
        addOns={{}}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Kontaktformular erscheint sofort in der Vorschau");
    // Team ist seit Plan B5 Task 2 kein "folgt später"-Hinweis mehr, sondern
    // buchbar und pflegbar — der veraltete Satz ist entfernt.
    expect(html).not.toContain("Team folgt.");
  });

  test("Team-Extra inaktiv → kein 'Team pflegen'-Unterbereich", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{ team: false }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).not.toContain("Team pflegen");
  });

  test("Team-Extra aktiv → 'Team pflegen'-Unterbereich mit vorhandenen Mitgliedern und Übernehmen-Button", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={docWithTeam}
        addOns={{ team: true }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Team pflegen");
    expect(html).toContain('value="Anna Beispiel"');
    expect(html).toContain('value="Meisterin"');
    expect(html).toContain(">Übernehmen<");
  });
});

describe("AddonsPanel — Unterseiten (Plan B6, Task 5)", () => {
  const docWithPage: WebsiteDataV2 = {
    ...blankDoc,
    pages: [
      {
        slug: "leistungen-im-detail",
        title: "Leistungen im Detail",
        seo: { title: "Leistungen im Detail", description: "" },
        sections: [{ type: "pageHeader", title: "Leistungen im Detail" }],
      },
    ],
  };

  test("Unterseiten-Extra ist buchbar (Schalter + 3,90 €)", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ subpages: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    expect(html).toContain("Unterseiten");
    // 19,90 € Basis (jährlich) + 3,90 € Unterseiten.
    expect(html).toContain("23,80 €");
  });

  test("Unterseiten inaktiv → kein Unterseiten-Unterbereich", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={docWithPage}
        addOns={{ subpages: false }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).not.toContain("Unterseiten pflegen");
    expect(html).not.toContain('aria-label="Seitentitel Seite 1"');
  });

  test("Unterseiten aktiv → Unterbereich mit vorhandener Seite und Übernehmen-Button", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={docWithPage}
        addOns={{ subpages: true }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Unterseiten pflegen");
    expect(html).toContain('aria-label="Seitentitel Seite 1"');
    expect(html).toContain('value="Leistungen im Detail"');
    expect(html).toContain('value="leistungen-im-detail"');
    expect(html).toContain(">Übernehmen<");
  });

  test("pagesFromDoc liest pages[] bzw. liefert eine leere Liste", () => {
    expect(pagesFromDoc(docWithPage)).toEqual(docWithPage.pages);
    expect(pagesFromDoc(blankDoc)).toEqual([]);
  });
});

describe("teamFromDoc", () => {
  test("liest bestehende Team-Sektion", () => {
    expect(teamFromDoc(docWithTeam)).toEqual({
      headline: "Unser Team",
      members: [{ name: "Anna Beispiel", role: "Meisterin" }],
    });
  });

  test("ohne Team-Sektion → leere Mitgliederliste", () => {
    expect(teamFromDoc(blankDoc)).toEqual({ members: [] });
  });
});
