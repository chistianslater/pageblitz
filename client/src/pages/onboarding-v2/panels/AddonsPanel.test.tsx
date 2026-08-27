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
  reconcileAddOnDraft,
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
    expect(html).toContain("Weniger Hürden bis zur Anfrage");
    expect(html).toContain("pb-studio-addon-icon");
  });

  test("gebuchte Speisekarte: Bearbeiten ist die Hauptaktion, Toggle bleibt sekundär", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ menu: true, gallery: true }}
        onToggle={() => {}}
        interval="yearly"
        onEditExtra={() => {}}
      />
    );
    expect(html).toContain('data-open-extra="menu"');
    expect(html).toContain('data-edit-kind="openPanel"');
    expect(html).toContain('data-open-extra="gallery"');
    expect(html).toContain(">Bearbeiten<");
    expect(html).toContain(">Ausgewählt<");
    expect(html).toContain('data-has-editor="true"');
  });

  test("ungebuchtes Extra hat keinen Bearbeiten-Button, nur Hinzufügen", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ menu: false }}
        onToggle={() => {}}
        interval="yearly"
        onEditExtra={() => {}}
      />
    );
    expect(html).not.toContain('data-open-extra="menu"');
    expect(html).toContain(">Hinzufügen<");
    expect(html).not.toContain(">Bearbeiten<");
  });

  test("gebuchtes Team: Bearbeiten scrollt zum Editor, nicht zum Kauf-Toggle", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ team: true }}
        onToggle={() => {}}
        interval="yearly"
        onEditExtra={() => {}}
      />
    );
    expect(html).toContain('data-open-extra="team"');
    expect(html).toContain('data-edit-kind="scrollEditor"');
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

  test("aktive Extras zeigen gepolsterte Quick-Settings und Dashboard-Hinweis", () => {
    const docWithContact: WebsiteDataV2 = {
      ...blankDoc,
      sections: [
        ...blankDoc.sections,
        { type: "contact", headline: "Kontakt" },
      ],
    };
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={docWithContact}
        addOns={{ contactForm: true, aiChat: true, booking: true }}
        chatWelcomeMessage="Hallo! Wie kann ich helfen?"
        onApplied={() => {}}
        onClose={() => {}}
        onNext={() => {}}
      />
    );
    expect(html).toContain("Schnelleinstellungen");
    expect(html).toContain('value="Kontakt"');
    expect(html).toContain('value="Hallo! Wie kann ich helfen?"');
    expect(html).toContain("Dauer, freie Zeiten, Puffer");
    expect(html).toContain(
      "Du kannst nachher alles noch im Kunden-Dashboard bearbeiten."
    );
    expect(html).toContain("Auswahl speichern &amp; weiter");
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
    expect(html).toContain('id="pb-addon-editor-team"');
    expect(html).toContain('data-open-extra="team"');
    expect(html).toContain('data-edit-kind="scrollEditor"');
  });

  test("gebuchte Galerie zeigt Sprung in den Foto-Editor", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{ gallery: true }}
        onApplied={() => {}}
        onClose={() => {}}
        onOpenExtraEditor={() => {}}
      />
    );
    expect(html).toContain("Gebuchte Extras pflegen");
    expect(html).toContain("Bildergalerie bearbeiten");
    expect(html).toContain('data-open-extra="gallery"');
    expect(html).toContain('data-edit-kind="openPanel"');
  });

  test("gebuchte Speisekarte in der Übersicht öffnet den Speisekarten-Editor", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{ menu: true }}
        onApplied={() => {}}
        onClose={() => {}}
        onOpenExtraEditor={() => {}}
      />
    );
    expect(html).toContain('data-open-extra="menu"');
    expect(html).toContain('data-edit-kind="openPanel"');
    expect(html).toContain("Speisekarte bearbeiten");
    expect(html).toContain(">Bearbeiten<");
  });

  test("Galerie-Überschrift in den Extras nutzt keinen Editor-Anker — der liegt im Foto-Panel", () => {
    const docWithGallery: WebsiteDataV2 = {
      ...blankDoc,
      sections: [
        ...blankDoc.sections,
        {
          type: "gallery",
          headline: "Impressionen",
          images: [{ url: "https://x/1.jpg", alt: "A" }],
        },
      ],
    };
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={docWithGallery}
        addOns={{ gallery: true }}
        onApplied={() => {}}
        onClose={() => {}}
        onOpenExtraEditor={() => {}}
      />
    );
    expect(html).toContain('id="pb-addon-heading-gallery"');
    expect(html).not.toContain('id="pb-addon-editor-gallery"');
    expect(html).toContain('data-open-extra="gallery"');
  });

  test("KI-Chat und Terminbuchung tragen Scroll-Anker für Extra-Klicks", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{ aiChat: true, booking: true }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain('id="pb-addon-editor-aiChat"');
    expect(html).toContain('id="pb-addon-editor-booking"');
    expect(html).toContain('data-open-extra="aiChat"');
    expect(html).toContain('data-open-extra="booking"');
    expect(html).toContain('data-edit-kind="scrollEditor"');
  });
});

describe("AddonsPanel — Add-on-Konsistenz (Plan B6, Task 6)", () => {
  test("vor dem Checkout: kein Abrechnungshinweis", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{}}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).not.toContain("anteilig abgerechnet");
  });

  test("nach dem Checkout (live): Hinweis, dass Änderungen sofort (anteilig) über Stripe abgerechnet werden", () => {
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={blankDoc}
        addOns={{}}
        live
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("anteilig abgerechnet");
  });

  test("Gastro-Default: die Speisekarte kommt mit addOns.menu aus der Generierung → Schalter steht auf „Aktiv“, Preis zählt in die Summe", () => {
    const gusto: WebsiteDataV2 = {
      ...blankDoc,
      stylePackId: "gusto",
      addOns: { menu: true },
      sections: [
        ...blankDoc.sections,
        {
          type: "menu",
          headline: "Speisekarte",
          categories: [{ name: "Pasta", items: [{ name: "T", price: "1" }] }],
        },
      ],
    };
    // state.addOns (onboarding_responses) wird von runJob gespiegelt; hier
    // den Zustand direkt übergeben, wie ihn StudioPage liefert.
    const html = renderWithTrpc(
      <AddonsPanel
        token={"t".repeat(32)}
        doc={gusto}
        addOns={{ menu: true }}
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    const menuRow = html.split("Speisekarte")[1] ?? "";
    expect(menuRow).toContain(">Ausgewählt<");
    // 19,90 € Basis (jährlich) + 3,90 € Speisekarte.
    expect(html).toContain("23,80 €");
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
    expect(html).toContain('id="pb-addon-editor-subpages"');
    expect(html).toContain('data-open-extra="subpages"');
    expect(html).toContain('data-edit-kind="scrollEditor"');
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

describe("reconcileAddOnDraft (Review-Fund B6 Task 6: frisch geladener Stand überschreibt keinen alten Entwurf)", () => {
  const allOff = {
    contactForm: false,
    gallery: false,
    menu: false,
    pricelist: false,
    aiChat: false,
    booking: false,
    team: false,
    subpages: false,
  };

  test("Server-Stand unverändert → Entwurf bleibt exakt erhalten (gleiche Referenz)", () => {
    const draft = { ...allOff, team: true };
    expect(reconcileAddOnDraft(draft, allOff, { ...allOff })).toBe(draft);
  });

  test("Server-Stand ändert gallery (z. B. Dashboard-Kauf/Webhook) → Entwurf übernimmt gallery, unberührte Entwurfs-Toggles bleiben", () => {
    const draft = { ...allOff, team: true };
    const next = reconcileAddOnDraft(draft, allOff, {
      ...allOff,
      gallery: true,
    });
    expect(next).toEqual({ ...allOff, team: true, gallery: true });
    expect(draft.gallery).toBe(false);
  });

  test("Server-Stand nimmt gallery zurück → Entwurf folgt; fehlende Keys zählen als false", () => {
    const draft = { ...allOff, gallery: true };
    expect(reconcileAddOnDraft(draft, { gallery: true }, {})).toEqual(allOff);
  });
});
