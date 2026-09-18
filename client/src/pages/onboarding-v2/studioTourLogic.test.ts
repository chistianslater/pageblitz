import { describe, expect, test } from "vitest";
import {
  STUDIO_TOUR_STEPS,
  clampTourCard,
  shouldStartTour,
  tourStorageKey,
} from "./studioTourLogic";

describe("Studio-Tour (Test-Feedback 2026-09-18)", () => {
  test("erklärt Schritte links, Layout-Varianten in der Vorschau, Assistent und den späten Kauf", () => {
    const text = STUDIO_TOUR_STEPS.map(s => `${s.title} ${s.body}`).join(" ");
    expect(STUDIO_TOUR_STEPS.length).toBeGreaterThanOrEqual(3);
    expect(text).toMatch(/Schritt/);
    expect(text).toMatch(/Layout/);
    expect(text).toMatch(/Assistent/);
    expect(text).toMatch(/zum Schluss|am Ende/i);
  });

  test("Speicherschlüssel ist pro Vorschau-Token", () => {
    expect(tourStorageKey("abc")).not.toBe(tourStorageKey("xyz"));
  });

  test("startet nur vor dem Kauf und nur, wenn sie noch nie gesehen wurde", () => {
    expect(shouldStartTour("preview", null)).toBe(true);
    expect(shouldStartTour("preview", "1")).toBe(false);
    expect(shouldStartTour("active", null)).toBe(false);
    expect(shouldStartTour("sold", null)).toBe(false);
  });

  test("Karte bleibt im Fenster — rechts neben dem Ziel, sonst darunter, nie außerhalb", () => {
    const viewport = { width: 1200, height: 800 };
    const card = { width: 320, height: 160 };
    // Ziel links: Karte rechts daneben.
    expect(
      clampTourCard({ left: 0, top: 100, width: 400, height: 500 }, card, viewport)
    ).toEqual({ left: 416, top: 100 });
    // Ziel rechts unten: kein Platz rechts → unter/über dem Ziel, eingeklemmt.
    const pos = clampTourCard(
      { left: 900, top: 700, width: 280, height: 60 },
      card,
      viewport
    );
    expect(pos.left + card.width).toBeLessThanOrEqual(viewport.width - 16);
    expect(pos.top + card.height).toBeLessThanOrEqual(viewport.height - 16);
    expect(pos.left).toBeGreaterThanOrEqual(16);
    expect(pos.top).toBeGreaterThanOrEqual(16);
  });

  test("ohne Ziel wird die Karte zentriert", () => {
    expect(
      clampTourCard(null, { width: 320, height: 160 }, { width: 1200, height: 800 })
    ).toEqual({ left: 440, top: 320 });
  });
});
