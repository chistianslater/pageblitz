import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { DesignSplash } from "./DesignSplash";

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

const base = {
  token: "t".repeat(32),
  businessName: "Salon Lindner",
  previewVersion: 4,
  onApplied: () => {},
  onConfirmed: () => {},
};

describe("DesignSplash — Designsystem (Task 16)", () => {
  test("rev 3: Vorschau als System, Farbstimmungen statt Farb-/Schriftwahl", () => {
    const html = renderWithTrpc(
      <DesignSplash
        {...base}
        currentPackId="salon-noir"
        currentSystem="journal"
        currentPalette="salbei"
      />
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Farbstimmung Journal"');
    expect(html).not.toContain("Schriftkombination");
  });

  test("rev 2: Pack-Schnellwahl wie bisher, keine Farbstimmungen", () => {
    const html = renderWithTrpc(
      <DesignSplash {...base} currentPackId="salon-noir" />
    );
    expect(html).toContain("Schriftkombination");
    expect(html).not.toContain('role="radiogroup"');
  });
});
