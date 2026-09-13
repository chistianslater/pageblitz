import { describe, expect, test } from "vitest";
import { kandidatBewerten, type KandidatZeile } from "./kandidaten";

const zeile = (teil: Partial<KandidatZeile> = {}): KandidatZeile => ({
  businessId: 7,
  name: "Salon Beispiel",
  anschrift: "Osterstraße 25, 46397 Bocholt, Deutschland",
  branche: "Friseursalon",
  websiteId: 42,
  slug: "salon-beispiel-ab12",
  previewToken: "tok",
  websiteUpdatedAt: new Date("2026-09-10T10:00:00Z"),
  karteId: 3,
  code: "AB12",
  kartenStatus: "entwurf",
  notiz: null,
  textVariant: "ungefragt",
  bildUrl: "https://media.pageblitz.de/postkarten/AB12.jpg",
  bildAt: new Date("2026-09-12T10:00:00Z"),
  pdfUrl: null,
  sentAt: null,
  ...teil,
});

describe("kandidatBewerten", () => {
  test("Motiv jünger als die Seite: bereit", () => {
    const k = kandidatBewerten(zeile());
    expect(k.zustand).toBe("bereit");
    expect(k.beauftragbar).toBe(true);
    expect(k.stadt).toBe("Bocholt");
  });

  test("Seite nach der Aufnahme neu erzeugt: Motiv veraltet", () => {
    // Der Fall, der die Kampagne getroffen hat: 32 Dokumente neu gestaffelt,
    // die Motive davon unberührt.
    const k = kandidatBewerten(
      zeile({
        bildAt: new Date("2026-09-10T10:00:00Z"),
        websiteUpdatedAt: new Date("2026-09-13T09:00:00Z"),
      })
    );
    expect(k.zustand).toBe("motiv-veraltet");
    expect(k.beauftragbar).toBe(false);
  });

  test("gleiche Sekunde gilt noch als aktuell", () => {
    const gleich = new Date("2026-09-13T09:00:00Z");
    expect(
      kandidatBewerten(zeile({ bildAt: gleich, websiteUpdatedAt: gleich }))
        .zustand
    ).toBe("bereit");
  });

  test("ohne Motiv fehlt der erste Schritt", () => {
    const k = kandidatBewerten(zeile({ bildUrl: null, bildAt: null }));
    expect(k.zustand).toBe("ohne-motiv");
    expect(k.beauftragbar).toBe(false);
  });

  test("versendet schlägt alles — auch ein veraltetes Motiv", () => {
    const k = kandidatBewerten(
      zeile({
        kartenStatus: "versendet",
        sentAt: new Date("2026-09-11T08:00:00Z"),
        bildAt: new Date("2026-09-01T08:00:00Z"),
        websiteUpdatedAt: new Date("2026-09-13T08:00:00Z"),
      })
    );
    expect(k.zustand).toBe("versendet");
    expect(k.beauftragbar).toBe(false);
  });

  test("zurückgestellt zeigt die Begründung, nicht den nächsten Schritt", () => {
    // Der Betrieb faellt aus der Kampagne, die Zeile bleibt — sonst waere
    // beim naechsten Durchgang nicht mehr zu sehen, dass er dran war.
    const k = kandidatBewerten(
      zeile({
        kartenStatus: "zurueckgestellt",
        notiz: "Zurückgestellt: keine brauchbare Anschrift.",
        bildUrl: null,
      })
    );
    expect(k.zustand).toBe("zurueckgestellt");
    expect(k.hinweis).toContain("keine brauchbare Anschrift");
    expect(k.beauftragbar).toBe(false);
  });

  test("zurückgestellt ohne Notiz bleibt verständlich", () => {
    const k = kandidatBewerten(
      zeile({ kartenStatus: "zurueckgestellt", notiz: null })
    );
    expect(k.hinweis).toContain("Zurückgestellt");
  });

  test("versendet schlägt zurückgestellt", () => {
    const k = kandidatBewerten(
      zeile({ kartenStatus: "versendet", notiz: "alt" })
    );
    expect(k.zustand).toBe("versendet");
  });

  test("unzerlegbare Anschrift blockiert den Auftrag", () => {
    const k = kandidatBewerten(zeile({ anschrift: "Bocholt" }));
    expect(k.zustand).toBe("ohne-anschrift");
    expect(k.beauftragbar).toBe(false);
  });

  test("ohne Vorschau-Token hätte der QR kein Ziel", () => {
    const k = kandidatBewerten(zeile({ previewToken: null }));
    expect(k.zustand).toBe("ohne-vorschau");
    expect(k.beauftragbar).toBe(false);
  });
});
