import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import type { StudioState } from "../../../../server/onboardingV2/state";
import { CheckoutBar, CheckoutSummary } from "./CheckoutBar";

describe("CheckoutSummary", () => {
  test("listet fehlende Pflichtpunkte auf", () => {
    const html = renderToStaticMarkup(
      <CheckoutSummary
        interval="yearly"
        addOns={{}}
        ready={false}
        hasEmail={false}
        missing={[
          { id: "legal", title: "Impressum-Angaben" },
          { id: "email", title: "E-Mail-Adresse" },
        ]}
      />
    );
    expect(html).toContain("Impressum-Angaben");
    expect(html).toContain("E-Mail-Adresse");
    // Verlinkt (2026-08-30): Einträge sind Buttons, kein toter Text.
    expect(html).toContain("<button");
  });

  test("ohne Extras steht der Preis einmal — kein „+ Extras“ (Audit 2026-09-19)", () => {
    const html = renderToStaticMarkup(
      <CheckoutSummary interval="yearly" addOns={{}} ready={true} hasEmail={true} missing={[]} />
    );
    expect(html).not.toContain("Extras");
    expect(html.match(/19,90 €/g)).toHaveLength(1);
    expect(html).toContain("7 Tage kostenlos");
  });

  test("zeigt einen Bereit-Hinweis, wenn nichts mehr fehlt", () => {
    const html = renderToStaticMarkup(
      <CheckoutSummary
        interval="yearly"
        addOns={{}}
        ready={true}
        hasEmail={true}
        missing={[]}
      />
    );
    expect(html).toContain("bereit");
  });

  test("zeigt den ruhigen Jahres-Hinweis nur bei jährlicher Abrechnung, ohne Badge", () => {
    const yearly = renderToStaticMarkup(
      <CheckoutSummary
        interval="yearly"
        addOns={{}}
        ready={false}
        hasEmail={false}
        missing={[]}
      />
    );
    const monthly = renderToStaticMarkup(
      <CheckoutSummary
        interval="monthly"
        addOns={{}}
        ready={false}
        hasEmail={false}
        missing={[]}
      />
    );
    expect(yearly).toContain("2 Monate gratis");
    expect(monthly).not.toContain("2 Monate gratis");
  });

  test("Team zählt seit Plan B5 Task 2 in die Gesamtsumme mit", () => {
    const html = renderToStaticMarkup(
      <CheckoutSummary
        interval="yearly"
        addOns={{ team: true }}
        ready={false}
        hasEmail={false}
        missing={[]}
      />
    );
    // 19,90 € Basis (jährlich) + 3,90 € Team.
    expect(html).toContain("23,80 €");
  });
});

/** Minimaler StudioState-Fixture — nur die Felder, die CheckoutBar liest. */
function buildState(overrides: Partial<StudioState> = {}): StudioState {
  return {
    websiteId: 1,
    token: "t".repeat(32),
    studioProgress: {},
    businessName: "Testfirma",
    category: "handwerk",
    stylePackId: "werkbank",
    doc: null,
    legacy: false,
    status: "preview",
    slug: "testfirma",
    job: null,
    needsCategory: false,
    checklist: [
      {
        id: "style",
        title: "Designrichtung",
        hint: "",
        status: "done",
        required: false,
      },
      {
        id: "photos",
        title: "Fotos",
        hint: "",
        status: "done",
        required: false,
      },
      {
        id: "texts",
        title: "Texte",
        hint: "",
        status: "done",
        required: false,
      },
      {
        id: "offer",
        title: "Angebot",
        hint: "",
        status: "done",
        required: false,
      },
      {
        id: "legal",
        title: "Rechtliches",
        hint: "",
        status: "open",
        required: true,
      },
      {
        id: "addons",
        title: "Extras",
        hint: "",
        status: "done",
        required: false,
      },
    ],
    checkoutReady: false,
    customerEmail: null,
    ageGate: { enabled: false, suspected: false, asked: false },
  legal: {
      legalOwner: "",
      legalStreet: "",
      legalZip: "",
      legalCity: "",
      legalEmail: "",
      legalPhone: "",
      legalVatId: "",
    },
    addOns: {},
    uploadedPhotos: [],
    openingHours: [],
    ...overrides,
  };
}

/**
 * CheckoutBar nutzt trpc-Mutations-Hooks (setCustomerEmail/createCheckout) —
 * die brauchen einen trpc.Provider/QueryClientProvider im Baum, sonst wirft
 * useMutation(). Beide Mutations feuern aber nur bei .mutate(), nicht beim
 * reinen Rendern — renderToStaticMarkup mit echtem, aber ungenutztem Client
 * ist daher sicher und ohne laufenden Server möglich.
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

const legalDone = (state: StudioState): StudioState["checklist"] =>
  state.checklist.map(i => (i.id === "legal" ? { ...i, status: "done" } : i));

describe("CheckoutBar (Audit 2026-09-19)", () => {
  // Seit 2026-08-29 bewusst NICHT deaktiviert — der Knopf sagt jetzt aber
  // ehrlich, was fehlt, statt „freischalten“ zu versprechen.
  test("fehlt Rechtliches, heißt der Knopf „Rechtliches ergänzen“ und bleibt klickbar", () => {
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState()}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    const match = html.match(/<button[^>]*class="[^"]*pb-studio-checkout-cta[^"]*"[^>]*>[\s\S]*?<\/button>/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("Rechtliches ergänzen");
    expect(match![0]).not.toContain("disabled");
  });

  test("bereit: Knopf nennt Testwoche und Preis", () => {
    const base = buildState();
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState({
          checkoutReady: true,
          customerEmail: "a@b.de",
          checklist: legalDone(base),
        })}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    expect(html).toContain("Website freischalten");
    expect(html).toContain("7 Tage gratis, dann 19,90 € / Monat");
  });

  test("nur die E-Mail fehlt: kein eigener Speichern-Knopf, Freischalten speichert sie mit", () => {
    const base = buildState();
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState({ checklist: legalDone(base) })}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    expect(html).toContain("Website freischalten");
    expect(html).not.toMatch(/>Speichern</);
  });

  test("Umschalter nennt beide Preise", () => {
    const html = renderWithTrpc(
      <CheckoutBar state={buildState()} token={"t".repeat(32)} onStateChanged={() => {}} />
    );
    expect(html).toContain("24,90 €");
    expect(html).toContain("19,90 €");
  });

  test("Vertrauenszeile am Knopf: kündbar, inkl. MwSt., Stripe", () => {
    const html = renderWithTrpc(
      <CheckoutBar state={buildState()} token={"t".repeat(32)} onStateChanged={() => {}} />
    );
    expect(html).toContain("Jederzeit kündbar");
    expect(html).toContain("inkl. MwSt.");
    expect(html).toContain("Stripe");
  });

  test("Impressums-E-Mail wird als änderbarer Account-Vorschlag vorbefüllt", () => {
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState({
          legal: {
            ...buildState().legal,
            legalEmail: "impressum@beispiel.de",
          },
        })}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    expect(html).toContain('value="impressum@beispiel.de"');
    expect(html).toContain("E-Mail-Adresse für deinen Account");
    expect(html).toContain("Aus dem Impressum vorgeschlagen");
  });

  test("Extras-Hinweis nur, wenn solche Extras gebucht sind (Finding F3 bleibt inhaltlich)", () => {
    const ohne = renderWithTrpc(
      <CheckoutBar state={buildState()} token={"t".repeat(32)} onStateChanged={() => {}} />
    );
    expect(ohne).not.toContain("Kontaktformular erscheint sofort");
    const mit = renderWithTrpc(
      <CheckoutBar
        state={buildState({ addOns: { aiChat: true } })}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    expect(mit).toContain("KI-Chat");
    expect(mit).toContain("direkt nach dem Freischalten aktiv");
  });
});
