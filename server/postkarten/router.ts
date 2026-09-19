/**
 * Postkarten im Backend: erzeugen, pruefen, beauftragen (2026-09-13).
 *
 * Bisher lief das ueber zwei Skripte auf dem Server, mit einer CSV
 * dazwischen. Das ging, solange eine Stadt gleichzeitig dran war — aber
 * nach jeder Neugenerierung der Seiten musste der Betreiber sich erinnern,
 * welche Motive dadurch veraltet sind. Genau das macht jetzt die Liste
 * (`kandidaten.ts`) sichtbar, und diese Prozeduren sind die Handgriffe
 * dazu.
 *
 * Drei Sperren sitzen hier und nirgends sonst:
 *
 *   1. Eine versendete Karte wird nicht angefasst. Kein neues Motiv, kein
 *      zweiter Auftrag — sie liegt beim Betrieb im Briefkasten.
 *   2. Ein Auftrag geht nur raus, wenn das Motiv zur heutigen Seite passt.
 *      Sonst wirbt Papier mit einem Stand, den es nicht mehr gibt.
 *   3. `beauftragen` verlangt eine ausgeschriebene Bestaetigung. Der Aufruf
 *      kostet Porto und Druck und ist nicht rueckholbar.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { deleteWebsite, updateBusiness } from "../db";
import { gruppiere, trichter } from "./auswertung";
import { karteAnHeymail, standardTemplate } from "./auftrag";
import {
  karteWiederAufnehmen,
  karteZurueckstellen,
  kartenUebersicht,
  motivGespeichert,
  postkarteSichern,
  postkarteVersendet,
  vorschauGespeichert,
  druckstatusSetzen,
} from "./db";
import {
  anschriftZerlegen,
  postkartenVariablen,
  TEXT_VARIANTEN,
  type TextVariante,
} from "./heymail";
import { kandidatenLaden, kandidatLaden, type Kandidat } from "./kandidaten";
import { motivErzeugen } from "./motiv";

/**
 * Die Vorlage darf je Lauf mitgegeben werden. Grund: Am 13.09. antwortete
 * HeyMail auf die eingebaute ID mit NOT_FOUND — Vorlagen gehoeren zum Konto
 * und wechseln, ohne dass der Code davon erfaehrt. So kann der Betreiber die
 * ID aus dem HeyMail-Konto eintragen, ohne dass jemand deployen muss.
 */
const TemplateSchema = z.string().trim().min(8).max(100).optional();

const VarianteSchema = z.enum(
  Object.keys(TEXT_VARIANTEN) as [TextVariante, ...TextVariante[]]
);

function basisUrl(): string {
  return (process.env.APP_BASE_URL || "https://pageblitz.de").replace(
    /\/+$/,
    ""
  );
}

function heymailSchluessel(): string {
  const key = process.env.HEYMAIL_API_KEY;
  if (!key) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "HEYMAIL_API_KEY fehlt in der Server-Umgebung.",
    });
  }
  return key;
}

/** Laedt die Zeile und wirft verstaendlich, wenn daran nichts zu tun ist. */
async function offenerKandidat(businessId: number): Promise<Kandidat> {
  const kandidat = await kandidatLaden(businessId);
  if (!kandidat) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Kein Betrieb mit Vorschau-Seite unter dieser Nummer.",
    });
  }
  if (kandidat.zustand === "versendet") {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Die Karte für ${kandidat.name} ist bereits versendet — sie bleibt, wie sie ist.`,
    });
  }
  return kandidat;
}

/**
 * Baut die Variablen der Karte. Wirft dieselben Fehler wie der Skriptweg,
 * nur eben als Meldung im Backend statt in der Konsole.
 */
function variablenFuer(
  kandidat: Kandidat,
  variante: TextVariante,
  code: string
) {
  const empfaenger = kandidat.anschrift
    ? anschriftZerlegen(kandidat.anschrift)
    : null;
  if (!empfaenger) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: `Anschrift von ${kandidat.name} ist nicht zerlegbar — ohne sie kostet die Karte nur Porto.`,
    });
  }
  if (!kandidat.bildUrl) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Erst das Motiv aufnehmen, dann die Karte.",
    });
  }
  try {
    return {
      empfaenger,
      variablen: postkartenVariablen(
        {
          name: kandidat.name,
          stadt: empfaenger.city,
          vorschauUrl: `${basisUrl()}/preview-ssr/${kandidat.previewToken}`,
          bildUrl: kandidat.bildUrl,
          kurzcode: code,
        },
        variante
      ),
    };
  } catch (err) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export const postkartenRouter = router({
  /** Auswertung der gedruckten Karten: Scans, Staedte, Textvarianten. */
  uebersicht: adminProcedure.query(async () => {
    const karten = await kartenUebersicht();
    return {
      karten,
      trichter: trichter(karten),
      nachStadt: gruppiere(karten, z => z.city),
      nachVariante: gruppiere(karten, z => z.textVariant),
    };
  }),

  /**
   * Druckstatus aus dem HeyMail-Konto nachziehen (2026-09-19) — von Hand,
   * weil HeyMail per API-Schluessel keine Status-Abfrage anbietet.
   */
  druckstatusSetzen: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number().int().positive()).min(1).max(500),
        druckstatus: z.enum(["geplant", "verschickt", "storniert"]),
      })
    )
    .mutation(async ({ input }) => ({
      geaendert: await druckstatusSetzen(input.ids, input.druckstatus),
    })),

  /** Was der Server gerade benutzen wuerde — fuer die Anzeige im Backend. */
  einstellungen: adminProcedure.query(() => ({
    templateId: standardTemplate(),
    ausUmgebung: !!process.env.HEYMAIL_TEMPLATE_ID?.trim(),
    heymailBereit: !!process.env.HEYMAIL_API_KEY,
  })),

  /** Textvarianten fuer die Auswahl im Backend. */
  varianten: adminProcedure.query(() =>
    Object.entries(TEXT_VARIANTEN).map(([id, text]) => ({
      id,
      headline: text.headline,
      copy: text.copy,
    }))
  ),

  /** Alle Vorschau-Seiten mit dem Stand ihrer Karte. */
  kandidaten: adminProcedure
    .input(
      z
        .object({
          branche: z.string().max(120).optional(),
          stadt: z.string().max(120).optional(),
          suche: z.string().max(200).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { zeilen, abgeschnitten } = await kandidatenLaden(input ?? {});
      return {
        zeilen,
        abgeschnitten,
        // Der Stand der Kampagne in Zahlen: Was der Filter gerade zeigt, ist
        // die Kampagne (Branche + Stadt). `offen` ist der Rest, der noch
        // Arbeit macht — versendet und zurueckgestellt sind erledigt.
        zaehler: {
          gesamt: zeilen.length,
          bereit: zeilen.filter(z => z.zustand === "bereit").length,
          ohneMotiv: zeilen.filter(z => z.zustand === "ohne-motiv").length,
          veraltet: zeilen.filter(z => z.zustand === "motiv-veraltet").length,
          versendet: zeilen.filter(z => z.zustand === "versendet").length,
          zurueckgestellt: zeilen.filter(z => z.zustand === "zurueckgestellt")
            .length,
          blockiert: zeilen.filter(
            z => z.zustand === "ohne-anschrift" || z.zustand === "ohne-vorschau"
          ).length,
          offen: zeilen.filter(
            z => z.zustand !== "versendet" && z.zustand !== "zurueckgestellt"
          ).length,
        },
      };
    }),

  /**
   * Anschrift nachtragen oder geradeziehen.
   *
   * „Anschrift fehlt" ist der einzige Zustand, den der Betreiber nicht mit
   * einem Klick aufloesen kann: Google liefert bei manchen Betrieben keine
   * Adresse oder eine, die sich nicht sauber zerlegen laesst (fehlende
   * Hausnummer, „Postfach", Adresszusatz vor der Strasse). Bisher haette er
   * dafuer in die Datenbank gemusst.
   *
   * Gespeichert wird nur, was `anschriftZerlegen` versteht — eine geratene
   * Adresse waere schlimmer als gar keine Karte: Sie kostet Porto und landet
   * im Nirgendwo.
   */
  anschrift: adminProcedure
    .input(
      z.object({
        businessId: z.number().int().positive(),
        anschrift: z.string().min(5).max(400),
      })
    )
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      const empfaenger = anschriftZerlegen(input.anschrift.trim());
      if (!empfaenger) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "So ist die Anschrift nicht zerlegbar. Form: Osterstraße 25, 46397 Bocholt, Deutschland — Hausnummer und PLZ müssen drin sein.",
        });
      }
      await updateBusiness(kandidat.businessId, {
        address: input.anschrift.trim(),
      });
      return { empfaenger };
    }),

  /**
   * Zuruecklegen: Der Betrieb faellt aus der Kampagne — ohne brauchbare
   * Anschrift etwa —, die Zeile bleibt aber stehen. Das ist der Unterschied
   * zum Loeschen der Seite: Beim naechsten Durchgang ist noch zu sehen, dass
   * er dran war und warum er nichts bekam.
   */
  zurueckstellen: adminProcedure
    .input(
      z.object({
        businessId: z.number().int().positive(),
        notiz: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      const karte = await postkarteSichern({
        businessId: kandidat.businessId,
        websiteId: kandidat.websiteId,
        city: kandidat.stadt,
        textVariant: kandidat.textVariant,
      });
      const notiz =
        input.notiz?.trim() ||
        (kandidat.zustand === "ohne-anschrift"
          ? "Zurückgestellt: keine brauchbare Anschrift."
          : "Zurückgestellt.");
      await karteZurueckstellen(karte.id, notiz);
      return { code: karte.code, notiz };
    }),

  /** Zurueck in die Kampagne, etwa nach nachgetragener Anschrift. */
  wiederAufnehmen: adminProcedure
    .input(z.object({ businessId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      if (!kandidat.karteId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Für diesen Betrieb gibt es noch gar keine Karte.",
        });
      }
      await karteWiederAufnehmen(kandidat.karteId);
      return { ok: true };
    }),

  /**
   * Vorschau-Seite loeschen. Der harte Weg — gedacht fuer Betriebe, die gar
   * nicht erst haetten generiert werden sollen.
   *
   * Fuer „faellt aus der Kampagne" ist `zurueckstellen` das richtige
   * Werkzeug: Nach dem Loeschen verschwindet die Zeile, und mit ihr die
   * Antwort, ob der Betrieb je dran war. Eine versendete Karte sperrt das
   * Loeschen ohnehin — ihr QR-Code zeigt auf genau diese Seite.
   */
  seiteLoeschen: adminProcedure
    .input(
      z.object({
        businessId: z.number().int().positive(),
        bestaetigung: z.literal("LOESCHEN"),
      })
    )
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      await deleteWebsite(kandidat.websiteId);
      return { name: kandidat.name, slug: kandidat.slug };
    }),

  /**
   * Motiv aufnehmen — auch erneut, solange die Karte nicht raus ist. Genau
   * das ist der Handgriff nach einer Neugenerierung der Seiten.
   */
  motiv: adminProcedure
    .input(z.object({ businessId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      if (!kandidat.previewToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Die Seite hat keinen Vorschau-Token — der QR hätte kein Ziel.",
        });
      }
      // Der Code entsteht hier, falls es noch keinen gibt: Er bestimmt den
      // Dateinamen des Motivs und steht spaeter auf dem Papier.
      const karte = await postkarteSichern({
        businessId: kandidat.businessId,
        websiteId: kandidat.websiteId,
        city: kandidat.stadt,
        textVariant: kandidat.textVariant,
      });
      try {
        const { bildUrl, bytes } = await motivErzeugen({
          vorschauUrl: `${basisUrl()}/preview-ssr/${kandidat.previewToken}`,
          code: karte.code,
        });
        await motivGespeichert(karte.id, bildUrl);
        return { code: karte.code, bildUrl, bytes };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Motiv für ${kandidat.name}: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }),

  /**
   * Musterbild für den Template-Bau bei HeyMail (Betreiber-Wunsch
   * 2026-09-13).
   *
   * Im HeyMail-Editor braucht man ein Bild, das dauerhaft unter derselben
   * Adresse liegt — sonst beurteilt man ein Layout an einer Aufnahme, die
   * morgen weg ist. Ein Motiv eines echten Betriebs taugt dafuer nur halb:
   * Es gehoert zu dessen Karte und wird ersetzt, sobald die Seite neu
   * erzeugt wird.
   *
   * Deshalb liegt das Muster unter einem festen Schluessel
   * (`postkarten/muster.jpg`), gehoert keiner Karte und wird nur ersetzt,
   * wenn man hier erneut drueckt.
   */
  musterMotiv: adminProcedure
    .input(
      z
        .object({ businessId: z.number().int().positive().optional() })
        .optional()
    )
    .mutation(async ({ input }) => {
      const kandidat = input?.businessId
        ? await kandidatLaden(input.businessId)
        : ((await kandidatenLaden({ limit: 50 })).zeilen.find(
            k => k.previewToken
          ) ?? null);
      if (!kandidat?.previewToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Keine Vorschau-Seite gefunden, von der sich ein Muster aufnehmen ließe.",
        });
      }
      const { bildUrl } = await motivErzeugen({
        vorschauUrl: `${basisUrl()}/preview-ssr/${kandidat.previewToken}`,
        code: "muster",
      });
      return { bildUrl, betrieb: kandidat.name };
    }),

  /**
   * HeyMail-Vorschau: erzeugt das PDF, verschickt nichts und kostet nichts.
   */
  vorschau: adminProcedure
    .input(
      z.object({
        businessId: z.number().int().positive(),
        variante: VarianteSchema.default("ungefragt"),
        templateId: TemplateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      const karte = await postkarteSichern({
        businessId: kandidat.businessId,
        websiteId: kandidat.websiteId,
        city: kandidat.stadt,
        textVariant: input.variante,
      });
      const { empfaenger, variablen } = variablenFuer(
        kandidat,
        input.variante,
        karte.code
      );
      const ergebnis = await karteAnHeymail({
        modus: "vorschau",
        apiKey: heymailSchluessel(),
        ...(input.templateId ? { templateId: input.templateId } : {}),
        firma: kandidat.name,
        empfaenger,
        variablen,
      });
      await vorschauGespeichert(karte.id, ergebnis.pdfUrl);
      return { code: karte.code, pdfUrl: ergebnis.pdfUrl };
    }),

  /**
   * Der Druckauftrag. Kostet Geld, ist nicht rueckholbar — deshalb die
   * ausgeschriebene Bestaetigung und die Pruefung, dass das Motiv zur
   * heutigen Seite gehoert.
   */
  beauftragen: adminProcedure
    .input(
      z.object({
        businessId: z.number().int().positive(),
        variante: VarianteSchema.default("ungefragt"),
        templateId: TemplateSchema,
        bestaetigung: z.literal("VERSENDEN"),
      })
    )
    .mutation(async ({ input }) => {
      const kandidat = await offenerKandidat(input.businessId);
      if (!kandidat.beauftragbar) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `${kandidat.name}: ${kandidat.hinweis}`,
        });
      }
      const karte = await postkarteSichern({
        businessId: kandidat.businessId,
        websiteId: kandidat.websiteId,
        city: kandidat.stadt,
        textVariant: input.variante,
      });
      const { empfaenger, variablen } = variablenFuer(
        kandidat,
        input.variante,
        karte.code
      );
      const ergebnis = await karteAnHeymail({
        modus: "versand",
        apiKey: heymailSchluessel(),
        ...(input.templateId ? { templateId: input.templateId } : {}),
        firma: kandidat.name,
        // Steht als Titel des Mailings in der HeyMail-Liste — sonst heisst
        // dort jeder der 31 Auftraege gleich.
        kurzcode: karte.code,
        empfaenger,
        variablen,
      });
      if (!ergebnis.referenz) {
        // Ohne Referenz gibt es bei einer Reklamation nichts vorzuzeigen —
        // deshalb wenigstens die Rohantwort ins Log (Befund 2026-09-09).
        console.log(
          `[Postkarten] ${kandidat.name}: keine Referenz in der Antwort — ${ergebnis.roh}`
        );
      }
      await postkarteVersendet(karte.id, ergebnis.referenz);
      return { code: karte.code, referenz: ergebnis.referenz };
    }),
});
