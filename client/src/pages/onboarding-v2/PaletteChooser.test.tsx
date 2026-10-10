// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PaletteChooser } from "./PaletteChooser";

const PALETTES = [
  { id: "papier", name: "Papier", paper: "#f3eee7", accent: "#6e5643" },
  { id: "salbei", name: "Salbei", paper: "#eef0ea", accent: "#4a6545" },
  { id: "ton", name: "Ton", paper: "#f4ece6", accent: "#9a4630" },
];

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount(node: React.ReactElement) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root!.render(node));
  return host;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("PaletteChooser", () => {
  test("Radiogruppe mit aria-checked und Farbfeld (Papier-Grund, Akzent-Punkt)", () => {
    const el = mount(
      <PaletteChooser
        label="Farbstimmung Journal"
        palettes={PALETTES}
        value="salbei"
        onChange={() => {}}
      />
    );
    const group = el.querySelector('[role="radiogroup"]')!;
    expect(group.getAttribute("aria-label")).toBe("Farbstimmung Journal");
    const radios = [...el.querySelectorAll('[role="radio"]')];
    expect(radios.map(r => r.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
    ]);
    // Roving tabindex: nur die gewählte Palette ist per Tab erreichbar.
    expect(radios.map(r => r.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
    const swatch = radios[2].querySelector(".pb-palette-swatch") as HTMLElement;
    expect(swatch.style.background).toBe("rgb(244, 236, 230)");
    const dot = radios[2].querySelector(".pb-palette-dot") as HTMLElement;
    expect(dot.style.background).toBe("rgb(154, 70, 48)");
    expect(radios[2].textContent).toContain("Ton");
  });

  test("Pfeiltasten wählen die nächste/vorige Palette (mit Umlauf) und setzen den Fokus", () => {
    const onChange = vi.fn();
    const el = mount(
      <PaletteChooser
        label="Farbstimmung"
        palettes={PALETTES}
        value="papier"
        onChange={onChange}
      />
    );
    const radios = [...el.querySelectorAll<HTMLElement>('[role="radio"]')];
    act(() => {
      radios[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
      );
    });
    expect(onChange).toHaveBeenLastCalledWith("salbei");
    expect(document.activeElement).toBe(radios[1]);
    act(() => {
      radios[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
      );
    });
    expect(onChange).toHaveBeenLastCalledWith("ton");
    act(() => {
      radios[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true })
      );
    });
    expect(onChange).toHaveBeenLastCalledWith("ton");
  });

  test("Klick wählt; gesperrt (disabled) passiert nichts", () => {
    const onChange = vi.fn();
    const el = mount(
      <PaletteChooser
        label="Farbstimmung"
        palettes={PALETTES}
        value="papier"
        onChange={onChange}
        disabled
      />
    );
    const radios = [...el.querySelectorAll<HTMLElement>('[role="radio"]')];
    act(() => radios[1].click());
    expect(onChange).not.toHaveBeenCalled();
    expect(radios[1].getAttribute("aria-disabled")).toBe("true");
  });
});
