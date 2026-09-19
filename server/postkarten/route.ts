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
  /**
   * Eingeloggter Admin? Dann nicht zaehlen (2026-09-19): Die eigenen Tests
   * des Betreibers standen sonst als Scans im Trichter.
   */
  istAdmin?: (req: Request) => Promise<boolean>;
}

/** Admin-Pruefung, die nie im Weg steht: Fehler heisst „kein Admin". */
async function vomAdmin(req: Request, deps: KurzlinkDeps): Promise<boolean> {
  if (!deps.istAdmin) return false;
  try {
    return await deps.istAdmin(req);
  } catch {
    return false;
  }
}

/**
 * `/k/:code` — der Weg von der gedruckten Karte ins Studio.
 *
 * Ziel ist seit 2026-09-18 die Design-Auswahl (`/onboarding/<token>`),
 * nicht mehr die fertige Vorschau: Test-Feedback war, dass die Karte sonst
 * „ein fertiges Template" zeigt, obwohl der Betrieb zuerst zwischen den
 * Richtungen waehlen soll. Der Splash zeigt die Seite trotzdem gross —
 * das Kartenversprechen „deine Website ist fertig" bleibt.
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
  const zaehlen =
    !istBot(typeof userAgent === "string" ? userAgent : undefined) &&
    !(await vomAdmin(req, deps));
  if (zaehlen) {
    try {
      await deps.erfasseScan(
        karte.id,
        kanalAus(req.query.q as string | undefined)
      );
    } catch {
      // Bewusst geschluckt: Eine kaputte Zaehlung darf den Besucher nicht
      // vor eine Fehlerseite laufen lassen.
    }
  }

  // `via=karte` (2026-09-19): markiert Postkarten-Besuche für Clarity/GA4
  // (studioEvents.ts), damit sich der Funnel nur für Kartenempfänger
  // auswerten lässt. Das Studio ignoriert den Parameter sonst.
  res.redirect(302, `/onboarding/${karte.token}?via=karte`);
}
