/**
 * Postkarten-Vorschau bei HeyMail (2026-09-09).
 *
 * Läuft AUF DEM SERVER: lädt die lokal gerenderten Screenshots nach R2,
 * baut je Betrieb die Variablen und ruft `/v1/mailings/preview` auf.
 * Verschickt NICHTS — die Vorschau erzeugt weder Druckauftrag noch Kosten.
 *
 *   npx tsx -r dotenv/config scripts/postkarten-vorschau.ts \
 *     --csv postkarten-bocholt-friseur.csv --bilder /root/postkarten
 */
import fs from "fs";
import path from "path";
import { storagePut } from "../server/storage";
import { postkarteSichern, postkarteVersendet } from "../server/postkarten/db";
import { karteAnHeymail, TEMPLATE_STANDARD } from "../server/postkarten/auftrag";
import {
  anschriftZerlegen,
  postkartenVariablen,
  TEXT_VARIANTEN,
  type TextVariante,
} from "../server/postkarten/heymail";

/**
 * `--senden` schaltet von der Vorschau auf den echten Druckauftrag. Mit dem
 * Test-Key passiert weiterhin nichts; mit einem Live-Key kostet jeder Lauf
 * Geld und ist nicht rueckholbar. Deshalb ist die Vorschau der Standard.
 */
const senden = process.argv.includes("--senden");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const csvPfad = arg("--csv");
const bilderPfad = arg("--bilder");
const templateId = arg("--template") ?? TEMPLATE_STANDARD;
const variante = (arg("--text") ?? "ungefragt") as TextVariante;
/**
 * Die Stadt fuer die Auswertung. Ohne sie wuerde die Postanschrift zaehlen —
 * und die zerfaellt in "Duisburg-Hamborn", "Duisburg-Rheinhausen" usw., was
 * den Vergleich zwischen Staedten im Dashboard unbrauchbar macht.
 */
const stadtGruppe = arg("--stadt");
if (!(variante in TEXT_VARIANTEN)) {
  throw new Error(
    `Unbekannte Textvariante "${variante}" — bekannt: ${Object.keys(TEXT_VARIANTEN).join(", ")}`
  );
}
if (!csvPfad || !bilderPfad) {
  throw new Error(
    'Aufruf: --csv <datei> --bilder <ordner> [--template <id>]'
  );
}
const key = process.env.HEYMAIL_API_KEY;
if (!key) throw new Error("HEYMAIL_API_KEY fehlt in der Umgebung");

/** Dateiname-tauglicher Name, identisch zum lokalen Render-Schritt. */
function dateiname(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main(): Promise<void> {
  const zeilen = fs.readFileSync(csvPfad!, "utf8").trim().split("\n");
  const kopf = zeilen[0].split(";");
  const idx = (name: string) => kopf.indexOf(name);
  const ergebnisse: string[] = [`name;vorschau_pdf;bild_url;textvariante;kurzcode`];

  for (const zeile of zeilen.slice(1)) {
    const f = zeile.split(";");
    const name = f[idx("name")];
    const anschrift = f[idx("anschrift")];
    const vorschauUrl = f[idx("vorschau_url")];

    const empfaenger = anschriftZerlegen(anschrift);
    if (!empfaenger) {
      console.log(`${name}: Anschrift nicht zerlegbar — übersprungen`);
      ergebnisse.push(`${name};;;Anschrift nicht zerlegbar`);
      continue;
    }

    // Ein Betrieb, ein Code: Die Karte wird gesichert, bevor sie entsteht.
    const businessId = Number(f[idx("business_id")] ?? "0");
    const karte = businessId
      ? await postkarteSichern({
          businessId,
          city: stadtGruppe ?? empfaenger.city,
          textVariant: variante,
        })
      : null;

    const bildDatei = path.join(bilderPfad!, `${dateiname(name)}.png`);
    if (!fs.existsSync(bildDatei)) {
      console.log(`${name}: Screenshot fehlt (${bildDatei}) — übersprungen`);
      ergebnisse.push(`${name};;;Screenshot fehlt`);
      continue;
    }

    const hoch = await storagePut(
      `postkarten/${dateiname(name)}.png`,
      fs.readFileSync(bildDatei),
      "image/png"
    );

    let variablen;
    try {
      variablen = postkartenVariablen(
        {
          name,
          stadt: empfaenger.city,
          vorschauUrl,
          bildUrl: hoch.url,
          ...(karte ? { kurzcode: karte.code } : {}),
        },
        variante
      );
    } catch (err) {
      const grund = err instanceof Error ? err.message : String(err);
      console.log(`${name}: ${grund}`);
      ergebnisse.push(`${name};;${hoch.url};${grund}`);
      continue;
    }

    // Der Aufruf selbst liegt in server/postkarten/auftrag.ts — dasselbe
    // Modul, ueber das auch das Backend Karten erzeugt und beauftragt.
    let ergebnis;
    try {
      ergebnis = await karteAnHeymail({
        modus: senden ? "versand" : "vorschau",
        apiKey: key!,
        templateId,
        firma: name,
        empfaenger,
        variablen,
      });
    } catch (err) {
      const grund = err instanceof Error ? err.message : String(err);
      console.log(`${name}: ${grund}`);
      ergebnisse.push(`${name};;${hoch.url};${grund}`);
      continue;
    }
    const pdf = ergebnis.pdfUrl ?? "";
    // Automatisch bestaetigen (Betreiber-Entscheidung 2026-09-09): Was der
    // Anbieter angenommen hat, gilt als raus — kein zweiter Handgriff.
    if (senden && karte) {
      // Beim ersten echten Versand (09.09.) blieb die Referenz leer: Die
      // Antwort trug keins der erwarteten Felder, und der Rohtext war weg.
      // Ohne Referenz gibt es bei einer Reklamation nichts vorzuzeigen —
      // deshalb im Zweifel die ganze Antwort protokollieren.
      if (!ergebnis.referenz) {
        console.log(
          `  ${name}: keine Referenz in der Antwort — Rohdaten: ${ergebnis.roh}`
        );
      }
      await postkarteVersendet(karte.id, ergebnis.referenz);
    }
    console.log(`${name}: ${karte?.code ?? "ohne Code"} ${pdf}`);
    ergebnisse.push(`${name};${pdf};${hoch.url};${variante};${karte?.code ?? ""}`);
  }

  const ziel = csvPfad!.replace(/\.csv$/, "-vorschau.csv");
  fs.writeFileSync(ziel, ergebnisse.join("\n") + "\n", "utf8");
  console.log(`\nErgebnis: ${ziel}`);
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);
