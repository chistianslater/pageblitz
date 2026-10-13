/**
 * Nachfass-Auswahl für Welle 2, Batch D (Betreiber-Entscheid 2026-10-13).
 *
 * Fünf Friseure der ersten Welle, die ihre Karte nie gescannt haben,
 * bekommen eine zweite. Die Auswahl ist deterministisch — wer die Liste
 * zweimal öffnet, sieht denselben Vorschlag — und über die Städte verteilt,
 * damit nicht zufällig fünf Bocholter den Batch ausmachen und Stadt und
 * Nachfass sich in der Auswertung vermischen.
 *
 * Nur die reine Logik; die Abfrage steht in `db.ts`.
 */
import { WELLE_1, welleVon } from "../../shared/postkartenWelle";

export interface NachfassKandidat {
  karteId: number;
  code: string;
  businessId: number;
  betrieb: string;
  city: string | null;
  welle: string | null;
  status: string;
  testkarte: boolean;
  druckstatus: string | null;
  scans: number;
  /** generated_websites.status der Karten-Seite — `preview` = noch nicht gekauft. */
  websiteStatus: string | null;
  /** Gibt es zum Betrieb schon eine jüngere Karte (z. B. diesen Nachfass)? */
  hatNeuereKarte: boolean;
  sentAt: Date | null;
}

/**
 * Warum diese Karte keinen Nachfass bekommt — oder `null`, wenn sie darf.
 * Die Reihenfolge entspricht der Wichtigkeit: eigene Testkarte und schon
 * angefasste Betriebe zuerst.
 */
export function nachfassSperre(k: NachfassKandidat): string | null {
  if (k.testkarte) return "eigene Testkarte";
  if (welleVon(k.welle) !== WELLE_1) return "nicht aus der ersten Welle";
  if (k.hatNeuereKarte) return "hat schon eine jüngere Karte";
  if (k.status !== "versendet") return "erste Karte nie versendet";
  if (k.druckstatus === "storniert") return "erste Karte storniert";
  if (k.scans > 0) return "hat gescannt";
  if (k.websiteStatus && k.websiteStatus !== "preview") {
    return "Seite ist schon gekauft oder nicht mehr in der Vorschau";
  }
  return null;
}

/**
 * Wählt `anzahl` Karten aus, reihum über die Städte: zuerst die Stadt mit
 * den meisten Berechtigten (bei Gleichstand alphabetisch), in jeder Stadt
 * nach Kurzcode. Der Kurzcode ist zufällig vergeben und stabil — damit
 * entscheidet weder Name noch Versandreihenfolge, wer drankommt.
 */
export function nachfassVorschlag(
  kandidaten: NachfassKandidat[],
  anzahl: number
): NachfassKandidat[] {
  const jeStadt = new Map<string, NachfassKandidat[]>();
  for (const k of kandidaten) {
    if (nachfassSperre(k) !== null) continue;
    const stadt = k.city?.trim() || "ohne Stadt";
    jeStadt.set(stadt, [...(jeStadt.get(stadt) ?? []), k]);
  }
  const staedte = [...jeStadt.entries()]
    .map(([stadt, karten]) => ({
      stadt,
      karten: [...karten].sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort(
      (a, b) =>
        b.karten.length - a.karten.length || a.stadt.localeCompare(b.stadt)
    );

  const auswahl: NachfassKandidat[] = [];
  for (let runde = 0; auswahl.length < anzahl; runde++) {
    const dieseRunde = staedte
      .map(s => s.karten[runde])
      .filter((k): k is NachfassKandidat => k !== undefined);
    if (dieseRunde.length === 0) break;
    auswahl.push(...dieseRunde.slice(0, anzahl - auswahl.length));
  }
  return auswahl;
}
