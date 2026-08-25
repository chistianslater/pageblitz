import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { resolveLegalPrefill } from "./state";

/** Minimales Doc mit Contact-Sektion — nur die Felder, die resolveLegalPrefill liest. */
function docWithContact(
  contact: Partial<{
    street: string;
    zip: string;
    city: string;
    phone: string;
    email: string;
  }>
): WebsiteDataV2 {
  return {
    businessName: "Schreinerei Brandt",
    sections: [{ type: "contact", ...contact }],
  } as unknown as WebsiteDataV2;
}

describe("resolveLegalPrefill (GMB-Vorbefüllung fürs Impressum, 2026-08-25)", () => {
  test("ohne jede Quelle bleiben die Felder leer", () => {
    const legal = resolveLegalPrefill({
      onboarding: null,
      doc: null,
      businessName: "",
      customerEmail: null,
    });
    expect(legal).toEqual({
      legalOwner: "",
      legalStreet: "",
      legalZip: "",
      legalCity: "",
      legalEmail: "",
      legalPhone: "",
      legalVatId: "",
    });
  });

  test("Dokument (contact-Sektion) füllt Adresse und Telefon vor", () => {
    const legal = resolveLegalPrefill({
      onboarding: null,
      doc: docWithContact({
        street: "Huckarder Straße 214",
        zip: "44147",
        city: "Dortmund",
        phone: "0231 555 4471",
        email: "info@brandt.example",
      }),
      businessName: "Schreinerei Brandt",
      customerEmail: null,
    });
    expect(legal.legalStreet).toBe("Huckarder Straße 214");
    expect(legal.legalZip).toBe("44147");
    expect(legal.legalCity).toBe("Dortmund");
    expect(legal.legalPhone).toBe("0231 555 4471");
    expect(legal.legalEmail).toBe("info@brandt.example");
    expect(legal.legalOwner).toBe("Schreinerei Brandt");
  });

  test("Business-Adresse (GMB formatted_address) füllt auf, wenn das Doc nichts hat", () => {
    const legal = resolveLegalPrefill({
      onboarding: null,
      doc: docWithContact({}),
      businessName: "Schreinerei Brandt",
      businessAddress: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
      businessPhone: "02871 123456",
      customerEmail: null,
    });
    expect(legal.legalStreet).toBe("Zum Waldschlösschen 19");
    expect(legal.legalZip).toBe("46395");
    expect(legal.legalCity).toBe("Bocholt");
    expect(legal.legalPhone).toBe("02871 123456");
  });

  test("explizite Eingaben aus dem Onboarding schlagen jede GMB-Quelle", () => {
    const legal = resolveLegalPrefill({
      onboarding: {
        legalStreet: "Eigene Straße 1",
        legalCity: "Eigenstadt",
        legalEmail: "eigen@example.com",
      } as never,
      doc: docWithContact({
        street: "Huckarder Straße 214",
        zip: "44147",
        city: "Dortmund",
      }),
      businessName: "Schreinerei Brandt",
      businessAddress: "Zum Waldschlösschen 19, 46395 Bocholt, Deutschland",
      customerEmail: "kunde@example.com",
    });
    expect(legal.legalStreet).toBe("Eigene Straße 1");
    expect(legal.legalCity).toBe("Eigenstadt");
    expect(legal.legalEmail).toBe("eigen@example.com");
    // Nicht explizit gesetzte Felder fallen auf die nächste Quelle durch:
    expect(legal.legalZip).toBe("44147");
  });

  test("Kunden-E-Mail schlägt die Doc-E-Mail (bisherige Kette bleibt)", () => {
    const legal = resolveLegalPrefill({
      onboarding: null,
      doc: docWithContact({ email: "info@brandt.example" }),
      businessName: "Schreinerei Brandt",
      customerEmail: "kunde@example.com",
    });
    expect(legal.legalEmail).toBe("kunde@example.com");
  });

  test("USt-IdNr. bleibt leer — GMB liefert sie nie", () => {
    const legal = resolveLegalPrefill({
      onboarding: null,
      doc: docWithContact({ street: "Huckarder Straße 214" }),
      businessName: "Schreinerei Brandt",
      customerEmail: null,
    });
    expect(legal.legalVatId).toBe("");
  });
});
