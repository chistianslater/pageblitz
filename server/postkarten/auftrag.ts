/**
 * Der Gang zu HeyMail — Vorschau und Auftrag (2026-09-13).
 *
 * Bisher stand dieser Aufruf nur in `scripts/postkarten-vorschau.ts`. Seit
 * die Karten auch im Backend entstehen, gibt es ihn zweimal — und damit die
 * Gefahr, dass die eine Seite eine Regel kennt, die die andere nicht hat
 * (die Koerperform je Endpunkt etwa, siehe `anfrageKoerper`). Deshalb hier
 * an einer Stelle.
 *
 * `modus: "versand"` kostet Geld und ist nicht rueckholbar. Diese Funktion
 * entscheidet das nicht selbst: Sie tut, was ihr gesagt wird. Die Sperren
 * (schon versendet? bestaetigt?) sitzen bewusst eine Ebene hoeher, wo auch
 * bekannt ist, wer klickt.
 */
import {
  anfrageKoerper,
  mailingTitel,
  type Empfaenger,
  type Modus,
  type PostkartenVariablen,
} from "./heymail";

const BASIS = "https://api.heymail.com/v1/mailings";

/**
 * Die Vorlage, die ohne ausdrueckliche Angabe benutzt wird — oder `null`.
 *
 * Hier stand bis zum 15.09. eine fest eingebaute ID. Die war seit dem 13.09.
 * im HeyMail-Konto geloescht, und weil `/send` die Vorlage erst nach der
 * Feldpruefung nachschlaegt, kam als Antwort kein „nicht gefunden", sondern
 * ein nacktes `500 INTERNAL` — 31-mal hintereinander, und die Suche lief
 * tagelang in die Adressen statt in die Vorlage.
 *
 * Eine ID gehoert zum Konto und kann jederzeit verschwinden. Der Code kann
 * das nicht wissen, also raet er auch nicht mehr: Ohne
 * `HEYMAIL_TEMPLATE_ID` oder ausdrueckliche Angabe geht gar nichts raus.
 */
export function standardTemplate(): string | null {
  return process.env.HEYMAIL_TEMPLATE_ID?.trim() || null;
}

/**
 * Wie lange nach einem `429` gewartet wird, bevor es der naechste Versuch
 * probiert. HeyMail drosselt `/send` schon bei rund einem Dutzend Aufrufen
 * kurz hintereinander (gemessen 15.09.) — und ein Stapel von 31 Karten
 * laeuft genau da hinein.
 */
const WARTEN_MS = [2000, 6000, 15000];

function schlafen(ms: number): Promise<void> {
  return new Promise(a => setTimeout(a, ms));
}

export interface HeymailErgebnis {
  /** PDF der Vorschau; beim Versand liefert HeyMail keins. */
  pdfUrl: string | null;
  /** Auftragsnummer — ohne sie gibt es bei einer Reklamation nichts. */
  referenz: string | null;
  /** Rohe Antwort, gekuerzt; landet ins Log, wenn die Referenz fehlt. */
  roh: string;
}

export async function karteAnHeymail(opts: {
  modus: Modus;
  apiKey: string;
  templateId?: string;
  /** Firmenname in der Anschrift — steht ueber der Strasse. */
  firma: string;
  /** Kurzcode der Karte; steht im Titel des Mailings, wenn vorhanden. */
  kurzcode?: string;
  empfaenger: Empfaenger;
  variablen: PostkartenVariablen;
}): Promise<HeymailErgebnis> {
  const templateId = opts.templateId?.trim() || standardTemplate();
  if (!templateId) {
    throw new Error(
      `Keine HeyMail-Vorlage hinterlegt. Die ID aus dem HeyMail-Konto im Feld „HeyMail-Vorlage" eintragen oder HEYMAIL_TEMPLATE_ID auf dem Server setzen.`
    );
  }
  const eintrag = {
    recipient: { company: opts.firma, ...opts.empfaenger },
    variableData: opts.variablen,
  };
  const url = opts.modus === "versand" ? `${BASIS}/send` : `${BASIS}/preview`;
  const koerper = JSON.stringify(
    anfrageKoerper(
      opts.modus,
      templateId,
      eintrag,
      opts.modus === "versand"
        ? mailingTitel(opts.firma, opts.kurzcode)
        : undefined
    )
  );

  let antwort = await heymailRuf(url, opts.apiKey, koerper);
  // Gedrosselt heisst „gleich wieder", nicht „geht nicht". Ohne das Warten
  // faellt mitten im Stapel eine Karte raus, die nichts falsch gemacht hat.
  //
  // Der zweite Versuch ist nur deshalb unbedenklich, weil HeyMail vor dem
  // Anlegen drosselt: Die Antwort lautet „Too many send requests", nicht
  // „schon angenommen". Wuerde dort je ein Auftrag entstehen und trotzdem
  // 429 zurueckkommen, waere dieses Wiederholen ein doppelter Druck.
  for (const ms of WARTEN_MS) {
    if (antwort.status !== 429) break;
    await schlafen(ms);
    antwort = await heymailRuf(url, opts.apiKey, koerper);
  }

  if (!antwort.ok) {
    // Der haeufigste Fehler ist kein Datenfehler, sondern eine Vorlage, die
    // es im Konto nicht (mehr) gibt. Ohne diesen Satz liest man 33-mal
    // „HTTP 404" und sucht in den Adressen.
    if (antwort.status === 404 && /template/i.test(antwort.text)) {
      throw new Error(vorlageFehltText(templateId));
    }
    // Beim Versand verschweigt HeyMail genau das: `/send` prueft die Vorlage
    // erst nach der Feldpruefung und antwortet dann mit `500 INTERNAL`
    // (Befund 15.09.). Die Vorschau sagt es sauber und kostet nichts —
    // also einmal nachfragen, statt den nackten 500er weiterzureichen.
    if (antwort.status >= 500 && opts.modus === "versand") {
      const probe = await heymailRuf(
        `${BASIS}/preview`,
        opts.apiKey,
        JSON.stringify(anfrageKoerper("vorschau", templateId, eintrag))
      );
      if (probe.status === 404 && /template/i.test(probe.text)) {
        throw new Error(vorlageFehltText(templateId));
      }
    }
    throw new Error(
      `HeyMail HTTP ${antwort.status} — ${antwort.text.slice(0, 200)}`
    );
  }

  let daten: Record<string, string | undefined> = {};
  try {
    daten = JSON.parse(antwort.text) as Record<string, string | undefined>;
  } catch {
    // Kein JSON: Die Antwort bleibt als Rohtext erhalten, statt hier zu
    // scheitern — beim ersten echten Versand (09.09.) war genau das der
    // Fall, und ohne den Text gab es nichts vorzuzeigen.
  }
  return {
    pdfUrl: daten.previewUrl ?? null,
    referenz: daten.mailingId ?? daten.id ?? daten.orderId ?? null,
    roh: antwort.text.slice(0, 400),
  };
}

function vorlageFehltText(templateId: string): string {
  return `HeyMail kennt die Vorlage ${templateId} nicht. Im HeyMail-Konto die Template-ID nachsehen und im Feld „HeyMail-Vorlage" eintragen (oder HEYMAIL_TEMPLATE_ID setzen).`;
}

async function heymailRuf(
  url: string,
  apiKey: string,
  koerper: string
): Promise<{ ok: boolean; status: number; text: string }> {
  const antwort = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: koerper,
  });
  return {
    ok: antwort.ok,
    status: antwort.status,
    text: await antwort.text(),
  };
}
