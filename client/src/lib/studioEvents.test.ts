import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./consent", () => ({
  GA4_MEASUREMENT_ID: "G-TEST",
  hasAnalyticsConsent: vi.fn(() => true),
}));

import { hasAnalyticsConsent } from "./consent";
import {
  resetStudioTagsForTests,
  tagStudioSession,
  trackStudioEvent,
} from "./studioEvents";

const g = globalThis as unknown as {
  window?: { clarity?: unknown; gtag?: unknown };
};
const consent = vi.mocked(hasAnalyticsConsent);

beforeEach(() => {
  consent.mockReturnValue(true);
  resetStudioTagsForTests();
});
afterEach(() => {
  delete g.window;
});

describe("studioEvents — Clarity (Studio-Funnel, 2026-09-19)", () => {
  test("meldet ein Ereignis an Clarity, wenn es geladen ist", () => {
    const clarity = vi.fn();
    g.window = { clarity };
    trackStudioEvent("design_bestaetigt");
    expect(clarity).toHaveBeenCalledWith("event", "design_bestaetigt");
  });

  test("ohne window (SSR/Tests) wirft nichts", () => {
    expect(() => trackStudioEvent("intro_geschlossen")).not.toThrow();
  });

  test("ein Fehler in Clarity oder GA reißt das Studio nicht mit", () => {
    g.window = {
      clarity: () => {
        throw new Error("clarity kaputt");
      },
      gtag: () => {
        throw new Error("gtag kaputt");
      },
    };
    expect(() => trackStudioEvent("tour_uebersprungen")).not.toThrow();
  });

  test("Sitzungs-Tags werden als clarity('set', …) gesetzt", () => {
    const clarity = vi.fn();
    g.window = { clarity };
    tagStudioSession({ quelle: "postkarte", status: "preview" });
    expect(clarity).toHaveBeenCalledWith("set", "quelle", "postkarte");
    expect(clarity).toHaveBeenCalledWith("set", "status", "preview");
  });
});

describe("studioEvents — späte Einwilligung", () => {
  test("Tags, die vor dem Laden von Clarity gesetzt wurden, gehen mit dem nächsten Ereignis nach", () => {
    g.window = {};
    tagStudioSession({ quelle: "postkarte" });
    const clarity = vi.fn();
    g.window = { clarity };
    trackStudioEvent("design_angesehen");
    expect(clarity).toHaveBeenCalledWith("set", "quelle", "postkarte");
    expect(clarity).toHaveBeenLastCalledWith("event", "design_angesehen");
    trackStudioEvent("design_bestaetigt");
    expect(
      clarity.mock.calls.filter(c => c[0] === "set").length
    ).toBe(1);
  });
});

describe("studioEvents — Google Analytics 4", () => {
  test("schickt das Ereignis gezielt an die GA4-Property, mit den Sitzungs-Tags als Parametern", () => {
    const gtag = vi.fn();
    g.window = { gtag };
    tagStudioSession({ quelle: "postkarte" });
    trackStudioEvent("schritt_fotos");
    expect(gtag).toHaveBeenCalledWith("event", "schritt_fotos", {
      send_to: "G-TEST",
      event_category: "studio",
      quelle: "postkarte",
    });
  });

  test("ohne Statistik-Einwilligung geht nichts an GA — auch wenn gtag (Google Ads) geladen ist", () => {
    consent.mockReturnValue(false);
    const gtag = vi.fn();
    g.window = { gtag };
    trackStudioEvent("kauf_gestartet");
    expect(gtag).not.toHaveBeenCalled();
  });
});
