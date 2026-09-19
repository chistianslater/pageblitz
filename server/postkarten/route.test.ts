import { describe, expect, test, vi } from "vitest";
import { handleKurzlink } from "./route";

function res() {
  return {
    code: 0,
    ziel: "",
    kopf: {} as Record<string, string>,
    text: "",
    status(c: number) { this.code = c; return this; },
    redirect(c: number, url: string) { this.code = c; this.ziel = url; return this; },
    set(k: string, v: string) { this.kopf[k] = v; return this; },
    type() { return this; },
    send(t: string) { this.text = t; return this; },
  };
}

const karte = { id: 7, code: "BOC7", token: "tok123" };

describe("handleKurzlink", () => {
  test("leitet in die Design-Auswahl des Studios weiter, markiert die Herkunft und zaehlt den Scan", async () => {
    const erfasseScan = vi.fn();
    const r = res();
    await handleKurzlink(
      { params: { code: "boc7" }, query: { q: "1" }, headers: { "user-agent": "Mozilla/5.0 (iPhone)" } } as never,
      r as never,
      { findeKarte: async () => karte, erfasseScan }
    );
    expect(r.code).toBe(302);
    expect(r.ziel).toBe("/onboarding/tok123?via=karte");
    expect(erfasseScan).toHaveBeenCalledWith(7, "qr");
  });

  test("ohne q-Parameter gilt es als abgetippt", async () => {
    const erfasseScan = vi.fn();
    await handleKurzlink(
      { params: { code: "BOC7" }, query: {}, headers: { "user-agent": "Mozilla/5.0 (iPhone)" } } as never,
      res() as never,
      { findeKarte: async () => karte, erfasseScan }
    );
    expect(erfasseScan).toHaveBeenCalledWith(7, "typed");
  });

  test("Bots werden weitergeleitet, aber nicht gezaehlt", async () => {
    // Sonst zaehlt jeder Crawler als Scan und die Quote ist wertlos.
    const erfasseScan = vi.fn();
    const r = res();
    await handleKurzlink(
      { params: { code: "BOC7" }, query: { q: "1" }, headers: { "user-agent": "Googlebot/2.1" } } as never,
      r as never,
      { findeKarte: async () => karte, erfasseScan }
    );
    expect(r.code).toBe(302);
    expect(erfasseScan).not.toHaveBeenCalled();
  });

  test("unbekannter Code endet freundlich, nicht mit einem Absturz", async () => {
    const r = res();
    await handleKurzlink(
      { params: { code: "XXXX" }, query: {}, headers: { "user-agent": "Mozilla/5.0" } } as never,
      r as never,
      { findeKarte: async () => null, erfasseScan: vi.fn() }
    );
    expect(r.code).toBe(404);
    expect(r.text).toContain("pageblitz.de");
  });

  test("die Seite darf nie in den Suchindex", async () => {
    const r = res();
    await handleKurzlink(
      { params: { code: "BOC7" }, query: {}, headers: { "user-agent": "Mozilla/5.0 (iPhone)" } } as never,
      r as never,
      { findeKarte: async () => karte, erfasseScan: vi.fn() }
    );
    expect(r.kopf["X-Robots-Tag"]).toContain("noindex");
  });

  test("eine fehlgeschlagene Zaehlung darf den Besucher nicht aufhalten", async () => {
    // Der Mensch mit der Karte in der Hand ist wichtiger als die Statistik.
    const r = res();
    await handleKurzlink(
      { params: { code: "BOC7" }, query: { q: "1" }, headers: { "user-agent": "Mozilla/5.0 (iPhone)" } } as never,
      r as never,
      {
        findeKarte: async () => karte,
        erfasseScan: async () => { throw new Error("DB weg"); },
      }
    );
    expect(r.code).toBe(302);
    expect(r.ziel).toBe("/onboarding/tok123?via=karte");
  });
});
