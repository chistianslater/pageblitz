import { describe, expect, test } from "vitest";
import {
  CODE_ALPHABET,
  istBot,
  kanalAus,
  kurzcodeErzeugen,
  normalisiereCode,
} from "./kurzcode";

describe("kurzcodeErzeugen", () => {
  test("vier Zeichen aus dem verwechslungsfreien Alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = kurzcodeErzeugen();
      expect(code).toHaveLength(4);
      for (const z of code) expect(CODE_ALPHABET).toContain(z);
    }
  });

  test("enthaelt nie verwechselbare Zeichen", () => {
    // Auf Papier ist 0/O und 1/I/l nicht unterscheidbar — wer abtippt,
    // landet sonst auf einer 404 und ist weg.
    for (const z of "01OIl") expect(CODE_ALPHABET).not.toContain(z);
  });

  test("streut breit genug fuer einen Stapel", () => {
    const codes = new Set(Array.from({ length: 500 }, () => kurzcodeErzeugen()));
    expect(codes.size).toBeGreaterThan(480);
  });
});

describe("normalisiereCode", () => {
  test("Kleinschreibung und Leerzeichen sind egal", () => {
    expect(normalisiereCode(" boc7 ")).toBe("BOC7");
    expect(normalisiereCode("Boc7")).toBe("BOC7");
  });
});

describe("kanalAus", () => {
  test("mit q=1 ist es ein Scan", () => {
    expect(kanalAus("1")).toBe("qr");
  });

  test("ohne Parameter hat jemand getippt", () => {
    // Der gedruckte Kurz-Link traegt kein ?q=1 — niemand tippt das ab.
    expect(kanalAus(undefined)).toBe("typed");
    expect(kanalAus("")).toBe("typed");
  });
});

describe("istBot", () => {
  test("erkennt gaengige Crawler", () => {
    expect(istBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(istBot("WhatsApp/2.23")).toBe(true);
    expect(istBot("facebookexternalhit/1.1")).toBe(true);
  });

  test("laesst echte Browser durch", () => {
    expect(
      istBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15")
    ).toBe(false);
  });

  test("ohne User-Agent lieber als Bot behandeln", () => {
    // Ein Handy schickt immer einen — fehlt er, war es Technik.
    expect(istBot(undefined)).toBe(true);
  });
});
