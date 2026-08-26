import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { DesignQuickControls } from "./DesignQuickControls";

function render(): string {
  const queryClient = new QueryClient();
  const client = trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
  });
  return renderToStaticMarkup(
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DesignQuickControls
          token={"t".repeat(32)}
          packId="werkbank"
          onApplied={() => {}}
        />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

describe("DesignQuickControls", () => {
  test("zeigt kompakte Farb-/Schrift-Trigger ohne ausführliche Layoutoptionen", () => {
    const html = render();
    expect(html).toContain("Schnell anpassen");
    expect(html).toContain("Farbe");
    expect(html).toContain("Richtungsfarbe");
    expect(html).toContain("Schrift");
    expect(html).toContain("Schriften der Richtung");
    expect(html).not.toContain("Seitenaufbau");
    expect(html).not.toContain("Galerie");
  });
});
