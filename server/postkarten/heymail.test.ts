import { describe, expect, test } from "vitest";
import {
  anschriftZerlegen,
  MAX_BETRIEB_ORT,
  postkartenVariablen,
  TEXT_VARIANTEN,
} from "./heymail";

describe("anschriftZerlegen (Google-Anschrift → HeyMail-Empfänger)", () => {
  test("Standardfall aus der Google-Suche", () => {
    expect(anschriftZerlegen("Osterstraße 25, 46397 Bocholt, Deutschland")).toEqual({
      street: "Osterstraße",
      houseNumber: "25",
      zip: "46397",
      city: "Bocholt",
      country: "Deutschland",
    });
  });

  test("Hausnummernbereich bleibt zusammen", () => {
    expect(anschriftZerlegen("Neustraße 18-20, 46399 Bocholt, Deutschland")).toMatchObject({
      street: "Neustraße",
      houseNumber: "18-20",
    });
  });

  test("Hausnummer mit Buchstabe", () => {
    expect(anschriftZerlegen("Franzstraße 1b, 46395 Bocholt, Deutschland")).toMatchObject({
      street: "Franzstraße",
      houseNumber: "1b",
    });
  });

  test("mehrteiliger Straßenname mit Bindestrichen", () => {
    expect(anschriftZerlegen("Alfred-Flender-Straße 26, 46395 Bocholt, Deutschland")).toMatchObject({
      street: "Alfred-Flender-Straße",
      houseNumber: "26",
    });
  });

  test("Straße mit Leerzeichen im Namen", () => {
    expect(anschriftZerlegen("Am Schievegraben 54, 46399 Bocholt, Deutschland")).toMatchObject({
      street: "Am Schievegraben",
      houseNumber: "54",
    });
  });

  test("abgekürzte Straße mit Punkt", () => {
    expect(anschriftZerlegen("Europapl. 2, 46399 Bocholt, Deutschland")).toMatchObject({
      street: "Europapl.",
      houseNumber: "2",
    });
  });

  test("ohne Land am Ende", () => {
    expect(anschriftZerlegen("Nordstraße 35, 46399 Bocholt")).toMatchObject({
      city: "Bocholt",
      country: "Deutschland",
    });
  });

  test("unbrauchbare Anschrift liefert null statt geratener Werte", () => {
    expect(anschriftZerlegen("")).toBeNull();
    expect(anschriftZerlegen("Bocholt")).toBeNull();
    expect(anschriftZerlegen("Irgendwo ohne PLZ, Deutschland")).toBeNull();
  });
});

describe("postkartenVariablen (die beiden gegenläufigen Schema-Regeln)", () => {
  const basis = {
    name: "Haar Galerie",
    stadt: "Bocholt",
    vorschauUrl: "https://pageblitz.de/preview-ssr/abc123",
    bildUrl: "https://pub-x.r2.dev/postkarten/haar-galerie.png",
  };

  test("qrCodeUrl kommt OHNE Schema — das Template setzt https:// davor", () => {
    expect(postkartenVariablen(basis).qrCodeUrl).toBe(
      "pageblitz.de/preview-ssr/abc123"
    );
  });

  test("auch http:// wird entfernt", () => {
    expect(
      postkartenVariablen({ ...basis, vorschauUrl: "http://pageblitz.de/x" }).qrCodeUrl
    ).toBe("pageblitz.de/x");
  });

  test("bildUrl behält das Schema — dort gilt die umgekehrte Regel", () => {
    expect(postkartenVariablen(basis).bildUrl).toBe(basis.bildUrl);
  });

  test("Bild ohne https wird abgelehnt statt still falsch verschickt", () => {
    expect(() =>
      postkartenVariablen({ ...basis, bildUrl: "http://unsicher/x.png" })
    ).toThrow(/https/i);
    expect(() =>
      postkartenVariablen({ ...basis, bildUrl: "/lokal/x.png" })
    ).toThrow(/https/i);
  });

  test("betrieb_ort nennt Betrieb und Ort", () => {
    // Ohne Artikel, siehe Grammatikfalle weiter unten.
    expect(postkartenVariablen(basis).betrieb_ort).toBe(
      "Für Haar Galerie in Bocholt"
    );
  });

  test("zu lange Namen werden gekürzt, nicht umgebrochen", () => {
    const lang = postkartenVariablen({
      ...basis,
      name: "Friseursalon Schneidewerkstatt am alten Marktplatz",
    }).betrieb_ort;
    expect(lang.length).toBeLessThanOrEqual(MAX_BETRIEB_ORT);
    expect(lang).toMatch(/…$/);
  });

  test("leerer Vorschaulink ist ein Fehler — eine Karte ohne Ziel ist wertlos", () => {
    expect(() => postkartenVariablen({ ...basis, vorschauUrl: "" })).toThrow();
  });
});

describe("Textvarianten (Betreiber-Wunsch 2026-09-09: Wording testen)", () => {
  const basis = {
    name: "Haar Galerie",
    stadt: "Bocholt",
    vorschauUrl: "https://pageblitz.de/preview-ssr/abc123",
    bildUrl: "https://pub-x.r2.dev/postkarten/haar-galerie.png",
  };

  test("ohne Angabe kommt die bestehende Fassung mit du-Ansprache", () => {
    const v = postkartenVariablen(basis);
    expect(v.headline).toContain("Deine Website ist fertig");
    expect(v.copy).toMatch(/\bdeine\b|\bDeine\b/);
    expect(v.abbinder).toContain("19,90");
  });

  test("jede Variante liefert alle drei Textfelder gefüllt", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as keyof typeof TEXT_VARIANTEN);
      expect(v.headline.length).toBeGreaterThan(10);
      expect(v.copy.length).toBeGreaterThan(30);
      expect(v.abbinder.length).toBeGreaterThan(10);
    }
  });

  test("jede Variante duzt — Sie-Ansprache waere ein Bruch im Motiv", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as keyof typeof TEXT_VARIANTEN);
      const text = `${v.headline} ${v.copy} ${v.abbinder}`;
      expect(text).not.toMatch(/\bIhre\b|\bIhnen\b|\bSie\b/);
    }
  });

  test("jede Variante nennt den Preis — ohne Preis keine Entscheidung", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as keyof typeof TEXT_VARIANTEN);
      expect(`${v.copy} ${v.abbinder}`).toContain("19,90");
    }
  });

  test("unbekannte Variante faellt nicht still auf den Standard zurueck", () => {
    expect(() =>
      postkartenVariablen(basis, "gibtsnicht" as never)
    ).toThrow(/unbekannt/i);
  });

  test("die Varianten unterscheiden sich tatsaechlich im Wortlaut", () => {
    const alle = Object.keys(TEXT_VARIANTEN).map(
      n => postkartenVariablen(basis, n as never).headline
    );
    expect(new Set(alle).size).toBe(alle.length);
  });
});

describe("Rueckseite: Begruessung und Anschreiben (2026-09-09)", () => {
  const basis = {
    name: "Haar Galerie",
    stadt: "Bocholt",
    vorschauUrl: "https://pageblitz.de/preview-ssr/abc123",
    bildUrl: "https://pub-x.r2.dev/postkarten/haar-galerie.png",
  };

  test("liefert Begruessung und Anschreiben mit", () => {
    const v = postkartenVariablen(basis);
    expect(v.begruessung.length).toBeGreaterThan(5);
    expect(v.anschreiben.length).toBeGreaterThan(80);
  });

  test("das Anschreiben bleibt kurz genug fuer eine Handschrift", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as never);
      // Handschriften laufen breit; auf einer A6-Rueckseite mit Adressblock
      // ist bei rund 600 Zeichen Schluss, bevor die Schrift zu klein wird.
      // 320 statt 600: Bei 417 Zeichen lief der Text aus dem Satzspiegel
      // (Betreiber-Befund am gedruckten PDF, 2026-09-09).
      expect(v.anschreiben.length).toBeLessThanOrEqual(320);
    }
  });

  test("Anschreiben duzt und nennt den Preis", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as never);
      expect(v.anschreiben).not.toMatch(/\bIhre\b|\bIhnen\b/);
      expect(v.anschreiben).toContain("19,90");
    }
  });

  test("Begruessung nennt den Betrieb beim Namen statt allgemein zu gruessen", () => {
    expect(postkartenVariablen(basis).begruessung).toBe("Hallo Haar Galerie,");
    expect(
      postkartenVariablen({ ...basis, name: "Manfred Wagner" }).begruessung
    ).toBe("Hallo Manfred Wagner,");
  });

  test("erfindet aber keine Anrede — Herr oder Frau waere geraten", () => {
    // "Manfred Wagner" ist der FIRMENname. Ob die Person so heisst, verraet
    // uns Google nicht; "Hallo Herr Wagner" waere peinlich, wenn falsch.
    for (const name of ["Manfred Wagner", "Haar Galerie", "Goldene Schere"]) {
      const v = postkartenVariablen({ ...basis, name });
      expect(v.begruessung).not.toMatch(/\bHerr\b|\bFrau\b/);
    }
  });

  test("jedes Anschreiben nennt den eigenen Agentur-Hintergrund", () => {
    // Der Glaubwuerdigkeitsanker: Wer selbst Websites baut, weiss, warum
    // der uebliche Weg zu teuer und zu langsam ist.
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as never);
      expect(v.anschreiben.toLowerCase()).toContain("agentur");
    }
  });

  test("das Anschreiben nimmt Bezug auf den konkreten Anlass", () => {
    for (const name of Object.keys(TEXT_VARIANTEN)) {
      const v = postkartenVariablen(basis, name as never);
      expect(v.anschreiben.toLowerCase()).toMatch(/google|profil/);
    }
  });
});

describe("betrieb_ort ohne Artikel (Grammatikfalle)", () => {
  const basis = {
    stadt: "Bocholt",
    vorschauUrl: "https://pageblitz.de/x",
    bildUrl: "https://pub-x.r2.dev/x.png",
  };

  test("Personenname ergibt einen korrekten Satz", () => {
    // "Für die Manfred Wagner" war grammatisch falsch.
    expect(postkartenVariablen({ ...basis, name: "Manfred Wagner" }).betrieb_ort).toBe(
      "Für Manfred Wagner in Bocholt"
    );
  });

  test("Firmenname ebenso", () => {
    expect(postkartenVariablen({ ...basis, name: "Haar Galerie" }).betrieb_ort).toBe(
      "Für Haar Galerie in Bocholt"
    );
  });
});
