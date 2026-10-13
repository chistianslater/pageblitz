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

describe("DesignSplash — nur Designsysteme (Packs entfernen, Task 3)", () => {
  test("Vorschau im System, Farbstimmungen statt Farb-/Schriftwahl", () => {
    const html = renderWithTrpc(
      <DesignSplash {...base} currentSystem="journal" currentPalette="salbei" />
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Farbstimmung Journal"');
    expect(html).toContain("?system=journal&amp;palette=salbei&amp;v=4");
    expect(html).not.toContain("pack=");
    expect(html).not.toContain("Schrift");
    expect(html).not.toContain("Eigene Farbe");
    expect(html).toContain("Mit diesem Design weiter");
  });
});
