import { afterEach, describe, expect, test, vi } from "vitest";
import { karteAnHeymail } from "./auftrag";
import { postkartenVariablen, type Empfaenger } from "./heymail";

const empfaenger: Empfaenger = {
  street: "Osterstraße",
  houseNumber: "25",
  zip: "46397",
  city: "Bocholt",
  country: "Deutschland",
};

const variablen = postkartenVariablen({
  name: "Salon Beispiel",
  stadt: "Bocholt",
  vorschauUrl: "https://pageblitz.de/preview-ssr/tok",
  bildUrl: "https://media.pageblitz.de/postkarten/AB12.jpg",
  kurzcode: "AB12",
});

function antwortMit(körper: unknown, ok = true, status?: number) {
  const text = typeof körper === "string" ? körper : JSON.stringify(körper);
  return vi.fn(async () => ({
    ok,
    status: status ?? (ok ? 200 : 422),
    text: async () => text,
  })) as unknown as typeof fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

/** Seit dem 15.09. geht ohne Vorlage nichts raus — Tests setzen eine. */
function mitVorlage(id = "tpl-aus-der-umgebung") {
  vi.stubEnv("HEYMAIL_TEMPLATE_ID", id);
}

describe("karteAnHeymail", () => {
  test("Vorschau nimmt mailItem (Einzahl) und liefert das PDF", async () => {
    mitVorlage();
    const fetchMock = antwortMit({ previewUrl: "https://pdf/1.pdf" });
    vi.stubGlobal("fetch", fetchMock);

    const ergebnis = await karteAnHeymail({
      modus: "vorschau",
      apiKey: "k",
      firma: "Salon Beispiel",
      empfaenger,
      variablen,
    });

    expect(ergebnis.pdfUrl).toBe("https://pdf/1.pdf");
    const [url, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toContain("/preview");
    const koerper = JSON.parse((init as RequestInit).body as string);
    expect(koerper.templateId).toBe("tpl-aus-der-umgebung");
    expect(koerper.mailItem.recipient).toMatchObject({
      company: "Salon Beispiel",
      zip: "46397",
    });
    expect(koerper.mailItems).toBeUndefined();
  });

  test("Versand nimmt mailItems (Mehrzahl) und die Auftragsnummer", async () => {
    mitVorlage();
    const fetchMock = antwortMit({ mailingId: "m-9" });
    vi.stubGlobal("fetch", fetchMock);

    const ergebnis = await karteAnHeymail({
      modus: "versand",
      apiKey: "k",
      firma: "Salon Beispiel",
      empfaenger,
      variablen,
    });

    expect(ergebnis.referenz).toBe("m-9");
    const [url, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toContain("/send");
    expect(
      JSON.parse((init as RequestInit).body as string).mailItems
    ).toHaveLength(1);
  });

  test("HTTP-Fehler wirft mit der Antwort im Text", async () => {
    mitVorlage();
    vi.stubGlobal("fetch", antwortMit("Adresse unvollständig", false));
    await expect(
      karteAnHeymail({
        modus: "vorschau",
        apiKey: "k",
        firma: "Salon Beispiel",
        empfaenger,
        variablen,
      })
    ).rejects.toThrow(/422.*Adresse unvollständig/);
  });

  test("unbekannte Vorlage nennt die Vorlage, nicht nur 404", async () => {
    // Befund 2026-09-13: 33-mal „HeyMail HTTP 404" im Backend, während der
    // Grund eine Template-ID war, die es im Konto nicht mehr gibt.
    vi.stubGlobal(
      "fetch",
      antwortMit(
        {
          type: "NOT_FOUND",
          message:
            "Could not find template with id 93df425c-64eb-4c13-b07b-cd54dd663301",
        },
        false,
        404
      )
    );
    await expect(
      karteAnHeymail({
        modus: "vorschau",
        apiKey: "k",
        templateId: "93df425c-64eb-4c13-b07b-cd54dd663301",
        firma: "Salon Beispiel",
        empfaenger,
        variablen,
      })
    ).rejects.toThrow(/kennt die Vorlage 93df425c/);
  });

  test("die ausdrueckliche Vorlage sticht die aus der Umgebung", async () => {
    const fetchMock = antwortMit({ previewUrl: "https://pdf/2.pdf" });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("HEYMAIL_TEMPLATE_ID", "neue-vorlage-1234");

    await karteAnHeymail({
      modus: "vorschau",
      apiKey: "k",
      templateId: "aus-dem-feld-9999",
      firma: "Salon Beispiel",
      empfaenger,
      variablen,
    });

    const [, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(JSON.parse((init as RequestInit).body as string).templateId).toBe(
      "aus-dem-feld-9999"
    );
  });

  test("Antwort ohne JSON bleibt als Rohtext erhalten", async () => {
    // Genau das war beim ersten echten Versand (09.09.) der Fall.
    mitVorlage();
    vi.stubGlobal("fetch", antwortMit("accepted"));
    const ergebnis = await karteAnHeymail({
      modus: "versand",
      apiKey: "k",
      firma: "Salon Beispiel",
      empfaenger,
      variablen,
    });
    expect(ergebnis.referenz).toBeNull();
    expect(ergebnis.roh).toBe("accepted");
  });
  test("ohne jede Vorlage geht nichts raus", async () => {
    // Bis zum 15.09. stand hier eine fest eingebaute ID. Als die im Konto
    // geloescht war, antwortete /send mit einem nackten 500 — 31-mal.
    const fetchMock = antwortMit({ mailingId: "m-1" });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("HEYMAIL_TEMPLATE_ID", "");

    await expect(
      karteAnHeymail({
        modus: "versand",
        apiKey: "k",
        firma: "Salon Beispiel",
        empfaenger,
        variablen,
      })
    ).rejects.toThrow(/Keine HeyMail-Vorlage hinterlegt/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("der Versand traegt Betrieb und Kurzcode als Titel", async () => {
    mitVorlage();
    const fetchMock = antwortMit({ mailingId: "m-2" });
    vi.stubGlobal("fetch", fetchMock);

    await karteAnHeymail({
      modus: "versand",
      apiKey: "k",
      firma: "Friseur Bocholt by Aras",
      kurzcode: "KGA5",
      empfaenger,
      variablen,
    });

    const [, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(JSON.parse((init as RequestInit).body as string).name).toBe(
      "Friseur Bocholt by Aras · KGA5"
    );
  });

  test("die Vorschau schickt keinen Titel — /preview kennt das Feld nicht", async () => {
    mitVorlage();
    const fetchMock = antwortMit({ previewUrl: "https://pdf/3.pdf" });
    vi.stubGlobal("fetch", fetchMock);

    await karteAnHeymail({
      modus: "vorschau",
      apiKey: "k",
      firma: "Salon Beispiel",
      kurzcode: "AB12",
      empfaenger,
      variablen,
    });

    const [, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(JSON.parse((init as RequestInit).body as string).name).toBeUndefined();
  });

  test("ein gedrosselter Auftrag wird abgewartet, nicht verworfen", async () => {
    // HeyMail drosselt /send schon bei rund einem Dutzend Aufrufen kurz
    // hintereinander (gemessen 15.09.) — ein Stapel von 31 laeuft da rein.
    mitVorlage();
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => '{"type":"RATE_LIMIT"}',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '{"mailingId":"m-3"}',
      });
    vi.stubGlobal("fetch", fetchMock);

    const lauf = karteAnHeymail({
      modus: "versand",
      apiKey: "k",
      firma: "Salon Beispiel",
      empfaenger,
      variablen,
    });
    await vi.advanceTimersByTimeAsync(2000);

    expect((await lauf).referenz).toBe("m-3");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("500 beim Versand wird als fehlende Vorlage entlarvt", async () => {
    // /send prueft die Vorlage erst nach der Feldpruefung und antwortet
    // dann mit INTERNAL. Die Vorschau sagt es sauber und kostet nichts.
    mitVorlage("geloeschte-vorlage");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () =>
          '{"type":"INTERNAL","message":"Internal server error"}',
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () =>
          '{"type":"NOT_FOUND","message":"Template not found."}',
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      karteAnHeymail({
        modus: "versand",
        apiKey: "k",
        firma: "Salon Beispiel",
        empfaenger,
        variablen,
      })
    ).rejects.toThrow(/kennt die Vorlage geloeschte-vorlage nicht/);
    expect(
      (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[1][0]
    ).toContain("/preview");
  });
});
