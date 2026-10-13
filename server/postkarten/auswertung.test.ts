import { describe, expect, test } from "vitest";
import {
  gruppiere,
  nachVersuchsarm,
  trichter,
  trichterStufe,
} from "./auswertung";
import type { KartenZeile } from "./db";

const karte = (o: Partial<KartenZeile>): KartenZeile => ({
  id: 1, code: "AAAA", betrieb: "Salon", city: "Bocholt",
  textVariant: "ungefragt", status: "versendet", sentAt: new Date(),
  scans: 0, ersterScan: null, letzterScan: null, druckstatus: "geplant",
  websiteStatus: "preview", hatEmail: false, designBestaetigt: false,
  welle: null, batch: null, layout: null, abgeloest: false, ...o,
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

describe("trichterStufe (Postkarten-Übersicht, 2026-09-19)", () => {
  test("die höchste erreichte Stufe zählt — gekauft schlägt alles", () => {
    expect(trichterStufe(karte({}))).toBe("beauftragt");
    expect(trichterStufe(karte({ scans: 2 }))).toBe("gescannt");
    expect(trichterStufe(karte({ scans: 1, designBestaetigt: true }))).toBe("design");
    expect(trichterStufe(karte({ scans: 1, designBestaetigt: true, hatEmail: true }))).toBe("email");
    expect(trichterStufe(karte({ websiteStatus: "active" }))).toBe("gekauft");
    expect(trichterStufe(karte({ websiteStatus: "sold" }))).toBe("gekauft");
  });

  test("Design bestätigt ohne erfassten Scan zählt trotzdem (Link abgetippt, Bot-Filter, Zählung ausgefallen)", () => {
    expect(trichterStufe(karte({ scans: 0, designBestaetigt: true }))).toBe("design");
  });

  test("stornierte, zurückgestellte und Entwurfs-Karten sind nicht im Trichter", () => {
    expect(trichterStufe(karte({ druckstatus: "storniert" }))).toBeNull();
    expect(trichterStufe(karte({ status: "zurueckgestellt", druckstatus: null }))).toBeNull();
    expect(trichterStufe(karte({ status: "entwurf", druckstatus: null }))).toBeNull();
  });
});

describe("trichter", () => {
  test("zählt kumulativ: wer gekauft hat, hat auch gescannt", () => {
    const t = trichter([
      karte({ id: 1 }),
      karte({ id: 2, scans: 1 }),
      karte({ id: 3, scans: 1, designBestaetigt: true, hatEmail: true }),
      karte({ id: 4, websiteStatus: "active" }),
      karte({ id: 5, druckstatus: "storniert", scans: 9 }),
    ]);
    expect(t.map(s => [s.stufe, s.anzahl])).toEqual([
      ["beauftragt", 4],
      ["gescannt", 3],
      ["design", 2],
      ["email", 2],
      ["gekauft", 1],
    ]);
    expect(t[1].quote).toBe(75);
    expect(t[0].quote).toBe(100);
  });

  test("leere Kampagne: keine Division durch null", () => {
    expect(trichter([]).every(s => s.anzahl === 0 && s.quote === 0)).toBe(true);
  });
});

describe("Nachfass-Zuordnung (Welle 2, Batch D)", () => {
  test("abgelöste, nie gescannte Karte bekommt den Kauf nicht gutgeschrieben", () => {
    // Die Seite ist dieselbe — ohne die Regel zählte der Kauf für beide Karten.
    expect(
      trichterStufe(karte({ abgeloest: true, websiteStatus: "active" }))
    ).toBe("beauftragt");
    expect(
      trichterStufe(
        karte({ welle: "welle-2", batch: "D", websiteStatus: "active" })
      )
    ).toBe("gekauft");
  });

  test("hat die alte Karte selbst gescannt, behält sie ihren Fortschritt", () => {
    expect(
      trichterStufe(karte({ abgeloest: true, scans: 1, designBestaetigt: true }))
    ).toBe("design");
  });
});

describe("nachVersuchsarm", () => {
  const karten = [
    karte({ id: 1, scans: 1 }),
    karte({ id: 2 }),
    karte({ id: 3, welle: "welle-2", batch: "B", layout: "screenshot", textVariant: "screenshot", scans: 2, designBestaetigt: true }),
    karte({ id: 4, welle: "welle-2", batch: "B", layout: "screenshot", textVariant: "screenshot" }),
    karte({ id: 5, welle: "welle-2", batch: "A", layout: "standard", textVariant: "ungefragt", websiteStatus: "active" }),
    karte({ id: 6, welle: "welle-2", batch: "C", layout: "standard", textVariant: "angebot", status: "entwurf", druckstatus: null }),
  ];

  test("erste Welle steht als Vergleichszeile oben, dann die Batches in Reihenfolge", () => {
    expect(nachVersuchsarm(karten).map(a => [a.welle, a.batch])).toEqual([
      ["welle-1", null],
      ["welle-2", "A"],
      ["welle-2", "B"],
      ["welle-2", "C"],
    ]);
  });

  test("Karten ohne Welle und Layout heißen welle-1 und standard", () => {
    const [basis] = nachVersuchsarm(karten);
    expect(basis).toMatchObject({
      welle: "welle-1",
      layout: "standard",
      textVariant: "ungefragt",
      versendet: 2,
    });
    expect(basis.trichter[1]).toMatchObject({ stufe: "gescannt", anzahl: 1, quote: 50 });
  });

  test("jeder Arm hat seinen eigenen Trichter", () => {
    const b = nachVersuchsarm(karten).find(a => a.batch === "B")!;
    expect(b.layout).toBe("screenshot");
    expect(b.trichter.map(s => s.anzahl)).toEqual([2, 1, 1, 0, 0]);
    const a = nachVersuchsarm(karten).find(x => x.batch === "A")!;
    expect(a.trichter.at(-1)).toMatchObject({ stufe: "gekauft", anzahl: 1 });
  });

  test("Entwürfe erscheinen, zählen aber nicht als versendet", () => {
    const c = nachVersuchsarm(karten).find(a => a.batch === "C")!;
    expect(c.versendet).toBe(0);
    expect(c.trichter[0].quote).toBe(0);
  });

  test("zwei Textvarianten in einem Batch werden zwei Zeilen, nicht gemittelt", () => {
    const arme = nachVersuchsarm([
      karte({ id: 1, welle: "welle-2", batch: "C", textVariant: "angebot" }),
      karte({ id: 2, welle: "welle-2", batch: "C", textVariant: "ungefragt" }),
    ]);
    expect(arme).toHaveLength(2);
  });
});
