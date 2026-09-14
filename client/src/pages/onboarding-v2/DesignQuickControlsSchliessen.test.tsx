// @vitest-environment jsdom
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { DesignQuickControls } from "./DesignQuickControls";

/**
 * Zumachen war die unklarste Stelle im Studio (Betreiber-Befund
 * 2026-09-14): Wer eine Farbe oder Schrift gewählt hatte, fand keinen Weg
 * aus der Klappe. Diese Tests halten die drei Wege fest, die es jetzt gibt —
 * „Fertig", Klick daneben, Escape.
 */
let behaelter: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  behaelter = document.createElement("div");
  document.body.appendChild(behaelter);
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const client = trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
  });
  root = createRoot(behaelter);
  act(() => {
    root.render(
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
  });
});

afterEach(() => {
  act(() => root.unmount());
  behaelter.remove();
});

const trigger = (name: string): HTMLButtonElement => {
  const treffer = [...behaelter.querySelectorAll("button")].find(b =>
    b.textContent?.includes(name)
  );
  if (!treffer) throw new Error(`Kein Knopf mit dem Text ${name} gefunden`);
  return treffer as HTMLButtonElement;
};
const klappeOffen = () => !!behaelter.querySelector(".pb-harmony-options");

function oeffnen(name = "Farbwelt") {
  act(() => trigger(name).click());
  expect(klappeOffen()).toBe(true);
}

describe("Klappe für Farbe und Schrift schließen", () => {
  test("der Fertig-Knopf schließt sie", () => {
    oeffnen();
    act(() => trigger("Fertig").click());
    expect(klappeOffen()).toBe(false);
  });

  test("ein Klick daneben schließt sie", () => {
    oeffnen("Schriftkombination");
    act(() => {
      document.body.dispatchEvent(
        new window.PointerEvent("pointerdown", { bubbles: true })
      );
    });
    expect(klappeOffen()).toBe(false);
  });

  test("Escape schließt sie auch ohne Fokus darin", () => {
    oeffnen();
    act(() => {
      document.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });
    expect(klappeOffen()).toBe(false);
  });

  test("ein Klick in der Klappe schließt sie nicht", () => {
    // Sonst wäre die Farbwahl selbst der Grund, warum sie zugeht — und
    // Vergleichen ginge nicht mehr.
    oeffnen();
    const drin = behaelter.querySelector(
      ".pb-harmony-options button"
    ) as HTMLButtonElement;
    act(() => {
      drin.dispatchEvent(
        new window.PointerEvent("pointerdown", { bubbles: true })
      );
    });
    expect(klappeOffen()).toBe(true);
  });
});
