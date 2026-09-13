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
  type Empfaenger,
  type Modus,
  type PostkartenVariablen,
} from "./heymail";

const BASIS = "https://api.heymail.com/v1/mailings";

/** Das Motiv-Template, mit dem die Bocholt-Serie gedruckt wurde. */
export const TEMPLATE_STANDARD = "93df425c-64eb-4c13-b07b-cd54dd663301";

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
  empfaenger: Empfaenger;
  variablen: PostkartenVariablen;
}): Promise<HeymailErgebnis> {
  const templateId = opts.templateId ?? TEMPLATE_STANDARD;
  const antwort = await fetch(
    opts.modus === "versand" ? `${BASIS}/send` : `${BASIS}/preview`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        anfrageKoerper(opts.modus, templateId, {
          recipient: { company: opts.firma, ...opts.empfaenger },
          variableData: opts.variablen,
        })
      ),
    }
  );
  const text = await antwort.text();
  if (!antwort.ok) {
    throw new Error(`HeyMail HTTP ${antwort.status} — ${text.slice(0, 200)}`);
  }
  let daten: Record<string, string | undefined> = {};
  try {
    daten = JSON.parse(text) as Record<string, string | undefined>;
  } catch {
    // Kein JSON: Die Antwort bleibt als Rohtext erhalten, statt hier zu
    // scheitern — beim ersten echten Versand (09.09.) war genau das der
    // Fall, und ohne den Text gab es nichts vorzuzeigen.
  }
  return {
    pdfUrl: daten.previewUrl ?? null,
    referenz: daten.mailingId ?? daten.id ?? daten.orderId ?? null,
    roh: text.slice(0, 400),
  };
}
