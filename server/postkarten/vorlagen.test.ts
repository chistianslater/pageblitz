import { describe, expect, test } from "vitest";
import {
  VORLAGE_ENV,
  vorlageAufloesen,
  vorlageFuerLayout,
  vorlagenUebersicht,
} from "./vorlagen";

const STANDARD = "5fd696c2-eccf-45ce-9e1b-0d1be6123d01";
const SCREENSHOT = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const env = {
  HEYMAIL_TEMPLATE_ID: STANDARD,
  HEYMAIL_TEMPLATE_ID_SCREENSHOT: SCREENSHOT,
};

describe("vorlageFuerLayout", () => {
  test("jedes Layout hat seine eigene Umgebungsvariable", () => {
    expect(VORLAGE_ENV.standard).toBe("HEYMAIL_TEMPLATE_ID");
    expect(VORLAGE_ENV.screenshot).toBe("HEYMAIL_TEMPLATE_ID_SCREENSHOT");
    expect(vorlageFuerLayout("standard", env)).toBe(STANDARD);
    expect(vorlageFuerLayout("screenshot", env)).toBe(SCREENSHOT);
  });

  test("Karten ohne Layout (Welle 1) gelten als Standard", () => {
    expect(vorlageFuerLayout(null, env)).toBe(STANDARD);
    expect(vorlageFuerLayout(undefined, env)).toBe(STANDARD);
  });

  test("leere Variable zählt als nicht gesetzt", () => {
    expect(
      vorlageFuerLayout("screenshot", { HEYMAIL_TEMPLATE_ID_SCREENSHOT: "  " })
    ).toBeNull();
  });

  test("Übersicht nennt jede Variable, auch die fehlende", () => {
    expect(vorlagenUebersicht({ HEYMAIL_TEMPLATE_ID: STANDARD })).toEqual([
      {
        layout: "standard",
        envName: "HEYMAIL_TEMPLATE_ID",
        templateId: STANDARD,
      },
      {
        layout: "screenshot",
        envName: "HEYMAIL_TEMPLATE_ID_SCREENSHOT",
        templateId: null,
      },
    ]);
  });
});

describe("vorlageAufloesen", () => {
  test("ohne Überschreibung gilt die Vorlage des Layouts", () => {
    expect(vorlageAufloesen({ layout: "screenshot", env })).toBe(SCREENSHOT);
    expect(vorlageAufloesen({ layout: null, env })).toBe(STANDARD);
  });

  test("Screenshot-Karte fällt NICHT auf die Standardvorlage zurück", () => {
    // Sonst ginge Batch B im Design der ersten Welle in den Druck — und
    // der Versuch wäre wertlos, ohne dass es jemand merkt.
    expect(() =>
      vorlageAufloesen({
        layout: "screenshot",
        env: { HEYMAIL_TEMPLATE_ID: STANDARD },
      })
    ).toThrow(/HEYMAIL_TEMPLATE_ID_SCREENSHOT/);
  });

  test("fehlt jede Vorlage, nennt der Fehler die Variable", () => {
    expect(() => vorlageAufloesen({ layout: "standard", env: {} })).toThrow(
      /HEYMAIL_TEMPLATE_ID/
    );
  });

  test("eine Überschreibung aus dem Browser gilt für ihr Layout", () => {
    expect(
      vorlageAufloesen({ layout: "standard", override: " neu-123456 ", env })
    ).toBe("neu-123456");
  });

  test("eine Überschreibung, die zu einem anderen Layout gehört, wird abgewiesen", () => {
    // Der alte Fall: ein im Browser gemerkter Wert sticht still die
    // Umgebung — jetzt sogar das falsche Design.
    expect(() =>
      vorlageAufloesen({ layout: "screenshot", override: STANDARD, env })
    ).toThrow(/gehört zum Layout „standard"/);
    expect(() =>
      vorlageAufloesen({ layout: "standard", override: SCREENSHOT, env })
    ).toThrow(/gehört zum Layout „screenshot"/);
  });
});
