import { describe, expect, test } from "vitest";
import { toCssVars } from "./toCssVars";
import type { PackConstitution } from "./types";

const mini: PackConstitution = {
  id: "werkbank",
  name: "Werkbank",
  essence: "Test",
  theme: "light",
  industries: ["schreinerei"],
  palette: [
    { name: "Beton", hex: "#E8E6E1", role: "canvas", usage: "Grund" },
    {
      name: "Signal",
      hex: "#FF4D00",
      role: "accent",
      usage: "CTA",
      locked: true,
    },
    { name: "Kohle", hex: "#191919", role: "ink", usage: "Text" },
  ],
  type: {
    display: {
      family: "Archivo Black",
      weights: [400],
      fallback: "sans-serif",
      googleCss: "Archivo+Black",
    },
    body: {
      family: "Inter",
      weights: [400, 700],
      fallback: "sans-serif",
      googleCss: "Inter:wght@400;700",
    },
    scale: { basePx: 16, ratio: 1.25, heroClamp: "clamp(2.4rem,6vw,4.5rem)" },
  },
  shape: {
    radiusCard: "0px",
    radiusButton: "0px",
    buttonStyle: "block",
    density: "dense",
  },
  signature: {
    hero: "vertical-rail",
    decor: ["marquee"],
    imageTreatment: "hard-crop",
  },
  llmHints: { do: ["direkt"], dont: ["blumig"] },
};

describe("toCssVars", () => {
  test("emittiert Rollen- und Font-Variablen", () => {
    const v = toCssVars(mini);
    expect(v["--pb-canvas"]).toBe("#E8E6E1");
    expect(v["--pb-accent"]).toBe("#FF4D00");
    expect(v["--pb-font-display"]).toBe('"Archivo Black", sans-serif');
    expect(v["--pb-radius-button"]).toBe("0px");
  });
  test("Override greift bei nicht gesperrter Farbe", () => {
    expect(toCssVars(mini, { ink: "#222222" })["--pb-ink"]).toBe("#222222");
  });
  test("Kunden-Akzent-Override schlägt locked (Studio-Theme-Editor)", () => {
    // Bewusste Kundenwahl > Pack-Lock bei `accent` (siehe toCssVars.ts) —
    // sonst wäre „Ich wähle Rot, nichts passiert" für Packs mit locked
    // Akzent (z. B. werkbank) unerklärbar.
    expect(toCssVars(mini, { accent: "#00FF00" })["--pb-accent"]).toBe(
      "#00FF00"
    );
  });
  test("Override wird bei locked Nicht-Akzent-Farbe weiterhin ignoriert", () => {
    const lockedInk: PackConstitution = {
      ...mini,
      palette: mini.palette.map(p =>
        p.role === "ink" ? { ...p, locked: true } : p
      ),
    };
    expect(toCssVars(lockedInk, { ink: "#222222" })["--pb-ink"]).toBe(
      "#191919"
    );
  });
  test("Schriftpaar ersetzt display/body, utility bleibt pack-seitig", () => {
    const pair = {
      display: {
        family: "Lora",
        fallback: "Georgia, serif",
        googleCss: "Lora:ital,wght@0,500;1,500",
      },
      body: {
        family: "Karla",
        fallback: "system-ui, sans-serif",
        googleCss: "Karla:wght@400;500",
      },
    };
    const v = toCssVars(mini, undefined, pair);
    expect(v["--pb-font-display"]).toBe('"Lora", Georgia, serif');
    expect(v["--pb-font-body"]).toBe('"Karla", system-ui, sans-serif');
  });
  test("ohne Schriftpaar bleiben die Pack-Fonts", () => {
    const v = toCssVars(mini, undefined, null);
    expect(v["--pb-font-display"]).toBe('"Archivo Black", sans-serif');
  });
  test("--pb-accent-text fällt ohne Paletteneintrag auf --pb-accent zurück", () => {
    expect(toCssVars(mini)["--pb-accent-text"]).toBe("#FF4D00");
  });
  test("--pb-accent-text nutzt den accent-text-Paletteneintrag, wenn vorhanden", () => {
    const withText: PackConstitution = {
      ...mini,
      palette: [
        ...mini.palette,
        {
          name: "Rost",
          hex: "#A83600",
          role: "accent-text",
          usage: "Kleintext",
        },
      ],
    };
    const v = toCssVars(withText);
    expect(v["--pb-accent"]).toBe("#FF4D00");
    expect(v["--pb-accent-text"]).toBe("#A83600");
  });
});
