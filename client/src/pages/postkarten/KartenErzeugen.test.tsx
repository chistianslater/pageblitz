import React from "react";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Rauchprobe für die Karten-Oberfläche. Sie klickt nichts — sie stellt
 * sicher, dass die Seite mit echten Daten überhaupt steht und die Zustände
 * aus `kandidatBewerten` alle einen Namen haben. Genau daran wäre sie sonst
 * still gescheitert: ein unbekannter Zustand, und der Badge greift ins
 * Leere.
 */
const zeile = (teil: Record<string, unknown> = {}) => ({
  businessId: 1,
  name: "Salon Beispiel",
  anschrift: "Osterstraße 25, 46397 Bocholt, Deutschland",
  branche: "Friseursalon",
  websiteId: 9,
  slug: "salon-beispiel",
  previewToken: "tok",
  websiteUpdatedAt: new Date("2026-09-10T10:00:00Z"),
  karteId: 2,
  code: "AB12",
  kartenStatus: "entwurf",
  textVariant: "ungefragt",
  bildUrl: "https://media.pageblitz.de/postkarten/AB12.jpg",
  bildAt: new Date("2026-09-12T10:00:00Z"),
  pdfUrl: null,
  sentAt: null,
  stadt: "Bocholt",
  zustand: "bereit",
  hinweis: "Motiv passt zur aktuellen Seite.",
  beauftragbar: true,
  ...teil,
});

const zeilen = [
  zeile(),
  zeile({
    businessId: 2,
    name: "Haar Galerie",
    zustand: "motiv-veraltet",
    beauftragbar: false,
    hinweis: "Die Seite wurde nach der Aufnahme neu erzeugt.",
  }),
  zeile({
    businessId: 3,
    name: "Figaro",
    zustand: "ohne-motiv",
    bildUrl: null,
    bildAt: null,
    beauftragbar: false,
  }),
  zeile({
    businessId: 4,
    name: "Goldene Schere",
    zustand: "versendet",
    beauftragbar: false,
    sentAt: new Date("2026-09-11T08:00:00Z"),
  }),
  zeile({
    businessId: 5,
    name: "Ohne Adresse",
    zustand: "ohne-anschrift",
    beauftragbar: false,
  }),
  zeile({
    businessId: 6,
    name: "Ohne Token",
    zustand: "ohne-vorschau",
    beauftragbar: false,
  }),
  zeile({
    businessId: 7,
    name: "Mobiler Friseur",
    zustand: "zurueckgestellt",
    beauftragbar: false,
    hinweis: "Zurückgestellt: keine brauchbare Anschrift.",
  }),
];

vi.mock("@/lib/trpc", () => {
  const mutation = { mutateAsync: vi.fn(), isPending: false };
  return {
    trpc: {
      useUtils: () => ({
        postkarten: {
          kandidaten: { invalidate: vi.fn() },
          uebersicht: { invalidate: vi.fn() },
        },
      }),
      postkarten: {
        kandidaten: {
          useQuery: () => ({
            data: {
              zeilen,
              abgeschnitten: false,
              zaehler: {
                gesamt: 7,
                bereit: 1,
                ohneMotiv: 1,
                veraltet: 1,
                versendet: 1,
                zurueckgestellt: 1,
                blockiert: 2,
                offen: 5,
              },
            },
            isLoading: false,
          }),
        },
        einstellungen: {
          useQuery: () => ({
            data: {
              templateId: "93df425c-64eb-4c13-b07b-cd54dd663301",
              ausUmgebung: false,
              heymailBereit: true,
            },
          }),
        },
        varianten: {
          useQuery: () => ({
            data: [{ id: "ungefragt", headline: "Deine Website ist fertig." }],
          }),
        },
        anschrift: { useMutation: () => mutation },
        zurueckstellen: { useMutation: () => mutation },
        wiederAufnehmen: { useMutation: () => mutation },
        seiteLoeschen: { useMutation: () => mutation },
        motiv: { useMutation: () => mutation },
        vorschau: { useMutation: () => mutation },
        beauftragen: { useMutation: () => mutation },
      },
    },
  };
});

const { default: KartenErzeugen } = await import("./KartenErzeugen");

describe("KartenErzeugen", () => {
  const html = renderToStaticMarkup(<KartenErzeugen />);

  test("zeigt jeden Betrieb mit seinem Zustand", () => {
    expect(html).toContain("Salon Beispiel");
    expect(html).toContain("bereit");
    expect(html).toContain("Motiv veraltet");
    expect(html).toContain("ohne Motiv");
    expect(html).toContain("Anschrift fehlt");
    expect(html).toContain("kein Vorschau-Link");
    expect(html).toContain("versendet");
  });

  test("bietet nur die wirklich beauftragbaren Karten an", () => {
    // Ohne Auswahl ist der Versandknopf leer — und bleibt es, bis jemand
    // Zeilen anhakt.
    expect(html).toContain("Beauftragen (0)");
  });

  test("bietet bei fehlender Anschrift das Nachtragen an", () => {
    // Der einzige Zustand, den kein Knopf auflöst — deshalb hier ein Feld
    // statt eines Hinweises, der in die Datenbank schickt.
    expect(html).toContain("Anschrift speichern");
    expect(html).toContain("Osterstraße 25, 46397 Bocholt, Deutschland");
  });

  test("nennt den Stand der Kampagne, nicht nur Zahlen", () => {
    expect(html).toContain("1 von 7 erledigt");
    expect(html).toContain("5 offen");
    expect(html).toContain("1 zurückgestellt");
    expect(html).toContain("1 mit veraltetem Motiv");
  });

  test("bietet Zurückstellen an und Wiederaufnehmen für Zurückgestellte", () => {
    expect(html).toContain("Zurückstellen");
    expect(html).toContain("Wieder aufnehmen");
    expect(html).toContain("Seite löschen");
  });
});
