/**
 * Postkarten über HeyMail (2026-09-09).
 *
 * Zwei Regeln, die genau gegenläufig sind und deshalb hier gekapselt und
 * getestet werden — HeyMail-Support, Robin, 2026-09-09:
 *
 *   qrCodeUrl  Im Template steht `https://{{qrCodeUrl}}`. Der übergebene Wert
 *              darf das Schema deshalb NICHT enthalten, sonst entsteht
 *              `https://https://…` und der Code führt ins Leere.
 *   bildUrl    Muss das Schema enthalten und über HTTPS öffentlich erreichbar
 *              sein. Der Bildserver ist bei HeyMail freigeschaltet.
 */

/** Kopfzeile der Karte; darüber bricht die Zeile im Layout um. */
export const MAX_BETRIEB_ORT = 44;

export interface Empfaenger {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
}

/**
 * Zerlegt eine Google-Anschrift wie „Osterstraße 25, 46397 Bocholt,
 * Deutschland" in die Felder, die HeyMail erwartet.
 *
 * Bewusst streng: Ohne erkennbare Postleitzahl und Hausnummer kommt `null`
 * zurück. Eine geratene Adresse wäre schlimmer als gar keine Karte — sie
 * kostet Porto und landet im Nirgendwo.
 */
export function anschriftZerlegen(anschrift: string): Empfaenger | null {
  const teile = anschrift
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);
  if (teile.length < 2) return null;

  // Letzter Teil ist das Land, falls vorhanden; davor „PLZ Ort".
  const land = /^[A-Za-zÄÖÜäöüß ]+$/.test(teile[teile.length - 1] ?? "")
    ? teile.pop()!
    : "Deutschland";
  const ortTeil = teile.pop() ?? "";
  const plzOrt = ortTeil.match(/^(\d{4,5})\s+(.+)$/);
  if (!plzOrt) return null;

  const strasseTeil = teile.join(", ");
  // Hausnummer: Ziffer am Ende, optional mit Bereich oder Buchstabe.
  const strasse = strasseTeil.match(/^(.*?)\s+(\d+\s*[-/]?\s*\d*\s*[a-zA-Z]?)$/);
  if (!strasse) return null;

  return {
    street: strasse[1].trim(),
    houseNumber: strasse[2].replace(/\s+/g, ""),
    zip: plzOrt[1],
    city: plzOrt[2].trim(),
    country: land,
  };
}

export interface PostkartenBetrieb {
  name: string;
  stadt: string;
  /** Öffentliche Vorschau der erzeugten Website, mit Schema. */
  vorschauUrl: string;
  /** Screenshot der Seite, öffentlich über HTTPS, mit Schema. */
  bildUrl: string;
}

export interface PostkartenVariablen {
  betrieb_ort: string;
  qrCodeUrl: string;
  bildUrl: string;
}

function ohneSchema(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function postkartenVariablen(
  betrieb: PostkartenBetrieb
): PostkartenVariablen {
  if (!betrieb.vorschauUrl.trim()) {
    throw new Error(
      "Ohne Vorschau-Link hat die Postkarte kein Ziel — Karte übersprungen."
    );
  }
  if (!/^https:\/\//i.test(betrieb.bildUrl)) {
    throw new Error(
      `Bild-URL muss mit https:// beginnen (HeyMail-Vorgabe): ${betrieb.bildUrl}`
    );
  }

  const voll = `Für die ${betrieb.name} in ${betrieb.stadt}`;
  const betrieb_ort =
    voll.length <= MAX_BETRIEB_ORT
      ? voll
      : `${voll.slice(0, MAX_BETRIEB_ORT - 1).trimEnd()}…`;

  return {
    betrieb_ort,
    qrCodeUrl: ohneSchema(betrieb.vorschauUrl.trim()),
    bildUrl: betrieb.bildUrl.trim(),
  };
}
