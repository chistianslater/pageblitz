import { describe, expect, test } from "vitest";
import { gruppiere } from "./auswertung";
import type { KartenZeile } from "./db";

const karte = (o: Partial<KartenZeile>): KartenZeile => ({
  id: 1, code: "AAAA", betrieb: "Salon", city: "Bocholt",
  textVariant: "ungefragt", status: "versendet", sentAt: new Date(),
  scans: 0, ersterScan: null, ...o,
});

describe("gruppiere", () => {
  test("trennt Karten mit Scan von der Zahl der Aufrufe", () => {
    // Wer zweimal oeffnet, ist trotzdem ein Interessent.
    const g = gruppiere([karte({ scans: 3 }), karte({ id: 2, scans: 0 })], z => z.city);
    expect(g[0]).toMatchObject({ versendet: 2, gescannt: 1, scans: 3, quote: 50 });
  });

  test("Entwuerfe druecken die Quote nicht", () => {
    // Eine nie gedruckte Karte kann niemand scannen.
    const g = gruppiere(
      [karte({ scans: 1 }), karte({ id: 2, status: "entwurf" })],
      z => z.city
    );
    expect(g[0]).toMatchObject({ versendet: 1, quote: 100 });
  });

  test("gruppiert auch nach Textvariante", () => {
    const g = gruppiere(
      [karte({ textVariant: "ungefragt", scans: 1 }), karte({ id: 2, textVariant: "gefunden" })],
      z => z.textVariant
    );
    expect(g.map(x => x.name).sort()).toEqual(["gefunden", "ungefragt"]);
  });

  test("fehlende Angaben verschwinden nicht stillschweigend", () => {
    const g = gruppiere([karte({ city: null })], z => z.city);
    expect(g[0].name).toBe("ohne Angabe");
  });

  test("ohne Versand keine Division durch null", () => {
    const g = gruppiere([karte({ status: "entwurf" })], z => z.city);
    expect(g[0].quote).toBe(0);
  });
});
