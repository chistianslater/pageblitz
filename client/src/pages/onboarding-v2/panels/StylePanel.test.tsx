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
 * selectDesignSystem.useMutation() direkt im Component-Body — braucht
 * denselben trpc/QueryClient-Wrapper wie LegalPanel.test.tsx. Die Query
 * bleibt beim synchronen renderToStaticMarkup im "loading"-Zustand — der
 * KI-Vorschlag wird trotzdem client-seitig aus der System-Registry ergänzt.
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

describe("StyleCandidateList (nur Systeme)", () => {
  test("Systemkarte: Vorschau mit system/palette, Farbstimmungen als Radiogruppe neben dem Knopf", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList
        token={token}
        busyId={null}
        onPickSystem={() => {}}
        previewVersion={7}
        candidates={[journal]}
      />
    );
    expect(html).toContain(
      `/preview-ssr/${token}?system=journal&amp;palette=papier&amp;studio=1&amp;v=7`
    );
    expect(html).not.toContain("pack=");
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Farbstimmung Journal"');
    expect(html.match(/role="radio"/g)).toHaveLength(3);
    expect(html).toContain("Dieses Design verwenden");
    // Kein Umschalter: der Knopf der Systemkarte trägt kein aria-pressed.
    const systemPick = html.match(/<button[^>]*>Dieses Design verwenden/)![0];
    expect(systemPick).not.toContain("aria-pressed");
    // Keine Radiogruppe und kein iframe innerhalb eines <button>.
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>)[\s\S])*<iframe/);
    expect(html).not.toMatch(
      /<button[^>]*class="pb-studio-cand-pick"[^>]*>(?:(?!<\/button>)[\s\S])*radiogroup/
    );
  });

  test("KI-Vorschlag bekommt eine Badge, gilt aber nicht als gewählt", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList
        token={token}
        busyId={null}
        onPickSystem={() => {}}
        preselectSystem="journal"
        candidates={[journal]}
      />
    );
    expect(html).toContain("KI-Vorschlag");
    expect(html).toContain('data-preselected="true"');
    expect(html).not.toContain("Aktuell");
  });
});

describe("StylePanel (nur Systeme und Farbstimmungen)", () => {
  test("Farbstimmungen des aktuellen Systems oben, keine Schrift-/Farbwahl, kein Marken-Import", () => {
    const html = renderWithTrpc(
      <StylePanel
        token={token}
        currentSystem="journal"
        currentPalette="ton"
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("Farbstimmung für Journal");
    expect(html).toMatch(/role="radio"[^>]*aria-checked="true"[^>]*>(?:(?!<\/button>)[\s\S])*Ton/);
    for (const gone of [
      "Schrift",
      "Farbwelt",
      "Abstände",
      "Bildwirkung",
      "pb-studio-theme-toggle",
      "pb-brand",
      "Aktuell",
      "pack=",
    ]) {
      expect(html, gone).not.toContain(gone);
    }
    expect(html).toContain("Andere Designs");
  });

  test("KI-Vorschlag eines Systems ist sichtbar, bevor die Kandidaten geladen sind", () => {
    const html = renderWithTrpc(
      <StylePanel
        token={token}
        currentSystem="journal"
        currentPalette="papier"
        preselectSystem="nacht"
        onApplied={() => {}}
        onClose={() => {}}
      />
    );
    expect(html).toContain("KI-Vorschlag");
    expect(html).toContain("Nacht");
    expect(html).toContain("?system=nacht&amp;palette=");
  });
});

describe("StylePanel: „Fotos einfärben“ (nur Plakat, 2026-10-13)", () => {
  const panel = (props: Partial<React.ComponentProps<typeof StylePanel>>) =>
    renderWithTrpc(
      <StylePanel
        token={token}
        currentSystem="plakat"
        currentPalette="kante"
        onApplied={() => {}}
        onClose={() => {}}
        onPhotoTreatment={() => {}}
        {...props}
      />
    );
  const checkbox = (html: string) =>
    html.match(/<input[^>]*data-pb-photo-tint[^>]*>/)?.[0];

  test("Plakat eingefärbt: Schalter an, mit Hinweis", () => {
    const html = panel({ photoTreatment: "tinted" });
    expect(html).toContain("Fotos einfärben");
    expect(checkbox(html)).toMatch(/type="checkbox"/);
    expect(checkbox(html)).toMatch(/checked=""/);
    expect(html).toMatch(/Aus zeigt deine Fotos in Originalfarben/);
  });

  test("Plakat original: Schalter aus", () => {
    const html = panel({ photoTreatment: "original" });
    expect(checkbox(html)).toBeDefined();
    expect(checkbox(html)).not.toMatch(/checked=""/);
  });

  test("andere Systeme oder ohne Speicher-Weg: kein Schalter", () => {
    expect(
      panel({ currentSystem: "journal", currentPalette: "papier", photoTreatment: "tinted" })
    ).not.toContain("Fotos einfärben");
    expect(
      panel({ onPhotoTreatment: undefined, photoTreatment: "tinted" })
    ).not.toContain("Fotos einfärben");
  });
});

