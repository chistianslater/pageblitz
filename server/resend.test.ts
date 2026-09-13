import { describe, it, expect } from "vitest";
import { Resend } from "resend";

/**
 * Umgebungspruefung, kein Unit-Test: RESEND_API_KEY steckt in der Produktion,
 * nicht in einer frischen Arbeitskopie. Ohne die Bedingung war die Datei auf
 * jedem Rechner ausser dem Server rot — und rote Dauerlaeufer liest irgendwann
 * niemand mehr. Mit gesetztem Schluessel laeuft die Pruefung wie bisher.
 */
describe.skipIf(!process.env.RESEND_API_KEY)(
  "Resend API Key Validation",
  () => {
    it("should have RESEND_API_KEY set in environment", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toBeTruthy();
      expect(apiKey).toMatch(/^re_/);
    });

    it("should be able to initialize Resend client without error", () => {
      const apiKey = process.env.RESEND_API_KEY ?? "";
      expect(() => new Resend(apiKey)).not.toThrow();
    });
  }
);
