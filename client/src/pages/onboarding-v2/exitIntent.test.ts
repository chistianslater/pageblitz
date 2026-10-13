import { afterEach, describe, expect, test } from "vitest";
import {
  EXIT_INTENT_MIN_DWELL_MS,
  EXIT_INTENT_MIN_SPEED,
  EXIT_INTENT_STORAGE_KEY,
  exitIntentAlreadyShown,
  isFinePointerDevice,
  mapFramePoint,
  markExitIntentShown,
  markStudioCheckoutStarted,
  resetExitIntentForTests,
  shouldShowExitIntent,
  studioCheckoutInProgress,
  upwardSpeed,
  type ExitIntentInput,
} from "./exitIntent";

const ready = (overrides: Partial<ExitIntentInput> = {}): ExitIntentInput => ({
  armed: true,
  finePointer: true,
  alreadyShown: false,
  checkoutInProgress: false,
  otherDialogOpen: false,
  modalOpen: false,
  dwellMs: EXIT_INTENT_MIN_DWELL_MS,
  leftWindow: true,
  clientX: 400,
  viewportWidth: 1440,
  clientY: 0,
  speed: 2,
  ...overrides,
});

afterEach(() => resetExitIntentForTests());

describe("shouldShowExitIntent", () => {
  test("feuert beim schnellen Verlassen über die Oberkante, wenn alles passt", () => {
    expect(shouldShowExitIntent(ready())).toBe(true);
    expect(shouldShowExitIntent(ready({ clientY: -12 }))).toBe(true);
    // Ohne Bewegungsdaten (direkt nach dem Laden) nicht blockieren.
    expect(shouldShowExitIntent(ready({ speed: null }))).toBe(true);
  });

  test("nicht über Unter- oder Seitenkante bzw. innerhalb der Seite", () => {
    expect(shouldShowExitIntent(ready({ clientY: 400 }))).toBe(false);
    expect(shouldShowExitIntent(ready({ clientY: 900 }))).toBe(false);
    expect(shouldShowExitIntent(ready({ leftWindow: false }))).toBe(false);
  });

  test("Ecke über die Seite (clientX außerhalb des Fensters) zählt nicht", () => {
    expect(shouldShowExitIntent(ready({ clientX: -4, clientY: -4 }))).toBe(
      false
    );
    expect(shouldShowExitIntent(ready({ clientX: 1445, clientY: -4 }))).toBe(
      false
    );
    expect(shouldShowExitIntent(ready({ clientX: 0 }))).toBe(true);
  });

  test("langsames Hinfahren zur Adressleiste löst nicht aus", () => {
    expect(
      shouldShowExitIntent(ready({ speed: EXIT_INTENT_MIN_SPEED / 4 }))
    ).toBe(false);
    expect(shouldShowExitIntent(ready({ speed: -1 }))).toBe(false);
  });

  test("Sperren: nicht scharf, Touch, schon gezeigt, Checkout, anderer Dialog, eigenes Modal offen", () => {
    expect(shouldShowExitIntent(ready({ armed: false }))).toBe(false);
    expect(shouldShowExitIntent(ready({ finePointer: false }))).toBe(false);
    expect(shouldShowExitIntent(ready({ alreadyShown: true }))).toBe(false);
    expect(shouldShowExitIntent(ready({ checkoutInProgress: true }))).toBe(
      false
    );
    expect(shouldShowExitIntent(ready({ otherDialogOpen: true }))).toBe(false);
    expect(shouldShowExitIntent(ready({ modalOpen: true }))).toBe(false);
  });

  test("erst 20 s nachdem die Website fertig ist", () => {
    expect(EXIT_INTENT_MIN_DWELL_MS).toBe(20_000);
    expect(shouldShowExitIntent(ready({ dwellMs: 19_999 }))).toBe(false);
    expect(shouldShowExitIntent(ready({ dwellMs: null }))).toBe(false);
  });
});

describe("mapFramePoint", () => {
  test("rechnet iframe-Koordinaten (inkl. Skalierung) in den Viewport um", () => {
    const rect = { top: 135, left: 450, width: 480, height: 300 };
    expect(mapFramePoint(rect, 960, 600, -3, 100)).toEqual({
      x: 500,
      y: 133.5,
    });
    const top = { top: 0, left: 0, width: 1440, height: 900 };
    expect(mapFramePoint(top, 1440, 900, -2, 700)).toEqual({ x: 700, y: -2 });
    // Ohne Breite/Höhe (versteckt): 1:1
    expect(mapFramePoint(top, 0, 0, 5, 7)).toEqual({ x: 7, y: 5 });
  });
});

describe("upwardSpeed", () => {
  test("px/ms nach oben, null ohne Vorgänger", () => {
    expect(upwardSpeed(null, 0, 100)).toBeNull();
    expect(upwardSpeed({ y: 100, t: 0 }, 0, 50)).toBe(2);
    expect(upwardSpeed({ y: 0, t: 0 }, 100, 50)).toBe(-2);
    // gleicher Zeitstempel: als schnell werten
    expect(upwardSpeed({ y: 50, t: 10 }, 0, 10)).toBe(Infinity);
  });
});

describe("Sitzungs-Sperre und Checkout-Flag", () => {
  test("einmal pro Sitzung (sessionStorage), robust ohne Storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    expect(exitIntentAlreadyShown(storage)).toBe(false);
    markExitIntentShown(storage);
    expect(store.get(EXIT_INTENT_STORAGE_KEY)).toBe("1");
    expect(exitIntentAlreadyShown(storage)).toBe(true);

    resetExitIntentForTests();
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(exitIntentAlreadyShown(broken)).toBe(false);
    markExitIntentShown(broken);
    // Speicher gesperrt → Merker im Modul greift.
    expect(exitIntentAlreadyShown(broken)).toBe(true);
  });

  test("Checkout-Flag", () => {
    expect(studioCheckoutInProgress()).toBe(false);
    markStudioCheckoutStarted(true);
    expect(studioCheckoutInProgress()).toBe(true);
    markStudioCheckoutStarted(false);
    expect(studioCheckoutInProgress()).toBe(false);
  });

  test("isFinePointerDevice: Maus ja, Touch/kein Hover nein", () => {
    const mm = (fine: boolean, hoverNone: boolean) => ({
      matchMedia: (q: string) => ({
        matches:
          q === "(pointer: fine)"
            ? fine
            : q === "(hover: none)"
              ? hoverNone
              : false,
      }),
    });
    expect(isFinePointerDevice(mm(true, false))).toBe(true);
    expect(isFinePointerDevice(mm(false, true))).toBe(false);
    expect(isFinePointerDevice(mm(true, true))).toBe(false);
    expect(isFinePointerDevice({})).toBe(false);
  });
});
