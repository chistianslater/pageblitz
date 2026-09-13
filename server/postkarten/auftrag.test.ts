import { afterEach, describe, expect, test, vi } from "vitest";
import { karteAnHeymail, TEMPLATE_STANDARD } from "./auftrag";
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

function antwortMit(körper: unknown, ok = true) {
  const text = typeof körper === "string" ? körper : JSON.stringify(körper);
  return vi.fn(async () => ({
    ok,
    status: ok ? 200 : 422,
    text: async () => text,
  })) as unknown as typeof fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("karteAnHeymail", () => {
  test("Vorschau nimmt mailItem (Einzahl) und liefert das PDF", async () => {
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
    expect(koerper.templateId).toBe(TEMPLATE_STANDARD);
    expect(koerper.mailItem.recipient).toMatchObject({
      company: "Salon Beispiel",
      zip: "46397",
    });
    expect(koerper.mailItems).toBeUndefined();
  });

  test("Versand nimmt mailItems (Mehrzahl) und die Auftragsnummer", async () => {
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

  test("Antwort ohne JSON bleibt als Rohtext erhalten", async () => {
    // Genau das war beim ersten echten Versand (09.09.) der Fall.
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
});
