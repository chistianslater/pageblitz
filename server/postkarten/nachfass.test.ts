import { describe, expect, test } from "vitest";
import {
  nachfassSperre,
  nachfassVorschlag,
  type NachfassKandidat,
} from "./nachfass";

let laufend = 0;
const karte = (o: Partial<NachfassKandidat> = {}): NachfassKandidat => {
  laufend += 1;
  return {
    karteId: laufend,
    code: `C${String(laufend).padStart(3, "0")}`,
    businessId: 100 + laufend,
    betrieb: `Salon ${laufend}`,
    city: "Bocholt",
    welle: null,
    status: "versendet",
    testkarte: false,
    druckstatus: "verschickt",
    scans: 0,
    websiteStatus: "preview",
    hatNeuereKarte: false,
    sentAt: new Date("2026-09-17T10:00:00Z"),
    ...o,
  };
};

describe("nachfassSperre", () => {
  test("eine nie gescannte Karte der ersten Welle darf", () => {
    expect(nachfassSperre(karte())).toBeNull();
  });

  test("schließt Testkarte, Scanner, Gekaufte und schon Nachgefasste aus", () => {
    expect(nachfassSperre(karte({ testkarte: true }))).toMatch(/Testkarte/);
    expect(nachfassSperre(karte({ scans: 1 }))).toMatch(/gescannt/);
    expect(nachfassSperre(karte({ websiteStatus: "sold" }))).toMatch(/gekauft/);
    expect(nachfassSperre(karte({ hatNeuereKarte: true }))).toMatch(/jüngere/);
    expect(nachfassSperre(karte({ status: "entwurf" }))).toMatch(
      /nie versendet/
    );
    expect(nachfassSperre(karte({ druckstatus: "storniert" }))).toMatch(
      /storniert/
    );
    expect(nachfassSperre(karte({ welle: "welle-2" }))).toMatch(/ersten Welle/);
  });
});

describe("nachfassVorschlag", () => {
  const bocholt = [1, 2, 3, 4].map(() => karte({ city: "Bocholt" }));
  const borken = [1, 2, 3].map(() => karte({ city: "Borken" }));
  const duisburg = [1, 2].map(() => karte({ city: "Duisburg" }));
  const gesperrt = [
    karte({ city: "Duisburg", scans: 2 }),
    karte({ city: "Bocholt", testkarte: true }),
  ];
  const alle = [...gesperrt, ...duisburg, ...borken, ...bocholt];

  test("wählt genau fünf und keine gesperrte", () => {
    const v = nachfassVorschlag(alle, 5);
    expect(v).toHaveLength(5);
    expect(v.every(k => nachfassSperre(k) === null)).toBe(true);
  });

  test("verteilt reihum über die Städte, größte Stadt zuerst", () => {
    const v = nachfassVorschlag(alle, 5);
    expect(v.map(k => k.city)).toEqual([
      "Bocholt",
      "Borken",
      "Duisburg",
      "Bocholt",
      "Borken",
    ]);
  });

  test("ist deterministisch, unabhängig von der Eingabereihenfolge", () => {
    const a = nachfassVorschlag(alle, 5).map(k => k.code);
    const b = nachfassVorschlag([...alle].reverse(), 5).map(k => k.code);
    expect(a).toEqual(b);
  });

  test("in jeder Stadt entscheidet der Kurzcode", () => {
    const v = nachfassVorschlag(alle, 5);
    const ausBocholt = v.filter(k => k.city === "Bocholt").map(k => k.code);
    expect(ausBocholt).toEqual([...ausBocholt].sort());
    expect(ausBocholt[0]).toBe(bocholt[0].code);
  });

  test("gibt weniger zurück, wenn es nicht genug Berechtigte gibt", () => {
    expect(nachfassVorschlag(duisburg, 5)).toHaveLength(2);
    expect(nachfassVorschlag(gesperrt, 5)).toHaveLength(0);
  });
});
