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
import {
  anschriftZerlegen,
  postkartenVariablen,
  TEXT_VARIANTEN,
  type TextVariante,
} from "../server/postkarten/heymail";

const API = "https://api.heymail.com/v1/mailings/preview";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const csvPfad = arg("--csv");
const bilderPfad = arg("--bilder");
const templateId = arg("--template") ?? "93df425c-64eb-4c13-b07b-cd54dd663301";
const variante = (arg("--text") ?? "ungefragt") as TextVariante;
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
  const ergebnisse: string[] = [`name;vorschau_pdf;bild_url;textvariante;hinweis`];

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
        { name, stadt: empfaenger.city, vorschauUrl, bildUrl: hoch.url },
        variante
      );
    } catch (err) {
      const grund = err instanceof Error ? err.message : String(err);
      console.log(`${name}: ${grund}`);
      ergebnisse.push(`${name};;${hoch.url};${grund}`);
      continue;
    }

    const antwort = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        mailItem: { recipient: { company: name, ...empfaenger }, variableData: variablen },
      }),
    });
    const text = await antwort.text();
    if (!antwort.ok) {
      console.log(`${name}: HTTP ${antwort.status} — ${text.slice(0, 160)}`);
      ergebnisse.push(`${name};;${hoch.url};HTTP ${antwort.status}`);
      continue;
    }
    const pdf = (JSON.parse(text) as { previewUrl?: string }).previewUrl ?? "";
    console.log(`${name}: ${pdf}`);
    ergebnisse.push(`${name};${pdf};${hoch.url};${variante};`);
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
