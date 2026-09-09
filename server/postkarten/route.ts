import type { Request, Response } from "express";
import { istBot, kanalAus, normalisiereCode, type Kanal } from "./kurzcode";

export interface KurzlinkKarte {
  id: number;
  code: string;
  /** Der aktuelle Vorschau-Token des Betriebs — darf sich aendern. */
  token: string;
}

export interface KurzlinkDeps {
  findeKarte: (code: string) => Promise<KurzlinkKarte | null>;
  erfasseScan: (postcardId: number, kanal: Kanal) => Promise<void> | void;
}

/**
 * `/k/:code` — der Weg von der gedruckten Karte zur Vorschau.
 *
 * Reihenfolge mit Absicht: erst zaehlen, dann weiterleiten — aber die
 * Zaehlung darf nie im Weg stehen. Wer die Karte in der Hand haelt, ist
 * wichtiger als die Statistik.
 */
export async function handleKurzlink(
  req: Request,
  res: Response,
  deps: KurzlinkDeps
): Promise<void> {
  // Der Kurz-Link darf nie im Suchindex landen: Er zeigt auf eine
  // Vorschau, die dem Betrieb noch gar nicht gehoert.
  res.set("X-Robots-Tag", "noindex, nofollow");

  const code = normalisiereCode(String(req.params.code ?? ""));
  const karte = await deps.findeKarte(code);
  if (!karte) {
    res
      .status(404)
      .type("text/plain")
      .send(
        "Diesen Code kennen wir nicht. Bitte prüfe die vier Zeichen auf der Karte — oder schau auf pageblitz.de vorbei."
      );
    return;
  }

  const userAgent = req.headers["user-agent"];
  if (!istBot(typeof userAgent === "string" ? userAgent : undefined)) {
    try {
      await deps.erfasseScan(karte.id, kanalAus(req.query.q as string | undefined));
    } catch {
      // Bewusst geschluckt: Eine kaputte Zaehlung darf den Besucher nicht
      // vor eine Fehlerseite laufen lassen.
    }
  }

  res.redirect(302, `/preview-ssr/${karte.token}`);
}
