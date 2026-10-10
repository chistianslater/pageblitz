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
    expect(html).toContain("Diese Richtung verwenden");
    expect(html).toContain("Abstände");
    expect(html).toContain("Bildwirkung");
    expect(html).not.toContain("Seitenaufbau");
    expect(html).not.toContain("Mosaik");
  });
});

describe("Designsysteme im Stil-Panel (Task 16)", () => {
  const token = "t".repeat(32);
  const journal = {
    kind: "system" as const,
    id: "journal" as const,
    name: "Journal",
    essence: "Magazin, ruhig, gebildet",
    palettes: [
      { id: "papier", name: "Papier", paper: "#f3eee7", accent: "#6e5643" },
      { id: "salbei", name: "Salbei", paper: "#eef0ea", accent: "#4a6545" },
      { id: "ton", name: "Ton", paper: "#f4ece6", accent: "#9a4630" },
    ],
  };

  test("Systemkarte: Vorschau mit system/palette, Farbstimmungen als Radiogruppe neben dem Knopf", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList
        token={token}
        currentPackId="werkbank"
        busyId={null}
        onPick={() => {}}
        onPickSystem={() => {}}
        previewVersion={7}
        candidates={[
          journal,
          { kind: "pack", id: "werkbank", name: "Werkbank", essence: "Robust." },
        ]}
      />
    );
    expect(html).toContain(
      `/preview-ssr/${token}?system=journal&amp;palette=papier&amp;v=7`
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Farbstimmung Journal"');
    expect(html.match(/role="radio"/g)).toHaveLength(3);
    expect(html).toContain("Dieses Design verwenden");
    // Kein Umschalter: der Knopf der Systemkarte trägt kein aria-pressed.
    const systemPick = html.match(/<button[^>]*>Dieses Design verwenden/)![0];
    expect(systemPick).not.toContain("aria-pressed");
    // Pack-Karte unverändert daneben.
    expect(html).toContain(`/preview-ssr/${token}?pack=werkbank`);
    // Keine Radiogruppe und kein iframe innerhalb eines <button>.
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>)[\s\S])*<iframe/);
    expect(html).not.toMatch(
      /<button[^>]*class="pb-studio-cand-pick"[^>]*>(?:(?!<\/button>)[\s\S])*radiogroup/
    );
  });

  test("rev-3-Seite: Farbstimmungen des aktuellen Systems oben, keine Schrift-/Farbwahl des Packs", () => {
    const html = renderWithTrpc(
      <StylePanel
        token={token}
        currentPackId="salon-noir"
        currentSystem="journal"
        currentPalette="ton"
        category="Friseursalon"
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Farbstimmung für Journal");
    expect(html).toMatch(/role="radio"[^>]*aria-checked="true"[^>]*>(?:(?!<\/button>)[\s\S])*Ton/);
    expect(html).not.toContain("Schriftkombination");
    expect(html).not.toContain("Farbwelt");
    // Journal ignoriert density/imageTreatment — keine wirkungslosen Regler.
    expect(html).not.toContain("Abstände");
    expect(html).not.toContain("Bildwirkung");
    expect(html).not.toContain("pb-studio-theme-toggle");
    // Marken-Import schriebe Akzent/Schrift, die rev 3 nicht nutzt.
    expect(html).not.toContain("pb-brand");
    // Kein Pack gilt als „Aktuell", solange das System aktiv ist.
    expect(html).not.toContain("Aktuell");
  });

  test("rev-2-Seite: keine Farbstimmungs-Sektion, Schriftwahl wie bisher", () => {
    const html = renderWithTrpc(
      <StylePanel
        token={token}
        currentPackId="werkbank"
        category="handwerk"
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).not.toContain("Farbstimmung für");
    expect(html).toContain("Schriftkombination");
  });
});
