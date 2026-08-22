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
        missing={["Impressum-Angaben", "E-Mail-Adresse"]}
      />
    );
    expect(html).toContain("Impressum-Angaben");
    expect(html).toContain("E-Mail-Adresse");
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
});

/** Minimaler StudioState-Fixture — nur die Felder, die CheckoutBar liest. */
function buildState(overrides: Partial<StudioState> = {}): StudioState {
  return {
    websiteId: 1,
    token: "t".repeat(32),
    businessName: "Testfirma",
    category: "handwerk",
    stylePackId: "werkbank",
    doc: null,
    legacy: false,
    status: "preview",
    slug: "testfirma",
    job: null,
    checklist: [
      {
        id: "style",
        title: "Stil",
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

describe("CheckoutBar", () => {
  test("'Website freischalten' ist deaktiviert, solange checkoutReady falsch ist", () => {
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState()}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    const match = html.match(/<button[^>]*>Website freischalten<\/button>/);
    expect(match).not.toBeNull();
    expect(match![0]).toContain('disabled=""');
  });

  test("'Website freischalten' ist aktiv, sobald checkoutReady wahr ist", () => {
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState({ checkoutReady: true, customerEmail: "a@b.de" })}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    const match = html.match(/<button[^>]*>Website freischalten<\/button>/);
    expect(match).not.toBeNull();
    expect(match![0]).not.toContain("disabled");
  });

  test("Finding F3: Hinweistext differenziert Kontaktformular (sofort) von KI-Chat/Terminbuchung (nach Freischalten)", () => {
    const html = renderWithTrpc(
      <CheckoutBar
        state={buildState()}
        token={"t".repeat(32)}
        onStateChanged={() => {}}
      />
    );
    expect(html).toContain(
      "Kontaktformular erscheint sofort in deiner Website; KI-Chat und Terminbuchung werden direkt nach dem Freischalten aktiv. Team folgt."
    );
  });
});
