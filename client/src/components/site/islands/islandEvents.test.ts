import { afterEach, describe, expect, test, vi } from "vitest";
import { notifyIslandOpened, subscribeToOtherIslandOpen } from "./islandEvents";

describe("islandEvents", () => {
  afterEach(() => {
    // @ts-expect-error – Test-Stub wieder entfernen, node-Umgebung hat kein window
    delete globalThis.window;
  });

  test("ruft den Listener NICHT auf, wenn die eigene Insel öffnet", () => {
    // @ts-expect-error – EventTarget als minimaler window-Stub (echtes window ist auch eines)
    globalThis.window = new EventTarget();
    const onOther = vi.fn();
    subscribeToOtherIslandOpen("chat", onOther);
    notifyIslandOpened("chat");
    expect(onOther).not.toHaveBeenCalled();
  });

  test("ruft den Listener auf, wenn eine ANDERE Insel öffnet", () => {
    // @ts-expect-error
    globalThis.window = new EventTarget();
    const onOther = vi.fn();
    subscribeToOtherIslandOpen("chat", onOther);
    notifyIslandOpened("booking");
    expect(onOther).toHaveBeenCalledTimes(1);
  });

  test("die Booking-Insel reagiert umgekehrt auf ein Chat-Öffnen", () => {
    // @ts-expect-error
    globalThis.window = new EventTarget();
    const onOther = vi.fn();
    subscribeToOtherIslandOpen("booking", onOther);
    notifyIslandOpened("chat");
    expect(onOther).toHaveBeenCalledTimes(1);
  });

  test("die zurückgegebene Cleanup-Funktion entfernt den Listener", () => {
    // @ts-expect-error
    globalThis.window = new EventTarget();
    const onOther = vi.fn();
    const unsubscribe = subscribeToOtherIslandOpen("chat", onOther);
    unsubscribe();
    notifyIslandOpened("booking");
    expect(onOther).not.toHaveBeenCalled();
  });

  test("ohne window (SSR) ist notifyIslandOpened ein No-Op", () => {
    expect(() => notifyIslandOpened("chat")).not.toThrow();
  });

  test("ohne window (SSR) liefert subscribeToOtherIslandOpen eine No-Op-Cleanup-Funktion", () => {
    const unsubscribe = subscribeToOtherIslandOpen("chat", () => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});
