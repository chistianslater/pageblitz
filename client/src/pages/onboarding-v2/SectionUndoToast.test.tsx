// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { SectionType, WebsiteDataV2 } from "@shared/siteContract/types";

const removeMutate = vi.fn();
const restoreMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    onboardingV2: {
      removeSection: {
        useMutation: () => ({ mutate: removeMutate, isPending: false }),
      },
      restoreSection: {
        useMutation: () => ({ mutate: restoreMutate, isPending: false }),
      },
      updateStructure: {
        useMutation: () => ({
          mutate: updateMutate,
          isPending: false,
          error: null,
        }),
      },
    },
  },
}));

import { SECTION_TOAST_MS, SectionUndoToast } from "./SectionUndoToast";
import { StructurePanel } from "./panels/StructurePanel";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  removeMutate.mockReset();
  restoreMutate.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

function doc(types: SectionType[]): WebsiteDataV2 {
  return {
    version: 2,
    businessName: "Brandt",
    seo: { title: "t", description: "d" },
    sections: types.map(type => ({ type }) as never),
  } as unknown as WebsiteDataV2;
}

function button(label: string): HTMLButtonElement {
  const found = Array.from(container.querySelectorAll("button")).find(
    b => b.getAttribute("aria-label") === label || b.textContent === label
  );
  if (!found) throw new Error(`Knopf „${label}“ fehlt`);
  return found as HTMLButtonElement;
}

function mountPanel(onApplied = vi.fn()) {
  act(() => {
    root.render(
      <StructurePanel
        token="tok"
        doc={doc(["hero", "usp", "gallery", "contact"])}
        addOns={{ gallery: true }}
        onApplied={onApplied}
        onClose={() => {}}
      />
    );
  });
  return { onApplied };
}

describe("Struktur-Panel: Abschnitt entfernen", () => {
  test("Einstieg und Kontakt: Entfernen gesperrt, mit Begründung", () => {
    mountPanel();
    const hero = button("Hero kann nicht entfernt werden");
    const contact = button("Kontakt kann nicht entfernt werden");
    expect(hero.getAttribute("aria-disabled")).toBe("true");
    expect(contact.getAttribute("aria-disabled")).toBe("true");
    expect(hero.title).toMatch(/Einstieg/);
    expect(contact.title).toMatch(/Kontakt bleibt/);
    // Antippen (Handy, kein Tooltip) zeigt die Begründung, entfernt nichts.
    act(() => contact.click());
    expect(removeMutate).not.toHaveBeenCalled();
    expect(container.querySelector('[role="note"]')?.textContent).toMatch(
      /Kontakt bleibt/
    );
  });

  test("Entfernen zeigt den Rückgängig-Hinweis, Rückgängig holt den Abschnitt zurück", () => {
    const { onApplied } = mountPanel();
    act(() => button("Vorteile entfernen").click());
    expect(removeMutate).toHaveBeenCalledWith(
      { token: "tok", type: "usp" },
      expect.any(Object)
    );
    act(() => removeMutate.mock.calls[0][1].onSuccess({ state: {} }));
    expect(onApplied).toHaveBeenCalledTimes(1);
    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toContain("„Vorteile“ entfernt");
    act(() => button("Rückgängig").click());
    expect(restoreMutate).toHaveBeenCalledWith(
      { token: "tok", type: "usp" },
      expect.any(Object)
    );
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  test("gebuchtes Extra: Hinweis, dass es gebucht bleibt", () => {
    mountPanel();
    act(() => button("Galerie entfernen").click());
    act(() =>
      removeMutate.mock.calls[0][1].onSuccess({
        state: {},
        addonNote:
          "Dein Extra „Bildergalerie“ bleibt gebucht — abbestellen geht nur unter Extras.",
      })
    );
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "bleibt gebucht"
    );
  });
});

describe("SectionUndoToast", () => {
  test("verschwindet nach rund 8 Sekunden von selbst", () => {
    const onDismiss = vi.fn();
    act(() => {
      root.render(
        <SectionUndoToast
          toast={{ kind: "removed", type: "usp" }}
          onUndo={() => {}}
          onRemove={() => {}}
          onDismiss={onDismiss}
        />
      );
    });
    act(() => vi.advanceTimersByTime(SECTION_TOAST_MS - 100));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("nach dem Einfügen: „Wieder entfernen“", () => {
    const onRemove = vi.fn();
    act(() => {
      root.render(
        <SectionUndoToast
          toast={{ kind: "inserted", type: "usp" }}
          onUndo={() => {}}
          onRemove={onRemove}
          onDismiss={() => {}}
        />
      );
    });
    expect(container.textContent).toContain("„Vorteile“ eingefügt");
    act(() => button("Wieder entfernen").click());
    expect(onRemove).toHaveBeenCalledWith("usp");
  });
});
