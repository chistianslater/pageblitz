// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/studioEvents", () => ({ trackStudioEvent: vi.fn() }));

import { trackStudioEvent } from "@/lib/studioEvents";
import { EXIT_INTENT, LeaveWithoutEmailGuard } from "./LeaveWithoutEmailGuard";
import {
  EXIT_INTENT_STORAGE_KEY,
  markStudioCheckoutStarted,
  resetExitIntentForTests,
} from "./exitIntent";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const track = vi.mocked(trackStudioEvent);
let container: HTMLDivElement;
let root: Root;
let pointerFine = true;

function setPointer(fine: boolean) {
  pointerFine = fine;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-13T10:00:00Z"));
  resetExitIntentForTests();
  window.sessionStorage.clear();
  track.mockClear();
  setPointer(true);
  window.matchMedia = ((query: string) => ({
    matches:
      query === "(pointer: fine)"
        ? pointerFine
        : query === "(hover: none)"
          ? !pointerFine
          : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = "";
  vi.useRealTimers();
});

function mount(props: Partial<React.ComponentProps<typeof LeaveWithoutEmailGuard>> = {}) {
  const onSubmitEmail = props.onSubmitEmail ?? vi.fn(async () => {});
  act(() => {
    root.render(
      <LeaveWithoutEmailGuard
        armed
        exitIntentEngaged
        onSubmitEmail={onSubmitEmail}
        {...props}
      />
    );
  });
  return { onSubmitEmail };
}

function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Schnelle Bewegung nach oben und raus aus dem Fenster bei `exitY`. */
function flickOut(exitY = -5, exitX = 400) {
  act(() => {
    const t0 = performance.now();
    document.dispatchEvent(
      new MouseEvent("mousemove", { clientX: exitX, clientY: 120, bubbles: true })
    );
    vi.advanceTimersByTime(30);
    void t0;
    document.documentElement.dispatchEvent(
      new MouseEvent("mouseout", {
        clientX: exitX,
        clientY: exitY,
        relatedTarget: null,
        bubbles: true,
      })
    );
  });
}

const modal = () => document.querySelector('[role="alertdialog"]');

describe("LeaveWithoutEmailGuard — Exit-Intent", () => {
  test("Verlassen über die Oberkante öffnet das Modal (nach 20 s, scharf)", () => {
    mount();
    wait(20_000);
    flickOut();
    expect(modal()).not.toBeNull();
    expect(modal()!.textContent).toContain(EXIT_INTENT.modalTitle);
    expect(modal()!.textContent).toContain("24 Stunden");
    expect(modal()!.textContent).toContain("sieben Tage");
    expect(track).toHaveBeenCalledWith("exit_intent_gezeigt");
    expect(window.sessionStorage.getItem(EXIT_INTENT_STORAGE_KEY)).toBe("1");
  });

  test("vor 20 s im Studio: nichts", () => {
    mount();
    wait(5_000);
    flickOut();
    expect(modal()).toBeNull();
  });

  test("nicht über Unter- oder Seitenkante", () => {
    mount();
    wait(20_000);
    flickOut(900);
    flickOut(400, -5); // links raus, clientY mitten im Fenster
    expect(modal()).toBeNull();
  });

  test("höchstens einmal pro Sitzung", () => {
    mount();
    wait(20_000);
    flickOut();
    expect(modal()).not.toBeNull();
    const close = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Schließen"]'
    )!;
    act(() => close.click());
    expect(modal()).toBeNull();
    expect(track).toHaveBeenCalledWith("exit_intent_geschlossen");
    flickOut();
    expect(modal()).toBeNull();
  });

  test("nicht, wenn schon eine E-Mail da ist (Guard nicht scharf)", () => {
    mount({ armed: false });
    wait(20_000);
    flickOut();
    expect(modal()).toBeNull();
  });

  test("nicht auf Touch-Geräten (grober Zeiger)", () => {
    setPointer(false);
    mount();
    wait(20_000);
    flickOut();
    expect(modal()).toBeNull();
  });

  test("nicht ohne Interaktion — erst nach einem Klick im Studio", () => {
    mount({ exitIntentEngaged: false });
    wait(20_000);
    flickOut();
    expect(modal()).toBeNull();
    act(() => {
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    flickOut();
    expect(modal()).not.toBeNull();
  });

  test("nicht, solange ein anderer Dialog offen ist oder der Checkout läuft", () => {
    mount();
    wait(20_000);
    const other = document.createElement("div");
    other.setAttribute("role", "dialog");
    document.body.appendChild(other);
    flickOut();
    expect(modal()).toBeNull();
    other.remove();
    markStudioCheckoutStarted(true);
    flickOut();
    expect(modal()).toBeNull();
  });

  test("E-Mail im Modal speichern nutzt onSubmitEmail und schließt", async () => {
    const { onSubmitEmail } = mount();
    wait(20_000);
    flickOut();
    const input = document.querySelector<HTMLInputElement>("#pb-leave-email")!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      setter.call(input, "kunde@betrieb.de");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const form = document.querySelector("form")!;
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(onSubmitEmail).toHaveBeenCalledWith("kunde@betrieb.de");
    expect(modal()).toBeNull();
    expect(track).toHaveBeenCalledWith("exit_intent_email");
  });
});
