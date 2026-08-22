import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { StyleCandidateList, StylePanel } from "./StylePanel";

/**
 * StylePanel nutzt trpc.onboardingV2.getStyleCandidates.useQuery() +
 * selectStylePack.useMutation() direkt im Component-Body — braucht denselben
 * trpc/QueryClient-Wrapper wie LegalPanel.test.tsx. Die Query bleibt beim
 * synchronen renderToStaticMarkup zwangsläufig im "loading"-Zustand (der
 * echte Request geht ins Leere, da kein Server läuft) — das reicht für den
 * Finding-F4-Test unten, weil `displayCandidates` den KI-Vorschlag bereits
 * client-seitig aus `getConstitution` synthetisiert, auch ohne Server-Antwort
 * (siehe StylePanel.tsx, `useMemo`).
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

describe("StyleCandidateList", () => {
  test("rendert je Kandidat Mini-Preview (iframe mit ?pack=), Name, Essenz; aktuelles Pack markiert", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList
        token={"t".repeat(32)}
        currentPackId="werkbank"
        busyId={null}
        onPick={() => {}}
        candidates={[
          { id: "werkbank", name: "Werkbank", essence: "Robust." },
          { id: "kanzlei", name: "Kanzlei", essence: "Seriös." },
        ]}
      />
    );
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=werkbank`);
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=kanzlei`);
    expect(html).toContain("Kanzlei");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Aktuell");
    // Gültiges HTML: kein interaktives <iframe> innerhalb eines <button> —
    // die Mini-Previews liegen dekorativ neben dem eigentlichen Auswahl-Button.
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>)[\s\S])*<iframe/);
  });
});

describe("StylePanel", () => {
  test("Finding F4: preselectPackId wird nur als Badge hervorgehoben, NICHT automatisch als 'Aktuell' übernommen", () => {
    const html = renderWithTrpc(
      <StylePanel
        token={"t".repeat(32)}
        currentPackId="werkbank"
        category="handwerk"
        preselectPackId="kanzlei"
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    // Der KI-Vorschlag ("kanzlei") ist sichtbar und als Vorschlag markiert …
    expect(html).toContain("KI-Vorschlag");
    // … aber NICHT als "Aktuell" — das darf erst nach einem echten Klick
    // passieren, nicht schon beim bloßen Öffnen des Panels mit Vorschlag.
    expect(html).not.toContain("Aktuell");
    expect(html).toContain("Diesen Stil wählen");
  });
});
