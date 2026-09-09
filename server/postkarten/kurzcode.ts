import { randomInt } from "crypto";

/**
 * Kurzcode fuer die Postkarte (2026-09-09).
 *
 * Der QR zeigt seit dieser Aenderung auf `/k/<code>` statt direkt auf den
 * Vorschau-Token. Zwei Gruende, der zweite wiegt schwerer:
 *
 * 1. Messbarkeit — jeder Aufruf ist zweifelsfrei Postkarten-Verkehr.
 * 2. Haltbarkeit — der Code zeigt auf den BETRIEB, nicht auf einen Token.
 *    Wird die Vorschau neu erzeugt, bleibt die gedruckte Karte gueltig.
 *    Genau das ist am 09.09. zweimal schiefgegangen: erst loeschte die
 *    TTL die Seiten, dann wechselten bei der Neuerzeugung die Tokens —
 *    beide Male zeigten fertige Karten ins Leere. Papier laesst sich
 *    nicht nachtraeglich reparieren.
 */

/** Ohne 0/O und 1/I/L — auf Papier nicht unterscheidbar. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

const CODE_LAENGE = 4;

/** ~810.000 Kombinationen bei vier Zeichen — reicht fuer jeden Stapel. */
export function kurzcodeErzeugen(): string {
  let code = "";
  for (let i = 0; i < CODE_LAENGE; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

/** Wer abtippt, tippt klein und ungenau. */
export function normalisiereCode(eingabe: string): string {
  return eingabe.trim().toUpperCase();
}

export type Kanal = "qr" | "typed";

/**
 * Der QR kodiert `?q=1`, der gedruckte Kurz-Link nicht. Niemand tippt
 * einen Query-Parameter ab — damit ist der Kanal eindeutig, ohne dass
 * der Leser etwas davon merkt.
 */
export function kanalAus(q: string | undefined): Kanal {
  return q === "1" ? "qr" : "typed";
}

const BOT_MUSTER =
  /bot|crawl|spider|slurp|preview|whatsapp|facebookexternalhit|telegram|discord|curl|wget|python-requests|headless|lighthouse|monitor/i;

/**
 * Ohne Filter zaehlt jeder Crawler als Scan und die Quote ist wertlos.
 * Fehlender User-Agent gilt als Bot: Ein echtes Handy schickt immer einen.
 */
export function istBot(userAgent: string | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return true;
  return BOT_MUSTER.test(userAgent);
}
