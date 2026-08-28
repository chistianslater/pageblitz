import { describe, expect, test } from "vitest";
import {
  geoFallbackMessage,
  shouldAutoUseLocation,
  standortControlMode,
} from "./startLocation";

describe("shouldAutoUseLocation", () => {
  test("nur bei bereits erteilter Permission — kein Prompt auf der Landing", () => {
    expect(shouldAutoUseLocation("granted")).toBe(true);
    expect(shouldAutoUseLocation("prompt")).toBe(false);
    expect(shouldAutoUseLocation("denied")).toBe(false);
    expect(shouldAutoUseLocation("unknown")).toBe(false);
  });
});

describe("standortControlMode", () => {
  test("denied → Control aus, Tipp-Suche bleibt", () => {
    expect(standortControlMode("denied", "idle")).toBe("hidden");
    expect(standortControlMode("prompt", "denied")).toBe("hidden");
  });

  test("prompt/unknown zeigt den Standort-Button", () => {
    expect(standortControlMode("prompt", "idle")).toBe("button");
    expect(standortControlMode("unknown", "idle")).toBe("button");
    expect(standortControlMode("granted", "idle")).toBe("button");
  });

  test("requesting / ready übersteuern die Permission", () => {
    expect(standortControlMode("prompt", "requesting")).toBe("loading");
    expect(standortControlMode("granted", "ready")).toBe("active");
  });

  test("unavailable lässt den Button zum erneuten Versuch stehen", () => {
    expect(standortControlMode("prompt", "unavailable")).toBe("button");
  });
});

describe("geoFallbackMessage", () => {
  test("Denied und technische Fehler blockieren nicht", () => {
    expect(geoFallbackMessage("denied")).toContain("Stadt");
    expect(geoFallbackMessage("unavailable")).toContain(
      "Standort nicht verfügbar"
    );
    expect(geoFallbackMessage("timeout")).toContain(
      "Standort nicht verfügbar"
    );
    expect(geoFallbackMessage("unsupported")).toContain(
      "Standort nicht verfügbar"
    );
  });
});
